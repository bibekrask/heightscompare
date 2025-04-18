'use client';

import React, { useState } from 'react';

// Type definitions (can be moved to a shared types file)
interface ManagedImage {
  id: string;
  name: string;
  src: string;
  heightCm: number;
  aspectRatio: number;
  verticalOffsetCm: number;
  horizontalOffsetCm: number;
}

type CmToFtInObjFn = (cm: number) => { feet: number; inches: number };

interface EditSectionProps {
  images: ManagedImage[];
  handleRemoveImage: (id: string) => void;
  handleSetHeight: (id: string, heightCm: number) => void;
  handleFtInchChange: (id: string, part: 'ft' | 'in', value: string) => void;
  handleSetVerticalOffset: (id: string, offsetCm: number) => void;
  handleSetHorizontalOffset: (id: string, offsetCm: number) => void;
  handleSetName: (id: string, name: string) => void;
  cmToFtInObj: CmToFtInObjFn;
  dynamicShiftStepCm: number; // Dynamic step for vertical/horizontal offset
  OFFSET_MIN_CM: number; // Constants passed down
  OFFSET_MAX_CM: number;
  isActive: boolean;
  onToggle: () => void;
  hasImages: boolean;
}

const EditSection: React.FC<EditSectionProps> = ({
  images,
  handleRemoveImage,
  handleSetHeight,
  handleFtInchChange,
  handleSetVerticalOffset,
  handleSetHorizontalOffset,
  handleSetName,
  cmToFtInObj,
  dynamicShiftStepCm,
  OFFSET_MIN_CM,
  OFFSET_MAX_CM,
  isActive,
  onToggle,
  hasImages,
}) => {
  // State to track which image details are expanded
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

  const handleToggleImageDetails = (imageId: string) => {
    setExpandedImageId(prevId => (prevId === imageId ? null : imageId));
  };

  return (
    <section className="p-4 bg-gray-50 dark:bg-gray-850">
      <h3 
        className={`text-lg font-semibold mb-3 text-center flex justify-center items-center gap-2 ${hasImages ? 'cursor-pointer' : 'cursor-default text-gray-500 dark:text-gray-400'}`}
        onClick={hasImages ? onToggle : undefined}
      >
        Edit Images
        {hasImages && (
           <span className={`transform transition-transform ${isActive ? 'rotate-180' : 'rotate-0'}`}>
              ▼
           </span>
        )}
      </h3>

      {isActive && hasImages && (
        <div className="space-y-2 mt-4">
          {images.map((image) => {
            const isExpanded = image.id === expandedImageId;
            const { feet, inches } = cmToFtInObj(image.heightCm);

            return (
              <div key={image.id} className="border rounded bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleToggleImageDetails(image.id)}
                >
                  <span className="text-sm font-medium truncate pr-2" title={image.name}>{image.name}</span>
                  <span className={`text-xs transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    ▶
                  </span>
                </div>

                {isExpanded && (
                  <div className="flex flex-col items-center p-3 border-t border-gray-200 dark:border-gray-600">
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

                    <div className="w-full mb-2 px-1">
                      <label htmlFor={`height-cm-${image.id}`} className="block text-xs font-medium mb-1">Height (cm)</label>
                      <input 
                        id={`height-cm-${image.id}`} 
                        type="number" 
                        value={Math.round(image.heightCm * 10) / 10}
                        onChange={(e) => handleSetHeight(image.id, parseFloat(e.target.value) || 0)} 
                        min="1" 
                        step="1"
                        className="w-full p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        aria-label={`Height (cm) for ${image.name}`}
                      />
                    </div>

                    <div className="w-full mb-2 px-1">
                      <label className="block text-xs font-medium mb-1">Height (ft/in)</label>
                      <div className="flex gap-1">
                        <input
                          id={`height-ft-${image.id}`}
                          type="number"
                          value={feet}
                          onChange={(e) => handleFtInchChange(image.id, 'ft', e.target.value)}
                          min="0"
                          step="1"
                          className="w-1/2 p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Height (feet) for ${image.name}`}
                        />
                        <input
                          id={`height-in-${image.id}`}
                          type="number"
                          value={inches}
                          onChange={(e) => handleFtInchChange(image.id, 'in', e.target.value)}
                          min="0"
                          max="11.9"
                          step="0.1"
                          className="w-1/2 p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Height (inches) for ${image.name}`}
                        />
                      </div>
                    </div>

                    <div className="w-full mb-2 px-1">
                      <label htmlFor={`offset-v-${image.id}`} className="block text-xs font-medium mb-1">Vertical Offset (cm)</label>
                      <div className="flex items-center gap-1">
                        <input
                          id={`offset-v-${image.id}`}
                          type="range"
                          value={image.verticalOffsetCm}
                          onChange={(e) => handleSetVerticalOffset(image.id, parseFloat(e.target.value))}
                          min={OFFSET_MIN_CM}
                          max={OFFSET_MAX_CM}
                          step={dynamicShiftStepCm}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          aria-label={`Vertical offset for ${image.name}`}
                        />
                        <input
                          type="number"
                          value={image.verticalOffsetCm}
                          onChange={(e) => handleSetVerticalOffset(image.id, parseFloat(e.target.value))}
                          min={OFFSET_MIN_CM}
                          max={OFFSET_MAX_CM}
                          step={dynamicShiftStepCm}
                          className="w-16 p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Vertical offset value for ${image.name}`}
                        />
                      </div>
                    </div>

                    <div className="w-full mb-3 px-1">
                      <label htmlFor={`offset-h-${image.id}`} className="block text-xs font-medium mb-1">Horizontal Offset (cm)</label>
                      <div className="flex items-center gap-1">
                        <input
                          id={`offset-h-${image.id}`}
                          type="range"
                          value={image.horizontalOffsetCm}
                          onChange={(e) => handleSetHorizontalOffset(image.id, parseFloat(e.target.value))}
                          min={OFFSET_MIN_CM}
                          max={OFFSET_MAX_CM}
                          step={dynamicShiftStepCm}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          aria-label={`Horizontal offset for ${image.name}`}
                        />
                        <input
                          type="number"
                          value={image.horizontalOffsetCm}
                          onChange={(e) => handleSetHorizontalOffset(image.id, parseFloat(e.target.value))}
                          min={OFFSET_MIN_CM}
                          max={OFFSET_MAX_CM}
                          step={dynamicShiftStepCm}
                          className="w-16 p-1 border rounded text-center text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Horizontal offset value for ${image.name}`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="w-full px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 mt-auto"
                      aria-label={`Remove ${image.name}`}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default EditSection;
