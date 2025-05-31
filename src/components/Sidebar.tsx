'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PersonForm from '@/components/PersonForm';
import ImageForm from '@/components/ImageForm';
import { SidebarProps } from '@/types';
import { COLOR_OPTIONS, CM_PER_INCH, INCHES_PER_FOOT } from '@/constants';
import { cmToFtIn } from '@/utils';

const Sidebar: React.FC<SidebarProps> = ({ 
  images, 
  selectedId, 
  onSelect, 
  onUpdate, 
  onAdd, 
  onRemove,
  editingId,
  onSetEditingId,
  majorStep,
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'celebrities' | 'fictional' | 'objects' | 'buildings' | 'animals' | 'addImage'>('add');
  const [localEditingId, setLocalEditingId] = useState<string | null>(null);
  const [editingHeightUnit, setEditingHeightUnit] = useState<'ft' | 'cm'>('ft');
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const desktopSidebarContentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Sync parent editingId with local state
  useEffect(() => {
    if (editingId !== undefined) {
      setLocalEditingId(editingId);
      
      if (editingId && itemRefs.current[editingId]) {
        setTimeout(() => {
          const itemElement = itemRefs.current[editingId];
          const mobileSidebar = sidebarContentRef.current;
          const desktopSidebar = desktopSidebarContentRef.current;
          
          if (itemElement) {
            if (mobileSidebar && window.innerWidth < 768) {
              const scrollOffset = itemElement.offsetTop - mobileSidebar.offsetTop - 20;
              mobileSidebar.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
              });
            } else if (desktopSidebar && window.innerWidth >= 768) {
              const scrollOffset = itemElement.offsetTop - desktopSidebar.offsetTop - 20;
              desktopSidebar.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
              });
            }
          }
        }, 50);
      }
    }
  }, [editingId, images]);
  
  // Handle clicking the edit button for a silhouette
  const handleEditClick = (id: string) => {
    const newEditingId = id === localEditingId ? null : id;
    setLocalEditingId(newEditingId);
    
    if (onSetEditingId) {
      onSetEditingId(newEditingId);
    }
    
    if (newEditingId !== null) {
      setTimeout(() => {
        const itemElement = itemRefs.current[id];
        const mobileSidebar = sidebarContentRef.current;
        const desktopSidebar = desktopSidebarContentRef.current;
        
        if (itemElement) {
          if (mobileSidebar && window.innerWidth < 768) {
            const scrollOffset = itemElement.offsetTop - mobileSidebar.offsetTop - 20;
            mobileSidebar.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            });
          } else if (desktopSidebar && window.innerWidth >= 768) {
            const scrollOffset = itemElement.offsetTop - desktopSidebar.offsetTop - 20;
            desktopSidebar.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            });
          }
        }
      }, 50);
    }
  };
  
  // Handle done editing
  const handleDoneEditing = () => {
    setLocalEditingId(null);
    if (onSetEditingId) {
      onSetEditingId(null);
    }
  };
  
  // Register item refs when they mount or remount
  const registerItemRef = (id: string, element: HTMLDivElement | null) => {
    itemRefs.current[id] = element;
  };

  // Helper to render the height in different units
  const renderHeight = (heightCm: number) => {
    const inches = heightCm / CM_PER_INCH;
    const feet = Math.floor(inches / 12);
    const remainingInches = Number((inches % 12).toFixed(2));
    
    return `${feet}ft ${remainingInches}inch`;
  };
  
  // Action bar at the top of the sidebar with horizontal scrollable tabs
  const renderActionBar = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    const handleScrollLeft = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: -120,
          behavior: 'smooth'
        });
        setTimeout(checkScrollability, 300);
      }
    };

    const handleScrollRight = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: 120,
          behavior: 'smooth'
        });
        setTimeout(checkScrollability, 300);
      }
    };

    // Check scrollability on mount and when tabs change
    useEffect(() => {
      checkScrollability();
      const handleResize = () => checkScrollability();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const entityTabs = [
      {
        id: 'add',
        label: 'Add Person',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      },
      {
        id: 'addImage',
        label: 'Add Image',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        id: 'celebrities',
        label: 'Celebrities',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        )
      },
      {
        id: 'objects',
        label: 'Objects',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      },
      {
        id: 'fictional',
        label: 'Fictional',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1h3l.5 1.5v3L16 10H8l-1-2.5v-3L7.5 3h3z" />
          </svg>
        )
      },
      {
        id: 'animals',
        label: 'Animals',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        id: 'buildings',
        label: 'Buildings',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      }
    ];

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide py-1 relative"
          onScroll={checkScrollability}
        >
          {entityTabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-shrink-0 px-2 md:px-3 py-2 text-center text-xs font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
              data-tab={tab.id}
            >
              <div className="flex flex-col items-center justify-center min-w-max">
                {tab.icon}
                <span className="text-xs whitespace-nowrap">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Left scroll indicator - only visible when can scroll left */}
        {canScrollLeft && (
          <button 
            onClick={handleScrollLeft}
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-red-500 via-red-400 to-transparent hover:from-red-600 hover:via-red-500 dark:from-red-600 dark:via-red-500 dark:hover:from-red-700 dark:hover:via-red-600 flex items-center justify-start pl-1 transition-all duration-200 cursor-pointer group"
            title="Scroll left to see previous categories"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-110 transition-all duration-200 animate-bounce-x-left" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
              </svg>
            </div>
          </button>
        )}
        
        {/* Right scroll indicator - only visible when can scroll right */}
        {canScrollRight && (
          <button 
            onClick={handleScrollRight}
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-red-500 via-red-400 to-transparent hover:from-red-600 hover:via-red-500 dark:from-red-600 dark:via-red-500 dark:hover:from-red-700 dark:hover:via-red-600 flex items-center justify-end pr-1 transition-all duration-200 cursor-pointer group"
            title="Scroll right to see more categories"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white drop-shadow-lg group-hover:scale-110 transition-all duration-200 animate-bounce-x-right" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </div>
          </button>
        )}
      </div>
    );
  };
  
  // Render the list of existing silhouettes
  const renderSilhouetteList = () => {
    if (images.length === 0) {
      return (
        <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-xs">
          No silhouettes added yet. Add your first silhouette using the form above.
        </div>
      );
    }
    
    return (
      <div className="p-1 space-y-1">
        {images.map(image => {
          const isDefaultSilhouette = image.src.includes('.svg') || image.src.startsWith('/images/');
          const currentEditingId = localEditingId !== null ? localEditingId : editingId;
          const isEditing = currentEditingId === image.id;
          
          return (
            <div 
              key={image.id}
              ref={(el) => registerItemRef(image.id, el)}
              className={`p-2 mb-1 bg-white dark:bg-gray-800 border rounded shadow-sm cursor-pointer flex flex-col text-xs
                ${selectedId === image.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}
                ${isEditing ? 'rounded-b-none' : 'rounded-b'}
              `}
            >
              <div className="flex items-center gap-2">
                {/* Avatar/Silhouette with coloring */}
                <div 
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 overflow-hidden"
                  style={{
                    ...(isDefaultSilhouette ? {
                      maskImage: `url(${image.src})`,
                      WebkitMaskImage: `url(${image.src})`,
                      maskSize: 'cover',
                      WebkitMaskSize: 'cover',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      backgroundColor: image.color
                    } : {
                      backgroundImage: `url(${image.src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    })
                  }}
                  onClick={(e) => {
                    onSelect(image.id !== selectedId ? image.id : null);
                    
                    if (image.id === selectedId) {
                      e.stopPropagation();
                      handleEditClick(image.id);
                    }
                  }}
                ></div>
                
                <div className="flex-grow min-w-0">
                  <div className="font-medium text-xs truncate">{image.name || `Person ${image.id.slice(0, 3)}`}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(image.heightCm)}cm ({renderHeight(image.heightCm)})
                  </div>
                </div>
                
                <div>
                  <button 
                    onClick={() => handleEditClick(image.id)}
                    className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Expanded editing section */}
              {isEditing && (
                <div 
                  className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 rounded-b space-y-2"
                  style={{
                    backgroundColor: isDefaultSilhouette ? `${image.color}15` : 'transparent'
                  }}
                >
                  {/* Done Editing button */}
                  <button 
                    className="w-full py-1 mb-2 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-xs"
                    onClick={handleDoneEditing}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done Editing
                  </button>
                  
                  {/* Gender Selection */}
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <button
                      className={`py-1 px-2 rounded-l border text-xs ${
                        image.gender === 'male' 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => onUpdate(image.id, { gender: 'male' })}
                    >
                      Male
                    </button>
                    <button
                      className={`py-1 px-2 rounded-r border text-xs ${
                        image.gender === 'female' 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => onUpdate(image.id, { gender: 'female' })}
                    >
                      Female
                    </button>
                  </div>
                  
                  {/* Name Input */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter name"
                      value={image.name}
                      onChange={(e) => onUpdate(image.id, { name: e.target.value })}
                      className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs"
                      suppressHydrationWarning={true}
                    />
                  </div>
                  
                  {/* Height Input with Unit Toggle */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Height</label>
                      <div className="flex border rounded overflow-hidden">
                        <button 
                          className={`px-1 py-0.5 text-xs ${editingHeightUnit === 'ft' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => setEditingHeightUnit('ft')}
                        >
                          ft
                        </button>
                        <button 
                          className={`px-1 py-0.5 text-xs ${editingHeightUnit === 'cm' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => setEditingHeightUnit('cm')}
                        >
                          cm
                        </button>
                      </div>
                    </div>
                    
                    {editingHeightUnit === 'ft' ? (
                      <div className="grid grid-cols-2 gap-1">
                        <div className="relative">
                          <input 
                            type="number" 
                            value={Math.floor(image.heightCm / CM_PER_INCH / INCHES_PER_FOOT)}
                            onChange={(e) => {
                              const feet = parseFloat(e.target.value) || 0;
                              const inches = (image.heightCm / CM_PER_INCH) % INCHES_PER_FOOT;
                              const newHeightCm = (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
                              onUpdate(image.id, { heightCm: newHeightCm });
                            }}
                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs"
                            min="0"
                            step="1"
                            suppressHydrationWarning={true}
                          />
                          <span className="absolute right-1 top-1 text-gray-500 dark:text-gray-400 text-xs">ft</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={Number(((image.heightCm / CM_PER_INCH) % INCHES_PER_FOOT).toFixed(2))}
                            onChange={(e) => {
                              const feet = Math.floor(image.heightCm / CM_PER_INCH / INCHES_PER_FOOT);
                              const inches = parseFloat(e.target.value) || 0;
                              const newHeightCm = (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
                              onUpdate(image.id, { heightCm: newHeightCm });
                            }}
                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs"
                            min="0" 
                            max="11.99"
                            step="0.01"
                            suppressHydrationWarning={true}
                          />
                          <span className="absolute right-1 top-1 text-gray-500 dark:text-gray-400 text-xs">in</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="number" 
                          value={Math.round(image.heightCm)}
                          onChange={(e) => {
                            const heightCm = parseFloat(e.target.value) || 0;
                            onUpdate(image.id, { heightCm });
                          }}
                          className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-xs"
                          min="0"
                          step="1"
                          suppressHydrationWarning={true}
                        />
                        <span className="absolute right-1 md:right-3 top-1 md:top-2 text-gray-500 dark:text-gray-400 text-xs">cm</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Color Selection */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <div className="flex flex-wrap gap-1">
                      {COLOR_OPTIONS.map(color => (
                        <button
                          key={color}
                          className={`w-5 h-5 rounded border-2 ${
                            image.color === color ? 'border-gray-800 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => onUpdate(image.id, { color })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vertical Adjustment */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Vertical Adjustment</label>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          const stepSize = majorStep / 20;
                          onUpdate(image.id, { verticalOffsetCm: (image.verticalOffsetCm || 0) + stepSize });
                        }}
                        className="p-1 rounded-l flex items-center justify-center hover:bg-opacity-80"
                        style={{ 
                          backgroundColor: image.color,
                          color: 'white'
                        }}
                        title="Move up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <div className="flex-grow text-center text-xs text-gray-600 dark:text-gray-400 px-1 py-1 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                        {(image.verticalOffsetCm || 0).toFixed(2)} cm
                      </div>
                      <button
                        onClick={() => {
                          const stepSize = majorStep / 20;
                          onUpdate(image.id, { verticalOffsetCm: (image.verticalOffsetCm || 0) - stepSize });
                        }}
                        className="p-1 rounded-r flex items-center justify-center hover:bg-opacity-80"
                        style={{ 
                          backgroundColor: image.color,
                          color: 'white'
                        }}
                        title="Move down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 italic">
                      Adjust to align feet position to ground level
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Step size: {(majorStep / 20).toFixed(2)} cm
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      onRemove(image.id);
                      setLocalEditingId(null);
                    }}
                    className="w-full py-1 mt-1 bg-red-100 text-red-700 rounded flex items-center justify-center hover:bg-red-200 text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render coming soon content for inactive tabs
  const renderComingSoon = (title: string, iconPath: string) => (
    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
      <div className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={iconPath} />
        </svg>
      </div>
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{title} Coming Soon</h3>
      <p className="text-xs">{title.toLowerCase()} heights will be available here soon.</p>
    </div>
  );
  
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden sidebar-tabs ${className}`}>
      <div className="block">
        {renderActionBar()}
      </div>
      
      <div className="flex-1 overflow-y-auto" ref={desktopSidebarContentRef}>
        {activeTab === 'add' && (
          <>
            <div className="p-1.5 md:p-4">
              <PersonForm onSubmit={onAdd} buttonText="Add Person" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'addImage' && (
          <>
            <div className="p-1.5 md:p-4">
              <ImageForm onSubmit={onAdd} buttonText="Add Image" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'celebrities' && (
          <>
            <div className="p-1.5 md:p-4">
              <ImageForm onSubmit={onAdd} buttonText="Add Celebrity" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'objects' && (
          <>
            <div className="p-1.5 md:p-4">
              <ImageForm onSubmit={onAdd} buttonText="Add Object" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'fictional' && (
          <>
            <div className="p-1.5 md:p-4">
              <ImageForm onSubmit={onAdd} buttonText="Add Fictional Character" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'animals' && (
          <>
            <div className="p-1.5 md:p-4">
              <ImageForm onSubmit={onAdd} buttonText="Add Animal" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
        
        {activeTab === 'buildings' && (
          <>
            <div className="p-1.5 md:p-4">
              <ImageForm onSubmit={onAdd} buttonText="Add Building" />
            </div>
            {images.length > 0 && renderSilhouetteList()}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;