'use client'; // Required for future state management and interactions

import React, { useState, useMemo, useCallback } from 'react';
import ControlPanel from '@/components/ControlPanel';
import ImageComparer from '@/components/ImageComparer';

// Constants
const DEFAULT_HEIGHT_CM = 100; // Default height for new images
const MAX_IMAGES = 50; // Max number of images allowed - Changed to 50
const SHIFT_STEP_CM = 1; // How many cm to shift per button click

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
  const handleSetHeight = useCallback((idToUpdate: string, newHeight: number) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === idToUpdate ? { ...img, heightCm: Math.max(1, newHeight) } : img // Ensure height is at least 1
      )
    );
  }, []);

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

      {/* Adjustment Controls Section - Use Buttons for Shift */}
      {images.length > 0 && (
        <section className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
          <h3 className="text-lg font-semibold mb-3 text-center">Adjust Images</h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-6">
            {images.map((image) => (
              <div key={`control-${image.id}`} className="flex flex-col items-center w-48 p-2 border rounded bg-white dark:bg-gray-800">
                <span
                  className="text-sm font-medium mb-2 truncate w-full text-center"
                  title={image.name}
                >
                  {image.name}
                </span>
                {/* Height Control */}
                <div className="flex items-center justify-between w-full mb-2 text-xs">
                    <label htmlFor={`height-input-${image.id}`} className="font-medium">Height:</label>
                    <div>
                        <input id={`height-input-${image.id}`} type="number" value={image.heightCm} onChange={(e) => handleSetHeight(image.id, parseFloat(e.target.value) || 0)} min="1" className="w-16 p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                        <span className="ml-1">cm</span>
                    </div>
                </div>

                {/* --- Shift Controls --- */}
                <div className="grid grid-cols-3 gap-1 w-full mb-1">
                    {/* Top Row: Up */}
                    <div></div> {/* Empty cell */}
                    <button
                        onClick={() => handleSetVerticalOffset(image.id, image.verticalOffsetCm + SHIFT_STEP_CM)}
                        className="px-2 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                        title="Shift Up"
                    >↑</button>
                    <div></div> {/* Empty cell */}

                    {/* Middle Row: Left, Reset, Right */}
                     <button
                        onClick={() => handleSetHorizontalOffset(image.id, image.horizontalOffsetCm - SHIFT_STEP_CM)}
                         className="px-2 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                        title="Shift Left"
                     >←</button>
                     <button
                        onClick={() => {
                            handleSetVerticalOffset(image.id, 0);
                            handleSetHorizontalOffset(image.id, 0);
                        }}
                        className="px-2 py-1 text-xs border rounded bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-700 dark:hover:bg-yellow-600 dark:border-yellow-600"
                        title="Reset Position (0,0)"
                    >Reset</button>
                     <button
                         onClick={() => handleSetHorizontalOffset(image.id, image.horizontalOffsetCm + SHIFT_STEP_CM)}
                         className="px-2 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                        title="Shift Right"
                     >→</button>

                     {/* Bottom Row: Down */}
                    <div></div> {/* Empty cell */}
                     <button
                         onClick={() => handleSetVerticalOffset(image.id, image.verticalOffsetCm - SHIFT_STEP_CM)}
                         className="px-2 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                        title="Shift Down"
                     >↓</button>
                    <div></div> {/* Empty cell */}
                </div>
                 {/* Display current offsets */} 
                 <div className="text-xs text-gray-500 dark:text-gray-400 w-full text-center mt-1">
                    (X: {image.horizontalOffsetCm}cm, Y: {image.verticalOffsetCm}cm)
                 </div>

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
