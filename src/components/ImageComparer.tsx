'use client';

import React, { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react';

// --- Interfaces --- 
// Match the interface used in page.tsx
interface ManagedImage {
  id: string;
  name: string;
  src: string; 
  heightCm: number;
  aspectRatio: number; 
  verticalOffsetCm: number; 
  horizontalOffsetCm: number; 
  color: string;
  gender: 'male' | 'female';
}

interface ImageComparerProps {
  images: ManagedImage[];
  zoomLevel?: number; // Add zoom level property
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onImageUpdate?: (id: string, updates: Partial<ManagedImage>) => void;
  onZoomChange?: (newZoom: number) => void; // Add zoom change handler
  onMajorStepChange?: (step: number) => void; // Add callback for major step changes
}

// --- Constants --- 
const SCALE_TOP_FACTOR = 1.1; // Show 10% margin above highest content
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const MAJOR_INTERVALS = 10; // Number of intervals for major lines (e.g., every 10% of range)
const FIGURE_LABEL_OFFSET_Y = -1; // Pixels above figure head for label - Adjusted to -1
const epsilon = 1e-6;

// Constants for infinite scrolling
// const SCROLL_THRESHOLD = 100; // px from top/bottom to trigger range expansion
// const RANGE_INCREMENT_FACTOR = 0.5; // How much to increase range by when scrolled to edge

// --- Helper Functions (cmToFtIn, cmToCmLabel, generateHorizontalMarks can be adapted) ---
const cmToFtIn = (cm: number): string => {
    if (Math.abs(cm) < epsilon) return "0\'0\"";
    const absCm = Math.abs(cm);
    const totalInches = absCm / CM_PER_INCH;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    // Match screenshot format (e.g., 5'10.46") - round to 2 decimal places for inches?
    let inches = totalInches % INCHES_PER_FOOT;
    let adjustedFeet = feet;
    if (Math.abs(inches - 12) < epsilon / 100) { // Check closer to 12
        adjustedFeet += 1;
        inches = 0;
    }
    const sign = cm < 0 ? '-' : '';
    // Show inches with more precision like screenshot, no space between feet and inches
    return `${sign}${adjustedFeet}\'${inches.toFixed(2)}\"`; 
};

const cmToCmLabel = (cm: number): string => {
    return `${Math.round(cm)}`; // Just the number for the scale
};

const generateHorizontalMarks = (scaleTopCm: number, scaleBottomCm: number, majorStepParam?: number): Array<{
  valueCm: number;
  labelCm: string;
  labelFtIn: string;
}> => {
    const totalRange = scaleTopCm - scaleBottomCm;
    if (totalRange <= epsilon) return [];

    // Use provided majorStepParam if available, otherwise calculate it
    let majorStep = majorStepParam;
    if (majorStep === undefined) {
      const positiveRange = Math.max(epsilon, scaleTopCm);
      const niceFractions = [1, 2, 2.5, 5, 10];
      majorStep = 10; // Default/minimum step

      if (positiveRange > epsilon) {
          const rawStep = positiveRange / MAJOR_INTERVALS;
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
          majorStep = bestFraction * pow10;
      }
      majorStep = Math.max(10, majorStep);
    }
    // --- End Dynamic Nice Step Calculation ---

    const majorMarks: Array<{
      valueCm: number;
      labelCm: string;
      labelFtIn: string;
    }> = [];

    // Generate marks based on the step for the full range
    for (let currentCm = Math.ceil(scaleBottomCm / majorStep) * majorStep; 
         currentCm <= scaleTopCm + epsilon; 
         currentCm += majorStep) {
        // Avoid adding duplicates
        if (majorMarks.findIndex(m => Math.abs(m.valueCm - currentCm) < epsilon) === -1) {
            majorMarks.push({
                valueCm: currentCm,
                labelCm: cmToCmLabel(currentCm),
                labelFtIn: cmToFtIn(currentCm),
            });
        }
    }
    
    // Explicitly add the zero line if it's within range and not already added
    if (0 >= scaleBottomCm - epsilon && 0 <= scaleTopCm + epsilon) {
        if (majorMarks.findIndex(m => Math.abs(m.valueCm) < epsilon) === -1) {
            majorMarks.push({ valueCm: 0, labelCm: '0', labelFtIn: cmToFtIn(0) });
        }
    }

    // Ensure we have at least one negative mark
    const hasNegativeMark = majorMarks.some(m => m.valueCm < -epsilon);
    if (!hasNegativeMark) {
        // Add a mark at -majorStep
        majorMarks.push({
            valueCm: -majorStep,
            labelCm: cmToCmLabel(-majorStep),
            labelFtIn: cmToFtIn(-majorStep)
        });
    }

    majorMarks.sort((a, b) => a.valueCm - b.valueCm);
    return majorMarks;
};

// --- Component --- 
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
  // Remove unused state
  // const [containerWidthPx, setContainerWidthPx] = useState<number>(0);
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

  // Drag threshold constants
  const DRAG_THRESHOLD_PX = 20; // Minimum pixels to move before starting drag - increased sensitivity
  const LONG_PRESS_DURATION = 100; // ms for long press to enable drag on mobile

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
        // Use full width since labels are now below the lines
        availableWidth = Math.max(100, width - 80); // 16px for padding
        
        setContainerHeightPx(height > 0 ? height : 0);
        // Removed unused state update
        // setContainerWidthPx(width > 0 ? width : 0);
        setAvailableWidthPx(availableWidth > 0 ? availableWidth : 0);
    }
  }, [images]); // Rerun if images change (potential height change)

  // --- Scale Calculations ---
  const maxImageHeight = images.length > 0 
      ? Math.max(1, ...images.map(img => img.heightCm || 0)) 
      : 0;
  const actualMaxCm = maxImageHeight > 0 ? maxImageHeight : 200;

  const baseScaleTopCm = actualMaxCm * SCALE_TOP_FACTOR;
  const zoomFactor = (110 - internalZoomLevel) / 50;
  const zoomAdjustedTopCmInitial = baseScaleTopCm * zoomFactor;

  let calculatedMajorStep = 10;
  const positiveRangeForStep = Math.max(epsilon, zoomAdjustedTopCmInitial);
  if (positiveRangeForStep > epsilon) {
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
  let totalRangeCmInitial = finalScaleTopCm - finalScaleBottomCm;

  // --- Combined Horizontal and Vertical Scaling ---
  const IMAGE_GAP_PX = 16; // Default gap between images
  
  // Calculate an initial pixelsPerCm to estimate figure dimensions
  const initialPixelsPerCm = containerHeightPx > 0 && totalRangeCmInitial > 0
    ? containerHeightPx / totalRangeCmInitial
    : 0;

  let horizontalScaleFactor = 1;
  let scaledGap = IMAGE_GAP_PX;
  let figureDimensionsUnscaled = images.map(image => ({
      id: image.id,
      width: 0,
      height: 0,
  }));

  if (initialPixelsPerCm > 0 && images.length > 0 && availableWidthPx > 0) {
    const unscaledDimensions = images.map(image => {
      const height = Math.max(1, image.heightCm * initialPixelsPerCm);
      const width = Math.max(1, height * image.aspectRatio);
      return { id: image.id, width, height };
    });
    figureDimensionsUnscaled = unscaledDimensions;

    const totalIdealWidth = unscaledDimensions.reduce((sum, dim) => sum + dim.width, 0) +
                          (images.length > 1 ? (images.length - 1) * IMAGE_GAP_PX : 0);

    if (totalIdealWidth > availableWidthPx) {
      horizontalScaleFactor = availableWidthPx / totalIdealWidth;
    }
    scaledGap = IMAGE_GAP_PX * horizontalScaleFactor;
  }
  
  // If horizontal scaling is applied, adjust the vertical range to match
  // This makes the scale markings "larger" in cm value, effectively shrinking them
  // to match the shrunken images, while keeping containerHeightPx constant.
  if (horizontalScaleFactor < 1) {
    finalScaleTopCm = zoomAdjustedTopCmInitial / horizontalScaleFactor;
    finalScaleBottomCm = zoomAdjustedBottomCmInitial / horizontalScaleFactor;
    // Scale the major step proportionally to maintain the same number of lines
    // at the same pixel positions, but with adjusted scale values
    // Round to avoid floating-point precision issues
    const scaledStep = calculatedMajorStep / horizontalScaleFactor;
    
    // Determine appropriate rounding based on the magnitude of the scaled step
    if (scaledStep >= 100) {
      calculatedMajorStep = Math.round(scaledStep);
    } else if (scaledStep >= 10) {
      calculatedMajorStep = Math.round(scaledStep * 10) / 10;
    } else {
      calculatedMajorStep = Math.round(scaledStep * 100) / 100;
    }
  }
  
  const totalRangeCm = finalScaleTopCm - finalScaleBottomCm;
  const majorHorizontalMarks = generateHorizontalMarks(finalScaleTopCm, finalScaleBottomCm, calculatedMajorStep); // Pass calculatedMajorStep

  // Calculate PixelsPerCm (vertical scale) using the potentially adjusted totalRangeCm
  const pixelsPerCm = containerHeightPx > 0 && totalRangeCm > 0 
      ? containerHeightPx / totalRangeCm 
      : 0;

  // Calculate offset for 0cm alignment
  const zeroLineOffsetPx = pixelsPerCm > 0 
      ? Math.max(0, (0 - finalScaleBottomCm) * pixelsPerCm) 
      : 0;
  
  // --- Figure Dimension Calculation (using final pixelsPerCm) ---
  const calculateFinalImageDimensions = () => {
    if (pixelsPerCm <= 0 || images.length === 0) {
      return images.map(img => ({ id: img.id, width: 0, height: 0 }));
    }
    
    return images.map(image => {
      // The height in cm is the source of truth.
      // The pixel height is derived from cm height * pixelsPerCm.
      // Aspect ratio is maintained.
      const heightPx = Math.max(1, image.heightCm * pixelsPerCm);
      const widthPx = Math.max(1, heightPx * image.aspectRatio);
      return { id: image.id, width: widthPx, height: heightPx };
    });
  };
  
  const figureDimensions = calculateFinalImageDimensions();
  // --- End of Scale Calculations --- 

  // Handle mouse down to start drag
  const handleMouseDown = useCallback((e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (!onImageUpdate) return;
    
    setDraggedImage(imageId);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setIsDragging(true);
    setDragThresholdMet(false);
    // Reset mobile-specific states for desktop interaction
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
    
    // Set timer for long press to enable drag mode
    const timer = setTimeout(() => {
      setLongPressActivated(true);
      setDragThresholdMet(true); // Allow immediate dragging after long press
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);
  }, [onImageUpdate, LONG_PRESS_DURATION]);

  // Handle mouse move to update position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedImage || !onImageUpdate || !pixelsPerCm) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    // Check if drag threshold is met
    if (!dragThresholdMet) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance >= DRAG_THRESHOLD_PX) {
        setDragThresholdMet(true);
        setShowMobileButtons(null); // Hide mobile buttons when dragging starts
      } else {
        return; // Don't move until threshold is met
      }
    }
    
    // horizontalScaleFactor is already incorporated into pixelsPerCm for vertical scaling
    // For horizontal dragging, we still need to account for the scaled width of figures.
    // If figures are consuming less width on screen (horizontalScaleFactor < 1), then a mouse drag
    // in pixels should translate to a larger change in cm.
    const effectiveHorizontalPixelsPerCm = pixelsPerCm * horizontalScaleFactor;

    const deltaXCm = deltaX / effectiveHorizontalPixelsPerCm;
    const deltaYCm = -deltaY / pixelsPerCm; // Vertical dragging is direct with pixelsPerCm
    
    const imageToUpdate = images.find(img => img.id === draggedImage);
    if (imageToUpdate) {
      // Allow completely free dragging anywhere within the full viewport area
      const newHorizontalOffset = imageToUpdate.horizontalOffsetCm + deltaXCm;
      const newVerticalOffset = imageToUpdate.verticalOffsetCm + deltaYCm;
      
      // Set very generous bounds to allow dragging anywhere in the viewport area
      const maxHorizontalOffsetCm = availableWidthPx > 0 ? (availableWidthPx * 1.5) / pixelsPerCm : 1000;
      const maxVerticalOffsetCm = containerHeightPx > 0 ? (containerHeightPx * 1.5) / pixelsPerCm : 1000;
      
      onImageUpdate(draggedImage, {
        horizontalOffsetCm: Math.max(-maxHorizontalOffsetCm, Math.min(maxHorizontalOffsetCm, newHorizontalOffset)),
        verticalOffsetCm: Math.max(-maxVerticalOffsetCm, Math.min(maxVerticalOffsetCm, newVerticalOffset))
      });
    }
    
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  }, [isDragging, draggedImage, dragStartX, dragStartY, onImageUpdate, pixelsPerCm, horizontalScaleFactor, images, dragThresholdMet, DRAG_THRESHOLD_PX, availableWidthPx, containerHeightPx]);

  // Handle touch move for mobile
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !draggedImage || !onImageUpdate || !pixelsPerCm) return;
    
    const deltaX = e.touches[0].clientX - dragStartX;
    const deltaY = e.touches[0].clientY - dragStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // On mobile (touch), ONLY allow dragging after long press is activated
    if (!longPressActivated) {
      // If user moves before long press completes, clear the timer and prevent drag
      if (longPressTimer && distance >= DRAG_THRESHOLD_PX) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      return; // Don't allow any movement until long press is activated
    }
    
    // Only proceed with dragging if long press was activated
    if (!dragThresholdMet) {
      setDragThresholdMet(true);
      setShowMobileButtons(null); // Hide mobile buttons when dragging starts
    }
    
    // Prevent default to stop scrolling when dragging
    e.preventDefault();
    
    const effectiveHorizontalPixelsPerCm = pixelsPerCm * horizontalScaleFactor;

    const deltaXCm = deltaX / effectiveHorizontalPixelsPerCm;
    const deltaYCm = -deltaY / pixelsPerCm;
    
    const imageToUpdate = images.find(img => img.id === draggedImage);
    if (imageToUpdate) {
      // Allow completely free dragging anywhere within the full viewport area
      const newHorizontalOffset = imageToUpdate.horizontalOffsetCm + deltaXCm;
      const newVerticalOffset = imageToUpdate.verticalOffsetCm + deltaYCm;
      
      // Set very generous bounds to allow dragging anywhere in the viewport area
      const maxHorizontalOffsetCm = availableWidthPx > 0 ? (availableWidthPx * 1.5) / pixelsPerCm : 1000;
      const maxVerticalOffsetCm = containerHeightPx > 0 ? (containerHeightPx * 1.5) / pixelsPerCm : 1000;
      
      onImageUpdate(draggedImage, {
        horizontalOffsetCm: Math.max(-maxHorizontalOffsetCm, Math.min(maxHorizontalOffsetCm, newHorizontalOffset)),
        verticalOffsetCm: Math.max(-maxVerticalOffsetCm, Math.min(maxVerticalOffsetCm, newVerticalOffset))
      });
    }
    
    setDragStartX(e.touches[0].clientX);
    setDragStartY(e.touches[0].clientY);
  }, [isDragging, draggedImage, dragStartX, dragStartY, onImageUpdate, pixelsPerCm, horizontalScaleFactor, images, dragThresholdMet, DRAG_THRESHOLD_PX, longPressTimer, longPressActivated, availableWidthPx, containerHeightPx]);

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    if (isDragging && !dragThresholdMet && draggedImage) {
      // If no significant drag occurred, treat as click for edit
      if (onEdit) {
        onEdit(draggedImage);
      }
    }
    setIsDragging(false);
    setDraggedImage(null);
    setDragThresholdMet(false);
    // Reset mobile-specific states
    setLongPressActivated(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [isDragging, dragThresholdMet, draggedImage, onEdit, longPressTimer]);

  // Handle touch end for mobile
  const handleTouchEnd = useCallback(() => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (isDragging && !dragThresholdMet && !longPressActivated && draggedImage) {
      // Short tap that didn't become a drag shows buttons
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
      // Keep the view centered on the useful content
      const viewportHeight = containerRef.current.clientHeight;
      const scrollableHeight = containerRef.current.scrollHeight;
      
      // Position to ensure figures are centered in view
      const scrollRatio = 0.35; // Slightly above middle to show more height
      const targetPosition = Math.max(0, scrollableHeight * scrollRatio - viewportHeight/2);
      
      containerRef.current.scrollTop = targetPosition;
    }
  }, [internalZoomLevel, pixelsPerCm, images]);
  
  // Prevent mouse wheel scroll but allow zoom control via wheel with Ctrl key
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // If Ctrl key is pressed, use wheel for zoom control
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Zoom in (wheel up)
        setInternalZoomLevel(prev => Math.min(100, prev + 5));
      } else {
        // Zoom out (wheel down)
        setInternalZoomLevel(prev => Math.max(10, prev - 5));
      }
    } else {
      // Prevent normal scrolling
      e.preventDefault();
    }
  }, []);

  // Add and remove event listeners for mouse move and up
  useLayoutEffect(() => {
    if (isDragging) {
      // For touch events, we need passive: false to be able to call preventDefault
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
    // Container with fixed scroll behavior
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-auto bg-white dark:bg-gray-800"
      onWheel={handleWheel}
    >
      {/* Content wrapper with fixed dimensions */}
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
                const isZeroLine = Math.abs(mark.valueCm) < epsilon;
                
                return (
                <div key={`mark-${mark.valueCm}`} className="absolute left-0 right-0" style={{ bottom: `${positionBottom}px` }}>
                    {/* Line - Full width */}
                    <div 
                      className={`w-full ${isZeroLine ? 'h-0.5 bg-red-500' : 'h-px bg-gray-300 dark:bg-gray-600'}`}
                    ></div>
                   </div>
                );
           })}
        </div>
        
        {/* Scale Labels Layer - Above figures but below interactive elements */}
        <div className="absolute inset-0 pointer-events-none z-5">
            {pixelsPerCm > 0 && majorHorizontalMarks.map((mark) => {
                const positionBottom = (mark.valueCm - finalScaleBottomCm) * pixelsPerCm;
                
                return (
                <div key={`label-${mark.valueCm}`} className="absolute left-0 right-0" style={{ bottom: `${positionBottom - 20}px` }}>
                    {/* Labels below the line */}
                    <div className="flex justify-between w-full px-1 mt-1">
                      {/* Left Label (CM) */}
                      <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 font-mono tracking-tighter">
                        {mark.labelCm}
                      </span>
                      {/* Right Label (Ft) */}
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
              paddingBottom: `${zeroLineOffsetPx}px`, // Align base with 0 line + space for labels
              paddingLeft: '0px', // padding from left edge for silohuettes
              paddingRight: '25px' // padding from right edge for silohuettes
          }}
        >
            {/* Use Flexbox to arrange figures horizontally */}
            <div 
              ref={figuresContainerRef}
              className="relative flex items-end justify-center h-full w-full"
              style={{
                gap: `${scaledGap}px`, // Apply scaled gap (already adjusted by horizontalScaleFactor)
                maxWidth: '100%'
              }}
            >
                {pixelsPerCm > 0 && images.map((image) => {
                    const dimensions = figureDimensions.find(d => d.id === image.id);
                    if (!dimensions) return null;
                    
                    // Dimensions.width and dimensions.height are now the final, scaled pixel values.
                    // horizontalScaleFactor is already incorporated into pixelsPerCm, which then affects dimensions.
                    const finalWidth = dimensions.width;
                    const finalHeight = dimensions.height;
                    
                    // Scale offsets proportionally.
                    // For horizontal offset, we need to use the effectiveHorizontalPixelsPerCm.
                    const effectiveHorizontalPixelsPerCm = pixelsPerCm * horizontalScaleFactor;
                    const offsetX = image.horizontalOffsetCm * effectiveHorizontalPixelsPerCm;
                    const offsetY = -image.verticalOffsetCm * pixelsPerCm; // Vertical offset uses direct pixelsPerCm
                    
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
                      {/* Edit/Delete buttons - Visible on hover (desktop) or mobile button state */}
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

                      {/* Figure Label Container - Positioned above the figure */}
                      <div
                        className="absolute bottom-full left-1/2 flex flex-col items-center pointer-events-none"
                        style={{ transform: `translate(-50%, ${FIGURE_LABEL_OFFSET_Y}px)` }}
                      >
                        {/* Text Content Block - Placed FIRST */}
                        <div className="p-2 text-gray-900 font-semibold text-sm md:text-base whitespace-pre text-center mb-1 dark:text-white font-body">
                          {figureLabel}
                        </div>
                        {/* Horizontal Line - Placed SECOND, below the text */}
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
                          // Check if image is an SVG (from default silhouettes) or a custom uploaded image
                          ...(image.src.includes('.svg') || image.src.startsWith('/images/') ? {
                            // For SVG images, use mask-image to create a silhouette effect with custom color
                            WebkitMaskImage: `url("${image.src}")`,
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: `url("${image.src}")`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            backgroundColor: image.color // Use the color for the fill
                          } : {
                            // For non-SVG images, use background-image directly
                            backgroundImage: `url("${image.src}")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                          })
                        }}
                        title={`${image.name} - ${image.heightCm}cm. ${window.innerWidth < 768 ? 'Tap to show options, long press & drag to move' : 'Click and drag to move horizontally and vertically.'}`}
                        onClick={() => {
                          if (!isDragging && !dragThresholdMet) {
                            // Check if this is a touch device
                            const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                            if (isMobile) {
                              // On mobile, show buttons instead of immediate edit
                              setShowMobileButtons(image.id);
                            } else {
                              // On desktop, immediate edit
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