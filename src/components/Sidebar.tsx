'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PersonForm from '@/components/PersonForm';
import ImageForm from '@/components/ImageForm';
import { SidebarProps, ManagedImage } from '@/types';

const Sidebar: React.FC<SidebarProps> = ({ 
  images, 
  onUpdate, 
  onAdd, 
  onRemove,
  editingId,
  onSetEditingId,
  majorStep,
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'celebrities' | 'fictional' | 'objects' | 'buildings' | 'animals' | 'addImage'>('add');
  
  // Scroll indicator state and refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get the current editing item
  const editingItem = editingId ? images.find(img => img.id === editingId) || null : null;

  // Function to determine item category
  const determineItemCategory = useCallback((item: ManagedImage) => {
    // Check if item has a category property (for newly added items)
    if ('category' in item && item.category) {
      return item.category as 'add' | 'celebrities' | 'fictional' | 'objects' | 'buildings' | 'animals' | 'addImage';
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
    return 'addImage';
  }, []);

  // Update active tab when editing item changes
  useEffect(() => {
    if (editingItem) {
      const correctCategory = determineItemCategory(editingItem);
      setActiveTab(correctCategory);
    }
  }, [editingItem, determineItemCategory]);

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

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    if (onSetEditingId) {
      onSetEditingId(null);
    }
  };

  // Handle adding items with category information
  const handleAddWithCategory = useCallback((itemData: Omit<ManagedImage, 'id'>) => {
    // Add category information based on current active tab
    const itemWithCategory = {
      ...itemData,
      category: activeTab
    } as Omit<ManagedImage, 'id'> & { category?: string };
    onAdd(itemWithCategory);
  }, [activeTab, onAdd]);

  // Action bar at the top of the sidebar with horizontal scrollable tabs
  const renderActionBar = () => {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

    // Handle tab click with auto-exit edit mode
    const handleTabClick = (tabId: 'add' | 'celebrities' | 'fictional' | 'objects' | 'buildings' | 'animals' | 'addImage') => {
      // If currently editing, exit edit mode first
      if (editingId && onSetEditingId) {
        onSetEditingId(null);
      }
      // Then switch to the new tab
      setActiveTab(tabId);
    };

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
              onClick={() => handleTabClick(tab.id as 'add' | 'celebrities' | 'fictional' | 'objects' | 'buildings' | 'animals' | 'addImage')}
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

  // Show added items summary when there are items and not editing
  const renderItemsSummary = () => {
    if (images.length === 0 || editingItem) return null;
    
    return (
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          <span className="font-medium">{images.length}</span> item{images.length === 1 ? '' : 's'} added
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
          Click on items in the comparison view to edit them
        </div>
      </div>
    );
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-visible sidebar-tabs ${className}`}>
      <div className="block">
        {renderActionBar()}
      </div>
      
      <div className="flex-1 overflow-visible" style={{ maxHeight: '40vh' }}>
        {renderItemsSummary()}
        
        {activeTab === 'add' && (
          <div className="p-1.5 md:p-4">
            <PersonForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Person"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
        
        {activeTab === 'addImage' && (
          <div className="p-1.5 md:p-4">
            <ImageForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Image"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
        
        {activeTab === 'celebrities' && (
          <div className="p-1.5 md:p-4">
            <ImageForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Celebrity"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
        
        {activeTab === 'objects' && (
          <div className="p-1.5 md:p-4">
            <ImageForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Object"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
        
        {activeTab === 'fictional' && (
          <div className="p-1.5 md:p-4">
            <ImageForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Fictional Character"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
        
        {activeTab === 'animals' && (
          <div className="p-1.5 md:p-4">
            <ImageForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Animal"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
        
        {activeTab === 'buildings' && (
          <div className="p-1.5 md:p-4">
            <ImageForm 
              onSubmit={handleAddWithCategory} 
              buttonText="Add Building"
              editingItem={editingItem}
              onUpdate={onUpdate}
              onCancelEdit={handleCancelEdit}
              onRemove={onRemove}
              majorStep={majorStep}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;