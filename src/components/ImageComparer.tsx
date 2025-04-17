'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
// import ScaleBar from './ScaleBar'; // Removed ScaleBar import

interface ImageInfo {
  id: string | number; // Unique identifier for key prop
  src: string;
  name: string;
  heightCm: number; // Re-added heightCm to input prop
  aspectRatio: number; // Expect aspectRatio
}

interface ImageComparerProps {
  images: ImageInfo[]; // Expects images with heightCm
  containerHeight?: string;
  containerWidth?: string;
}

// const DEFAULT_HEIGHT_CM = 100; // No longer needed here
const DEFAULT_SCALE_MAX_CM = 170; // Default scale height when no images
const SCALE_TOP_PADDING_FACTOR = 1.1; // Add 10% padding above the tallest image
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const IMAGE_GAP_PX = 16; // Equivalent to gap-4 (4 * 0.25rem * 16px/rem assumed)

// Helper to convert CM to Feet/Inches string (copied from old ScaleBar)
const cmToFtIn = (cm: number): string => {
    if (cm <= 0) return "0' 0\"";
    const totalInches = cm / CM_PER_INCH;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    const inches = Math.round(totalInches % INCHES_PER_FOOT);
    return `${feet}' ${inches}\"`;
};

// Function to generate horizontal scale marks
const generateHorizontalMarks = (maxCm: number) => {
    if (maxCm <= 0) return []; // Handle edge case

    const numberOfIntervals = 10;
    const exactStep = maxCm / numberOfIntervals;

    const marks = [];
    // Generate exactly 11 marks (0 + 10 intervals)
    for (let i = 0; i <= numberOfIntervals; i++) {
        const currentCm = i * exactStep;
        marks.push({
            valueCm: currentCm,
            // Round labels for display, but use exact valueCm for positioning
            labelCm: `${Math.round(currentCm)} cm`, 
            labelFtIn: cmToFtIn(currentCm),
        });
    }
    
    // The loop now guarantees the 0 and maxCm marks are included.
    // Removed explicit add for 0 and maxCm

    return marks;
};

const ImageComparer: React.FC<ImageComparerProps> = ({
  images, // Now expects images with heightCm
  containerHeight = '80vh', 
  containerWidth = '90vw'
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null); // Ref for the inner image container
  const [internalCanvasHeightPx, setInternalCanvasHeightPx] = useState<number>(0);
  const [imageContainerWidthPx, setImageContainerWidthPx] = useState<number>(0);

  useLayoutEffect(() => {
    // Get container height
    if (wrapperRef.current) {
      const element = wrapperRef.current;
      const computedStyle = window.getComputedStyle(element);
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      const availableHeight = element.offsetHeight - paddingTop - paddingBottom;
      setInternalCanvasHeightPx(Math.max(0, availableHeight));
    }
    // Get image container width
    if (imageContainerRef.current) {
        setImageContainerWidthPx(imageContainerRef.current.offsetWidth);
    }
  }, [containerHeight, containerWidth, images]); // Rerun if images change (for width calc)

  // Determine the actual maximum image height or default
  const maxImageHeight = images.length > 0 
      ? Math.max(1, ...images.map(img => img.heightCm || 0)) 
      : 0;
  const actualMaxCm = maxImageHeight > 0 ? maxImageHeight : DEFAULT_SCALE_MAX_CM;

  // Calculate the initial effective top of the scale for rendering, including padding
  const initialScaleTopCm = actualMaxCm * SCALE_TOP_PADDING_FACTOR;

  // Calculate initial vertical scale factor
  const initialScaleCmPerPixel = (internalCanvasHeightPx > 0 && initialScaleTopCm > 0) 
      ? initialScaleTopCm / internalCanvasHeightPx 
      : 0;

  // Calculate ideal dimensions based on initial vertical scale
  let totalIdealWidth = 0;
  const imageDimensions = images.map(image => {
    const idealHeight = initialScaleCmPerPixel > 0 ? (image.heightCm || 1) / initialScaleCmPerPixel : 0;
    const idealWidth = idealHeight * (image.aspectRatio || 1);
    totalIdealWidth += idealWidth;
    return { id: image.id, idealHeight, idealWidth };
  });

  // Add gaps to total width
  if (images.length > 1) {
    totalIdealWidth += (images.length - 1) * IMAGE_GAP_PX;
  }

  // Calculate horizontal scaling factor needed to fit width
  const horizontalScaleFactor = (imageContainerWidthPx > 0 && totalIdealWidth > imageContainerWidthPx)
    ? imageContainerWidthPx / totalIdealWidth
    : 1;

  // ---- Adjust scale for lines based on horizontal scaling ----
  const adjustedScaleTopCm = initialScaleTopCm / horizontalScaleFactor; // Effective top CM value after scaling
  const adjustedScaleCmPerPixel = (internalCanvasHeightPx > 0 && adjustedScaleTopCm > 0)
      ? adjustedScaleTopCm / internalCanvasHeightPx
      : 0; // Scale factor for positioning lines
  const maxCmForLines = actualMaxCm / horizontalScaleFactor; // Max cm value for generating line labels

  // Generate horizontal marks based on the *adjusted* scale range
  const horizontalMarks = generateHorizontalMarks(maxCmForLines);

  // ---- Calculate final dynamic gap ----
  const finalGap = Math.max(0, IMAGE_GAP_PX * horizontalScaleFactor);

  return (
    <div
      ref={wrapperRef}
      className="flex bg-gray-100 dark:bg-gray-900 p-2 rounded-lg shadow overflow-hidden"
      style={{ height: containerHeight, width: containerWidth }}
    >
      {internalCanvasHeightPx > 0 && (
        <>
          {/* Main image container - Remove gap class, add inline gap style */}
          <div
            ref={imageContainerRef}
            className="relative flex-grow flex items-end overflow-hidden justify-center" // Removed gap-4
            style={{ 
                height: `${internalCanvasHeightPx}px`, 
                gap: `${finalGap}px` // Apply dynamic gap
            }}
          >
            {/* Render Horizontal Measurement Lines - Position based on adjusted scale */}
            {horizontalMarks.map((mark) => {
                // Use adjusted scale to calculate position
                const positionBottom = adjustedScaleCmPerPixel > 0 ? mark.valueCm / adjustedScaleCmPerPixel : 0;
                // Clip marks outside the actual canvas height
                if (positionBottom > internalCanvasHeightPx && mark.valueCm !== 0) return null;
                const clampedPositionBottom = Math.max(0, positionBottom);

                return (
                    <div
                      key={`mark-${mark.valueCm}`}
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{ bottom: `${clampedPositionBottom}px` }}
                    >
                        {/* Line (removed min-w-full) */}
                        <div className="h-px bg-gray-400 dark:bg-gray-600 opacity-50"></div>
                        {/* Label (removed z-20) */}
                        <span 
                           className="absolute bottom-0 left-1 transform -translate-y-1/2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 px-1 rounded"
                           style={{ whiteSpace: 'nowrap' }}
                        >
                            {mark.labelCm} / {mark.labelFtIn}
                        </span>
                    </div>
                );
            })}

            {/* Render Images with final scaled dimensions */}
            {images.map((image) => {
              const dims = imageDimensions.find(d => d.id === image.id);
              if (!dims) return null; 

              // Apply horizontal scaling factor to ideal dimensions
              const finalHeight = Math.max(1, dims.idealHeight * horizontalScaleFactor);
              const finalWidth = Math.max(1, dims.idealWidth * horizontalScaleFactor);

              return (
                // Image wrapper div - Allow shrinking (removed flex-shrink-0)
                <div key={image.id} className="relative z-10 flex flex-col items-center justify-end">
                  {finalHeight > 1 && (
                      <img
                        src={image.src}
                        alt={image.name}
                        // Restore object-contain/bottom for aspect ratio preservation within the calculated box
                        className="block object-contain object-bottom"
                        style={{ 
                            height: `${finalHeight}px`, 
                            width: `${finalWidth}px` // Set explicit width
                        }}
                      />
                   )}
                 </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageComparer; 