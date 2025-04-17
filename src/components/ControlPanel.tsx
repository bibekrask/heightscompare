'use client';

import React, { useState, ChangeEvent, useCallback } from 'react';

interface ControlPanelProps {
  onAddImage: (file: File, heightCm: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onAddImage }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [heightInput, setHeightInput] = useState<string>('');
  const [unit, setUnit] = useState<'cm' | 'ftin'>('cm'); // Default to CM

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleHeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHeightInput(event.target.value);
  };

  const handleUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setUnit(event.target.value as 'cm' | 'ftin');
  };

  // Parses height input (CM or ft'in") to centimeters
  const parseHeightToCm = useCallback((value: string, currentUnit: 'cm' | 'ftin'): number | null => {
    if (!value) return null;

    if (currentUnit === 'cm') {
      const cm = parseFloat(value);
      return !isNaN(cm) && cm > 0 ? cm : null;
    } else {
      // Parse ft'in" format (e.g., 5'9", 5' 9", 5', 69)
      const ftInMatch = value.match(/^(\d+)'?\s*(\d*)?"?$/);
      if (ftInMatch) {
        const feet = parseInt(ftInMatch[1], 10);
        const inches = ftInMatch[2] ? parseInt(ftInMatch[2], 10) : 0;
        if (!isNaN(feet) && !isNaN(inches) && feet >= 0 && inches >= 0 && inches < 12) {
          const totalInches = feet * 12 + inches;
          const cm = totalInches * 2.54;
          return cm > 0 ? cm : null;
        }
      }
      // Try parsing as simple inches if ft/in fails
      const inchesOnly = parseFloat(value);
      if (!isNaN(inchesOnly) && inchesOnly > 0) {
         return inchesOnly * 2.54;
      }
      return null; // Invalid format or value
    }
  }, []);

  const handleAddClick = () => {
    if (!selectedFile) {
      alert('Please select an image file.');
      return;
    }
    const heightCm = parseHeightToCm(heightInput, unit);
    if (heightCm === null) {
      alert('Please enter a valid positive height.\nCM: e.g., 175\nFt/In: e.g., 5\'9", 5\' 9", 5\', 69"');
      return;
    }

    onAddImage(selectedFile, heightCm);

    // Reset form after adding
    setSelectedFile(null);
    setHeightInput('');
    // Reset file input visually
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* File Input */}
      <div>
        <label htmlFor="imageUpload" className="block text-sm font-medium mb-1">
          Image File:
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
        />
        {selectedFile && <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">{selectedFile.name}</span>}
      </div>

      {/* Height Input & Unit Selector */}
      <div className="flex items-end gap-2">
        <div>
          <label htmlFor="heightInput" className="block text-sm font-medium mb-1">
            Object Height:
          </label>
          <input
            id="heightInput"
            type="text"
            value={heightInput}
            onChange={handleHeightChange}
            placeholder={unit === 'cm' ? 'e.g., 175' : 'e.g., 5\'9" or 69'}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="unitSelect" className="block text-sm font-medium mb-1">
            Unit:
          </label>
          <select
            id="unitSelect"
            value={unit}
            onChange={handleUnitChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-[42px] dark:bg-gray-700 dark:border-gray-600" // Match height of input
          >
            <option value="cm">CM</option>
            <option value="ftin">Ft/In</option>
          </select>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddClick}
        disabled={!selectedFile || !heightInput}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]" // Match height of input
      >
        Add Image
      </button>
    </div>
  );
};

export default ControlPanel; 