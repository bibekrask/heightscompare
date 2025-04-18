'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback, ChangeEvent } from 'react';
import ImageComparer from '@/components/ImageComparer';
import AddSection from '@/components/AddSection';
import EditSection from '@/components/EditSection';

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
  const [activeSection, setActiveSection] = useState<'add' | 'edit' | null>(null); // State for active section

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

      {/* Image Comparer */}
      <main className="flex-grow flex justify-center items-center p-4 overflow-hidden">
         <ImageComparer images={images} /> 
      </main>

      {/* Container for Add/Edit Sections */}
      <div className="flex flex-col md:flex-row border-t border-gray-200 dark:border-gray-700">
        {/* Add Section */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
          <AddSection 
            onAddImage={handleAddImage} 
            isActive={activeSection === 'add'}
            onToggle={() => setActiveSection(activeSection === 'add' ? null : 'add')}
          />
        </div>

        {/* Edit Section */}
        <div className="w-full md:w-1/2">
          <EditSection 
            images={images}
            handleRemoveImage={handleRemoveImage}
            handleSetHeight={handleSetHeight}
            handleFtInchChange={handleFtInchChange}
            handleSetVerticalOffset={handleSetVerticalOffset}
            handleSetHorizontalOffset={handleSetHorizontalOffset}
            handleSetName={handleSetName}
            cmToFtInObj={cmToFtInObj}
            dynamicShiftStepCm={dynamicShiftStepCm}
            OFFSET_MIN_CM={OFFSET_MIN_CM}
            OFFSET_MAX_CM={OFFSET_MAX_CM}
            isActive={activeSection === 'edit'}
            onToggle={() => setActiveSection(activeSection === 'edit' ? null : 'edit')}
            hasImages={images.length > 0}
          />
        </div>
      </div>

      <footer className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm mt-auto">
        HeightCompare App © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
