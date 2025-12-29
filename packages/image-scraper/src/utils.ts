import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a directory if it doesn't exist
 */
export async function ensureDir(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Sanitizes a category name to be used as a folder name
 */
export function sanitizeFolderName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid characters
    .replace(/\s+/g, ' ')            // Normalize spaces
    .trim();
}

/**
 * Delays execution for a given number of milliseconds
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if a file already exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Extracts filename from URL
 */
export function getFilenameFromUrl(url: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = path.basename(pathname);
  return decodeURIComponent(filename);
}