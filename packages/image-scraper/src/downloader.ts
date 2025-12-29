import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { ImageInfo, ScraperConfig } from './types.js';
import { ensureDir, fileExists, delay, sanitizeFolderName } from './utils.js';

export class ImageDownloader {
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Downloads a single image with retry logic
   */
  async downloadImage(imageInfo: ImageInfo): Promise<boolean> {
    const categoryFolder = sanitizeFolderName(imageInfo.category);
    const targetDir = imageInfo.category
      ? path.join(this.config.outputDir, categoryFolder)
      : this.config.outputDir;

    await ensureDir(targetDir);

    const filePath = path.join(targetDir, imageInfo.filename);

    // Skip if already exists
    if (fileExists(filePath)) {
      console.log(`  ⏭️  Skipping (already exists): ${imageInfo.filename}`);
      return false;
    }

    // Try downloading with retries
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`  ⬇️  Downloading: ${imageInfo.filename}`);

        const response = await fetch(imageInfo.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        console.log(`  ✅ Downloaded: ${imageInfo.filename}`);
        await delay(this.config.delayMs);
        return true;
      } catch (error) {
        console.error(`  ❌ Attempt ${attempt}/${this.config.maxRetries} failed: ${error}`);

        if (attempt < this.config.maxRetries) {
          await delay(this.config.delayMs * 2); // Longer delay on retry
        } else {
          console.error(`  ⛔ Failed to download after ${this.config.maxRetries} attempts: ${imageInfo.filename}`);
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Downloads multiple images sequentially
   */
  async downloadImages(images: ImageInfo[]): Promise<{ downloaded: number; skipped: number; failed: number }> {
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const image of images) {
      const result = await this.downloadImage(image);
      if (result === true) {
        downloaded++;
      } else if (fileExists(path.join(
        image.category ? path.join(this.config.outputDir, sanitizeFolderName(image.category)) : this.config.outputDir,
        image.filename
      ))) {
        skipped++;
      } else {
        failed++;
      }
    }

    return { downloaded, skipped, failed };
  }
}