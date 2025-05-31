'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import PersonForm from '@/components/PersonForm';
import Sidebar from '@/components/Sidebar';
import ComparerControls from '@/components/ComparerControls';
import SEOContent from '@/components/SEOContent';
import ImageComparer from '@/components/ImageComparer';
import { ManagedImage } from '@/types';
import { MAX_IMAGES } from '@/constants';

export default function Home() {
  // Initialize with default empty state
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(50);
  const [majorStep, setMajorStep] = useState<number>(10);

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

  // Save images state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('heightCompareImages', JSON.stringify(images));
    }
  }, [images]);

  // Save selectedId state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('heightCompareSelectedId', selectedId === null ? 'null' : selectedId);
    }
  }, [selectedId]);

  // Reset editingId when selectedId changes to null
  useEffect(() => {
    if (selectedId === null) {
      setEditingId(null);
    }
  }, [selectedId]);

  // Save zoom level to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('heightCompareZoomLevel', zoomLevel.toString());
    }
  }, [zoomLevel]);

  // Add new person
  const handleAddPerson = useCallback((personData: Omit<ManagedImage, 'id'>) => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can only compare up to ${MAX_IMAGES} persons.`);
      return;
    }
    
    const newId = Date.now().toString();
    const newPerson: ManagedImage = {
      id: newId,
      ...personData
    };
    
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
        <div className="flex flex-col md:flex-row flex-grow overflow-y-auto md:overflow-hidden"> 
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
                  
                  const sidebarElement = document.querySelector('.sidebar-tabs');
                  if (sidebarElement) {
                    const addTabButton = sidebarElement.querySelector('[data-tab="add"]');
                    if (addTabButton) {
                      (addTabButton as HTMLElement).click();
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
            className="w-full md:w-1/4 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col md:overflow-y-auto order-2 md:max-h-none md:h-full"
          />
        </div>
      </div>

      {/* SEO Content Section - Below the main tool, accessible by scrolling */}
      <SEOContent />
    </div>
  );
}
