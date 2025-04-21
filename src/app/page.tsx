'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback } from 'react';
import ImageComparer from '@/components/ImageComparer';
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

  // Handle form submission
  const handleSubmit = () => {
    // Create person data with proper silhouette source and aspect ratio
    const aspectRatio = formData.gender === 'male' ? MALE_ASPECT_RATIO : FEMALE_ASPECT_RATIO;
    const svg = formData.gender === 'male' ? MALE_SILHOUETTE_SVG : FEMALE_SILHOUETTE_SVG;
    
    onSubmit({
      ...formData,
      aspectRatio,
      src: svg, // Use SVG path directly instead of trying to convert it
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

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color}
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
          <button
            onClick={() => {/* Add color picker UI */}}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"
            aria-label="Custom color"
          >
            <span>+</span>
          </button>
        </div>
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

// Updated Sidebar Component 
const Sidebar: React.FC<SidebarProps> = ({ 
  images, 
  selectedId, 
  onSelect, 
  onUpdate, 
  onAdd, 
  onRemove 
}) => {
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');
  
  // Get the currently selected person if any
  const selectedPerson = useMemo(() => {
    return selectedId ? images.find(img => img.id === selectedId) : null;
  }, [images, selectedId]);

  // Handle Edit button click
  const handleEditClick = (id: string) => {
    onSelect(id);
    setMode('edit');
  };

  // Handle Done Editing
  const handleDoneEditing = () => {
    onSelect(null);
    setMode('add'); // Return to add mode
  };

  // Actions section (Add Person, Celebrities, Entities, Add Image)
  const renderActionBar = () => (
    <div className="flex space-x-2 mb-4 justify-between">
      <button 
        className="p-2 border rounded flex items-center text-gray-700" 
        title="Add Person"
        onClick={() => { onSelect(null); setMode('add'); }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <span className="text-xs">Add</span>
      </button>
      
      <button className="p-2 border rounded flex items-center text-gray-700" title="Celebrities">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
      
      <button className="p-2 border rounded flex items-center text-gray-700" title="Entities">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </button>
      
      <button className="p-2 border rounded flex items-center text-gray-700" title="Add Image">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );

  return (
    <aside className="w-full md:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full overflow-y-auto">
      <div className="p-4">
        {renderActionBar()}
        
        <h2 className="font-medium mb-4">
          {mode === 'add' ? "Enter Your Details:" : mode === 'edit' ? "Edit Person:" : "Select Person:"}
        </h2>
        
        {/* Add Person Form */}
        {mode === 'add' && (
          <PersonForm 
            onSubmit={personData => {
              onAdd(personData);
              // Stay in add mode for adding multiple people
            }}
            buttonText="+ Add Person"
          />
        )}
        
        {/* Edit Person Form */}
        {mode === 'edit' && selectedPerson && (
          <>
            <PersonForm
              initialData={{
                name: selectedPerson.name,
                heightCm: selectedPerson.heightCm,
                gender: selectedPerson.gender,
                color: selectedPerson.color
              }}
              onSubmit={updates => {
                onUpdate(selectedId as string, updates);
                handleDoneEditing();
              }}
              buttonText="Done Editing"
            />
            <button 
              className="w-full mt-2 bg-red-500 text-white p-2 rounded"
              onClick={() => {
                onRemove(selectedId as string);
                handleDoneEditing();
              }}
            >
              Remove
            </button>
          </>
        )}
        
        {/* People List - shown in view mode or when edit form isn't active */}
        {mode === 'view' && (
          <div className="space-y-2 mt-4">
            {images.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No people added yet.</p>
            ) : (
              images.map(person => (
                <div 
                  key={person.id}
                  className={`p-3 border rounded flex justify-between items-center cursor-pointer ${
                    selectedId === person.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => onSelect(person.id)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full mr-2" 
                      style={{ backgroundColor: person.color }}
                    ></div>
                    <div>
                      <div className="font-medium">{person.name || "Unnamed"}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(person.heightCm)} cm ({cmToFtInString(person.heightCm)})
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-blue-500 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(person.id);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

// Controls for the comparer (slightly improved from placeholder)
const ComparerControls = () => (
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
      <button className="text-xs p-1 border rounded" title="Clear All">Clear All</button>
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
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        />

        {/* Main Comparison Area */} 
        <main className="flex flex-col flex-grow overflow-hidden">
          <ComparerControls />
          {/* Comparer component */}
          <div className="flex-grow relative bg-gray-200 dark:bg-gray-700 overflow-auto">
            <ImageComparer images={images} /> 
          </div>
        </main>
      </div>
    </div>
  );
}
