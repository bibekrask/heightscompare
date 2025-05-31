'use client';

import React, { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { ManagedImage, ImageComparerProps } from '@/types';
import { 
  SCALE_TOP_FACTOR,
  MAJOR_INTERVALS,
  FIGURE_LABEL_OFFSET_Y,
  IMAGE_GAP_PX,
  DRAG_THRESHOLD_PX,
  LONG_PRESS_DURATION,
  EPSILON
} from '@/constants';
import { generateHorizontalMarks, cmToFtIn } from '@/utils';

const ImageComparer: React.FC<ImageComparerProps> = ({ 
  images, 
  zoomLevel = 50,
  onEdit, 
  onDelete,
  onImageUpdate,
  onZoomChange,
  onMajorStepChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const figuresContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeightPx, setContainerHeightPx] = useState<number>(0);
  const [availableWidthPx, setAvailableWidthPx] = useState<number>(0);
  
  // State for drag functionality
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragThresholdMet, setDragThresholdMet] = useState(false);
  const [showMobileButtons, setShowMobileButtons] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressActivated, setLongPressActivated] = useState<boolean>(false);

  // Internal zoom state - tied to parent's zoomLevel prop
  const [internalZoomLevel, setInternalZoomLevel] = useState<number>(zoomLevel);

  // Update internal zoom when prop changes
  useEffect(() => {
    setInternalZoomLevel(zoomLevel);
  }, [zoomLevel]);
  
  // Propagate zoom changes to parent
  useEffect(() => {
    if (internalZoomLevel !== zoomLevel && onZoomChange) {
      onZoomChange(internalZoomLevel);
    }
  }, [internalZoomLevel, zoomLevel, onZoomChange]);

  // Effect to measure container dimensions
  useLayoutEffect(() => {
    let height = 0;
    let width = 0;
    let availableWidth = 0;
    
    if (containerRef.current) {
        height = containerRef.current.offsetHeight;
        width = containerRef.current.offsetWidth;
        availableWidth = Math.max(100, width - 80);
        
        setContainerHeightPx(height > 0 ? height : 0);
        setAvailableWidthPx(availableWidth > 0 ? availableWidth : 0);
    }
  }, [images]);

  // Scale Calculations
  const maxImageHeight = images.length > 0 
      ? Math.max(1, ...images.map(img => img.heightCm || 0)) 
      : 0;
  const actualMaxCm = maxImageHeight > 0 ? maxImageHeight : 200;

  const baseScaleTopCm = actualMaxCm * SCALE_TOP_FACTOR;
  const zoomFactor = (110 - internalZoomLevel) / 50;
  const zoomAdjustedTopCmInitial = baseScaleTopCm * zoomFactor;

  let calculatedMajorStep = 10;
  const positiveRangeForStep = Math.max(EPSILON, zoomAdjustedTopCmInitial);
  if (positiveRangeForStep > EPSILON) {
      const niceFractions = [1, 2, 2.5, 5, 10];
      const rawStep = positiveRangeForStep / MAJOR_INTERVALS;
      const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalizedStep = rawStep / pow10;
      let bestFraction = niceFractions[niceFractions.length - 1];
      let minDiff = Infinity;
      for (const frac of niceFractions) {
          const diff = Math.abs(normalizedStep - frac);
          if (diff < minDiff) {
              minDiff = diff;
              bestFraction = frac;
          }
      }
      calculatedMajorStep = bestFraction * pow10;
  }
  calculatedMajorStep = Math.max(10, calculatedMajorStep);

  useEffect(() => {
    if (onMajorStepChange) {
      onMajorStepChange(calculatedMajorStep);
    }
  }, [calculatedMajorStep, onMajorStepChange]);

  const baseScaleBottomCm = -calculatedMajorStep * 1.2; 
  const zoomAdjustedBottomCmInitial = baseScaleBottomCm * zoomFactor;
  
  let finalScaleTopCm = zoomAdjustedTopCmInitial;
  let finalScaleBottomCm = zoomAdjustedBottomCmInitial;
  const totalRangeCmInitial = finalScaleTopCm - finalScaleBottomCm;

  // Combined Horizontal and Vertical Scaling
  const initialPixelsPerCm = containerHeightPx > 0 && totalRangeCmInitial > 0
    ? containerHeightPx / totalRangeCmInitial
    : 0;

  let horizontalScaleFactor = 1;
  let scaledGap = IMAGE_GAP_PX;

  if (initialPixelsPerCm > 0 && images.length > 0 && availableWidthPx > 0) {
    const unscaledDimensions = images.map(image => {
      const height = Math.max(1, image.heightCm * initialPixelsPerCm);
      const width = Math.max(1, height * image.aspectRatio);
      return { id: image.id, width, height };
    });

    const totalIdealWidth = unscaledDimensions.reduce((sum, dim) => sum + dim.width, 0) +
                          (images.length > 1 ? (images.length - 1) * IMAGE_GAP_PX : 0);

    if (totalIdealWidth > availableWidthPx) {
      horizontalScaleFactor = availableWidthPx / totalIdealWidth;
    }
    scaledGap = IMAGE_GAP_PX * horizontalScaleFactor;
  }
  
  if (horizontalScaleFactor < 1) {
    finalScaleTopCm = zoomAdjustedTopCmInitial / horizontalScaleFactor;
    finalScaleBottomCm = zoomAdjustedBottomCmInitial / horizontalScaleFactor;
    const scaledStep = calculatedMajorStep / horizontalScaleFactor;
    
    if (scaledStep >= 100) {
      calculatedMajorStep = Math.round(scaledStep);
    } else if (scaledStep >= 10) {
      calculatedMajorStep = Math.round(scaledStep * 10) / 10;
    } else {
      calculatedMajorStep = Math.round(scaledStep * 100) / 100;
    }
  }
  
  const totalRangeCm = finalScaleTopCm - finalScaleBottomCm;
  const majorHorizontalMarks = generateHorizontalMarks(finalScaleTopCm, finalScaleBottomCm, calculatedMajorStep);

  const pixelsPerCm = containerHeightPx > 0 && totalRangeCm > 0 
      ? containerHeightPx / totalRangeCm 
      : 0;

  const zeroLineOffsetPx = pixelsPerCm > 0 
      ? Math.max(0, (0 - finalScaleBottomCm) * pixelsPerCm) 
      : 0;
  
  // Figure Dimension Calculation
  const calculateFinalImageDimensions = () => {
    if (pixelsPerCm <= 0 || images.length === 0) {
      return images.map(img => ({ id: img.id, width: 0, height: 0 }));
    }
    
    return images.map(image => {
      const heightPx = Math.max(1, image.heightCm * pixelsPerCm);
      const widthPx = Math.max(1, heightPx * image.aspectRatio);
      return { id: image.id, width: widthPx, height: heightPx };
    });
  };
  
  const figureDimensions = calculateFinalImageDimensions();

  // Handle mouse down to start drag
  const handleMouseDown = useCallback((e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (!onImageUpdate) return;
    
    setDraggedImage(imageId);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setIsDragging(true);
    setDragThresholdMet(false);
    setLongPressActivated(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [onImageUpdate, longPressTimer]);

  // Handle touch start for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, imageId: string) => {
    e.stopPropagation();
    if (!onImageUpdate) return;
    
    setDraggedImage(imageId);
    setDragStartX(e.touches[0].clientX);
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragThresholdMet(false);
    setLongPressActivated(false);
    
    const timer = setTimeout(() => {
      setLongPressActivated(true);
      setDragThresholdMet(true);
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);
  }, [onImageUpdate]);

  // Handle mouse move to update position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedImage || !onImageUpdate || !pixelsPerCm) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    if (!dragThresholdMet) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance >= DRAG_THRESHOLD_PX) {
        setDragThresholdMet(true);
        setShowMobileButtons(null);
      } else {
        return;
      }
    }
    
    const effectiveHorizontalPixelsPerCm = pixelsPerCm * horizontalScaleFactor;

    const deltaXCm = deltaX / effectiveHorizontalPixelsPerCm;
    const deltaYCm = -deltaY / pixelsPerCm;
    
    const imageToUpdate = images.find(img => img.id === draggedImage);
    if (imageToUpdate) {
      const newHorizontalOffset = imageToUpdate.horizontalOffsetCm + deltaXCm;
      const newVerticalOffset = imageToUpdate.verticalOffsetCm + deltaYCm;
      
      const maxHorizontalOffsetCm = availableWidthPx > 0 ? (availableWidthPx * 1.5) / pixelsPerCm : 1000;
      const maxVerticalOffsetCm = containerHeightPx > 0 ? (containerHeightPx * 1.5) / pixelsPerCm : 1000;
      
      onImageUpdate(draggedImage, {
        horizontalOffsetCm: Math.max(-maxHorizontalOffsetCm, Math.min(maxHorizontalOffsetCm, newHorizontalOffset)),
        verticalOffsetCm: Math.max(-maxVerticalOffsetCm, Math.min(maxVerticalOffsetCm, newVerticalOffset))
      });
    }
    
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  }, [isDragging, draggedImage, dragStartX, dragStartY, onImageUpdate, pixelsPerCm, horizontalScaleFactor, images, dragThresholdMet, availableWidthPx, containerHeightPx]);

  // Handle touch move for mobile
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !draggedImage || !onImageUpdate || !pixelsPerCm) return;
    
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (!longPressActivated) {
      if (longPressTimer && distance >= DRAG_THRESHOLD_PX) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      return;
    }
    
    if (!dragThresholdMet) {
      setDragThresholdMet(true);
      setShowMobileButtons(null);
    }
    
    e.preventDefault();
    
    const effectiveHorizontalPixelsPerCm = pixelsPerCm * horizontalScaleFactor;

    const deltaXCm = deltaX / effectiveHorizontalPixelsPerCm;
    const deltaYCm = -deltaY / pixelsPerCm;
    
    const imageToUpdate = images.find(img => img.id === draggedImage);
    if (imageToUpdate) {
      const newHorizontalOffset = imageToUpdate.horizontalOffsetCm + deltaXCm;
      const newVerticalOffset = imageToUpdate.verticalOffsetCm + deltaYCm;
      
      const maxHorizontalOffsetCm = availableWidthPx > 0 ? (availableWidthPx * 1.5) / pixelsPerCm : 1000;
      const maxVerticalOffsetCm = containerHeightPx > 0 ? (containerHeightPx * 1.5) / pixelsPerCm : 1000;
      
      onImageUpdate(draggedImage, {
        horizontalOffsetCm: Math.max(-maxHorizontalOffsetCm, Math.min(maxHorizontalOffsetCm, newHorizontalOffset)),
        verticalOffsetCm: Math.max(-maxVerticalOffsetCm, Math.min(maxVerticalOffsetCm, newVerticalOffset))
      });
    }
    
    setDragStartX(e.touches[0].clientX);
    setDragStartY(e.touches[0].clientY);
  }, [isDragging, draggedImage, dragStartX, dragStartY, onImageUpdate, pixelsPerCm, horizontalScaleFactor, images, dragThresholdMet, longPressTimer, longPressActivated, availableWidthPx, containerHeightPx]);

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    if (isDragging && !dragThresholdMet && draggedImage) {
      if (onEdit) {
        onEdit(draggedImage);
      }
    }
    setIsDragging(false);
    setDraggedImage(null);
    setDragThresholdMet(false);
    setLongPressActivated(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [isDragging, dragThresholdMet, draggedImage, onEdit, longPressTimer]);

  // Handle touch end for mobile
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (isDragging && !dragThresholdMet && !longPressActivated && draggedImage) {
      setShowMobileButtons(draggedImage);
    }
    
    setIsDragging(false);
    setDraggedImage(null);
    setDragThresholdMet(false);
    setLongPressActivated(false);
  }, [isDragging, dragThresholdMet, draggedImage, longPressTimer, longPressActivated]);

  // Adjust view position after zoom changes
  useEffect(() => {
    if (containerRef.current && pixelsPerCm > 0) {
      const viewportHeight = containerRef.current.clientHeight;
      const scrollableHeight = containerRef.current.scrollHeight;
      
      const scrollRatio = 0.35;
      const targetPosition = Math.max(0, scrollableHeight * scrollRatio - viewportHeight/2);
      
      containerRef.current.scrollTop = targetPosition;
    }
  }, [internalZoomLevel, pixelsPerCm, images]);
  
  // Prevent mouse wheel scroll but allow zoom control via wheel with Ctrl key
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setInternalZoomLevel(prev => Math.min(100, prev + 5));
      } else {
        setInternalZoomLevel(prev => Math.max(10, prev - 5));
      }
    } else {
      e.preventDefault();
    }
  }, []);

  // Add and remove event listeners for mouse move and up
  useLayoutEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Hide mobile buttons when clicking outside
  useLayoutEffect(() => {
    const handleClickOutside = () => {
      setShowMobileButtons(null);
    };

    if (showMobileButtons) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMobileButtons]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-auto bg-white dark:bg-gray-800"
      onWheel={handleWheel}
    >
      <div 
        className="relative" 
        style={{ 
          height: `${containerHeightPx}px`,
          minHeight: '100%'
        }}
      >
        {/* Scale Unit Headers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between z-10 pointer-events-none px-1">
          <span className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 px-1 py-0 rounded-lg shadow-lg font-heading">
            CM
          </span>
          <span className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 px-2 py-0 rounded-lg shadow-lg font-heading">
            Feet
          </span>
        </div>

        {/* Background Grid/Scales */} 
        <div className="absolute inset-0 pointer-events-none z-0">
            {pixelsPerCm > 0 && majorHorizontalMarks.map((mark) => {
                const positionBottom = (mark.valueCm - finalScaleBottomCm) * pixelsPerCm;
                const isZeroLine = Math.abs(mark.valueCm) < EPSILON;
                
                return (
                <div key={`mark-${mark.valueCm}`} className="absolute left-0 right-0" style={{ bottom: `${positionBottom}px` }}>
                    <div 
                      className={`w-full ${isZeroLine ? 'h-0.5 bg-red-500' : 'h-px bg-gray-300 dark:bg-gray-600'}`}
                    ></div>
                   </div>
                );
           })}
        </div>
        
        {/* Scale Labels Layer */}
        <div className="absolute inset-0 pointer-events-none z-5">
            {pixelsPerCm > 0 && majorHorizontalMarks.map((mark) => {
                const positionBottom = (mark.valueCm - finalScaleBottomCm) * pixelsPerCm;
                
                return (
                <div key={`label-${mark.valueCm}`} className="absolute left-0 right-0" style={{ bottom: `${positionBottom - 20}px` }}>
                    <div className="flex justify-between w-full px-1 mt-1">
                      <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 font-mono tracking-tighter">
                        {mark.labelCm}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 font-mono tracking-tighter">
                        {mark.labelFtIn}
                      </span>
                    </div>
                   </div>
                );
           })}
        </div>

        {/* Figures Layer */} 
        <div 
          className="absolute inset-0 z-10" 
          style={{ 
              paddingBottom: `${zeroLineOffsetPx}px`,
              paddingLeft: '0px',
              paddingRight: '25px'
          }}
        >
            <div 
              ref={figuresContainerRef}
              className="relative flex items-end justify-center h-full w-full"
              style={{
                gap: `${scaledGap}px`,
                maxWidth: '100%'
              }}
            >
                {pixelsPerCm > 0 && images.map((image) => {
                    const dimensions = figureDimensions.find(d => d.id === image.id);
                    if (!dimensions) return null;
                    
                    const finalWidth = dimensions.width;
                    const finalHeight = dimensions.height;
                    
                    const effectiveHorizontalPixelsPerCm = pixelsPerCm * horizontalScaleFactor;
                    const offsetX = image.horizontalOffsetCm * effectiveHorizontalPixelsPerCm;
                    const offsetY = -image.verticalOffsetCm * pixelsPerCm;
                    
                    const figureLabel = `${image.name}\ncm: ${Math.round(image.heightCm)}\nft: ${cmToFtIn(image.heightCm)}`;

                return (
                   <div
                      key={image.id}
                      className="relative flex-shrink-0 origin-bottom group"
                      style={{
                          width: `${finalWidth}px`, 
                          height: `${finalHeight}px`,
                          transform: `translate(${offsetX}px, ${offsetY}px)`,
                          cursor: isDragging && draggedImage === image.id ? 'grabbing' : 'grab'
                      }}
                    >
                      {/* Edit/Delete buttons */}
                      <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 flex space-x-1 z-30 transition-opacity duration-200 ${
                        showMobileButtons === image.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {onEdit && (
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 md:p-1 shadow-lg border-2 border-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMobileButtons(null);
                              onEdit(image.id);
                            }}
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 md:p-1 shadow-lg border-2 border-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMobileButtons(null);
                              onDelete(image.id);
                            }}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Figure Label Container */}
                      <div
                        className="absolute bottom-full left-1/2 flex flex-col items-center pointer-events-none"
                        style={{ transform: `translate(-50%, ${FIGURE_LABEL_OFFSET_Y}px)` }}
                      >
                        <div className="p-2 text-gray-900 font-semibold text-sm md:text-base whitespace-pre text-center mb-1 dark:text-white font-body">
                          {figureLabel}
                        </div>
                        <div className="h-px bg-gray-800 dark:bg-gray-200 w-12"></div>
                      </div>

                      {/* Mobile interaction hint */}
                      {showMobileButtons !== image.id && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity duration-200 flex items-center md:hidden shadow-lg">
                          <span>Tap for options, long press to drag</span>
                        </div>
                      )}

                      {/* Desktop drag indicator */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center hidden md:flex shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4 4m0 0l4-4m-4 4V4" />
                        </svg>
                      </div>

                      {/* Figure Image/SVG with hover effect */}
                      <div 
                        className="w-full h-full bg-contain bg-no-repeat bg-center overflow-hidden transition-opacity duration-200 group-hover:opacity-80"
                        style={{ 
                          ...(image.src.includes('.svg') || image.src.startsWith('/images/') ? {
                            WebkitMaskImage: `url("${image.src}")`,
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: `url("${image.src}")`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            backgroundColor: image.color
                          } : {
                            backgroundImage: `url("${image.src}")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                          })
                        }}
                        title={`${image.name} - ${image.heightCm}cm. ${window.innerWidth < 768 ? 'Tap to show options, long press & drag to move' : 'Click and drag to move horizontally and vertically.'}`}
                        onClick={() => {
                          if (!isDragging && !dragThresholdMet) {
                            const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                            if (isMobile) {
                              setShowMobileButtons(image.id);
                            } else {
                              if (onEdit) {
                                onEdit(image.id);
                              }
                            }
                          }
                        }}
                        onMouseDown={(e) => handleMouseDown(e, image.id)}
                        onTouchStart={(e) => handleTouchStart(e, image.id)}
                      ></div>
                   </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparer; 