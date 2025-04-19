'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
// import ScaleBar from './ScaleBar'; // Removed ScaleBar import

interface ImageInfo {
  id: string | number; // Unique identifier for key prop
  src: string;
  name: string;
  heightCm: number; // Re-added heightCm to input prop
  aspectRatio: number; // Expect aspectRatio
  verticalOffsetCm: number; // Expect vertical offset
  horizontalOffsetCm: number; // Expect horizontal offset
}

interface ImageComparerProps {
  images: ImageInfo[]; // Expects images with heightCm
  containerHeight?: string;
  containerWidth?: string;
}

// const DEFAULT_HEIGHT_CM = 100; // No longer needed here
const DEFAULT_SCALE_MAX_CM = 170; // Default scale height when no images
const SCALE_TOP_MARGIN_CM = 5; // Desired margin above highest mark in CM
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const IMAGE_GAP_PX = 16; // Equivalent to gap-4 (4 * 0.25rem * 16px/rem assumed)
const MAJOR_INTERVALS = 10; // Number of intervals for major lines (above 0)
const MINOR_INTERVALS_PER_MAJOR = 10; // Subdivisions between major lines
const NEGATIVE_MAJOR_INTERVALS = 1; // How many major steps below 0
const SCALE_BOTTOM_MARGIN_CM = 5; // Desired margin below lowest mark in CM
const epsilon = 1e-6; // Small value for floating point comparisons

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

// Function to generate horizontal scale marks (Major and Minor)
// Accepts the desired top of the scale, not just max content height
const generateHorizontalMarks = (scaleTopCm: number): { majorMarks: any[], minorMarks: any[], minCm: number } => {
    // Base step calculation on the visible positive range, or default if scaleTopCm is 0 or negative
    const positiveMaxForStep = Math.max(epsilon, scaleTopCm); 
    const majorStep = positiveMaxForStep / MAJOR_INTERVALS;
    const minorStep = majorStep / MINOR_INTERVALS_PER_MAJOR;
    // minCmGenerated still based on majorStep intervals below 0
    const minCmGenerated = -NEGATIVE_MAJOR_INTERVALS * majorStep;

    const majorMarks: any[] = [];
    const minorMarks: any[] = [];

    // Determine the effective maximum for the loop based on the desired scale top
    const loopMax = scaleTopCm + epsilon;

    for (let currentCm = minCmGenerated; currentCm <= loopMax; currentCm += minorStep) {
        // Check if currentCm is close to a multiple of majorStep or close to 0
        const isMajorCandidate = 
            Math.abs(currentCm % majorStep) < epsilon ||                  
            Math.abs(majorStep - (currentCm % majorStep)) < epsilon || 
            Math.abs(currentCm) < epsilon ||                           
            Math.abs(currentCm - scaleTopCm) < epsilon; // Check against scaleTopCm now

        // Refined check: Is it *exactly* on a major step or the scale top value?
        let isMajor = false;
        if (isMajorCandidate) {
             for (let j = -NEGATIVE_MAJOR_INTERVALS; j <= MAJOR_INTERVALS + 1; j++) { // Extend check slightly beyond major intervals if needed
                 if (Math.abs(currentCm - (j * majorStep)) < epsilon) {
                     isMajor = true;
                     break;
                 }
             }
             // Explicitly check against scaleTopCm
             if (!isMajor && Math.abs(currentCm - scaleTopCm) < epsilon) {
                 isMajor = true;
             }
        }
       
        // Avoid adding minor marks extremely close to major marks (check against scaleTopCm too)
        let tooCloseToMajor = false;
        if (!isMajor) {
            for (let j = -NEGATIVE_MAJOR_INTERVALS; j <= MAJOR_INTERVALS + 1; j++) {
                if (Math.abs(currentCm - (j * majorStep)) < minorStep / 2) {
                    tooCloseToMajor = true;
                    break;
                }
            }
             if (!tooCloseToMajor && Math.abs(currentCm - scaleTopCm) < minorStep / 2){ 
                tooCloseToMajor = true;
             }
        }

        if (isMajor) {
             // Avoid duplicates
             if (majorMarks.findIndex(m => Math.abs(m.valueCm - currentCm) < epsilon) === -1) {
                majorMarks.push({
                    valueCm: currentCm,
                    labelCm: `${Math.round(currentCm)} cm`,
                    labelFtIn: cmToFtIn(currentCm),
                });
             }
        } 
        // We are removing minor marks anyway, so commenting this out
        // else if (!tooCloseToMajor) {
        //    minorMarks.push({ valueCm: currentCm });
        // }
    }

     // Remove the manual check for maxCm, loop should cover scaleTopCm
     // if (majorMarks.findIndex(m => Math.abs(m.valueCm - maxCm) < epsilon) === -1 && maxCm > minCmGenerated + epsilon) { ... }

     majorMarks.sort((a, b) => a.valueCm - b.valueCm);

    return { majorMarks, minorMarks, minCm: minCmGenerated };
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

  // Calculate the desired top and bottom for the scale
  const initialScaleTopCm = actualMaxCm * 1.1;
  const initialScaleBottomCm = -NEGATIVE_MAJOR_INTERVALS * (Math.max(epsilon, initialScaleTopCm) / MAJOR_INTERVALS) - SCALE_BOTTOM_MARGIN_CM; // Calculate initial bottom based on top

  // --- Generate Marks based on the calculated scale top --- 
  const { majorMarks: preliminaryMajorMarks, minorMarks: preliminaryMinorMarks, minCm: actualMinCm } = generateHorizontalMarks(initialScaleTopCm);
  
  // --- Now calculate scales based on the generated marks min and calculated top ---
  // Use actualMinCm from generated marks for bottom, keep calculated top
  const finalScaleTopCm = initialScaleTopCm;
  const finalScaleBottomCm = actualMinCm - SCALE_BOTTOM_MARGIN_CM;
  
  // ... Calculate initialPixelsPerCm based on final scale range ...
  const initialTotalRangeCm = finalScaleTopCm - finalScaleBottomCm;
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
  const adjustedScaleTopCm = finalScaleTopCm / horizontalScaleFactor;
  const adjustedScaleBottomCm = finalScaleBottomCm / horizontalScaleFactor;
  const adjustedTotalRangeCm = adjustedScaleTopCm - adjustedScaleBottomCm;
  const adjustedPixelsPerCm = internalCanvasHeightPx > 0 && adjustedTotalRangeCm > 0 
      ? internalCanvasHeightPx / adjustedTotalRangeCm 
      : 0;

  // Recalculate marks based on the FINAL adjusted scale range if needed?
  // No, use preliminary marks but position them with final adjusted scale.
  const majorHorizontalMarks = preliminaryMajorMarks;
  const minorHorizontalMarks = preliminaryMinorMarks;

  // Calculate padding needed to align image bottom with 0cm line (uses NEW adjustedScaleBottomCm)
  const zeroLineOffsetPx = adjustedPixelsPerCm > 0 
      ? Math.max(0, (0 - adjustedScaleBottomCm) * adjustedPixelsPerCm) 
      : 0;

  const finalGap = Math.max(0, IMAGE_GAP_PX * horizontalScaleFactor);

  return (
    <div
      ref={wrapperRef}
      className="relative flex bg-gray-100 dark:bg-gray-900 rounded-lg shadow overflow-hidden pt-4"
      style={{ height: containerHeight, width: containerWidth }}
    >
      {internalCanvasHeightPx > 0 && (
        <>
          {/* Left Label Container (CM) - Positioned Absolutely */}
          <div 
            className="absolute left-0 top-0 bottom-0 flex-shrink-0 w-12 pr-1 text-right pointer-events-none z-20"
          >
            <div className="relative w-full h-full">
                {majorHorizontalMarks.map((mark) => {
                     const positionBottom = adjustedPixelsPerCm > 0 ? (mark.valueCm - adjustedScaleBottomCm) * adjustedPixelsPerCm : 0;
                     if (positionBottom < -epsilon || positionBottom > internalCanvasHeightPx + epsilon) return null;
                     const isZeroLine = Math.abs(mark.valueCm) < epsilon;
    
                     return (
                         <div
                           key={`cm-label-${mark.valueCm}`}
                           className="absolute left-0 right-0 text-xs pointer-events-auto"
                           style={{ 
                               bottom: `${positionBottom - 16}px`,
                               color: isZeroLine ? '#60a5fa' : 'inherit'
                           }}
                         >
                             <span title={`${mark.labelCm}`}>{mark.labelCm}</span>
                         </div>
                     );
                 })}
            </div>
          </div>

          {/* Central Image & Lines Container - Reduce horizontal padding */}
          <div
            ref={imageContainerRef}
            className="relative flex-grow flex items-end overflow-hidden justify-center px-12"
            style={{ 
                height: `${internalCanvasHeightPx}px`, 
                gap: `${finalGap}px`,
                paddingBottom: `${zeroLineOffsetPx}px`
            }}
          >
            {/* Render Major Horizontal Lines (spanning this container) */}
             {majorHorizontalMarks.map((mark) => {
                 const positionBottom = adjustedPixelsPerCm > 0 ? (mark.valueCm - adjustedScaleBottomCm) * adjustedPixelsPerCm : 0;
                 if (positionBottom < -epsilon || positionBottom > internalCanvasHeightPx + epsilon) return null;
                 const isZeroLine = Math.abs(mark.valueCm) < epsilon;
                 return (
                     <div
                       key={`major-mark-${mark.valueCm}`}
                       className="absolute left-0 right-0 pointer-events-none"
                       style={{ bottom: `${positionBottom}px` }}
                     >
                         {/* Use thicker blue line for zero, standard otherwise */}
                         <div className={` ${isZeroLine ? 'h-0.5 bg-blue-500 dark:bg-blue-400' : 'h-px bg-gray-500 dark:bg-gray-400 opacity-50'} `}></div>
                     </div>
                 );
             })}

            {/* Render Images with Names/Heights (within this container) */}
            {images.map((image) => {
              const dims = imageDimensions.find(d => d.id === image.id);
              if (!dims) return null; 

              const finalHeight = Math.max(1, dims.idealHeight * horizontalScaleFactor);
              const finalWidth = Math.max(1, dims.idealWidth * horizontalScaleFactor);
              const offsetXpx = (image.horizontalOffsetCm || 0) * adjustedPixelsPerCm;
              const offsetYpx = -(image.verticalOffsetCm || 0) * adjustedPixelsPerCm;

              return (
                 <div
                    key={image.id}
                    className="relative z-10 origin-bottom flex-shrink-0"
                    style={{
                        width: `${finalWidth}px`, 
                        height: `${finalHeight}px`,
                        transform: `translate(${offsetXpx}px, ${offsetYpx}px)`
                    }}
                 >
                  {image.name && (
                    <span 
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 pb-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {image.name} ({Math.round(image.heightCm)} cm / {cmToFtIn(image.heightCm)})
                    </span>
                  )}
                  {finalHeight > 1 && (
                      <img
                        src={image.src}
                        alt={image.name}
                        className="block object-contain shadow-md"
                        style={{ height: '100%', width: '100%' }}
                      />
                   )}
                 </div>
              );
            })}
          </div>

          {/* Right Label Container (Ft/In) - Positioned Absolutely */}
          <div 
            className="absolute right-0 top-0 bottom-0 flex-shrink-0 w-12 pl-1 text-left pointer-events-none z-20"
          >
            <div className="relative w-full h-full">
                {majorHorizontalMarks.map((mark) => {
                     const positionBottom = adjustedPixelsPerCm > 0 ? (mark.valueCm - adjustedScaleBottomCm) * adjustedPixelsPerCm : 0;
                     if (positionBottom < -epsilon || positionBottom > internalCanvasHeightPx + epsilon) return null;
                     const isZeroLine = Math.abs(mark.valueCm) < epsilon;
    
                     return (
                         <div
                           key={`ftin-label-${mark.valueCm}`}
                           className="absolute left-0 right-0 text-xs pointer-events-auto"
                           style={{ 
                               bottom: `${positionBottom - 16}px`,
                               color: isZeroLine ? '#60a5fa' : 'inherit'
                           }}
                         >
                             <span title={`${mark.labelFtIn}`}>{mark.labelFtIn}</span>
                         </div>
                     );
                 })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageComparer; 