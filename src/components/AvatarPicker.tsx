'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { loadAvatars, AvatarInfo } from '@/utils/avatarLoader';
import { ManagedImage } from '@/types';
import { MALE_ASPECT_RATIO, COLOR_OPTIONS } from '@/constants';

interface AvatarPickerProps {
  onSelectAvatar: (avatarData: Omit<ManagedImage, 'id'>) => void;
  className?: string;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ 
  onSelectAvatar, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatars, setAvatars] = useState<AvatarInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load avatars when component expands
  useEffect(() => {
    if (isExpanded && avatars.length === 0) {
      const loadAvatarList = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const loadedAvatars = await loadAvatars();
          setAvatars(loadedAvatars);
          if (loadedAvatars.length === 0) {
            setError('No avatars found. Add SVG files to /public/avatars/ directory.');
          }
        } catch (err) {
          setError('Failed to load avatars');
          console.error('Error loading avatars:', err);
        } finally {
          setIsLoading(false);
        }
      };

      loadAvatarList();
    }
  }, [isExpanded, avatars.length]);

  const handleAvatarSelect = (avatar: AvatarInfo) => {
    // Create avatar data for the comparer
    const avatarData: Omit<ManagedImage, 'id'> = {
      name: avatar.name,
      src: avatar.src,
      heightCm: 175, // Default height (175cm = ~5'9")
      aspectRatio: MALE_ASPECT_RATIO, // Default to male aspect ratio
      verticalOffsetCm: 0,
      horizontalOffsetCm: 0,
      color: COLOR_OPTIONS[0], // Default color
      gender: 'male' as const // Default gender
    };

    onSelectAvatar(avatarData);
    setIsExpanded(false); // Collapse after selection
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`avatar-picker ${className}`}>
      {/* Expandable Button */}
      <button
        onClick={toggleExpanded}
        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
          isExpanded 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center space-x-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
          <span className="font-medium">Choose Avatar</span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading avatars...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {error}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Place your SVG files in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/public/avatars/</code>
              </div>
            </div>
          )}

          {!isLoading && !error && avatars.length > 0 && (
            <>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                Click an avatar to add it to the comparison
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className="relative aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden group bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title={`Add ${avatar.name}`}
                  >
                    {/* Avatar Image */}
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <Image
                        src={avatar.src}
                        alt={avatar.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback for broken images
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Add
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarPicker; 