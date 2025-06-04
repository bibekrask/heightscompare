import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    
    // Check if directory exists
    try {
      await fs.access(avatarsDir);
    } catch {
      // Directory doesn't exist, return empty array
      return NextResponse.json([]);
    }

    // Read the directory contents
    const files = await fs.readdir(avatarsDir);
    
    // Filter for SVG files only
    const svgFiles = files.filter(file => 
      file.toLowerCase().endsWith('.svg') && 
      !file.startsWith('.')
    );

    return NextResponse.json(svgFiles);
  } catch (error) {
    console.error('Error reading avatars directory:', error);
    return NextResponse.json([]);
  }
} 