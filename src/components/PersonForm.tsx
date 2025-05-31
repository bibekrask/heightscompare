'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ColorPicker from '@/components/ColorPicker';
import { PersonFormProps, PersonFormData, ManagedImage } from '@/types';
import { 
  COLOR_OPTIONS, 
  CM_PER_INCH, 
  MALE_SILHOUETTE_SVG, 
  FEMALE_SILHOUETTE_SVG, 
  MALE_ASPECT_RATIO, 
  FEMALE_ASPECT_RATIO 
} from '@/constants';
import { processImageFile } from '@/utils';

interface ExtendedPersonFormData extends PersonFormData {
  customImage?: File;
  croppedImageData?: string;
  aspectRatio?: number;
}

interface ExtendedPersonFormProps extends PersonFormProps {
  editingItem?: ManagedImage | null;
  onUpdate?: (id: string, updates: Partial<ManagedImage>) => void;
  onCancelEdit?: () => void;
  onRemove?: (id: string) => void;
  majorStep?: number;
}

const PersonForm: React.FC<ExtendedPersonFormProps> = ({ 
  initialData = { 
    name: '', 
    heightCm: 0,
    gender: 'male',
    color: COLOR_OPTIONS[0]
  }, 
  onSubmit, 
  buttonText = "Add Person",
  editingItem,
  onUpdate,
  onCancelEdit,
  onRemove,
  majorStep = 100
}) => {
  const [formData, setFormData] = useState<ExtendedPersonFormData>(initialData);
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Set default formdata based on editing state
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        heightCm: editingItem.heightCm,
        gender: editingItem.gender || 'male',
        color: editingItem.color,
        customImage: undefined,
        croppedImageData: editingItem.src?.startsWith('data:') ? editingItem.src : undefined,
        aspectRatio: editingItem.aspectRatio
      });
      
      // If the editing item has a custom image, set it as the preview
      if (editingItem.src?.startsWith('data:')) {
        setUploadedImagePreview(editingItem.src);
      } else {
        setUploadedImagePreview(null);
      }
    } else {
      setFormData({
        name: '',
        heightCm: initialData?.heightCm || 0,
        gender: initialData?.gender || 'male',
        color: initialData?.color || COLOR_OPTIONS[0]
      });
      setUploadedImagePreview(null);
    }
  }, [editingItem, initialData]);

  // Handle clicking outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingItem && formRef.current && !formRef.current.contains(event.target as Node)) {
        // Check if clicked element is part of the comparison canvas or other UI elements
        const target = event.target as Element;
        if (!target.closest('.sidebar-tabs') && !target.closest('[role="dialog"]')) {
          if (onCancelEdit) {
            onCancelEdit();
          }
        }
      }
    };

    if (editingItem) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingItem, onCancelEdit]);
  
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
    
    const newFormData = { ...formData, heightCm: newCm };
    setFormData(newFormData);
    
    // If editing, update the item immediately
    if (editingItem && onUpdate) {
      onUpdate(editingItem.id, { heightCm: newCm });
    }
  };

  // Handle height changes in cm
  const handleCmChange = (value: string) => {
    const newValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(newValue)) return;
    const heightCm = Math.max(0, newValue);
    
    const newFormData = { ...formData, heightCm };
    setFormData(newFormData);
    
    // If editing, update the item immediately
    if (editingItem && onUpdate) {
      onUpdate(editingItem.id, { heightCm });
    }
  };

  // Handle gender change
  const handleGenderChange = (gender: 'male' | 'female') => {
    const newFormData = { ...formData, gender };
    setFormData(newFormData);
    
    // If editing, update the item immediately
    if (editingItem && onUpdate) {
      // Only update the silhouette if the current image is already a silhouette
      // Don't override custom images
      const isCurrentlySilhouette = editingItem.src === '/images/male.svg' || editingItem.src === '/images/female.svg';
      
      if (isCurrentlySilhouette) {
        onUpdate(editingItem.id, { 
          gender,
          src: gender === 'male' ? MALE_SILHOUETTE_SVG : FEMALE_SILHOUETTE_SVG,
          aspectRatio: gender === 'male' ? MALE_ASPECT_RATIO : FEMALE_ASPECT_RATIO
        });
      } else {
        // Just update the gender, keep the custom image
        onUpdate(editingItem.id, { gender });
      }
    }
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    const newFormData = { ...formData, color };
    setFormData(newFormData);
    
    // If editing, update the item immediately
    if (editingItem && onUpdate) {
      onUpdate(editingItem.id, { color });
    }
  };

  // Handle name change
  const handleNameChange = (name: string) => {
    const newFormData = { ...formData, name };
    setFormData(newFormData);
    
    // If editing, update the item immediately
    if (editingItem && onUpdate) {
      onUpdate(editingItem.id, { name });
    }
  };

  // Handle vertical adjustment change
  const handleVerticalAdjustment = (direction: 'up' | 'down') => {
    if (!editingItem || !onUpdate) return;
    
    const stepSize = majorStep / 20;
    const currentOffset = editingItem.verticalOffsetCm || 0;
    const newOffset = direction === 'up' ? currentOffset + stepSize : currentOffset - stepSize;
    
    onUpdate(editingItem.id, { verticalOffsetCm: newOffset });
  };

  // Handle custom image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImagePreview(event.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    setFormData(prev => ({ ...prev, customImage: file }));
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
                   formData.customImage?.type === 'image/png';
      
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
  }, [formData.customImage]);

  // Apply crop and close cropper
  const handleApplyCrop = useCallback(async () => {
    if (!imageRef.current || !completedCrop || !formData.customImage) return;
    
    try {
      const { dataUrl, aspectRatio } = await getCroppedImg(
        imageRef.current,
        completedCrop,
        formData.customImage.name
      );
      
      setUploadedImagePreview(dataUrl);
      setShowCropper(false);
      
      // Update form data with cropped image data
      setFormData(prev => ({ 
        ...prev, 
        croppedImageData: dataUrl,
        aspectRatio 
      }));

      // If editing, immediately update the item with new image
      if (editingItem && onUpdate) {
        onUpdate(editingItem.id, { 
          src: dataUrl,
          aspectRatio: aspectRatio
        });
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  }, [completedCrop, formData.customImage, getCroppedImg, editingItem, onUpdate]);

  // Cancel crop and remove image
  const handleCancelCrop = () => {
    setShowCropper(false);
    setUploadedImagePreview(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.customImage;
      delete newData.croppedImageData;
      delete newData.aspectRatio;
      return newData;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear custom image selection
  const clearCustomImage = () => {
    setUploadedImagePreview(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.customImage;
      delete newData.croppedImageData;
      delete newData.aspectRatio;
      return newData;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // If editing, revert to default silhouette
    if (editingItem && onUpdate) {
      const defaultSrc = formData.gender === 'male' ? MALE_SILHOUETTE_SVG : FEMALE_SILHOUETTE_SVG;
      const defaultAspectRatio = formData.gender === 'male' ? MALE_ASPECT_RATIO : FEMALE_ASPECT_RATIO;
      
      onUpdate(editingItem.id, { 
        src: defaultSrc,
        aspectRatio: defaultAspectRatio
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Get random values for empty fields
    const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    const randomGender = Math.random() < 0.5 ? 'male' : 'female';
    
    const minHeightInches = 5 * 12;
    const maxHeightInches = 5 * 12 + 10;
    const randomHeightInches = minHeightInches + Math.random() * (maxHeightInches - minHeightInches);
    const randomHeightCm = randomHeightInches * CM_PER_INCH;
    
    const isHeightEmpty = formData.heightCm === 0;
    const isColorDefault = formData.color === COLOR_OPTIONS[0];
    const isGenderDefault = formData.gender === initialData.gender;
    
    const finalGender = isGenderDefault ? randomGender : formData.gender;
    const finalHeight = isHeightEmpty ? randomHeightCm : formData.heightCm;
    const finalColor = isColorDefault ? randomColor : formData.color;
    
    try {
      if (formData.customImage && formData.croppedImageData) {
        // Use cropped image data
        onSubmit({
          ...formData,
          heightCm: finalHeight,
          color: finalColor,
          gender: finalGender,
          aspectRatio: formData.aspectRatio || 1,
          src: formData.croppedImageData,
          verticalOffsetCm: 0,
          horizontalOffsetCm: 0
        });
      } else if (formData.customImage) {
        // Fallback to processImageFile for backward compatibility
        const { dataUrl, aspectRatio } = await processImageFile(formData.customImage);
        
        onSubmit({
          ...formData,
          heightCm: finalHeight,
          color: finalColor,
          gender: finalGender,
          aspectRatio: aspectRatio,
          src: dataUrl,
          verticalOffsetCm: 0,
          horizontalOffsetCm: 0
        });
      } else {
        onSubmit({
          ...formData,
          heightCm: finalHeight,
          color: finalColor,
          gender: finalGender,
          aspectRatio: finalGender === 'male' ? MALE_ASPECT_RATIO : FEMALE_ASPECT_RATIO,
          src: finalGender === 'male' ? MALE_SILHOUETTE_SVG : FEMALE_SILHOUETTE_SVG,
          verticalOffsetCm: 0,
          horizontalOffsetCm: 0
        });
      }
      
      // Reset form
      setFormData({ 
        name: '', 
        heightCm: 0, 
        gender: 'male',
        color: COLOR_OPTIONS[0]
      });
      setUploadedImagePreview(null);
      setShowCropper(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try a different image.');
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!editingItem || !onRemove) return;
    
    const confirmDelete = confirm(`Are you sure you want to delete "${editingItem.name || `Person ${editingItem.id.slice(0, 3)}`}"?`);
    if (confirmDelete) {
      onRemove(editingItem.id);
      if (onCancelEdit) {
        onCancelEdit();
      }
    }
  };

  return (
    <div ref={formRef} className="space-y-3 md:space-y-5">
      {/* Edit Mode Header */}
      {editingItem && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Editing: {editingItem.name || `Person ${editingItem.id.slice(0, 3)}`}
              </span>
            </div>
            <button
              onClick={onCancelEdit}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Gender Selection */}
      <div className="grid grid-cols-2 gap-0.5 md:gap-1">
        <button
          className={`py-2 md:py-3 px-3 md:px-5 rounded-l-lg border font-medium text-sm md:text-base transition-all ${
            formData.gender === 'male' 
              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleGenderChange('male')}
        >
          Male
        </button>
        <button
          className={`py-2 md:py-3 px-3 md:px-5 rounded-r-lg border font-medium text-sm md:text-base transition-all ${
            formData.gender === 'female' 
              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleGenderChange('female')}
        >
          Female
        </button>
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">Name</label>
        <input 
          type="text" 
          placeholder="Name (optional)"
          value={formData.name}
          onChange={e => handleNameChange(e.target.value)}
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

      {/* Vertical Adjustment - show always */}
      <div>
        <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">Vertical Adjustment</label>
        <div className="flex items-center">
          <button
            onClick={() => handleVerticalAdjustment('up')}
            className="p-3 md:p-4 rounded-l-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
            style={{ 
              backgroundColor: formData.color,
              color: 'white'
            }}
            title="Move up"
            disabled={!editingItem}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div className="flex-grow text-center text-sm md:text-base text-gray-600 dark:text-gray-400 px-3 md:px-4 py-3 md:py-4 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
            {editingItem ? ((editingItem.verticalOffsetCm || 0)).toFixed(2) : '0.00'} cm
          </div>
          <button
            onClick={() => handleVerticalAdjustment('down')}
            className="p-3 md:p-4 rounded-r-lg flex items-center justify-center hover:bg-opacity-80 transition-all"
            style={{ 
              backgroundColor: formData.color,
              color: 'white'
            }}
            title="Move down"
            disabled={!editingItem}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="text-xs md:text-sm text-gray-500 mt-1 italic">
          {editingItem ? 'Adjust to align feet position to ground level' : 'Available when editing an item'}
        </div>
        <div className="text-xs md:text-sm text-gray-500 mt-0.5">
          Step size: {(majorStep / 20).toFixed(2)} cm
        </div>
      </div>

      {/* Custom Image Upload */}
      <div>
        <label className="block text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">Upload Image (Optional)</label>
        <div className="flex flex-col space-y-1 md:space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="custom-image-upload"
            suppressHydrationWarning={true}
          />
          
          {uploadedImagePreview && !showCropper ? (
            <div className="relative w-full">
              <Image 
                src={uploadedImagePreview} 
                alt="Preview" 
                width={96}
                height={96}
                className="h-16 md:h-24 object-contain mx-auto mb-1 md:mb-2 border border-gray-300 p-1 rounded"
              />
              <button
                onClick={clearCustomImage}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Choose Image</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && uploadedImagePreview && (
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
                <Image
                  ref={imageRef}
                  alt="Crop me"
                  src={uploadedImagePreview}
                  width={400}
                  height={400}
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                  onLoad={onImageLoad}
                  suppressHydrationWarning={true}
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

      {/* Add Person Button - only show when not editing */}
      {!editingItem && (
        <button
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-3 md:p-4 rounded-lg font-semibold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all font-heading"
          onClick={handleSubmit}
        >
          {buttonText}
        </button>
      )}

      {/* Done Editing Button - only show when editing */}
      {editingItem && onCancelEdit && (
        <button
          onClick={onCancelEdit}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-3 md:p-4 rounded-lg font-semibold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all font-heading flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Done Editing
        </button>
      )}

      {/* Delete Button - only show when editing */}
      {editingItem && onRemove && (
        <button
          onClick={handleDelete}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-3 md:p-4 rounded-lg font-semibold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all font-heading flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PersonForm; 