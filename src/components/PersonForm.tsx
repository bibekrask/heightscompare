'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import ColorPicker from '@/components/ColorPicker';
import { PersonFormProps, PersonFormData } from '@/types';
import { 
  COLOR_OPTIONS, 
  CM_PER_INCH, 
  MALE_SILHOUETTE_SVG, 
  FEMALE_SILHOUETTE_SVG, 
  MALE_ASPECT_RATIO, 
  FEMALE_ASPECT_RATIO 
} from '@/constants';
import { processImageFile } from '@/utils';

const PersonForm: React.FC<PersonFormProps> = ({ 
  initialData = { 
    name: '', 
    heightCm: 0,
    gender: 'male',
    color: COLOR_OPTIONS[0]
  }, 
  onSubmit, 
  buttonText = "Add Person" 
}) => {
  const [formData, setFormData] = useState<PersonFormData>(initialData);
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Handle gender change
  const handleGenderChange = (gender: 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender }));
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Handle custom image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setFormData(prev => ({ ...prev, customImage: file }));
  };

  // Clear custom image selection
  const clearCustomImage = () => {
    setUploadedImagePreview(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.customImage;
      return newData;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      if (formData.customImage) {
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try a different image.');
    }
  };

  return (
    <div className="space-y-3 md:space-y-5">
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
          placeholder="Enter person's name (optional)"
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
          
          {uploadedImagePreview ? (
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
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 md:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 md:gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Choose Image</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Person Button */}
      <button
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-3 md:p-4 rounded-lg font-semibold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all font-heading"
        onClick={handleSubmit}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PersonForm; 