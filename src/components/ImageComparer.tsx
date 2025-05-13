'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';

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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// --- Constants --- 
const SCALE_TOP_FACTOR = 1.1; // Show 10% margin above highest content
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const MAJOR_INTERVALS = 10; // Number of intervals for major lines (e.g., every 10% of range)
const NEGATIVE_MAJOR_INTERVALS = 1; // How many major steps below 0
const LABEL_WIDTH_PX = 60; // Approx width for side labels (adjust as needed)
const FIGURE_LABEL_OFFSET_Y = -1; // Pixels above figure head for label - Adjusted to -1
const epsilon = 1e-6;

// --- Helper Functions (cmToFtIn, cmToCmLabel, generateHorizontalMarks can be adapted) ---
const cmToFtIn = (cm: number): string => {
    if (Math.abs(cm) < epsilon) return "0\' 0\"";
    const absCm = Math.abs(cm);
    const totalInches = absCm / CM_PER_INCH;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    // Match screenshot format (e.g., 5' 10.46") - round to 2 decimal places for inches?
    let inches = totalInches % INCHES_PER_FOOT;
    let adjustedFeet = feet;
    if (Math.abs(inches - 12) < epsilon / 100) { // Check closer to 12
        adjustedFeet += 1;
        inches = 0;
    }
    const sign = cm < 0 ? '-' : '';
    // Show inches with more precision like screenshot
    return `${sign}${adjustedFeet}\' ${inches.toFixed(2)}\"`; 
};

const cmToCmLabel = (cm: number): string => {
    return `${Math.round(cm)}`; // Just the number for the scale
};

const generateHorizontalMarks = (scaleTopCm: number, scaleBottomCm: number): any[] => {
    const totalRange = scaleTopCm - scaleBottomCm;
    if (totalRange <= epsilon) return [];

    // --- Dynamic Nice Step Calculation ---
    const positiveRange = Math.max(epsilon, scaleTopCm);
    const niceFractions = [1, 2, 2.5, 5, 10];
    let majorStep = 10; // Default/minimum step

    if (positiveRange > epsilon) {
        const rawStep = positiveRange / MAJOR_INTERVALS;
        const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalizedStep = rawStep / pow10;

        // Find the closest nice fraction
        let bestFraction = niceFractions[niceFractions.length - 1]; // Start with 10
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
    // Ensure a minimum step size
    majorStep = Math.max(10, majorStep); 
    // --- End Dynamic Nice Step Calculation ---

    const majorMarks: any[] = [];

    // Loop ONLY for POSITIVE marks based on the calculated dynamic step
    for (let currentCm = majorStep; currentCm <= scaleTopCm + epsilon; currentCm += majorStep) {
        // Check if positive and within top range
        if (currentCm > epsilon && currentCm <= scaleTopCm + epsilon) {
            // Avoid adding duplicates
             if (majorMarks.findIndex(m => Math.abs(m.valueCm - currentCm) < epsilon) === -1) {
                majorMarks.push({
                    valueCm: currentCm,
                    labelCm: cmToCmLabel(currentCm),
                    labelFtIn: cmToFtIn(currentCm),
                });
             }
        }
    }
    
    // Explicitly add the zero line if it's within range
    if (0 >= scaleBottomCm - epsilon && 0 <= scaleTopCm + epsilon) {
        if (majorMarks.findIndex(m => Math.abs(m.valueCm) < epsilon) === -1) {
            majorMarks.push({ valueCm: 0, labelCm: '0', labelFtIn: cmToFtIn(0) });
        }
    }

    // Explicitly add the FIRST negative line (-majorStep) if it's within the scaleBottomCm boundary
    const firstNegativeMark = -majorStep;
    if (firstNegativeMark >= scaleBottomCm - epsilon) {
        if (majorMarks.findIndex(m => Math.abs(m.valueCm - firstNegativeMark) < epsilon) === -1) {
        majorMarks.push({
                valueCm: firstNegativeMark,
                labelCm: cmToCmLabel(firstNegativeMark),
                labelFtIn: cmToFtIn(firstNegativeMark),
            });
        }
     }

     majorMarks.sort((a, b) => a.valueCm - b.valueCm);
    return majorMarks;
};

// --- Component --- 
const ImageComparer: React.FC<ImageComparerProps> = ({ images, onEdit, onDelete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const figuresContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeightPx, setContainerHeightPx] = useState<number>(0);
  const [containerWidthPx, setContainerWidthPx] = useState<number>(0);
  const [availableWidthPx, setAvailableWidthPx] = useState<number>(0);
  // Add state for zoom/pan later if needed

  // Effect to measure container dimensions
  useLayoutEffect(() => {
    let height = 0;
    let width = 0;
    let availableWidth = 0;
    
    if (containerRef.current) {
        height = containerRef.current.offsetHeight;
        width = containerRef.current.offsetWidth;
        // Calculate the available width between the CM and Ft/In markers
        availableWidth = Math.max(100, width - (LABEL_WIDTH_PX * 2 + 16)); // 16px for padding
        
        setContainerHeightPx(height > 0 ? height : 0);
        setContainerWidthPx(width > 0 ? width : 0);
        setAvailableWidthPx(availableWidth > 0 ? availableWidth : 0);
    }
    
    // Add resize listener if needed
    // return () => remove listener;
  }, [images]); // Rerun if images change (potential height change)

  // --- Scale Calculations ---
  const maxImageHeight = images.length > 0 
      ? Math.max(1, ...images.map(img => img.heightCm || 0)) 
      : 0;
  // Use a default max if no images, or base on tallest image
  const actualMaxCm = maxImageHeight > 0 ? maxImageHeight : 200; // Default height like screenshot

  // Scale top based on max content + margin
  const finalScaleTopCm = actualMaxCm * SCALE_TOP_FACTOR;

  // --- Calculate dynamic majorStep first (mirroring logic in generateHorizontalMarks) ---
  let calculatedMajorStep = 10; // Default/minimum step
  const positiveRangeForStep = Math.max(epsilon, finalScaleTopCm); // Use finalScaleTopCm here
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
  // --- End dynamic step calculation ---

  // Scale bottom: Use calculated step to add margin below the first negative line
  const finalScaleBottomCm = -calculatedMajorStep * 1.2; // Push bottom down slightly

  const majorHorizontalMarks = generateHorizontalMarks(finalScaleTopCm, finalScaleBottomCm);
  const totalRangeCm = finalScaleTopCm - finalScaleBottomCm;

  // Calculate PixelsPerCm (vertical scale)
  const pixelsPerCm = containerHeightPx > 0 && totalRangeCm > 0 
      ? containerHeightPx / totalRangeCm 
      : 0;

  // Calculate offset for 0cm alignment
  const zeroLineOffsetPx = pixelsPerCm > 0 
      ? Math.max(0, (0 - finalScaleBottomCm) * pixelsPerCm) 
      : 0;
  
  // --- Horizontal Scaling Calculations ---
  // Calculate the ideal width needed for all images
  const IMAGE_GAP_PX = 16; // Default gap between images
  
  const calculateImageDimensions = () => {
    if (pixelsPerCm <= 0 || images.length === 0) return { figureDimensions: [], horizontalScale: 1, scaledGap: IMAGE_GAP_PX };
    
    // Calculate ideal dimensions for each image
    const figureDimensions = images.map(image => {
      const height = Math.max(1, image.heightCm * pixelsPerCm);
      const width = Math.max(1, height * image.aspectRatio);
      return { id: image.id, width, height };
    });
    
    // Calculate total ideal width including gaps
    const totalIdealWidth = figureDimensions.reduce((sum, dim) => sum + dim.width, 0) + 
                          (images.length > 1 ? (images.length - 1) * IMAGE_GAP_PX : 0);
    
    // Calculate horizontal scale factor if images don't fit
    const horizontalScale = availableWidthPx > 0 && totalIdealWidth > availableWidthPx
      ? availableWidthPx / totalIdealWidth
      : 1;
    
    // Scale the gap proportionally
    const scaledGap = horizontalScale < 1 ? IMAGE_GAP_PX * horizontalScale : IMAGE_GAP_PX;
    
    return { figureDimensions, horizontalScale, scaledGap };
  };
  
  const { figureDimensions, horizontalScale, scaledGap } = calculateImageDimensions();
  
  // --- End of Scale Calculations --- 

  return (
    // Container now fills the space given by parent in page.tsx
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-white dark:bg-gray-800">
      
      {/* Background Grid/Scales */} 
      <div className="absolute inset-0 pointer-events-none z-0">
          {pixelsPerCm > 0 && majorHorizontalMarks.map((mark) => {
              const positionBottom = (mark.valueCm - finalScaleBottomCm) * pixelsPerCm;
                 const isZeroLine = Math.abs(mark.valueCm) < epsilon;
              // Clip marks outside the view (might not be needed with overflow hidden)
              if (positionBottom < -1 || positionBottom > containerHeightPx + 1) return null;

                  return (
                  <div key={`mark-${mark.valueCm}`} className="absolute left-0 right-0" style={{ bottom: `${positionBottom}px` }}>
                      {/* Line */}
                      <div 
                        className={`mx-auto ${isZeroLine ? 'h-0.5 bg-red-500' : 'h-px bg-gray-300 dark:bg-gray-600'}`}
                        style={{ width: `calc(100% - ${LABEL_WIDTH_PX * 2}px)`}} // Line stops before labels
                      ></div>
                      {/* Left Label (CM) */}
                      <span 
                        className="absolute left-0 text-xs text-gray-500 dark:text-gray-400 text-right pr-2"
                        style={{ bottom: '-0.6em', width: `${LABEL_WIDTH_PX}px` }}
                      >
                          {mark.labelCm}
                      </span>
                      {/* Right Label (Ft) */}
                      <span 
                        className="absolute right-0 text-xs text-gray-500 dark:text-gray-400 text-left pl-2"
                        style={{ bottom: '-0.6em', width: `${LABEL_WIDTH_PX}px` }}
                      >
                          {mark.labelFtIn}
                         </span>
                     </div>
                  );
             })}
      </div>

      {/* Figures Layer */} 
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
            paddingLeft: `${LABEL_WIDTH_PX}px`, 
            paddingRight: `${LABEL_WIDTH_PX}px`,
            paddingBottom: `${zeroLineOffsetPx}px` // Align base with 0 line
        }}
      >
          {/* Use Flexbox to arrange figures horizontally */}
          <div 
            ref={figuresContainerRef}
            className="relative flex items-end justify-center h-full w-full"
            style={{
              gap: `${scaledGap}px`, // Apply scaled gap
              maxWidth: '100%'
            }}
          >
              {pixelsPerCm > 0 && images.map((image, index) => {
                  const dimensions = figureDimensions.find(d => d.id === image.id);
                  if (!dimensions) return null;
                  
                  // Apply horizontal scaling
                  const finalWidth = dimensions.width * (horizontalScale < 1 ? horizontalScale : 1);
                  const finalHeight = dimensions.height * (horizontalScale < 1 ? horizontalScale : 1);
                  
                  // Scale offsets proportionally
                  const offsetX = image.horizontalOffsetCm * pixelsPerCm * (horizontalScale < 1 ? horizontalScale : 1);
                  const offsetY = -image.verticalOffsetCm * pixelsPerCm;
                  
                  const figureLabel = `${image.name}\ncm: ${Math.round(image.heightCm)}\nft: ${cmToFtIn(image.heightCm)}`;

              return (
                 <div
                    key={image.id}
                        className="relative flex-shrink-0 origin-bottom group"
                        style={{
                            width: `${finalWidth}px`, 
                            height: `${finalHeight}px`,
                            transform: `translate(${offsetX}px, ${offsetY}px)` 
                        }}
                      >
                        {/* Edit/Delete buttons - Visible on hover */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                          {onEdit && (
                            <button 
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(image.id);
                              }}
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(image.id);
                              }}
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          <div className="p-1 text-black font-bold text-xs rounded whitespace-pre text-center mb-1 dark:text-white">
                            {figureLabel}
                          </div>
                          {/* Horizontal Line - Placed SECOND, below the text */}
                          <div className="h-px bg-gray-800 dark:bg-gray-200 w-12"></div>
                        </div>

                        {/* Figure Image/SVG with hover effect */}
                        <div 
                          className="w-full h-full bg-contain bg-no-repeat bg-center overflow-hidden cursor-pointer transition-opacity duration-200 group-hover:opacity-80"
                          style={{ 
                            // Use mask-image to create a silhouette effect with custom color
                            WebkitMaskImage: `url("${image.src}")`,
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: `url("${image.src}")`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            backgroundColor: image.color // Use the color for the fill
                          }}
                          title={`${image.name} - ${image.heightCm}cm`}
                          onClick={() => onEdit && onEdit(image.id)}
                        ></div>
                 </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};

export default ImageComparer; 