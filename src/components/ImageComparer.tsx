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
const SCALE_TOP_PADDING_FACTOR = 1.05; // Reduced padding from 1.1 (10%) to 1.05 (5%)
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const IMAGE_GAP_PX = 16; // Equivalent to gap-4 (4 * 0.25rem * 16px/rem assumed)
const MAJOR_INTERVALS = 10; // Number of intervals for major lines (above 0)
const MINOR_INTERVALS_PER_MAJOR = 10; // Subdivisions between major lines
const NEGATIVE_MAJOR_INTERVALS = 1; // How many major steps below 0
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
const generateHorizontalMarks = (maxCm: number): { majorMarks: any[], minorMarks: any[], minCm: number } => {
    const positiveMax = Math.max(0, maxCm);
    const majorStep = positiveMax > epsilon ? positiveMax / MAJOR_INTERVALS : 10;
    const minorStep = majorStep / MINOR_INTERVALS_PER_MAJOR;
    const minCmGenerated = -NEGATIVE_MAJOR_INTERVALS * majorStep;

    const majorMarks: any[] = [];
    const minorMarks: any[] = [];

    // Determine the effective maximum for the loop to avoid missing the last major mark
    const loopMax = maxCm + epsilon; // Include maxCm itself

    for (let currentCm = minCmGenerated; currentCm <= loopMax; currentCm += minorStep) {
        // Check if currentCm is close to a multiple of majorStep or close to 0
        const isMajorCandidate = 
            Math.abs(currentCm % majorStep) < epsilon ||                  
            Math.abs(majorStep - (currentCm % majorStep)) < epsilon || 
            Math.abs(currentCm) < epsilon ||                           
            Math.abs(currentCm - maxCm) < epsilon;                     

        // Refined check: Is it *exactly* on a major step or the max value?
        let isMajor = false;
        if (isMajorCandidate) {
             // Check against integer multiples of majorStep
             for (let j = -NEGATIVE_MAJOR_INTERVALS; j <= MAJOR_INTERVALS; j++) {
                 if (Math.abs(currentCm - (j * majorStep)) < epsilon) {
                     isMajor = true;
                     break;
                 }
             }
             // Explicitly check against maxCm
             if (!isMajor && Math.abs(currentCm - maxCm) < epsilon) {
                 isMajor = true;
             }
        }
       
        // Avoid adding minor marks extremely close to major marks
        let tooCloseToMajor = false;
        if (!isMajor) {
            for (let j = -NEGATIVE_MAJOR_INTERVALS; j <= MAJOR_INTERVALS; j++) {
                if (Math.abs(currentCm - (j * majorStep)) < minorStep / 2) {
                    tooCloseToMajor = true;
                    break;
                }
            }
             if (!tooCloseToMajor && Math.abs(currentCm - maxCm) < minorStep / 2){ 
                tooCloseToMajor = true;
             }
        }

        if (isMajor) {
             if (majorMarks.findIndex(m => Math.abs(m.valueCm - currentCm) < epsilon) === -1) {
                majorMarks.push({
                    valueCm: currentCm,
                    labelCm: `${Math.round(currentCm)} cm`,
                    labelFtIn: cmToFtIn(currentCm),
                });
             }
        } else if (!tooCloseToMajor) {
            minorMarks.push({ valueCm: currentCm });
        }
    }

     // Ensure maxCm mark is included if slightly missed by loop (should be covered now but keep as safeguard)
     if (majorMarks.findIndex(m => Math.abs(m.valueCm - maxCm) < epsilon) === -1 && maxCm > minCmGenerated + epsilon) {
        majorMarks.push({
            valueCm: maxCm,
            labelCm: `${Math.round(maxCm)} cm`,
            labelFtIn: cmToFtIn(maxCm),
        });
     }

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

  // --- Generate Marks FIRST to find the actual minimum CM required ---
  const { majorMarks: preliminaryMajorMarks, minorMarks: preliminaryMinorMarks, minCm: actualMinCm } = generateHorizontalMarks(actualMaxCm);
  
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
  const majorHorizontalMarks = preliminaryMajorMarks;
  const minorHorizontalMarks = preliminaryMinorMarks;

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
            {/* Render Minor Horizontal Lines FIRST */} 
            {minorHorizontalMarks.map((mark) => {
                 const positionBottom = adjustedPixelsPerCm > 0 ? (mark.valueCm - adjustedScaleBottomCm) * adjustedPixelsPerCm : 0;
                 // Clip precisely within canvas height - USE GLOBAL EPSILON
                 if (positionBottom < -epsilon || positionBottom > internalCanvasHeightPx + epsilon) return null;

                 return (
                     <div
                       key={`minor-mark-${mark.valueCm}`}
                       className="absolute left-0 right-0 pointer-events-none"
                       style={{ bottom: `${positionBottom}px` }}
                     >
                         {/* Minor Line Styling (now 1/16 width) */}
                         <div className="h-px bg-gray-400 dark:bg-gray-600 opacity-30 w-1/16"></div>
                     </div>
                 );
             })}

            {/* Render Major Horizontal Lines */} 
             {majorHorizontalMarks.map((mark) => {
                 const positionBottom = adjustedPixelsPerCm > 0 ? (mark.valueCm - adjustedScaleBottomCm) * adjustedPixelsPerCm : 0;
                 // Clip precisely within canvas height - USE GLOBAL EPSILON
                 if (positionBottom < -epsilon || positionBottom > internalCanvasHeightPx + epsilon) return null;
                 // Check if close to zero - USE GLOBAL EPSILON
                 const isZeroLine = Math.abs(mark.valueCm) < epsilon;

                  return (
                     <div
                       key={`major-mark-${mark.valueCm}`}
                       className="absolute left-0 right-0 pointer-events-none"
                       style={{ bottom: `${positionBottom}px` }}
                     >
                         <div className={` ${isZeroLine ? 'h-0.5 bg-blue-500 dark:bg-blue-400' : 'h-px bg-gray-400 dark:bg-gray-600 opacity-50'} `}></div>
                         <span className={`absolute bottom-0 left-1 transform -translate-y-1/2 text-xs ${isZeroLine ? 'font-semibold' : 'text-gray-600 dark:text-gray-400'} bg-gray-100 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 px-1 rounded`} style={{ whiteSpace: 'nowrap' }}>
                              {mark.labelCm} / {mark.labelFtIn}
                         </span>
                     </div>
                  );
             })}

            {/* Render Images - Apply offset via transform */}
            {images.map((image) => {
              const dims = imageDimensions.find(d => d.id === image.id);
              if (!dims) return null; 

              const finalHeight = Math.max(1, dims.idealHeight * horizontalScaleFactor);
              const finalWidth = Math.max(1, dims.idealWidth * horizontalScaleFactor);
              
              // Calculate offset in pixels
              const offsetXpx = (image.horizontalOffsetCm || 0) * adjustedPixelsPerCm;
              // Vertical offset needs to be inverted because Y increases downwards in translate
              const offsetYpx = -(image.verticalOffsetCm || 0) * adjustedPixelsPerCm;

              return (
                 // Wrapper takes flex item role, transform applied here
                 <div
                    key={image.id}
                    className="relative z-10 flex flex-col items-center" // Use flex-col for potential future labels
                    style={{
                        transform: `translate(${offsetXpx}px, ${offsetYpx}px)`
                        // We don't set justify-end here, relying on parent items-end
                    }}
                 >
                  {finalHeight > 1 && (
                      <img
                        src={image.src}
                        alt={image.name}
                        className="block object-contain" // Removed object-bottom as transform handles Y
                        style={{
                            height: `${finalHeight}px`,
                            width: `${finalWidth}px`
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