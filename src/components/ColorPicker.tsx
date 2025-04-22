'use client';

import React, { useState } from 'react';

// --- Constants (can be moved to a shared constants file later) ---
const COLOR_OPTIONS = [
  '#F9A826', // Orange
  '#F26D6D', // Pink/Red
  '#42CAFD', // Light Blue
  '#7747FF', // Purple
  '#FD5EB3', // Hot Pink
  '#743886', // Dark Purple
];

const EXTENDED_COLOR_OPTIONS = [
  // Primary Colors
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
  // Dark Tones
  '#8B0000', '#556B2F', '#008B8B', '#483D8B', '#8B008B', '#2F4F4F',
  // Light Tones
  '#FFC0CB', '#FFD700', '#ADFF2F', '#00FFFF', '#E6E6FA', '#FFF0F5',
  // Grayscale
  '#000000', '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#FFFFFF',
];

// --- Props Interface ---
interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

// --- Component --- 
const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onChange 
}) => {
  const [isExtendedOpen, setIsExtendedOpen] = useState(false);
  
  // Toggle extended color picker
  const toggleExtended = () => {
    setIsExtendedOpen(!isExtendedOpen);
  };
  
  return (
    <div className="space-y-2">
      {/* Main color options */}
      <div className="flex gap-2 flex-wrap items-center">
        {COLOR_OPTIONS.map(color => (
          <button
            key={color}
            type="button" // Prevent form submission if inside a form
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
        
        {/* Expand Button */}
        <button
          type="button"
          onClick={toggleExtended}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          aria-label={isExtendedOpen ? "Collapse color options" : "Expand color options"}
        >
          <span>{isExtendedOpen ? '−' : '+'}</span> {/* Use minus symbol when open */}
        </button>
      </div>
      
      {/* Extended color options - shown when expanded */}
      {isExtendedOpen && (
        <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded">
          <div className="flex gap-2 flex-wrap mb-2">
            {EXTENDED_COLOR_OPTIONS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className={`w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${selectedColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          
          {/* Custom color input */}
          <div className="flex gap-2 items-center mt-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 p-0 border-0 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                // Basic validation for hex format
                const colorRegex = /^#[0-9A-Fa-f]{6}$/i;
                if (colorRegex.test(e.target.value)) {
                  onChange(e.target.value);
                } else if (e.target.value.length <= 7) { 
                  // Allow typing, maybe provide temp state if needed?
                  // For now, only update if valid full hex
                }
              }}
              className="flex-1 p-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#RRGGBB"
              maxLength={7}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
