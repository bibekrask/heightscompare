'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ColorPicker from '@/components/ColorPicker';
import { PersonFormProps, PersonFormData, ManagedImage } from '@/types';
import { 
  COLOR_OPTIONS, 
  CM_PER_INCH
} from '@/constants';

interface ImageFormData {
  name: string;
  heightCm: number;
  color: string;
  imageFile?: File;
  croppedImageData?: string;
  aspectRatio?: number;
}

interface ImageFormProps {
  initialData?: ImageFormData;
  onSubmit: (data: Omit<ManagedImage, 'id'>) => void;
  buttonText?: string;
}

const ImageForm: React.FC<ImageFormProps> = ({ 
  initialData = { 
    name: '', 
    heightCm: 0,
    color: COLOR_OPTIONS[0]
  }, 
  onSubmit, 
  buttonText = "Add Image" 
}) => {
  const [formData, setFormData] = useState<ImageFormData>(initialData);
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate ft/in from cm for the inputs
  const ftInValues = useMemo(() => {
    if (formData.heightCm === 0) {
      return { feet: '' as string, inches: '' as string };
    }
    const inches = formData.heightCm / CM_PER_INCH;
    const feet = Math.floor(inches / 12);
    const remainingInches = Number((inches % 12).toFixed(2));
    return { feet, inches: remainingInches };
  }, [formData.heightCm]);

  // Handle height changes in feet/inches
  const handleFtInChange = (value: string, field: 'feet' | 'inches') => {
    const newValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(newValue)) return;
    
    let feet = field === 'feet' ? newValue : (ftInValues.feet === '' ? 0 : Number(ftInValues.feet));
    let inches = field === 'inches' ? newValue : (ftInValues.inches === '' ? 0 : Number(ftInValues.inches));
    
    feet = Math.max(0, feet);
    inches = Math.max(0, Math.min(11.99, inches));
    
    const totalInches = feet * 12 + inches;
    const newCm = totalInches * CM_PER_INCH;
    
    setFormData(prev => ({ ...prev, heightCm: newCm }));
  };

  // Handle height changes in cm
  const handleCmChange = (value: string) => {
    const newValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(newValue)) return;
    setFormData(prev => ({ ...prev, heightCm: Math.max(0, newValue) }));
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageSrc(event.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    setFormData(prev => ({ ...prev, imageFile: file }));
  };

  // Handle image load for cropper
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    
    // Default crop to center with appropriate aspect ratio
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        naturalWidth / naturalHeight,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );
    
    setCrop(crop);
    setCompletedCrop(crop);
  }, []);

  // Generate cropped image
  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
  ): Promise<{ dataUrl: string, aspectRatio: number }> => {
    const canvas = canvasRef.current;
    if (!canvas || !crop.width || !crop.height) {
      return Promise.reject(new Error('Canvas or crop not available'));
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.reject(new Error('No 2d context'));
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    // Clear the canvas with transparency for PNG images
    ctx.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      // Detect if the original file is PNG or has transparency
      const isPNG = fileName.toLowerCase().endsWith('.png') || 
                   fileName.toLowerCase().includes('png') ||
                   formData.imageFile?.type === 'image/png';
      
      // Use PNG format to preserve transparency, fallback to JPEG for other formats
      const outputFormat = isPNG ? 'image/png' : 'image/jpeg';
      const quality = isPNG ? undefined : 0.9; // PNG doesn't use quality parameter

      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ dataUrl: '', aspectRatio: 1 });
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const aspectRatio = (crop.width * scaleX) / (crop.height * scaleY);
          resolve({ 
            dataUrl: reader.result as string, 
            aspectRatio 
          });
        };
        reader.readAsDataURL(blob);
      }, outputFormat, quality);
    });
  }, [formData.imageFile]);

  // Apply crop and close cropper
  const handleApplyCrop = useCallback(async () => {
    if (!imageRef.current || !completedCrop || !formData.imageFile) return;
    
    try {
      const { dataUrl, aspectRatio } = await getCroppedImg(
        imageRef.current,
        completedCrop,
        formData.imageFile.name
      );
      
      setUploadedImageSrc(dataUrl);
      setShowCropper(false);
      
      // Update form data with cropped image data
      setFormData(prev => ({ 
        ...prev, 
        croppedImageData: dataUrl,
        aspectRatio 
      }));
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  }, [completedCrop, formData.imageFile, getCroppedImg]);

  // Cancel crop and remove image
  const handleCancelCrop = () => {
    setShowCropper(false);
    setUploadedImageSrc(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.imageFile;
      delete newData.croppedImageData;
      delete newData.aspectRatio;
      return newData;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear uploaded image
  const clearImage = () => {
    setUploadedImageSrc(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.imageFile;
      delete newData.croppedImageData;
      delete newData.aspectRatio;
      return newData;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.imageFile || !formData.croppedImageData) {
      alert('Please upload and crop an image first.');
      return;
    }

    // Get random values for empty fields
    const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    
    const minHeightInches = 5 * 12;
    const maxHeightInches = 5 * 12 + 10;
    const randomHeightInches = minHeightInches + Math.random() * (maxHeightInches - minHeightInches);
    const randomHeightCm = randomHeightInches * CM_PER_INCH;
    
    const isHeightEmpty = formData.heightCm === 0;
    const isColorDefault = formData.color === COLOR_OPTIONS[0];
    
    const finalHeight = isHeightEmpty ? randomHeightCm : formData.heightCm;
    const finalColor = isColorDefault ? randomColor : formData.color;
    
    try {
      onSubmit({
        name: formData.name || 'Custom Image',
        heightCm: finalHeight,
        color: finalColor,
        gender: 'male', // Default gender for images
        aspectRatio: formData.aspectRatio || 1,
        src: formData.croppedImageData,
        verticalOffsetCm: 0,
        horizontalOffsetCm: 0
      });
      
      // Reset form
      setFormData({ 
        name: '', 
        heightCm: 0, 
        color: COLOR_OPTIONS[0]
      });
      setUploadedImageSrc(null);
      setShowCropper(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting image:', error);
      alert('Failed to submit image. Please try again.');
    }
  };

  return (
    <div className="space-y-3 md:space-y-5">
      {/* Name Input */}
      <div>
        <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">Name</label>
        <input 
          type="text" 
          placeholder="Enter image name (optional)"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-3 md:p-4 border border-gray-300 rounded-lg text-sm md:text-base font-body bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          suppressHydrationWarning={true}
        />
      </div>

      {/* Height Input with Unit Toggle */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white">Height</label>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <button
              className={`px-3 md:px-4 py-2 text-sm md:text-base font-medium transition-all ${heightUnit === 'ft' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setHeightUnit('ft')}
            >
              ft/in
            </button>
            <button
              className={`px-3 md:px-4 py-2 text-sm md:text-base font-medium transition-all ${heightUnit === 'cm' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setHeightUnit('cm')}
            >
              cm
            </button>
          </div>
        </div>
        
        {heightUnit === 'ft' ? (
          <div className="flex gap-2 md:gap-3">
            <div className="relative flex-1">
              <input 
                type="number" 
                value={ftInValues.feet}
                onChange={e => handleFtInChange(e.target.value, 'feet')}
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg text-sm md:text-base font-body bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                min="0"
                step="1"
                placeholder="5"
                suppressHydrationWarning={true}
              />
              <span className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-500 dark:text-gray-400 text-sm font-medium">ft</span>
            </div>
            <div className="relative flex-1">
              <input 
                type="number" 
                value={ftInValues.inches}
                onChange={e => handleFtInChange(e.target.value, 'inches')}
                className="w-full p-3 md:p-4 border border-gray-300 rounded-lg text-sm md:text-base font-body bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                min="0"
                max="11.99"
                step="0.1"
                placeholder="10"
                suppressHydrationWarning={true}
              />
              <span className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-500 dark:text-gray-400 text-sm font-medium">in</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input 
              type="number" 
              value={formData.heightCm === 0 ? '' : Math.round(formData.heightCm)}
              onChange={e => handleCmChange(e.target.value)}
              className="w-full p-3 md:p-4 border border-gray-300 rounded-lg text-sm md:text-base font-body bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              min="0"
              step="1"
              placeholder="173"
              suppressHydrationWarning={true}
            />
            <span className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-500 dark:text-gray-400 text-sm font-medium">cm</span>
          </div>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">Color</label>
        <ColorPicker 
          selectedColor={formData.color} 
          onChange={handleColorChange} 
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">Upload Image</label>
        <div className="flex flex-col space-y-1 md:space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
            suppressHydrationWarning={true}
          />
          
          {uploadedImageSrc && !showCropper ? (
            <div className="relative w-full">
              <Image 
                src={uploadedImageSrc} 
                alt="Preview" 
                width={96}
                height={96}
                className="h-16 md:h-24 object-contain mx-auto mb-1 md:mb-2 border border-gray-300 p-1 rounded"
              />
              <button
                onClick={clearImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 md:p-1 shadow-md"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : !showCropper ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 md:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 md:gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Choose Image</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && uploadedImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Crop Your Image</h3>
            
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imageRef}
                  alt="Crop me"
                  src={uploadedImageSrc}
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Image Button */}
      <button
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-3 md:p-4 rounded-lg font-semibold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all font-heading disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={!formData.imageFile || !formData.croppedImageData}
      >
        {buttonText}
      </button>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageForm; 