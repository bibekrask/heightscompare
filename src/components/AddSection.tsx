'use client';

import React, { useCallback, useRef, ChangeEvent } from 'react';

interface AddSectionProps {
  onAddImage: (file: File) => void;
  isActive: boolean;
  onToggle: () => void;
}

const AddSection: React.FC<AddSectionProps> = ({ onAddImage, isActive, onToggle }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddImage(file);
      // Reset file input to allow adding the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onAddImage]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <section className="p-4 bg-gray-50 dark:bg-gray-850">
      <h3 
        className="text-lg font-semibold mb-3 text-center cursor-pointer flex justify-center items-center gap-2"
        onClick={onToggle}
      >
        Add Person / Object
        <span className={`transform transition-transform ${isActive ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </h3>
      {isActive && (
        <div className="flex justify-center mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }} // Hide the default input
            id="image-upload-input"
          />
          <button
            onClick={triggerFileInput}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            aria-label="Add new image"
          >
            Add Image
          </button>
        </div>
      )}
    </section>
  );
};

export default AddSection;
