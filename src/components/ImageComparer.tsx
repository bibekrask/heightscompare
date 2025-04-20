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
}

// --- Constants --- 
const SCALE_TOP_FACTOR = 1.1; // Show 10% margin above highest content
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const MAJOR_INTERVALS = 10; // Number of intervals for major lines (e.g., every 10% of range)
const NEGATIVE_MAJOR_INTERVALS = 1; // How many major steps below 0
const LABEL_WIDTH_PX = 60; // Approx width for side labels (adjust as needed)
const FIGURE_LABEL_OFFSET_Y = -10; // Pixels above figure head for label
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

    // Determine step based on the positive range, ensuring reasonable steps
    const positiveRange = Math.max(epsilon, scaleTopCm);
    let majorStep = positiveRange / MAJOR_INTERVALS;
    // Adjust step to be a 'nicer' number if desired (e.g., multiple of 10, 5, 2)
    // Simple approach: Use the calculated step
    
    const majorMarks: any[] = [];
    const startMarkValue = Math.floor(scaleBottomCm / majorStep) * majorStep;
    const endMarkValue = scaleTopCm + epsilon;

    for (let currentCm = startMarkValue; currentCm <= endMarkValue; currentCm += majorStep) {
        if (currentCm >= scaleBottomCm - epsilon && currentCm <= scaleTopCm + epsilon) {
             if (majorMarks.findIndex(m => Math.abs(m.valueCm - currentCm) < epsilon) === -1) {
                majorMarks.push({
                    valueCm: currentCm,
                    labelCm: cmToCmLabel(currentCm),
                    labelFtIn: cmToFtIn(currentCm), // Generate Ft label for right side
                });
             }
        }
    }
    
    // Ensure 0 is included if within range
    if (0 >= scaleBottomCm - epsilon && 0 <= scaleTopCm + epsilon && majorMarks.findIndex(m => Math.abs(m.valueCm) < epsilon) === -1) {
         majorMarks.push({ valueCm: 0, labelCm: '0', labelFtIn: cmToFtIn(0) });
    }

    majorMarks.sort((a, b) => a.valueCm - b.valueCm);
    return majorMarks;
};

// --- Component --- 
const ImageComparer: React.FC<ImageComparerProps> = ({ images }) => {
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
  // Determine a reasonable step (e.g., 10% of max or a fixed value?)
  const tempMajorStep = Math.max(10, actualMaxCm / MAJOR_INTERVALS); // Ensure step isn't too small
  // Scale bottom includes one negative step
  const finalScaleBottomCm = -Math.ceil(Math.abs(tempMajorStep)); // One rounded step below 0

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
                        className="relative flex-shrink-0 origin-bottom"
                        style={{
                            width: `${finalWidth}px`, 
                            height: `${finalHeight}px`,
                            transform: `translate(${offsetX}px, ${offsetY}px)` 
                        }}
                      >
                        {/* Figure Label */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-1 bg-black/50 text-white text-xs rounded whitespace-pre text-center pointer-events-none"
                             style={{ transform: `translate(-50%, ${FIGURE_LABEL_OFFSET_Y}px)` }}
                        >
                          {figureLabel}
                        </div>
                        {/* Figure Image/SVG */}
                        <div 
                          className="w-full h-full bg-contain bg-no-repeat bg-center overflow-hidden"
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