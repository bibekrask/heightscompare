'use client';

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';

// Define the structure for an image object
export interface DisplayImage {
  id: string;
  src: string; // Will be a data URL
  alt: string;
  actualHeightCm: number;
  displayWidth?: number; // Make optional - calculated width based on aspect ratio and scaled height
  displayHeight?: number; // Make optional - scaled height in pixels on the canvas
  aspectRatio?: number; // Store aspect ratio for recalculations
}

interface ComparisonCanvasProps {
  images: DisplayImage[];
  onRemoveImage: (id: string) => void;
  onSetHeight: (id: string, heightCm: number) => void; // Add prop for setting absolute height
}

const ComparisonCanvas: React.FC<ComparisonCanvasProps> = ({ images, onRemoveImage, onSetHeight }) => {

  const canvasHeight = 800; // Example fixed height in pixels
  // Local state for input fields (keep for direct entry)
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const handleInputChange = (id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  };

  // Update input blur to call onSetHeight directly
  const handleInputBlur = (id: string) => {
    const value = inputValues[id];
    if (value === undefined) return; // No change if undefined

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      onSetHeight(id, numericValue);
    }
    // Clear local state after attempting to set
    setInputValues(prev => { const next = {...prev}; delete next[id]; return next; });
  };

  // Handle Slider Change
  const handleSliderChange = (id: string, value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) { // Allow 0 temporarily during slide? Min is 1 anyway.
      onSetHeight(id, numericValue);
    }
  };

  return (
    <div className="flex-grow mx-4 relative overflow-x-auto overflow-y-hidden flex items-end border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 min-h-[400px]" style={{ height: `${canvasHeight}px` }}>
      {/* Ground Level Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500 dark:bg-gray-300 z-5"></div>

      {/* Images Container - Ensures content sits above the ground line visually */}
      <div className="relative z-10 flex items-end h-full p-4 space-x-4 min-w-full">
        {images.length === 0 ? (
          <p className="text-center w-full self-center text-gray-500 dark:text-gray-400">
            Upload images using the controls above to start comparing heights.
          </p>
        ) : (
          images.map((image) => (
            <div key={image.id} className="relative group flex flex-col items-center h-full justify-end">
              {/* Hover Line at Image Top */}
              <div
                className="absolute left-0 right-0 h-px bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-15"
                style={{
                  bottom: `${image.displayHeight ?? 0}px`,
                }}
              ></div>

              {/* Image Div */}
              <div
                className="relative flex-shrink-0"
                style={{
                  width: `${image.displayWidth ?? 0}px`,
                  height: `${image.displayHeight ?? 0}px`,
                }}
              >
                <Image
                  key={image.id + '-' + image.displayHeight}
                  src={image.src}
                  alt={image.alt}
                  width={image.displayWidth ?? 100}
                  height={image.displayHeight ?? 100}
                  style={{ objectFit: 'contain' }}
                  className="block"
                  priority
                />
                {/* Remove Button */}
                <button
                  onClick={() => onRemoveImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                  aria-label={`Remove ${image.alt}`}
                >
                  ✕
                </button>
              </div>

              {/* Controls Div */}
              <div className="mt-2 flex flex-col items-center space-y-1 w-full max-w-[150px]">
                  {/* Input Field Row */}
                  <div className="flex items-center justify-center space-x-1">
                    <input
                      type="number"
                      value={inputValues[image.id] ?? image.actualHeightCm.toFixed(1)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(image.id, e.target.value)}
                      onBlur={() => handleInputBlur(image.id)}
                      min="1"
                      step="0.1"
                      className="w-16 text-center text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 px-1 py-0.5"
                      aria-label={`Set height for ${image.alt} in cm`}
                    />
                     <span className="text-xs ml-0.5">cm</span>
                  </div>

                  {/* Slider Row */}
                   <div className="w-full px-2 pt-1">
                      <input
                        type="range"
                        min="1"
                        max="300"
                        step="1"
                        value={image.actualHeightCm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleSliderChange(image.id, e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        title={`${image.actualHeightCm.toFixed(1)} cm`}
                        aria-label={`Adjust height for ${image.alt} using slider`}
                      />
                   </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComparisonCanvas; 