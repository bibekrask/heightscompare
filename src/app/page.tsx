'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback } from 'react';
import ControlPanel from '@/components/ControlPanel';
import ImageComparer from '@/components/ImageComparer';

// Constants
const DEFAULT_HEIGHT_CM = 100; // Default height for new images
const MAX_IMAGES = 50; // Max number of images allowed - Changed to 50

// Define the structure for an image being managed in the parent
interface ManagedImage {
  id: string;
  name: string;
  src: string;
  heightCm: number; // Re-added heightCm here
  aspectRatio: number; // Added aspectRatio
}

export default function Home() {
  const [images, setImages] = useState<ManagedImage[]>([]);

  // Add image callback - now needs to calculate aspect ratio
  const handleAddImage = useCallback((file: File) => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can only compare up to ${MAX_IMAGES} images.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgSrc = e.target?.result as string;
      if (!imgSrc) return;

      // Create an image element in memory to get dimensions
      const img = document.createElement('img');
      img.onload = () => {
        const aspectRatio = img.naturalWidth > 0 && img.naturalHeight > 0
          ? img.naturalWidth / img.naturalHeight
          : 1; // Default aspect ratio if dimensions are zero

        const newImage: ManagedImage = {
          id: Date.now().toString(),
          name: file.name.split('.')[0] || 'Image',
          src: imgSrc,
          heightCm: DEFAULT_HEIGHT_CM,
          aspectRatio: aspectRatio, // Store aspect ratio
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
  const handleSetHeight = useCallback((idToUpdate: string, newHeight: number) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === idToUpdate ? { ...img, heightCm: Math.max(1, newHeight) } : img // Ensure height is at least 1
      )
    );
  }, []);

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

      {/* Image Comparer - Pass the full images state (now includes aspectRatio) */}
      <main className="flex-grow flex justify-center items-center p-4 overflow-hidden">
         <ImageComparer images={images} /> 
      </main>

      {/* Height Adjustment Controls Section - Independent Area Below */}
      {images.length > 0 && (
        <section className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
          <h3 className="text-lg font-semibold mb-3 text-center">Adjust Heights (cm)</h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
            {images.map((image) => (
              <div key={`control-${image.id}`} className="flex flex-col items-center">
                <label 
                  htmlFor={`height-input-${image.id}`} 
                  className="text-sm font-medium mb-1 truncate w-32 text-center" // Added truncate and width
                  title={image.name} // Show full name on hover
                >
                  {image.name}
                </label>
                <input
                  id={`height-input-${image.id}`}
                  type="number"
                  value={image.heightCm}
                  onChange={(e) => handleSetHeight(image.id, parseFloat(e.target.value) || 0)}
                  min="1"
                  className="w-24 p-1 border rounded text-center text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  aria-label={`Height (cm) for ${image.name}`}
                />
                {/* Optional: Add a slider alternative later if desired */}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm mt-auto">
        HeightCompare App © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
