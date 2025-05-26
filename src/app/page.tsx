'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ImageComparer from '@/components/ImageComparer';
import ColorPicker from '@/components/ColorPicker';
import Image from 'next/image';
import Link from 'next/link';
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
const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="p-3 md:p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="font-heading font-bold text-xl md:text-2xl flex items-center text-gray-900 dark:text-white">
            <span className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center mr-2 rounded-lg shadow-lg font-bold text-sm md:text-base">H</span>
            HeightsComparison
          </div>
          {/* Menu button for mobile */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 text-base font-medium">
            <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Home</Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">About</Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Contact</Link>
          </nav>
        </div>
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors">Login</button>
          <button className="text-base font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all">Sign Up — It&apos;s Free</button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-full bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <div className="flex flex-col p-4 space-y-1">
            <Link href="/" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Home</Link>
            <Link href="/about" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">About</Link>
            <Link href="/contact" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Contact</Link>
            <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
            <button className="text-left py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Login</button>
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg text-left text-base font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all">Sign Up — It&apos;s Free</button>
          </div>
        </nav>
      )}
    </header>
  );
};

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

      {/* Color Selection - Use the new ColorPicker component */}
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
  const desktopSidebarContentRef = useRef<HTMLDivElement>(null);
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
      if (editingId && itemRefs.current[editingId]) {
        // Add a slight delay to ensure DOM updates are complete
        setTimeout(() => {
          const itemElement = itemRefs.current[editingId];
          const mobileSidebar = sidebarContentRef.current;
          const desktopSidebar = desktopSidebarContentRef.current;
          
          if (itemElement) {
            // Check which sidebar is visible and scroll accordingly
            if (mobileSidebar && window.innerWidth < 768) {
              // Mobile layout
              const scrollOffset = itemElement.offsetTop - mobileSidebar.offsetTop - 20;
              mobileSidebar.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
              });
            } else if (desktopSidebar && window.innerWidth >= 768) {
              // Desktop layout
              const scrollOffset = itemElement.offsetTop - desktopSidebar.offsetTop - 20;
              desktopSidebar.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
              });
            }
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
        const mobileSidebar = sidebarContentRef.current;
        const desktopSidebar = desktopSidebarContentRef.current;
        
        if (itemElement) {
          // Check which sidebar is visible and scroll accordingly
          if (mobileSidebar && window.innerWidth < 768) {
            // Mobile layout
            const scrollOffset = itemElement.offsetTop - mobileSidebar.offsetTop - 20;
            mobileSidebar.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            });
          } else if (desktopSidebar && window.innerWidth >= 768) {
            // Desktop layout
            const scrollOffset = itemElement.offsetTop - desktopSidebar.offsetTop - 20;
            desktopSidebar.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            });
          }
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
        className={`flex-1 py-1.5 md:py-3 text-center text-xs md:text-sm font-medium border-b-2 ${
          activeTab === 'add' 
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        onClick={() => setActiveTab('add')}
        data-tab="add"
      >
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5 mb-0.5 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs md:text-sm">Add</span>
        </div>
      </button>
      
      <button
        className={`flex-1 py-1.5 md:py-3 text-center text-xs md:text-sm font-medium border-b-2 ${
          activeTab === 'celebrities' 
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        onClick={() => setActiveTab('celebrities')}
        data-tab="celebrities"
      >
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5 mb-0.5 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="text-xs md:text-sm">Stars</span>
        </div>
      </button>
      
      <button
        className={`flex-1 py-1.5 md:py-3 text-center text-xs md:text-sm font-medium border-b-2 ${
          activeTab === 'entities' 
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        onClick={() => setActiveTab('entities')}
        data-tab="entities"
      >
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5 mb-0.5 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-xs md:text-sm">More</span>
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
      <div className="p-1 md:p-2 space-y-1 md:space-y-2">
        {images.map(image => {
          const isDefaultSilhouette = image.src.includes('.svg') || image.src.startsWith('/images/');
          const currentEditingId = localEditingId !== null ? localEditingId : editingId;
          const isEditing = currentEditingId === image.id;
          
          return (
            <div 
              key={image.id}
              ref={(el) => registerItemRef(image.id, el)}
              className={`p-2 md:p-3 mb-1 md:mb-2 bg-white dark:bg-gray-800 border rounded-t shadow-sm cursor-pointer flex flex-col text-xs md:text-sm
                ${selectedId === image.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}
                ${isEditing ? 'rounded-b-none' : 'rounded-b'}
              `}
            >
              <div className="flex items-center gap-2 md:gap-3">
                {/* Avatar/Silhouette with coloring */}
                <div 
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 overflow-hidden ${!isDefaultSilhouette ? '' : ''}`}
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
                  <div className="font-medium text-xs md:text-sm">{image.name || `Person ${image.id.slice(0, 3)}`}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(image.heightCm)}cm ({renderHeight(image.heightCm)})
                  </div>
                </div>
                
                <div>
                  <button 
                    onClick={() => handleEditClick(image.id)}
                    className="p-0.5 md:p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Expanded editing section */}
              {isEditing && (
                <div 
                  className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700 rounded-b space-y-2 md:space-y-3"
                  style={{
                    backgroundColor: isDefaultSilhouette ? `${image.color}15` : 'transparent'
                  }}
                >
                  {/* Done Editing button */}
                  <button 
                    className="w-full py-1 md:py-2 mb-2 md:mb-3 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-xs md:text-sm"
                    onClick={handleDoneEditing}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done Editing
                  </button>
                  
                  {/* Gender Selection */}
                  <div className="grid grid-cols-2 gap-0.5 md:gap-1 mb-2 md:mb-3">
                    <button
                      className={`py-1 md:py-2 px-2 md:px-4 rounded-l border text-xs md:text-sm ${
                        image.gender === 'male' 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => onUpdate(image.id, { gender: 'male' })}
                    >
                      Male
                    </button>
                    <button
                      className={`py-1 md:py-2 px-2 md:px-4 rounded-r border text-xs md:text-sm ${
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
                  <div className="mb-2 md:mb-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 md:mb-1">Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name"
                      value={image.name}
                      onChange={(e) => onUpdate(image.id, { name: e.target.value })}
                      className="w-full p-1 md:p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs md:text-sm"
                      suppressHydrationWarning={true}
                    />
                  </div>
                  
                  {/* Height Input with Unit Toggle */}
                  <div className="mb-2 md:mb-3">
                    <div className="flex justify-between items-center mb-0.5 md:mb-1">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                      <div className="flex border rounded overflow-hidden">
                        <button 
                          className={`px-1 md:px-2 py-0.5 md:py-1 text-xs ${editingHeightUnit === 'ft' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => setEditingHeightUnit('ft')}
                        >
                          ft
                        </button>
                        <button 
                          className={`px-1 md:px-2 py-0.5 md:py-1 text-xs ${editingHeightUnit === 'cm' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => setEditingHeightUnit('cm')}
                        >
                          cm
                        </button>
                      </div>
                    </div>
                    
                    {editingHeightUnit === 'ft' ? (
                      <div className="grid grid-cols-2 gap-1 md:gap-2">
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
                            className="w-full p-1 md:p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs md:text-sm"
                            min="0"
                            step="1"
                            suppressHydrationWarning={true}
                          />
                          <span className="absolute right-1 md:right-3 top-1 md:top-2 text-gray-500 dark:text-gray-400 text-xs">ft</span>
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
                            className="w-full p-1 md:p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs md:text-sm"
                            min="0" 
                            max="11.99"
                            step="0.01"
                            suppressHydrationWarning={true}
                          />
                          <span className="absolute right-1 md:right-3 top-1 md:top-2 text-gray-500 dark:text-gray-400 text-xs">in</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="number" 
                          value={Math.round(image.heightCm)}
                          onChange={(e) => onUpdate(image.id, { heightCm: parseFloat(e.target.value) || 0 })}
                          className="w-full p-1 md:p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs md:text-sm"
                          min="0" 
                          step="1"
                          suppressHydrationWarning={true}
                        />
                        <span className="absolute right-1 md:right-3 top-1 md:top-2 text-gray-500 dark:text-gray-400 text-xs">cm</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Color Selection */}
                  <div className="mb-2 md:mb-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 md:mb-1">Color</label>
                    <ColorPicker 
                      selectedColor={image.color}
                      onChange={(color) => onUpdate(image.id, { color })}
                    />
                  </div>

                  {/* Vertical Adjustment */}
                  <div className="mb-2 md:mb-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 md:mb-1">Vertical Adjustment</label>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          const stepSize = majorStep / 20;
                          onUpdate(image.id, { verticalOffsetCm: (image.verticalOffsetCm || 0) + stepSize });
                        }}
                        className="p-1 md:p-2 rounded-l flex items-center justify-center hover:bg-opacity-80"
                        style={{ 
                          backgroundColor: image.color,
                          color: 'white'
                        }}
                        title="Move up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <div className="flex-grow text-center text-xs md:text-sm text-gray-600 dark:text-gray-400 px-1 md:px-2 py-1 md:py-2 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                        {(image.verticalOffsetCm || 0).toFixed(2)} cm
                      </div>
                      <button
                        onClick={() => {
                          const stepSize = majorStep / 20;
                          onUpdate(image.id, { verticalOffsetCm: (image.verticalOffsetCm || 0) - stepSize });
                        }}
                        className="p-1 md:p-2 rounded-r flex items-center justify-center hover:bg-opacity-80"
                        style={{ 
                          backgroundColor: image.color,
                          color: 'white'
                        }}
                        title="Move down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 md:mt-1 italic">
                      Adjust to align feet position to ground level
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 md:mt-1">
                      Step size: {(majorStep / 20).toFixed(2)} cm
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      onRemove(image.id);
                      setLocalEditingId(null);
                    }}
                    className="w-full py-1 md:py-2 mt-1 md:mt-2 bg-red-100 text-red-700 rounded flex items-center justify-center hover:bg-red-200 text-xs md:text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      {/* Desktop: Show tabs, Mobile: Hide tabs */}
      <div className="hidden md:block">
        {renderActionBar()}
      </div>
      
      {/* Mobile: Two column layout */}
      <div className="md:hidden flex-1 overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          {/* Left Column: Add Person */}
          <div className="border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-center text-xs font-medium text-gray-700 dark:text-gray-300 py-1">
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Person
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              <PersonForm onSubmit={onAdd} buttonText="Add" />
            </div>
          </div>
          
          {/* Right Column: People List */}
          <div className="flex flex-col overflow-hidden">
            <div className="p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-center text-xs font-medium text-gray-700 dark:text-gray-300 py-1">
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  People ({images.length})
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto" ref={sidebarContentRef}>
              {images.length === 0 ? (
                <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-xs">
                  No people added yet
                </div>
              ) : (
                renderSilhouetteList()
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop: Original tabbed content */}
      <div className="hidden md:block flex-1 overflow-y-auto" ref={desktopSidebarContentRef}>
        {activeTab === 'add' && (
          <>
            <div className="p-1.5 md:p-4">
              <PersonForm onSubmit={onAdd} buttonText="Add Person" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'celebrities' && (
          <div className="p-1.5 md:p-4 text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">
            Celebrity silhouettes will appear here.
          </div>
        )}
        
        {activeTab === 'entities' && (
          <div className="p-1.5 md:p-4 text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">
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
  className?: string;
}

// Controls for the comparer (accepts props)
const ComparerControls: React.FC<ComparerControlsProps> = ({ 
  onClearAll,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  zoomLevel = 50,
  className
}) => (
  <div className={`h-10 md:h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-1 md:px-4 z-10 sticky top-[0px] ${className}`}>
    <div className="flex items-center space-x-0.5 md:space-x-1">
      <button 
        title="Zoom Out" 
        className="p-0.5 md:p-1 border rounded flex items-center justify-center w-6 h-6 md:w-8 md:h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onZoomOut}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="range"
        min="10"
        max="100"
        value={zoomLevel}
        onChange={(e) => onZoomChange && onZoomChange(parseInt(e.target.value))}
        className="w-16 md:w-24 h-[4px]"
      />
      <button 
        title="Zoom In" 
        className="p-0.5 md:p-1 border rounded flex items-center justify-center w-6 h-6 md:w-8 md:h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onZoomIn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
    <div className="flex-grow text-center text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 px-1 md:px-2">
      <span className="md:hidden">HeightsCompare.com</span>
      <span className="hidden md:inline">HeightsComparison.com</span>
    </div>
    <div className="flex items-center space-x-0.5 md:space-x-1">
      <button 
        className="text-xs p-0.5 md:p-1 border rounded" 
        title="Clear All"
        onClick={onClearAll}
      >
        <span className="hidden md:inline">Clear All</span>
        <span className="md:hidden">Clear</span>
      </button>
      <button className="text-xs p-0.5 md:p-1 border rounded hidden md:block" title="Edit">Edit</button>
      <button className="text-xs p-0.5 md:p-1 border rounded" title="More Options">•••</button>
      <button className="text-xs p-0.5 md:p-1 bg-blue-500 text-white rounded px-1 md:px-3" title="Share">
        <span className="hidden md:inline">Share</span>
        <span className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </span>
      </button>
    </div>
  </div>
);

// --- Helper Functions ---
// Removed unused function

// Removed unused function

// SEO Content Component
const SEOContent = () => (
  <section className="bg-gray-50 dark:bg-gray-900 py-16 mt-8">
    <div className="container mx-auto px-4 max-w-6xl">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        The Ultimate Height Comparison Tool
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Visual Height Comparisons</h3>
          <p className="text-gray-600 dark:text-gray-300">Compare heights of celebrities, athletes, friends, and family members with our intuitive height comparison chart interface.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Height Conversion & Comparison</h3>
          <p className="text-gray-600 dark:text-gray-300">Get height differences in both metric (cm) and imperial (feet, inches to cm) units with our height comparator tool.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Easy Height Comparing</h3>
          <p className="text-gray-600 dark:text-gray-300">Simply add people, set their heights, and instantly see the height difference comparison. Works on all devices for comparing heights.</p>
        </div>
      </div>

      <div className="prose prose-lg max-w-4xl mx-auto text-gray-700 dark:text-gray-300">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">How to Use the Height Comparison Tool</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-8">
          <li>Click &quot;Add Person&quot; to create a new silhouette for height comparing</li>
          <li>Enter the person&apos;s name and height in cm or feet/inches for height conversion</li>
          <li>Choose male or female silhouette and customize the color</li>
          <li>Add multiple people to compare heights side by side using our height comparator</li>
          <li>Drag and position the silhouettes for the perfect height comparison chart</li>
          <li>Use zoom controls to get a better view of height differences</li>
        </ol>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Popular Height Comparison Use Cases</h3>
        <p className="mb-4">Our height comparison tool is perfect for comparing heights in various scenarios:</p>
        <ul className="list-disc ml-6 space-y-2 mb-8">
          <li><strong>Celebrity Height Comparisons:</strong> Compare heights of your favorite celebrities, actors, and public figures</li>
          <li><strong>Sports & Athletics:</strong> Height comparing for NBA players, soccer stars, and athletes from different disciplines</li>
          <li><strong>Recruitment Agencies:</strong> Visual height assessment for modeling, acting, and sports recruitment</li>
          <li><strong>Modeling Industry:</strong> Height comparison charts for fashion shows, photo shoots, and casting calls</li>
          <li><strong>Entertainment Casting:</strong> Compare height differences for movie roles, TV shows, and theater productions</li>
          <li><strong>Family & Friends:</strong> Fun height comparisons for family photos and group events</li>
          <li><strong>Historical Figures:</strong> Height comparing of famous historical personalities</li>
          <li><strong>Average Human Height Studies:</strong> Compare against average human height statistics by country and age</li>
          <li><strong>Dating & Social:</strong> Understanding height differences in relationships and social settings</li>
          <li><strong>Medical & Health:</strong> Height tracking and comparison for growth monitoring</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Height Comparison Examples & Scenarios</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Professional Use Cases</h4>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Modeling Agencies:</strong> Compare model heights for runway shows and photo shoots</li>
              <li><strong>Sports Recruiters:</strong> Height analysis for basketball, volleyball, and other height-dependent sports</li>
              <li><strong>Film & TV Casting:</strong> Ensure proper height ratios between actors in scenes</li>
              <li><strong>Fashion Industry:</strong> Height comparison charts for clothing size standards</li>
              <li><strong>Talent Agencies:</strong> Visual height assessment for various entertainment roles</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Personal & Educational</h4>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Family Growth Tracking:</strong> Monitor children&apos;s height progress over time</li>
              <li><strong>Educational Projects:</strong> Height comparison studies and statistics</li>
              <li><strong>Social Media Content:</strong> Create engaging height comparison posts</li>
              <li><strong>Fitness & Health:</strong> Compare heights in fitness and bodybuilding communities</li>
              <li><strong>Travel Planning:</strong> Understanding average human height in different countries</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Features & Benefits</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Free Height Comparison Tool</h4>
            <p>Use our height comparison tool completely free with no registration required. Compare up to 50 people at once for comprehensive height comparing.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Mobile-Responsive Height Comparator</h4>
            <p>Works perfectly on smartphones, tablets, and desktop computers with touch-friendly controls for easy height comparison on any device.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Custom Images for Height Compare</h4>
            <p>Upload your own photos or use our default silhouettes for personalized height comparison charts and visual height analysis.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Height Conversion Calculator</h4>
            <p>Built-in height conversion between feet, inches to cm and metric units for international height comparing needs.</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Height Conversion & Measurement Guide</h3>
        <p className="mb-4">
          Our height comparison tool includes comprehensive height conversion capabilities:
        </p>
        <ul className="list-disc ml-6 space-y-2 mb-6">
          <li><strong>Feet, Inches to CM:</strong> Automatic conversion from imperial to metric measurements</li>
          <li><strong>CM to Feet/Inches:</strong> Convert centimeters to feet and inches for height comparing</li>
          <li><strong>Average Human Height Reference:</strong> Compare against global height averages by gender and region</li>
          <li><strong>Height Difference Calculator:</strong> Instantly see exact height differences between people</li>
          <li><strong>Multiple Unit Display:</strong> View heights in both metric and imperial simultaneously</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Why Choose Our Height Comparison Tool?</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Instant Height Comparing:</strong> No downloads or installations required for height comparison</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Professional Height Comparison Charts:</strong> Perfect for recruitment agencies and modeling industry</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Comprehensive Height Conversion:</strong> Support for all major measurement units</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Visual Height Difference Analysis:</strong> Clear, easy-to-understand height comparisons</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Multi-Person Height Compare:</strong> Compare multiple heights simultaneously</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

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
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Height Comparison Tool - Full Viewport Height */}
      <div className="flex flex-col h-screen overflow-hidden">
        <AppHeader />

        {/* Main content area with Sidebar and Comparer */}
        <div className="flex flex-col md:flex-row flex-grow overflow-y-auto md:overflow-hidden"> 
          {/* Main Comparison Area - 75% width on desktop */}
          <div className="flex flex-col overflow-hidden order-1 min-h-[70vh] md:min-h-0 md:w-3/4">
            <ComparerControls 
              onClearAll={handleClearAll}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomChange={handleZoomChange}
              zoomLevel={zoomLevel}
              className="sticky top-0 z-20 bg-white dark:bg-gray-900"
            />
            
            {/* Comparer component container */} 
            <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden flex-grow md:min-h-0"> 
              <ImageComparer 
                images={images}
                zoomLevel={zoomLevel}
                onMajorStepChange={setMajorStep}
                onEdit={(id) => {
                  const isAlreadyEditing = editingId === id;
                  setSelectedId(id);
                  
                  const sidebarElement = document.querySelector('.sidebar-tabs');
                  if (sidebarElement) {
                    const addTabButton = sidebarElement.querySelector('[data-tab="add"]');
                    if (addTabButton) {
                      (addTabButton as HTMLElement).click();
                    }
                  }
                  
                  setTimeout(() => {
                    setEditingId(isAlreadyEditing ? null : id);
                  }, 50);

                  // On mobile, smooth scroll to the sidebar
                  if (window.innerWidth < 768) {
                    const sidebarElement = document.querySelector('.sidebar-tabs');
                    if (sidebarElement) {
                      sidebarElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                onDelete={handleRemovePerson}
                onImageUpdate={handleUpdatePerson}
              />
            </div>
          </div>

          {/* Sidebar - 25% width on desktop */}
          <Sidebar 
            images={images}
            selectedId={selectedId}
            onSelect={handleSelectPerson}
            onUpdate={handleUpdatePerson} 
            onAdd={handleAddPerson} 
            onRemove={handleRemovePerson} 
            editingId={editingId}
            onSetEditingId={setEditingId}
            majorStep={majorStep}
            className="w-full md:w-1/4 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col md:overflow-y-auto order-2 md:max-h-none md:h-full"
          />
        </div>
      </div>

      {/* SEO Content Section - Below the main tool, accessible by scrolling */}
      <SEOContent />
    </div>
  );
}
