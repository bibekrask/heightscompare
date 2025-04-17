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
    if (cm === 0) return "0' 0\"";
    const absCm = Math.abs(cm);
    const totalInches = absCm / CM_PER_INCH;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    let inches = Math.round(totalInches % INCHES_PER_FOOT);
    let adjustedFeet = feet;
    if (inches === 12) {
        adjustedFeet += 1;
        inches = 0;
    }
    const sign = cm < 0 ? '-' : '';
    return `${sign}${adjustedFeet}' ${inches}\"`;
};

// Function to generate horizontal scale marks with dynamic negative part
// Returns marks and the actual minimum CM value generated
const generateHorizontalMarks = (maxCm: number): { marks: any[], minCm: number } => {
    if (maxCm <= 0) { 
        // Handle case where max is 0 or negative - maybe just show 0 and -step?
        const step = 10; // Arbitrary step for negative-only scale
        return { 
            marks: [
                { valueCm: 0, labelCm: '0 cm', labelFtIn: cmToFtIn(0) },
                { valueCm: -step, labelCm: `-${step} cm`, labelFtIn: cmToFtIn(-step) },
            ],
            minCm: -step
        };
    } 

    const numberOfPositiveIntervals = 10;
    const exactStep = maxCm / numberOfPositiveIntervals;
    const numberOfNegativeIntervals = 1; // Changed from 2 to 1

    const marks = [];
    let minCmGenerated = 0;

    // Generate marks from negative up to positive
    for (let i = -numberOfNegativeIntervals; i <= numberOfPositiveIntervals; i++) {
        const currentCm = i * exactStep;
        marks.push({
            valueCm: currentCm,
            labelCm: `${Math.round(currentCm)} cm`,
            labelFtIn: cmToFtIn(currentCm),
        });
        if (i < 0) {
             minCmGenerated = Math.min(minCmGenerated, currentCm);
        }
    }

    // Ensure unique marks (e.g., if step is very small, rounding might create duplicates)
    const uniqueMarks = marks.filter((mark, index, self) => 
        index === self.findIndex((m) => m.valueCm === mark.valueCm)
    );

    return { marks: uniqueMarks, minCm: minCmGenerated };
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

  // --- Generate Marks FIRST to find the actual minimum CM required ---
  const { marks: preliminaryMarks, minCm: actualMinCm } = generateHorizontalMarks(actualMaxCm);
  
  // --- Now calculate scales based on actualMinCm and actualMaxCm ---
  const initialScaleTopCm = actualMaxCm * SCALE_TOP_PADDING_FACTOR;
  const initialScaleBottomCm = actualMinCm; // Use the dynamic minimum

  // ... Calculate initialPixelsPerCm (based on actual min/max range) ...
  const initialTotalRangeCm = initialScaleTopCm - initialScaleBottomCm;
  const initialPixelsPerCm = internalCanvasHeightPx > 0 && initialTotalRangeCm > 0 
      ? internalCanvasHeightPx / initialTotalRangeCm 
      : 0;

  // ... Calculate ideal dimensions and horizontalScaleFactor ...
  let totalIdealWidth = 0;
  const imageDimensions = images.map(image => {
      const idealHeightPx = (image.heightCm || 1) * initialPixelsPerCm;
      const idealWidthPx = idealHeightPx * (image.aspectRatio || 1);
      totalIdealWidth += idealWidthPx;
      return { id: image.id, idealHeight: idealHeightPx, idealWidth: idealWidthPx };
  });
  if (images.length > 1) { totalIdealWidth += (images.length - 1) * IMAGE_GAP_PX; }
  const horizontalScaleFactor = (imageContainerWidthPx > 0 && totalIdealWidth > imageContainerWidthPx)
      ? imageContainerWidthPx / totalIdealWidth : 1;

  // Adjust scale boundaries based on horizontal scaling and actual min/max
  const adjustedScaleTopCm = initialScaleTopCm / horizontalScaleFactor;
  const adjustedScaleBottomCm = initialScaleBottomCm / horizontalScaleFactor;
  const adjustedTotalRangeCm = adjustedScaleTopCm - adjustedScaleBottomCm;
  const adjustedPixelsPerCm = internalCanvasHeightPx > 0 && adjustedTotalRangeCm > 0 
      ? internalCanvasHeightPx / adjustedTotalRangeCm 
      : 0;

  // Recalculate marks based on the FINAL adjusted scale range if needed?
  // No, use preliminary marks but position them with final adjusted scale.
  const horizontalMarks = preliminaryMarks; 

  // Calculate padding needed to align image bottom with 0cm line
  const zeroLineOffsetPx = adjustedPixelsPerCm > 0 
      ? Math.max(0, (0 - adjustedScaleBottomCm) * adjustedPixelsPerCm) 
      : 0;

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
            className="relative flex-grow flex items-end overflow-hidden justify-center"
            style={{ 
                height: `${internalCanvasHeightPx}px`, 
                gap: `${finalGap}px`,
                paddingBottom: `${zeroLineOffsetPx}px` // Padding remains based on adjusted scale
            }}
          >
            {/* Render Horizontal Measurement Lines - Use adjusted scale */}
            {horizontalMarks.map((mark) => {
                // Position relative to the adjusted bottom 
                const positionBottom = adjustedPixelsPerCm > 0 
                    ? (mark.valueCm - adjustedScaleBottomCm) * adjustedPixelsPerCm 
                    : 0;
                if (positionBottom < 0 || positionBottom > internalCanvasHeightPx) return null; 
                
                return (
                    <div
                      key={`mark-${mark.valueCm}`}
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{ bottom: `${positionBottom}px` }}
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

            {/* Render Images - Calculation remains based on final dimensions */}
            {images.map((image) => {
              const dims = imageDimensions.find(d => d.id === image.id);
              if (!dims) return null; 

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