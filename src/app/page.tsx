'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ImageComparer from '@/components/ImageComparer';
import ColorPicker from '@/components/ColorPicker';
import Image from 'next/image';
// import AddSection from '@/components/AddSection'; // To be replaced by Sidebar logic
// import EditSection from '@/components/EditSection'; // To be replaced by Sidebar logic

// --- Constants and Shared Data --- 
const MAX_IMAGES = 50;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

// Define color palette options (matching screenshot)
const COLOR_OPTIONS = [
  '#F9A826', // Orange
  '#F26D6D', // Pink/Red
  '#42CAFD', // Light Blue
  '#7747FF', // Purple
  '#FD5EB3', // Hot Pink
  '#743886', // Dark Purple
];

// Silhouette SVGs - More detailed and accurate than simple rectangles
const MALE_SILHOUETTE_SVG = '/images/male.svg'
const FEMALE_SILHOUETTE_SVG = '/images/female.svg'

// Process uploaded image file to get data URL and aspect ratio
const processImageFile = async (file: File): Promise<{ dataUrl: string, aspectRatio: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        resolve({
          dataUrl: e.target?.result as string,
          aspectRatio
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Aspect ratios that match the silhouettes
const MALE_ASPECT_RATIO = 0.4; // Width to height ratio
const FEMALE_ASPECT_RATIO = 0.4; // Width to height ratio

// --- Placeholder Components --- 
const AppHeader = () => (
  <header className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex justify-between items-center">
    <div className="flex items-center space-x-4">
      <div className="font-bold text-xl flex items-center">
        <span className="w-8 h-8 bg-red-500 text-white flex items-center justify-center mr-1">H</span>
        HeightComparison
      </div>
      <nav className="hidden md:flex space-x-4 text-sm">
        <a className="hover:underline cursor-pointer">Home</a>
        <a className="hover:underline cursor-pointer">Height Calculator</a>
        <a className="hover:underline cursor-pointer">About</a>
        <a className="hover:underline cursor-pointer">Contact</a>
        <a className="text-blue-500 hover:underline cursor-pointer">Join us on Discord!</a>
      </nav>
    </div>
    <div className="flex items-center space-x-2">
      <button className="text-sm">Login</button>
      <button className="text-sm bg-red-500 text-white px-3 py-1 rounded">Sign Up &mdash; It&apos;s Free</button>
    </div>
  </header>
);

// --- ManagedImage Interface ---
interface ManagedImage {
  id: string;
  name: string;
  src: string;
  heightCm: number;
  aspectRatio: number;
  verticalOffsetCm: number;
  horizontalOffsetCm: number;
  color: string;
  gender: 'male' | 'female';
}

// --- Sidebar Props Interface ---
interface SidebarProps {
  images: ManagedImage[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ManagedImage>) => void;
  onAdd: (personData: Omit<ManagedImage, 'id'>) => void;
  onRemove: (id: string) => void;
  editingId?: string | null;
  onSetEditingId?: (id: string | null) => void;
  majorStep: number;
  className?: string;
}

// Add a type for the form data
interface PersonFormData {
  name: string;
  heightCm: number;
  gender: 'male' | 'female';
  color: string;
  customImage?: File;
}

// Add types for the PersonForm props
interface PersonFormProps {
  initialData?: PersonFormData;
  onSubmit: (data: Omit<ManagedImage, 'id'>) => void;
  buttonText?: string;
}

// Form component for adding/editing a person
const PersonForm: React.FC<PersonFormProps> = ({ 
  initialData = { 
    name: '', 
    heightCm: 0, // Changed from DEFAULT_HEIGHT_CM to 0 to represent "empty"
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
    // If height is 0 (empty), return empty values
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
    
    // Ensure valid ranges
    feet = Math.max(0, feet);
    inches = Math.max(0, Math.min(11.99, inches));
    
    // Convert to cm
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

  // Handle gender change with proper type handling
  const handleGenderChange = (gender: 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender }));
  };

  // Handle color change - This function will be passed to ColorPicker
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Handle custom image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the selected image
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
    // Get random values, but only apply them if user didn't provide input
    const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    const randomGender = Math.random() < 0.5 ? 'male' : 'female';
    
    // Calculate random height between 5'0" and 5'10" (in cm)
    const minHeightInches = 5 * 12; // 5 feet in inches
    const maxHeightInches = 5 * 12 + 10; // 5'10" in inches
    const randomHeightInches = minHeightInches + Math.random() * (maxHeightInches - minHeightInches);
    const randomHeightCm = randomHeightInches * CM_PER_INCH;
    
    // Determine if we should use user values or random values
    const isHeightEmpty = formData.heightCm === 0;
    const isColorDefault = formData.color === COLOR_OPTIONS[0];
    const isGenderDefault = formData.gender === initialData.gender;
    
    // Create person data with proper silhouette source and aspect ratio
    const finalGender = isGenderDefault ? randomGender : formData.gender;
    const finalHeight = isHeightEmpty ? randomHeightCm : formData.heightCm;
    const finalColor = isColorDefault ? randomColor : formData.color;
    
    try {
      // Handle custom image if provided
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
        // Use default silhouette if no custom image
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
      
      // Reset form for adding a new person
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
    <div className="space-y-4">
      {/* Gender Selection */}
      <div className="grid grid-cols-2 gap-1">
        <button
          className={`py-2 px-4 rounded-l border ${
            formData.gender === 'male' 
              ? 'bg-blue-100 border-blue-500' 
              : 'bg-white border-gray-300'
          }`}
          onClick={() => handleGenderChange('male')}
        >
          Male
        </button>
        <button
          className={`py-2 px-4 rounded-r border ${
            formData.gender === 'female' 
              ? 'bg-blue-100 border-blue-500' 
              : 'bg-white border-gray-300'
          }`}
          onClick={() => handleGenderChange('female')}
        >
          Female
        </button>
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input 
          type="text" 
          placeholder="(Optional)"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Height Input with Unit Toggle */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Height</label>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              className={`px-2 py-1 text-xs ${heightUnit === 'ft' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setHeightUnit('ft')}
            >
              ft
            </button>
            <button
              className={`px-2 py-1 text-xs ${heightUnit === 'cm' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setHeightUnit('cm')}
            >
              cm
            </button>
          </div>
        </div>
        
        {heightUnit === 'ft' ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                value={ftInValues.feet}
                onChange={e => handleFtInChange(e.target.value, 'feet')}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                step="1"
                placeholder="5"
              />
              <span className="absolute right-3 top-2 text-gray-500">ft</span>
            </div>
            <div className="relative flex-1">
              <input 
                type="number" 
                value={ftInValues.inches}
                onChange={e => handleFtInChange(e.target.value, 'inches')}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                max="11.99"
                step="0.1"
                placeholder="10"
              />
              <span className="absolute right-3 top-2 text-gray-500">in</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input 
              type="number" 
              value={formData.heightCm === 0 ? '' : Math.round(formData.heightCm)}
              onChange={e => handleCmChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              min="0" 
              step="1"
              placeholder="173"
            />
            <span className="absolute right-3 top-2 text-gray-500">cm</span>
          </div>
        )}
      </div>

      {/* Color Selection - Use the new ColorPicker component */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
        <ColorPicker 
          selectedColor={formData.color} 
          onChange={handleColorChange} 
        />
      </div>

      {/* Custom Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Image (Optional)</label>
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="custom-image-upload"
          />
          
          {uploadedImagePreview ? (
            <div className="relative w-full">
              <Image 
                src={uploadedImagePreview} 
                alt="Preview" 
                width={96}
                height={96}
                className="h-24 object-contain mx-auto mb-2 border border-gray-300 p-1 rounded"
              />
              <button
                onClick={clearCustomImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-2 border border-gray-300 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Choose Image</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Person Button */}
      <button
        className="w-full bg-blue-500 text-white p-3 rounded font-medium"
        onClick={handleSubmit}
      >
        {buttonText}
      </button>
    </div>
  );
};

// Sidebar component
const Sidebar: React.FC<SidebarProps> = ({ 
  images, 
  selectedId, 
  onSelect, 
  onUpdate, 
  onAdd, 
  onRemove,
  editingId,
  onSetEditingId,
  majorStep,
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'celebrities' | 'entities'>('add');
  const [localEditingId, setLocalEditingId] = useState<string | null>(null);
  // Removed unused state
  // const [formValues, setFormValues] = useState<PersonFormData>({
  //   name: '',
  //   heightCm: 0,
  //   gender: 'male',
  //   color: COLOR_OPTIONS[0]
  // });
  const [editingHeightUnit, setEditingHeightUnit] = useState<'ft' | 'cm'>('ft');
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Sync parent editingId with local state
  useEffect(() => {
    // Only update if editingId is explicitly defined (null is a valid value)
    if (editingId !== undefined) {
      setLocalEditingId(editingId);
      
      // If a new image is being edited
      if (editingId !== null) {
        // Removed form value update
        // const image = images.find(img => img.id === editingId);
        // if (image) {
        //   setFormValues({
        //     name: image.name,
        //     heightCm: image.heightCm,
        //     gender: image.gender,
        //     color: image.color
        //   });
        // }
      }
      
      // Scroll to the edited item when editingId changes
      if (editingId && sidebarContentRef.current && itemRefs.current[editingId]) {
        // Add a slight delay to ensure DOM updates are complete
        setTimeout(() => {
          const itemElement = itemRefs.current[editingId];
          if (itemElement && sidebarContentRef.current) {
            // Remove unused rect variables
            // Get the position of the item relative to the sidebar
            // const itemRect = itemElement.getBoundingClientRect();
            // const sidebarRect = sidebarContentRef.current.getBoundingClientRect();
            
            // Calculate offset to scroll to (accounting for some padding)
            const scrollOffset = itemElement.offsetTop - sidebarContentRef.current.offsetTop - 20;
            
            // Scroll the sidebar to the item
            sidebarContentRef.current.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            });
          }
        }, 50);
      }
    }
  }, [editingId, images]);
  
  // Handle clicking the edit button for a silhouette
  const handleEditClick = (id: string) => {
    const newEditingId = id === localEditingId ? null : id;
    setLocalEditingId(newEditingId);
    
    // Sync with parent state
    if (onSetEditingId) {
      onSetEditingId(newEditingId);
    }
    
    // Removed form value update
    // const image = images.find(img => img.id === id);
    // if (image) {
    //   setFormValues({
    //     name: image.name,
    //     heightCm: image.heightCm,
    //     gender: image.gender,
    //     color: image.color
    //   });
    // }
    
    // Scroll to the item when editing locally
    if (newEditingId !== null) {
      setTimeout(() => {
        const itemElement = itemRefs.current[id];
        if (itemElement && sidebarContentRef.current) {
          const scrollOffset = itemElement.offsetTop - sidebarContentRef.current.offsetTop - 20;
          sidebarContentRef.current.scrollTo({
            top: scrollOffset,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };
  
  // Handle done editing - update to also call the parent function
  const handleDoneEditing = () => {
    setLocalEditingId(null);
    // Also notify the parent to reset editingId
    if (onSetEditingId) {
      onSetEditingId(null);
    }
  };
  
  // Register item refs when they mount or remount
  const registerItemRef = (id: string, element: HTMLDivElement | null) => {
    itemRefs.current[id] = element;
  };

  // Helper to render the height in different units
  const renderHeight = (heightCm: number) => {
    // Calculate ft/in from cm
    const inches = heightCm / CM_PER_INCH;
    const feet = Math.floor(inches / 12);
    const remainingInches = Number((inches % 12).toFixed(2));
    
    return `${feet}ft ${remainingInches}inch`;
  };
  
  // Action bar at the top of the sidebar
  const renderActionBar = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <button
        className={`flex-1 py-3 text-center text-sm font-medium border-b-2 ${
          activeTab === 'add' 
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        onClick={() => setActiveTab('add')}
        data-tab="add"
      >
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Person</span>
        </div>
      </button>
      
      <button
        className={`flex-1 py-3 text-center text-sm font-medium border-b-2 ${
          activeTab === 'celebrities' 
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        onClick={() => setActiveTab('celebrities')}
        data-tab="celebrities"
      >
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>Celebrities</span>
        </div>
      </button>
      
      <button
        className={`flex-1 py-3 text-center text-sm font-medium border-b-2 ${
          activeTab === 'entities' 
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        onClick={() => setActiveTab('entities')}
        data-tab="entities"
      >
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span>Entities</span>
        </div>
      </button>
    </div>
  );
  
  // Render the list of existing silhouettes
  const renderSilhouetteList = () => {
    if (images.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No silhouettes added yet. Add your first silhouette using the form above.
        </div>
      );
    }
    
    return (
      <div className="p-2 space-y-2">
        {images.map(image => {
          const isDefaultSilhouette = image.src.includes('.svg') || image.src.startsWith('/images/');
          const currentEditingId = localEditingId !== null ? localEditingId : editingId;
          const isEditing = currentEditingId === image.id;
          
          return (
            <div 
              key={image.id}
              ref={(el) => registerItemRef(image.id, el)}
              className={`p-3 mb-2 bg-white dark:bg-gray-800 border rounded-t shadow-sm cursor-pointer flex flex-col text-sm
                ${selectedId === image.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}
                ${isEditing ? 'rounded-b-none' : 'rounded-b'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Avatar/Silhouette with coloring */}
                <div 
                  className={`w-10 h-10 rounded-full flex-shrink-0 overflow-hidden ${!isDefaultSilhouette ? '' : ''}`}
                  style={{
                    ...(isDefaultSilhouette ? {
                      // For SVG silhouettes, use mask approach
                      maskImage: `url(${image.src})`,
                      WebkitMaskImage: `url(${image.src})`,
                      maskSize: 'cover',
                      WebkitMaskSize: 'cover',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      backgroundColor: image.color // Use the color for the fill
                    } : {
                      // For custom images, use background image
                      backgroundImage: `url(${image.src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    })
                  }}
                  onClick={(e) => {
                    // First select this image
                    onSelect(image.id !== selectedId ? image.id : null);
                    
                    // Then toggle the edit mode if clicked while already selected
                    if (image.id === selectedId) {
                      e.stopPropagation();
                      handleEditClick(image.id);
                    }
                  }}
                ></div>
                
                <div className="flex-grow">
                  <div className="font-medium">{image.name || `Person ${image.id.slice(0, 3)}`}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(image.heightCm)}cm ({renderHeight(image.heightCm)})
                  </div>
                </div>
                
                <div>
                  <button 
                    onClick={() => handleEditClick(image.id)}
                    className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Expanded editing section */}
              {isEditing && (
                <div 
                  className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 rounded-b"
                  style={{
                    backgroundColor: isDefaultSilhouette ? `${image.color}15` : 'transparent' // Use silhouette color with alpha for background
                  }}
                >
                  {/* Done Editing button */}
                  <button 
                    className="w-full py-2 mb-3 bg-blue-100 text-blue-700 rounded flex items-center justify-center"
                    onClick={handleDoneEditing}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done Editing
                  </button>
                  
                  {/* Gender Selection */}
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    <button
                      className={`py-2 px-4 rounded-l border ${
                        image.gender === 'male' 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => onUpdate(image.id, { gender: 'male' })}
                    >
                      Male
                    </button>
                    <button
                      className={`py-2 px-4 rounded-r border ${
                        image.gender === 'female' 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => onUpdate(image.id, { gender: 'female' })}
                    >
                      Female
                    </button>
                  </div>
                  
                  {/* Name Input */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name"
                      value={image.name}
                      onChange={(e) => onUpdate(image.id, { name: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                  </div>
                  
                  {/* Height Input with Unit Toggle */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                      <div className="flex border rounded overflow-hidden">
                        <button 
                          className={`px-2 py-1 text-xs ${editingHeightUnit === 'ft' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => setEditingHeightUnit('ft')}
                        >
                          ft
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs ${editingHeightUnit === 'cm' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => setEditingHeightUnit('cm')}
                        >
                          cm
                        </button>
                      </div>
                    </div>
                    
                    {editingHeightUnit === 'ft' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input 
                            type="number" 
                            value={Math.floor(image.heightCm / CM_PER_INCH / INCHES_PER_FOOT)}
                            onChange={(e) => {
                              const feet = parseFloat(e.target.value) || 0;
                              const inches = (image.heightCm / CM_PER_INCH) % INCHES_PER_FOOT;
                              const newHeightCm = (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
                              onUpdate(image.id, { heightCm: newHeightCm });
                            }}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                            min="0"
                            step="1"
                          />
                          <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">ft</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={Number(((image.heightCm / CM_PER_INCH) % INCHES_PER_FOOT).toFixed(2))}
                            onChange={(e) => {
                              const feet = Math.floor(image.heightCm / CM_PER_INCH / INCHES_PER_FOOT);
                              const inches = parseFloat(e.target.value) || 0;
                              const newHeightCm = (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
                              onUpdate(image.id, { heightCm: newHeightCm });
                            }}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                            min="0" 
                            max="11.99"
                            step="0.01"
                          />
                          <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">in</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="number" 
                          value={Math.round(image.heightCm)}
                          onChange={(e) => onUpdate(image.id, { heightCm: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                          min="0" 
                          step="1"
                        />
                        <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">cm</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Color Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <ColorPicker 
                      selectedColor={image.color}
                      onChange={(color) => onUpdate(image.id, { color })}
                    />
                  </div>

                  {/* Vertical Adjustment */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vertical Adjustment</label>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          const stepSize = majorStep / 20; // 1/20th of the major step
                          onUpdate(image.id, { verticalOffsetCm: (image.verticalOffsetCm || 0) + stepSize });
                        }}
                        className="p-2 rounded-l flex items-center justify-center hover:bg-opacity-80"
                        style={{ 
                          backgroundColor: image.color,
                          color: 'white'
                        }}
                        title="Move up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <div className="flex-grow text-center text-sm text-gray-600 dark:text-gray-400 px-2 py-2 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                        {(image.verticalOffsetCm || 0).toFixed(2)} cm
                      </div>
                      <button
                        onClick={() => {
                          const stepSize = majorStep / 20; // 1/20th of the major step
                          onUpdate(image.id, { verticalOffsetCm: (image.verticalOffsetCm || 0) - stepSize });
                        }}
                        className="p-2 rounded-r flex items-center justify-center hover:bg-opacity-80"
                        style={{ 
                          backgroundColor: image.color,
                          color: 'white'
                        }}
                        title="Move down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 italic">
                      Adjust to align feet position to ground level
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Step size: {(majorStep / 20).toFixed(2)} cm
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      onRemove(image.id);
                      setLocalEditingId(null);
                    }}
                    className="w-full py-2 mt-2 bg-red-100 text-red-700 rounded flex items-center justify-center hover:bg-red-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Conditional rendering based on active tab
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden sidebar-tabs ${className}`}>
      {renderActionBar()}
      
      <div ref={sidebarContentRef} className="flex-1 overflow-y-auto">
        {activeTab === 'add' && (
          <>
            <div className="p-4">
              <PersonForm onSubmit={onAdd} buttonText="Add Person" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'celebrities' && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Celebrity silhouettes will appear here.
          </div>
        )}
        
        {activeTab === 'entities' && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Entity silhouettes will appear here.
          </div>
        )}
      </div>
    </div>
  );
};

// Define props for ComparerControls
interface ComparerControlsProps {
  onClearAll: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomChange?: (value: number) => void;
  zoomLevel?: number;
}

// Controls for the comparer (accepts props)
const ComparerControls: React.FC<ComparerControlsProps> = ({ 
  onClearAll,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  zoomLevel = 50 
}) => (
  <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-10 sticky top-[0px]">
    <div className="flex items-center space-x-1">
      <button 
        title="Zoom Out" 
        className="p-1 border rounded flex items-center justify-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onZoomOut}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="range"
        min="10"
        max="100"
        value={zoomLevel}
        onChange={(e) => onZoomChange && onZoomChange(parseInt(e.target.value))}
        className="w-24 h-[4px]"
      />
      <button 
        title="Zoom In" 
        className="p-1 border rounded flex items-center justify-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onZoomIn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
    <div className="flex-grow text-center text-xs text-gray-500">HeightComparison.com</div>
    <div className="flex items-center space-x-1">
      <button 
        className="text-xs p-1 border rounded" 
        title="Clear All"
        onClick={onClearAll}
      >
        Clear All
      </button>
      <button className="text-xs p-1 border rounded" title="Edit">Edit</button>
      <button className="text-xs p-1 border rounded" title="More Options">•••</button>
      <button className="text-xs p-1 bg-blue-500 text-white rounded px-3" title="Share">Share</button>
    </div>
  </div>
);

// --- Helper Functions ---
// Removed unused function

// Removed unused function

export default function Home() {
  // Initialize with default empty state
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(50);
  const [majorStep, setMajorStep] = useState<number>(10); // Store major step value

  // --- Load state from localStorage on initial client mount ---
  useEffect(() => {
    // Ensure localStorage is available (client-side only)
    if (typeof window !== 'undefined' && window.localStorage) {
      // Load images
      const savedImages = localStorage.getItem('heightCompareImages');
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          // Optional: Add validation here to ensure parsedImages matches ManagedImage[] structure
          if (Array.isArray(parsedImages)) {
             setImages(parsedImages);
          }
        } catch (error) {
          console.error("Error parsing saved images from localStorage:", error);
          localStorage.removeItem('heightCompareImages'); // Clear invalid data
        }
      }

      // Load selectedId
      const savedSelectedId = localStorage.getItem('heightCompareSelectedId');
      if (savedSelectedId && savedSelectedId !== 'null') {
        setSelectedId(savedSelectedId);
      } else {
        setSelectedId(null); // Ensure it's null if not found or explicitly 'null'
      }
      
      // Load zoom level
      const savedZoomLevel = localStorage.getItem('heightCompareZoomLevel');
      if (savedZoomLevel) {
        try {
          const zoomValue = parseInt(savedZoomLevel);
          if (!isNaN(zoomValue) && zoomValue >= 10 && zoomValue <= 100) {
            setZoomLevel(zoomValue);
          }
        } catch (error) {
          console.error("Error parsing zoom level:", error);
        }
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Save images state to localStorage whenever it changes ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('heightCompareImages', JSON.stringify(images));
    }
  }, [images]); // Dependency array includes images

  // --- Save selectedId state to localStorage whenever it changes ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('heightCompareSelectedId', selectedId === null ? 'null' : selectedId);
    }
  }, [selectedId]); // Dependency array includes selectedId

  // Reset editingId when selectedId changes to null
  useEffect(() => {
    if (selectedId === null) {
      setEditingId(null);
    }
  }, [selectedId]);

  // --- Save zoom level to localStorage whenever it changes ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('heightCompareZoomLevel', zoomLevel.toString());
    }
  }, [zoomLevel]);

  // --- Callbacks --- 
  // Add new person
  const handleAddPerson = useCallback((personData: Omit<ManagedImage, 'id'>) => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can only compare up to ${MAX_IMAGES} persons.`);
      return;
    }
    
    const newId = Date.now().toString();
    const newPerson: ManagedImage = {
      id: newId,
      ...personData
    };
    
    setImages(prev => [...prev, newPerson]);
    setSelectedId(newId); // Select the newly added person
  }, [images]);

  // Select person
  const handleSelectPerson = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  // Remove person
  const handleRemovePerson = useCallback((idToRemove: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== idToRemove));
    if (selectedId === idToRemove) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Update person
  const handleUpdatePerson = useCallback((idToUpdate: string, updates: Partial<ManagedImage>) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === idToUpdate 
          ? { 
              ...img, 
              ...updates,
              // If gender changed and there's no custom image, update the SVG and aspect ratio
              ...(updates.gender && updates.gender !== img.gender && 
                (img.src === MALE_SILHOUETTE_SVG || img.src === FEMALE_SILHOUETTE_SVG) ? {
                src: updates.gender === 'male' ? MALE_SILHOUETTE_SVG : FEMALE_SILHOUETTE_SVG,
                aspectRatio: updates.gender === 'male' ? MALE_ASPECT_RATIO : FEMALE_ASPECT_RATIO
              } : {}),
              // No need to update src for color changes since we handle that with CSS now
            } 
          : img
      )
    );
  }, []);

  // Add Clear All callback
  const handleClearAll = useCallback(() => {
    setImages([]);
    setSelectedId(null);
  }, []);

  // Add zoom control handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(100, prev + 10));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(10, prev - 10));
  }, []);
  
  const handleZoomChange = useCallback((value: number) => {
    setZoomLevel(value);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <AppHeader />

      {/* Main content area with Sidebar and Comparer */}
      <div className="flex flex-grow overflow-hidden"> 
        <Sidebar 
          images={images}
          selectedId={selectedId}
          onSelect={handleSelectPerson}
          onUpdate={handleUpdatePerson} 
          onAdd={handleAddPerson} 
          onRemove={handleRemovePerson} 
          editingId={editingId}
          onSetEditingId={setEditingId}
          majorStep={majorStep} // Pass major step to sidebar
          className="w-full h-[25vh] md:h-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto"
        />

        {/* Main Comparison Area */} 
        <main className="flex flex-col w-full h-[75vh] md:h-auto md:flex-grow overflow-hidden">
          <ComparerControls 
            onClearAll={handleClearAll}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomChange={handleZoomChange}
            zoomLevel={zoomLevel} 
          />
          {/* Comparer component container */} 
          <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden h-full md:h-[60vh]"> 
            <ImageComparer 
              images={images}
              zoomLevel={zoomLevel}
              onMajorStepChange={setMajorStep} // Get major step from ImageComparer
              onEdit={(id) => {
                // If the image is already being edited, then clicking it should close the edit sidebar
                const isAlreadyEditing = editingId === id;
                
                // Always set selectedId to the clicked image
                setSelectedId(id);
                
                // Ensure the activeTab is set to 'add' and the editingId is set to the clicked image
                const sidebarElement = document.querySelector('.sidebar-tabs');
                if (sidebarElement) {
                  // Set the active tab to 'add' to ensure the editing interface is visible
                  const addTabButton = sidebarElement.querySelector('[data-tab="add"]');
                  if (addTabButton) {
                    (addTabButton as HTMLElement).click();
                  }
                }
                
                // Toggle the editing state - if already editing this image, close it
                setTimeout(() => {
                  setEditingId(isAlreadyEditing ? null : id);
                }, 50);

                // On mobile, scroll to the sidebar
                if (window.innerWidth < 768) {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }}
              onDelete={handleRemovePerson}
              onImageUpdate={handleUpdatePerson}
            /> 
          </div>
        </main>

      </div>
    </div>
  );
}
