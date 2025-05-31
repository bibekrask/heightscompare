import { CM_PER_INCH, INCHES_PER_FOOT, MAJOR_INTERVALS, EPSILON } from '@/constants';

// Process uploaded image file to get data URL and aspect ratio
export const processImageFile = async (file: File): Promise<{ dataUrl: string, aspectRatio: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        resolve({
          dataUrl: e.target?.result as string,
          aspectRatio
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Convert cm to feet and inches format
export const cmToFtIn = (cm: number): string => {
  if (Math.abs(cm) < EPSILON) return "0'0\"";
  const absCm = Math.abs(cm);
  const totalInches = absCm / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = totalInches % INCHES_PER_FOOT;
  let adjustedFeet = feet;
  if (Math.abs(inches - 12) < EPSILON / 100) {
    adjustedFeet += 1;
    inches = 0;
  }
  const sign = cm < 0 ? '-' : '';
  return `${sign}${adjustedFeet}'${inches.toFixed(2)}"`;
};

// Convert cm to cm label format
export const cmToCmLabel = (cm: number): string => {
  return `${Math.round(cm)}`;
};

// Generate horizontal marks for the scale
export const generateHorizontalMarks = (scaleTopCm: number, scaleBottomCm: number, majorStepParam?: number): Array<{
  valueCm: number;
  labelCm: string;
  labelFtIn: string;
}> => {
  const totalRange = scaleTopCm - scaleBottomCm;
  if (totalRange <= EPSILON) return [];

  // Use provided majorStepParam if available, otherwise calculate it
  let majorStep = majorStepParam;
  if (majorStep === undefined) {
    const positiveRange = Math.max(EPSILON, scaleTopCm);
    const niceFractions = [1, 2, 2.5, 5, 10];
    majorStep = 10; // Default/minimum step

    if (positiveRange > EPSILON) {
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

  const majorMarks: Array<{
    valueCm: number;
    labelCm: string;
    labelFtIn: string;
  }> = [];

  // Generate marks based on the step for the full range
  for (let currentCm = Math.ceil(scaleBottomCm / majorStep) * majorStep; 
       currentCm <= scaleTopCm + EPSILON; 
       currentCm += majorStep) {
    // Avoid adding duplicates
    if (majorMarks.findIndex(m => Math.abs(m.valueCm - currentCm) < EPSILON) === -1) {
      majorMarks.push({
        valueCm: currentCm,
        labelCm: cmToCmLabel(currentCm),
        labelFtIn: cmToFtIn(currentCm),
      });
    }
  }
  
  // Explicitly add the zero line if it's within range and not already added
  if (0 >= scaleBottomCm - EPSILON && 0 <= scaleTopCm + EPSILON) {
    if (majorMarks.findIndex(m => Math.abs(m.valueCm) < EPSILON) === -1) {
      majorMarks.push({ valueCm: 0, labelCm: '0', labelFtIn: cmToFtIn(0) });
    }
  }

  // Ensure we have at least one negative mark
  const hasNegativeMark = majorMarks.some(m => m.valueCm < -EPSILON);
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