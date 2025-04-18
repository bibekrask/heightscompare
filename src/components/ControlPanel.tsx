'use client';

import React, { useState, ChangeEvent, useCallback } from 'react';

interface ControlPanelProps {
  onAddImage: (file: File) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onAddImage }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddClick = () => {
    if (!selectedFile) {
      alert('Please select an image file.');
      return;
    }

    onAddImage(selectedFile);

    // Reset form after adding
    setSelectedFile(null);
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

      {/* Add Button */}
      <button
        onClick={handleAddClick}
        disabled={!selectedFile}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
      >
        Add Image
      </button>
    </div>
  );
};

export default ControlPanel; 