'use client';

import React from 'react';
import { ComparerControlsProps } from '@/types';

const ComparerControls: React.FC<ComparerControlsProps> = ({ 
  onClearAll,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  zoomLevel = 50,
  className
}) => (
  <div className={`h-10 md:h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-1 md:px-4 z-10 sticky top-[0px] ${className}`}>
    <div className="flex items-center space-x-0.5 md:space-x-1">
      <button 
        title="Zoom Out" 
        className="p-0.5 md:p-1 border rounded flex items-center justify-center w-6 h-6 md:w-8 md:h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onZoomOut}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="range"
        min="10"
        max="100"
        value={zoomLevel}
        onChange={(e) => onZoomChange && onZoomChange(parseInt(e.target.value))}
        className="w-16 md:w-24 h-[4px]"
      />
      <button 
        title="Zoom In" 
        className="p-0.5 md:p-1 border rounded flex items-center justify-center w-6 h-6 md:w-8 md:h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onZoomIn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
    <div className="flex-grow text-center text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 px-1 md:px-2">
      <span className="md:hidden">HeightsCompare.com</span>
      <span className="hidden md:inline">HeightsComparison.com</span>
    </div>
    <div className="flex items-center space-x-0.5 md:space-x-1">
      <button 
        className="text-xs p-0.5 md:p-1 border rounded" 
        title="Clear All"
        onClick={onClearAll}
      >
        <span className="hidden md:inline">Clear All</span>
        <span className="md:hidden">Clear</span>
      </button>
      <button className="text-xs p-0.5 md:p-1 border rounded hidden md:block" title="Edit">Edit</button>
      <button className="text-xs p-0.5 md:p-1 border rounded" title="More Options">•••</button>
      <button className="text-xs p-0.5 md:p-1 bg-blue-500 text-white rounded px-1 md:px-3" title="Share">
        <span className="hidden md:inline">Share</span>
        <span className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </span>
      </button>
    </div>
  </div>
);

export default ComparerControls; 