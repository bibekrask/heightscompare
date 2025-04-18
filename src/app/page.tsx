'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback, ChangeEvent } from 'react';
import ControlPanel from '@/components/ControlPanel';
import ImageComparer from '@/components/ImageComparer';

// Constants
const DEFAULT_HEIGHT_CM = 180; // Default height for new images - Changed to 180
const MAX_IMAGES = 50; // Max number of images allowed - Changed to 50
const OFFSET_MIN_CM = -100;
const OFFSET_MAX_CM = 100;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

// --- Conversion Helpers ---
// Returns object {feet, inches} (inches rounded to 1 decimal for display/input)
const cmToFtInObj = (cm: number): { feet: number, inches: number } => {
    if (isNaN(cm)) return { feet: 0, inches: 0 };
    // Treat negative heights as 0 for ft/in display?
    // Or handle sign separately? Let's assume positive for ft/in components.
    const nonNegativeCm = Math.max(0, cm);
    const totalInches = nonNegativeCm / CM_PER_INCH;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    // Round inches to one decimal place for finer control in input
    let inches = Math.round((totalInches % INCHES_PER_FOOT) * 10) / 10; 
    let adjustedFeet = feet;
    // Handle rounding inches up to the next foot
    if (inches >= 11.95) { // Check close to 12 before rounding
        adjustedFeet += 1;
        inches = 0;
    }
    return { feet: adjustedFeet, inches: parseFloat(inches.toFixed(1)) }; // Ensure inches is number
};

// Define the structure for an image being managed in the parent
interface ManagedImage {
  id: string;
  name: string;
  src: string;
  heightCm: number;
  aspectRatio: number;
  verticalOffsetCm: number; // Added vertical offset
  horizontalOffsetCm: number; // Added horizontal offset
}

export default function Home() {
  const [images, setImages] = useState<ManagedImage[]>([]);

  // Add image callback - include default offsets
  const handleAddImage = useCallback((file: File) => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can only compare up to ${MAX_IMAGES} images.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgSrc = e.target?.result as string;
      if (!imgSrc) return;

      const img = document.createElement('img');
      img.onload = () => {
        const aspectRatio = img.naturalWidth > 0 && img.naturalHeight > 0
          ? img.naturalWidth / img.naturalHeight
          : 1;

        const newImage: ManagedImage = {
          id: Date.now().toString(),
          name: file.name.split('.')[0] || 'Image',
          src: imgSrc,
          heightCm: DEFAULT_HEIGHT_CM,
          aspectRatio: aspectRatio,
          verticalOffsetCm: 0,
          horizontalOffsetCm: 0, // Default horizontal offset
        };
        setImages((prevImages) => [...prevImages, newImage]);
      };
      img.onerror = () => {
        console.error("Error loading image to get dimensions for aspect ratio.");
        // Still add the image but with a default aspect ratio?
        const newImage: ManagedImage = {
          id: Date.now().toString(),
          name: file.name.split('.')[0] || 'Image',
          src: imgSrc,
          heightCm: DEFAULT_HEIGHT_CM,
          aspectRatio: 1, // Default aspect ratio on error
          verticalOffsetCm: 0,
          horizontalOffsetCm: 0, // Default horizontal offset on error
        };
        setImages((prevImages) => [...prevImages, newImage]);
      };
      img.src = imgSrc; // Set src to trigger onload/onerror
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
  }, [images.length]);

  // Remove image callback (no change needed)
  const handleRemoveImage = useCallback((idToRemove: string) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== idToRemove));
  }, []);

  // Re-implement callback for setting height
  const handleSetHeight = useCallback((idToUpdate: string, newHeightCm: number) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === idToUpdate ? { ...img, heightCm: Math.max(1, newHeightCm) } : img // Ensure height is at least 1
      )
    );
  }, []);

  // Handles changes from either Feet or Inches input
  const handleFtInchChange = useCallback((id: string, changedPart: 'ft' | 'in', newValueStr: string) => {
    const imageToUpdate = images.find(img => img.id === id);
    if (!imageToUpdate) return;

    // Get current feet/inches state from the *source of truth* (heightCm)
    const currentFtIn = cmToFtInObj(imageToUpdate.heightCm);
    let newFeet = currentFtIn.feet;
    let newInches = currentFtIn.inches;

    // Parse the changed value
    const parsedValue = parseFloat(newValueStr);
    if (isNaN(parsedValue)) {
        // Handle empty input - treat as 0 for calculation?
        if (changedPart === 'ft') newFeet = 0;
        else newInches = 0; 
    } else {
        if (changedPart === 'ft') {
            newFeet = Math.max(0, Math.floor(parsedValue)); // Feet must be non-negative integer
        } else {
            // Clamp inches between 0 and 11.9 (or slightly less to avoid rounding issues)
            newInches = Math.max(0, Math.min(11.9, parsedValue)); 
        }
    }
    
    // Convert back to CM and update state
    const totalInches = newFeet * INCHES_PER_FOOT + newInches;
    const newCm = totalInches * CM_PER_INCH;
    handleSetHeight(id, newCm); // Use the existing handler which ensures min height 1

  }, [images, handleSetHeight]); // Depend on images state and the setter

  // Add callback for setting vertical offset
  const handleSetVerticalOffset = useCallback((idToUpdate: string, newOffset: number) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === idToUpdate ? { ...img, verticalOffsetCm: newOffset } : img
      )
    );
  }, []);

  // Add callback for setting horizontal offset
  const handleSetHorizontalOffset = useCallback((idToUpdate: string, newOffset: number) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === idToUpdate ? { ...img, horizontalOffsetCm: newOffset } : img
      )
    );
  }, []);

  // Add callback for setting image name
  const handleSetName = useCallback((idToUpdate: string, newName: string) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === idToUpdate ? { ...img, name: newName } : img
      )
    );
  }, []);

  // --- Calculate Scale for Dynamic Step ---
  const actualMaxCm = useMemo(() => {
      const maxImageHeight = images.length > 0
        ? Math.max(1, ...images.map(img => img.heightCm || 0))
        : 0;
      const defaultComparerScale = 170;
       return maxImageHeight > 0 ? maxImageHeight : defaultComparerScale;
  }, [images]);

  // Calculate dynamic step size (1% of max height, min 0.1)
  const dynamicShiftStepCm = useMemo(() => {
      const onePercent = actualMaxCm / 100;
      return Math.max(0.1, onePercent);
  }, [actualMaxCm]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-center">HeightCompare</h1>
      </header>

      {/* Control Panel - Simplified, as it no longer takes height input */}
      {/* Assuming ControlPanel was modified to just call onAddImage(file) */}
      <section className="sticky top-[69px] z-10 p-2 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700">
         <ControlPanel onAddImage={handleAddImage} /> 
         {/* We might want a way to remove images from ControlPanel too, 
             or add a separate area for listing/removing images */}
      </section>

      {/* Image Comparer - Pass the full images state (now includes offset) */}
      <main className="flex-grow flex justify-center items-center p-4 overflow-hidden">
         <ImageComparer images={images} /> 
      </main>

      {/* Adjustment Controls Section - Updated Height Inputs */}
      {images.length > 0 && (
        <section className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
          <h3 className="text-lg font-semibold mb-3 text-center">Adjust Images</h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-6">
            {images.map((image) => {
               // Calculate ft/in values for display
               const { feet, inches } = cmToFtInObj(image.heightCm);
               
               return (
                  <div key={`control-${image.id}`} className="flex flex-col items-center w-56 p-3 border rounded bg-white dark:bg-gray-800 shadow">
                    <span
                      className="text-sm font-medium mb-3 truncate w-full text-center"
                      title={image.name}
                    >
                      {image.name}
                    </span>
                    
                    {/* --- Name Input --- */}
                    <div className="w-full mb-2 px-1">
                      <label htmlFor={`name-input-${image.id}`} className="block text-xs font-medium mb-1">Name</label>
                      <input 
                        id={`name-input-${image.id}`} 
                        type="text" 
                        value={image.name}
                        onChange={(e) => handleSetName(image.id, e.target.value)} 
                        placeholder="Optional Name"
                        className="w-full p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        aria-label={`Name for ${image.name}`}
                      />
                    </div>

                    {/* --- Height Controls (CM and Separate Ft/In) --- */}
                    <div className="w-full mb-2 px-1">
                      <label htmlFor={`height-cm-${image.id}`} className="block text-xs font-medium mb-1">Height (cm)</label>
                      <input 
                        id={`height-cm-${image.id}`} 
                        type="number" 
                        value={Math.round(image.heightCm * 10) / 10} // Display CM rounded to 1 decimal
                        onChange={(e) => handleSetHeight(image.id, parseFloat(e.target.value) || 0)} 
                        min="1" 
                        step="1" // Set step to 1 cm
                        className="w-full p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        aria-label={`Height (cm) for ${image.name}`}
                      />
                    </div>
                    {/* Feet/Inches Inputs */}
                    <div className="flex w-full gap-2 mb-3 px-1">
                        <div className="flex-1">
                            <label htmlFor={`height-ft-${image.id}`} className="block text-xs font-medium mb-1">Feet</label>
                            <input 
                                id={`height-ft-${image.id}`} 
                                type="number" 
                                value={feet} // Use derived value
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFtInchChange(image.id, 'ft', e.target.value)} 
                                min="0" 
                                step="1"
                                className="w-full p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                aria-label={`Feet for ${image.name}`}
                            />
                        </div>
                         <div className="flex-1">
                            <label htmlFor={`height-in-${image.id}`} className="block text-xs font-medium mb-1">Inches</label>
                            <input 
                                id={`height-in-${image.id}`} 
                                type="number" 
                                value={inches} // Use derived value
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFtInchChange(image.id, 'in', e.target.value)} 
                                min="0" 
                                max="11.9" // Allow up to 11.9 
                                step="0.1" // Allow decimal inches
                                className="w-full p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                aria-label={`Inches for ${image.name}`}
                            />
                        </div>
                    </div>

                    {/* Vertical Offset Slider */}
                    <div className="w-full mb-2 px-1">
                      <label htmlFor={`v-offset-slider-${image.id}`} className="flex justify-between text-xs font-medium mb-1">
                        <span>V Offset:</span>
                        <span>{image.verticalOffsetCm} cm</span>
                      </label>
                      <input
                        id={`v-offset-slider-${image.id}`}
                        type="range"
                        min={OFFSET_MIN_CM}
                        max={OFFSET_MAX_CM}
                        step={dynamicShiftStepCm}
                        value={image.verticalOffsetCm}
                        onChange={(e) => handleSetVerticalOffset(image.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        title={`Vertical Offset: ${image.verticalOffsetCm}cm (Step: ${dynamicShiftStepCm}cm)`}
                      />
                    </div>
                    {/* Horizontal Offset Slider */}
                    <div className="w-full px-1">
                      <label htmlFor={`h-offset-slider-${image.id}`} className="flex justify-between text-xs font-medium mb-1">
                        <span>H Offset:</span>
                        <span>{image.horizontalOffsetCm} cm</span>
                      </label>
                      <input
                        id={`h-offset-slider-${image.id}`}
                        type="range"
                        min={OFFSET_MIN_CM}
                        max={OFFSET_MAX_CM}
                        step={dynamicShiftStepCm}
                        value={image.horizontalOffsetCm}
                        onChange={(e) => handleSetHorizontalOffset(image.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        title={`Horizontal Offset: ${image.horizontalOffsetCm}cm (Step: ${dynamicShiftStepCm}cm)`}
                      />
                    </div>

                    {/* Remove Button */}
                    <button onClick={() => handleRemoveImage(image.id)} className="mt-3 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      Remove
                    </button>
                  </div>
               );
            })}
          </div>
        </section>
      )}

      <footer className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm mt-auto">
        HeightCompare App © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
