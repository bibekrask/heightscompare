'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ImageComparer from '@/components/ImageComparer';
import ColorPicker from '@/components/ColorPicker';
// import AddSection from '@/components/AddSection'; // To be replaced by Sidebar logic
// import EditSection from '@/components/EditSection'; // To be replaced by Sidebar logic

// --- Constants and Shared Data --- 
const DEFAULT_HEIGHT_CM = 180;
const MAX_IMAGES = 50;
const OFFSET_MIN_CM = -100;
const OFFSET_MAX_CM = 100;
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


// Convert SVG string to data URL
const svgToDataUrl = (svgString: string, color = '#000000') => {
  // Replace the currentColor with the specified color
  const coloredSvg = svgString.replace('currentColor', color);
  // Encode the SVG for use in data URL
  const encoded = encodeURIComponent(coloredSvg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
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
      <button className="text-sm bg-red-500 text-white px-3 py-1 rounded">Sign Up — It's Free</button>
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
}

// Add a type for the form data
interface PersonFormData {
  name: string;
  heightCm: number;
  gender: 'male' | 'female';
  color: string;
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
          heightCm: DEFAULT_HEIGHT_CM,
    gender: 'male',
    color: COLOR_OPTIONS[0]
  }, 
  onSubmit, 
  buttonText = "Add Person" 
}) => {
  const [formData, setFormData] = useState<PersonFormData>(initialData);
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  
  // Calculate ft/in from cm for the inputs
  const ftInValues = useMemo(() => {
    const inches = formData.heightCm / CM_PER_INCH;
    const feet = Math.floor(inches / 12);
    const remainingInches = Number((inches % 12).toFixed(2));
    return { feet, inches: remainingInches };
  }, [formData.heightCm]);

  // Handle height changes in feet/inches
  const handleFtInChange = (value: string, field: 'feet' | 'inches') => {
    const newValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(newValue)) return;
    
    let feet = field === 'feet' ? newValue : ftInValues.feet;
    let inches = field === 'inches' ? newValue : ftInValues.inches;
    
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

  // Handle form submission
  const handleSubmit = () => {
    // Create person data with proper silhouette source and aspect ratio
    onSubmit({
      ...formData,
      aspectRatio: formData.gender === 'male' ? MALE_ASPECT_RATIO : FEMALE_ASPECT_RATIO,
      src: formData.gender === 'male' ? MALE_SILHOUETTE_SVG : FEMALE_SILHOUETTE_SVG,
      verticalOffsetCm: 0,
      horizontalOffsetCm: 0
    });
    
    // Reset form for adding a new person
    setFormData({ 
      name: '', 
      heightCm: DEFAULT_HEIGHT_CM, 
      gender: 'male',
      color: COLOR_OPTIONS[0]
    });
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
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-2 py-1 text-xs ${heightUnit === 'ft' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setHeightUnit('ft')}
            >
              ft
            </button>
            <button 
              className={`px-2 py-1 text-xs ${heightUnit === 'cm' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setHeightUnit('cm')}
            >
              cm
            </button>
          </div>
        </div>
        
        {heightUnit === 'ft' ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
                      <input 
                        type="number" 
                value={ftInValues.feet}
                onChange={e => handleFtInChange(e.target.value, 'feet')}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                step="1"
              />
              <span className="absolute right-3 top-2 text-gray-500">ft</span>
                    </div>
            <div className="relative">
                            <input 
                                type="number" 
                value={ftInValues.inches}
                onChange={e => handleFtInChange(e.target.value, 'inches')}
                className="w-full p-2 border border-gray-300 rounded"
                                min="0" 
                max="11.99"
                step="0.1"
                            />
              <span className="absolute right-3 top-2 text-gray-500">inch</span>
            </div>
                        </div>
        ) : (
          <div className="relative">
                            <input 
                                type="number" 
              value={Math.round(formData.heightCm)}
              onChange={e => handleCmChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
                                min="0" 
              step="1"
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

      {/* Avatar Selection - Simplified for now */}
      <div>
        <button className="flex items-center justify-center w-full p-2 border border-gray-300 rounded">
          <span>Choose Avatar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
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

// Sidebar component with tabs and functionality for adding/editing silhouettes
const Sidebar: React.FC<SidebarProps & { className?: string }> = ({ 
  images, 
  selectedId, 
  onSelect, 
  onUpdate, 
  onAdd, 
  onRemove, 
  className // Accept className prop
}) => {
  // State to manage which tab is active
  const [activeTab, setActiveTab] = useState<'add' | 'celebrities' | 'entities'>('add');
  
  // State to manage which silhouette is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State to manage editing height unit
  const [editingHeightUnit, setEditingHeightUnit] = useState<'ft' | 'cm'>('ft');
  
  // Handle clicking the edit button for a silhouette
  const handleEditClick = (id: string) => {
    setEditingId(id === editingId ? null : id);
  };
  
  // Handle done editing
  const handleDoneEditing = () => {
    setEditingId(null);
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
  
  // Helper to choose avatar background color
  const getAvatarBgClass = (color: string) => {
    // Simply use the color directly instead of mapping
    return { backgroundColor: color };
  };
  
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
        {images.map(image => (
          <div key={image.id} className="relative">
            {/* Silhouette header with dropdown */}
            <div 
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                editingId === image.id 
                  ? 'bg-purple-100 dark:bg-purple-900' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
              style={{ backgroundColor: image.color }}
              onClick={() => handleEditClick(image.id)}
            >
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">{image.name || `Person ${image.id.slice(0, 3)}`}</span>
                <span>{Math.round(image.heightCm)}cm</span>
              </div>
              <div className="flex items-center">
                <span className={`transform transition-transform duration-200 ${editingId === image.id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
                <button 
                  className="ml-2 text-white hover:text-red-300"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onRemove(image.id); 
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Expanded editing section */}
            {editingId === image.id && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b p-3 shadow-md">
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
                
                {/* Height Input with Unit Toggle - similar to Add Person section */}
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
                          value={Number(((image.heightCm / CM_PER_INCH) % INCHES_PER_FOOT).toFixed(6))}
                          onChange={(e) => {
                            const feet = Math.floor(image.heightCm / CM_PER_INCH / INCHES_PER_FOOT);
                            const inches = parseFloat(e.target.value) || 0;
                            const newHeightCm = (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
                            onUpdate(image.id, { heightCm: newHeightCm });
                          }}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                          min="0" 
                          max="11.999999"
                          step="0.000001"
                        />
                        <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">inch</span>
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
                  <div className="flex flex-wrap justify-center gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full hover:ring-2 ${image.color === color ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onUpdate(image.id, { color })}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                    <button className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Avatar Selection - Dropdown */}
                <div className="mb-3">
                  <button className="w-full py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded flex items-center justify-center">
                    Choose Avatar
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Adjust Alignment Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adjust Alignment</span>
                    <button className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-1">
                    <button 
                      className="p-3 bg-blue-500 text-white rounded-lg"
                      onClick={() => onUpdate(image.id, { verticalOffsetCm: image.verticalOffsetCm + 5 })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <input 
                      type="number" 
                      value={image.verticalOffsetCm}
                      onChange={(e) => onUpdate(image.id, { verticalOffsetCm: parseFloat(e.target.value) || 0 })}
                      className="w-16 p-2 text-center border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                    
                    <button 
                      className="p-3 bg-blue-500 text-white rounded-lg"
                      onClick={() => onUpdate(image.id, { verticalOffsetCm: image.verticalOffsetCm - 5 })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Conditional rendering based on active tab
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden ${className}`}>
      {renderActionBar()}
      
      <div className="flex-1 overflow-y-auto">
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
}

// Controls for the comparer (accepts props)
const ComparerControls: React.FC<ComparerControlsProps> = ({ onClearAll }) => (
  <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-10 sticky top-[0px]">
    <div className="flex items-center space-x-1">
      <button title="Zoom Out" className="p-1 border rounded flex items-center justify-center w-8 h-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="range"
        min="0"
        max="100"
        defaultValue="50"
        className="w-24 h-[4px]"
      />
      <button title="Zoom In" className="p-1 border rounded flex items-center justify-center w-8 h-8">
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
// Formatted string for feet and inches
const cmToFtInString = (cm: number): string => {
  const { feet, inches } = cmToFtInObj(cm);
  return `${feet}' ${inches}"`;
};

// Returns object {feet, inches} (inches rounded to 1 decimal for display/input)
const cmToFtInObj = (cm: number): { feet: number, inches: number } => {
  if (isNaN(cm)) return { feet: 0, inches: 0 };
  const nonNegativeCm = Math.max(0, cm);
  const totalInches = nonNegativeCm / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = Math.round((totalInches % INCHES_PER_FOOT) * 10) / 10; 
  let adjustedFeet = feet;
  if (inches >= 11.95) { 
    adjustedFeet += 1;
    inches = 0;
  }
  return { feet: adjustedFeet, inches: parseFloat(inches.toFixed(1)) }; 
};

export default function Home() {
  // Initialize with default empty state
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
              // If gender changed, update the SVG and aspect ratio
              ...(updates.gender && updates.gender !== img.gender ? {
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
          // Assuming className prop is correctly handled within Sidebar definition for layout
          className="w-full h-[25vh] md:h-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto"
        />

        {/* Main Comparison Area */} 
        <main className="flex flex-col w-full h-[75vh] md:h-auto md:flex-grow overflow-hidden">
          <ComparerControls onClearAll={handleClearAll} />
          {/* Comparer component container */} 
          <div className="relative bg-gray-200 dark:bg-gray-700 overflow-auto h-full md:h-[60vh]"> 
            <ImageComparer images={images} /> 
          </div>
        </main>

      </div>
    </div>
  );
}
