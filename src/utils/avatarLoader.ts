export interface AvatarInfo {
  id: string;
  name: string;
  src: string;
}

let avatarsCache: AvatarInfo[] | null = null;

/**
 * Dynamically loads all SVG files from the /public/avatars/ directory
 * Uses webpack's require.context to find all .svg files
 */
export const loadAvatars = async (): Promise<AvatarInfo[]> => {
  // Return cached result if available
  if (avatarsCache) {
    return avatarsCache;
  }

  try {
    // In production or when the avatars directory doesn't exist, return empty array
    if (typeof window === 'undefined') {
      return [];
    }

    const avatars: AvatarInfo[] = [];
    
    // Try to fetch the list of files from the avatars directory
    try {
      const response = await fetch('/api/avatars');
      if (response.ok) {
        const fileList = await response.json();
        avatars.push(...fileList.map((filename: string) => ({
          id: filename.replace('.svg', ''),
          name: filename.replace('.svg', '').replace(/[-_]/g, ' '),
          src: `/avatars/${filename}`
        })));
      }
    } catch {
      // If API route doesn't exist, fall back to empty array
      console.log('Avatar API not available, avatars folder may be empty');
    }

    avatarsCache = avatars;
    return avatars;
  } catch (error) {
    console.error('Error loading avatars:', error);
    return [];
  }
};

/**
 * Clears the avatars cache - useful when new avatars are added
 */
export const clearAvatarsCache = () => {
  avatarsCache = null;
}; 