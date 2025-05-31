'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ComparerControls from '@/components/ComparerControls';
import SEOContent from '@/components/SEOContent';
import ImageComparer from '@/components/ImageComparer';
import { ManagedImage } from '@/types';
import { MAX_IMAGES } from '@/constants';
import { compressImageDataUrl } from '@/utils';

export default function Home() {
  // Initialize with default empty state
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(50);
  const [majorStep, setMajorStep] = useState<number>(10);

  // Add error handling for Web3/Ethereum related errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prevent Web3 wallet injection errors
      const handleError = (event: ErrorEvent) => {
        const message = event.message;
        // Suppress Web3/Ethereum related errors
        if (typeof message === 'string' && (
          message.includes('ethereum') || 
          message.includes('selectedAddress') ||
          message.includes('web3') ||
          message.includes('MetaMask') ||
          message.includes('wallet') ||
          message.includes('crypto') ||
          message.includes('blockchain')
        )) {
          console.warn('Suppressed Web3/Ethereum error:', message);
          event.preventDefault();
          return;
        }
      };

      // Handle unhandled promise rejections related to Web3
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (event.reason && typeof event.reason === 'object') {
          const reasonString = event.reason.toString();
          if (reasonString.includes('ethereum') || 
              reasonString.includes('web3') || 
              reasonString.includes('selectedAddress') ||
              reasonString.includes('wallet') ||
              reasonString.includes('crypto') ||
              reasonString.includes('blockchain')) {
            console.warn('Suppressed Web3/Ethereum promise rejection:', event.reason);
            event.preventDefault();
            return;
          }
        }
      };

      // Additional protection specifically for mobile camera/file access
      const originalConsoleError = console.error;
      console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('ethereum') || 
            message.includes('selectedAddress') || 
            message.includes('web3') ||
            message.includes('wallet')) {
          console.warn('Suppressed Web3 console error:', ...args);
          return;
        }
        originalConsoleError.apply(console, args);
      };

      // Protect window.ethereum access
      if (typeof (window as Window & { ethereum?: unknown }).ethereum !== 'undefined') {
        try {
          // Wrap potential problematic properties
          const originalEthereum = (window as Window & { ethereum?: unknown }).ethereum;
          Object.defineProperty(window, 'ethereum', {
            get: function() {
              try {
                return originalEthereum;
              } catch (error) {
                console.warn('Prevented ethereum access error:', error);
                return undefined;
              }
            },
            set: function(value) {
              try {
                // Allow setting but catch any errors
                return value;
              } catch (error) {
                console.warn('Prevented ethereum set error:', error);
                return undefined;
              }
            },
            configurable: true
          });
        } catch (error) {
          console.warn('Failed to wrap ethereum object:', error);
        }
      }

      // Add event listeners
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // Cleanup function
      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        console.error = originalConsoleError;
      };
    }
  }, []);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Load images
      const savedImages = localStorage.getItem('heightCompareImages');
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          if (Array.isArray(parsedImages)) {
             setImages(parsedImages);
          }
        } catch (error) {
          console.error("Error parsing saved images from localStorage:", error);
          localStorage.removeItem('heightCompareImages');
        }
      }

      // Load selectedId
      const savedSelectedId = localStorage.getItem('heightCompareSelectedId');
      if (savedSelectedId && savedSelectedId !== 'null') {
        setSelectedId(savedSelectedId);
      } else {
        setSelectedId(null);
      }
      
      // Load zoom level
      const savedZoomLevel = localStorage.getItem('heightCompareZoomLevel');
      if (savedZoomLevel) {
        try {
          const zoomValue = parseInt(savedZoomLevel);
          if (!isNaN(zoomValue) && zoomValue >= 10 && zoomValue <= 100) {
            setZoomLevel(zoomValue);
          }
        } catch (error) {
          console.error("Error parsing zoom level:", error);
        }
      }
    }
  }, []);

  // Helper function to safely save to localStorage with quota handling
  const saveToLocalStorage = useCallback((key: string, value: string) => {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
      
      // Handle quota exceeded error
      if (error instanceof DOMException && (
        error.code === 22 || // QuotaExceededError
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.warn('localStorage quota exceeded. Attempting to free up space...');
        
        // Try to clear old data and retry
        try {
          // Clear non-essential data first
          const keysToCheck = ['heightCompareSelectedId', 'heightCompareZoomLevel'];
          keysToCheck.forEach(k => {
            if (k !== key) {
              localStorage.removeItem(k);
            }
          });
          
          // If we're trying to save images and still failing, implement compression/cleanup
          if (key === 'heightCompareImages') {
            // Show user-friendly error message
            alert('Storage space is full. Your images may not be saved. Please try refreshing the page or clearing your browser data.');
            return false;
          }
          
          // Retry saving
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError);
          
          if (key === 'heightCompareImages') {
            // As a last resort, show warning to user
            alert('Warning: Unable to save your images due to storage limitations. Your work may be lost when refreshing the page.');
          }
          return false;
        }
      }
      
      return false;
    }
  }, []);

  // Helper function to check localStorage usage
  const checkStorageUsage = useCallback(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      // Estimate current localStorage usage
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      
      // Convert to MB for easier understanding
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      // Warn if approaching typical 5MB limit
      if (totalSize > 4 * 1024 * 1024) { // 4MB warning threshold
        console.warn(`localStorage usage is high: ${sizeMB}MB. Consider reducing the number of images.`);
        
        // Show user warning if very close to limit
        if (totalSize > 4.5 * 1024 * 1024) { // 4.5MB critical threshold
          const userConfirmed = confirm(
            `Your storage is almost full (${sizeMB}MB used). This may cause issues saving new images. Would you like to clear some older data?`
          );
          
          if (userConfirmed) {
            // Clear non-essential data
            localStorage.removeItem('heightCompareSelectedId');
            localStorage.removeItem('heightCompareZoomLevel');
          }
        }
      }
    } catch (error) {
      console.warn('Could not check storage usage:', error);
    }
  }, []);

  // Helper function to compress images in the images array
  const compressImagesForStorage = useCallback(async (imagesToCompress: ManagedImage[]): Promise<ManagedImage[]> => {
    const compressedImages = await Promise.all(
      imagesToCompress.map(async (image) => {
        // Only compress custom uploaded images (data URLs starting with data:image)
        if (image.src && image.src.startsWith('data:image/')) {
          try {
            const compressedSrc = await compressImageDataUrl(image.src, 0.7, 600);
            return { ...image, src: compressedSrc };
          } catch (error) {
            console.warn('Failed to compress image:', error);
            return image; // Return original if compression fails
          }
        }
        return image; // Return unchanged for SVG or other non-data URLs
      })
    );
    return compressedImages;
  }, []);

  // Save images state to localStorage whenever it changes
  useEffect(() => {
    if (images.length > 0) {
      // Compress images before saving to reduce storage usage
      compressImagesForStorage(images).then((compressedImages) => {
        const success = saveToLocalStorage('heightCompareImages', JSON.stringify(compressedImages));
        if (!success && images.length > 3) {
          // If saving failed and we have many images, suggest reducing them
          console.warn('Consider reducing the number of images to avoid storage issues');
        } else if (success) {
          // Check storage usage after successful save
          checkStorageUsage();
        }
      }).catch((error) => {
        console.warn('Failed to compress images for storage:', error);
        // Fallback to saving without compression
        const success = saveToLocalStorage('heightCompareImages', JSON.stringify(images));
        if (!success && images.length > 3) {
          console.warn('Consider reducing the number of images to avoid storage issues');
        } else if (success) {
          checkStorageUsage();
        }
      });
    } else {
      // If no images, safely remove the key
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('heightCompareImages');
      }
    }
  }, [images, saveToLocalStorage, compressImagesForStorage, checkStorageUsage]);

  // Save selectedId state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage('heightCompareSelectedId', selectedId === null ? 'null' : selectedId);
  }, [selectedId, saveToLocalStorage]);

  // Reset editingId when selectedId changes to null
  useEffect(() => {
    if (selectedId === null) {
      setEditingId(null);
    }
  }, [selectedId]);

  // Save zoom level to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage('heightCompareZoomLevel', zoomLevel.toString());
  }, [zoomLevel, saveToLocalStorage]);

  // Determine the correct category tab for an item
  const determineItemCategory = useCallback((item: ManagedImage) => {
    // Check if item has a category property (for newly added items)
    if ('category' in item && item.category) {
      return item.category;
    }
    
    // Legacy detection for existing items
    // If it's a silhouette (male.svg or female.svg), it's a person
    if (item.src === '/images/male.svg' || item.src === '/images/female.svg') {
      return 'add';
    }
    
    // If it has gender property (male/female), it's likely a person
    if (item.gender && (item.gender === 'male' || item.gender === 'female')) {
      return 'add'; // Person category
    }
    
    // For custom images without gender, default to Add Image category
    // In the future, we could add more sophisticated detection based on
    // image analysis, naming patterns, or user-provided metadata
    return 'addImage';
  }, []);

  // Add new person
  const handleAddPerson = useCallback((personData: Omit<ManagedImage, 'id'>) => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can only compare up to ${MAX_IMAGES} persons.`);
      return;
    }
    
    const newId = Date.now().toString();
    const newPerson: ManagedImage = {
      id: newId,
      ...personData,
      // Add category information to help with future editing
      category: personData.src === '/images/male.svg' || personData.src === '/images/female.svg' ? 'add' : 
                personData.gender ? 'add' : 'addImage'
    } as ManagedImage & { category?: string };
    
    setImages(prev => [...prev, newPerson]);
    setSelectedId(newId);
  }, [images]);

  // Select person
  const handleSelectPerson = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  // Remove person
  const handleRemovePerson = useCallback((idToRemove: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== idToRemove));
    if (selectedId === idToRemove) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Update person
  const handleUpdatePerson = useCallback((idToUpdate: string, updates: Partial<ManagedImage>) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === idToUpdate 
          ? { 
              ...img, 
              ...updates,
              // If gender changed and there's no custom image, update the SVG and aspect ratio
              ...(updates.gender && updates.gender !== img.gender && 
                (img.src === '/images/male.svg' || img.src === '/images/female.svg') ? {
                src: updates.gender === 'male' ? '/images/male.svg' : '/images/female.svg',
                aspectRatio: updates.gender === 'male' ? 0.4 : 0.4
              } : {})
            } 
          : img
      )
    );
  }, []);

  // Clear All callback
  const handleClearAll = useCallback(() => {
    setImages([]);
    setSelectedId(null);
  }, []);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(100, prev + 10));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(10, prev - 10));
  }, []);
  
  const handleZoomChange = useCallback((value: number) => {
    setZoomLevel(value);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Height Comparison Tool - Full Viewport Height */}
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />

        {/* Main content area with Sidebar and Comparer */}
        <div className="flex flex-col md:flex-row flex-grow overflow-auto"> 
          {/* Main Comparison Area - 75% width on desktop */}
          <div className="flex flex-col overflow-hidden order-1 min-h-[70vh] md:min-h-0 md:w-3/4">
            <ComparerControls 
              onClearAll={handleClearAll}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomChange={handleZoomChange}
              zoomLevel={zoomLevel}
              className="sticky top-0 z-20 bg-white dark:bg-gray-900"
            />
            
            {/* Comparer component container */} 
            <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden flex-grow md:min-h-0"> 
              <ImageComparer 
                images={images}
                zoomLevel={zoomLevel}
                onMajorStepChange={setMajorStep}
                onEdit={(id) => {
                  const isAlreadyEditing = editingId === id;
                  setSelectedId(id);
                  
                  // Find the item being edited
                  const itemToEdit = images.find(img => img.id === id);
                  if (itemToEdit) {
                    // Determine the correct category for this item
                    const correctCategory = determineItemCategory(itemToEdit);
                    
                    const sidebarElement = document.querySelector('.sidebar-tabs');
                    if (sidebarElement) {
                      const correctTabButton = sidebarElement.querySelector(`[data-tab="${correctCategory}"]`);
                      if (correctTabButton) {
                        (correctTabButton as HTMLElement).click();
                      }
                    }
                  }
                  
                  setTimeout(() => {
                    setEditingId(isAlreadyEditing ? null : id);
                  }, 50);

                  // On mobile, smooth scroll to the sidebar
                  if (window.innerWidth < 768) {
                    const sidebarElement = document.querySelector('.sidebar-tabs');
                    if (sidebarElement) {
                      sidebarElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                onDelete={handleRemovePerson}
                onImageUpdate={handleUpdatePerson}
              />
            </div>
          </div>

          {/* Sidebar - 25% width on desktop */}
          <Sidebar 
            images={images}
            selectedId={selectedId}
            onSelect={handleSelectPerson}
            onUpdate={handleUpdatePerson} 
            onAdd={handleAddPerson} 
            onRemove={handleRemovePerson} 
            editingId={editingId}
            onSetEditingId={setEditingId}
            majorStep={majorStep}
            className="w-full md:w-1/4 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col order-2"
          />
        </div>
      </div>

      {/* SEO Content Section - Below the main tool, accessible by scrolling */}
      <SEOContent />
    </div>
  );
}
