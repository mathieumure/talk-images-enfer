import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { CategoryInfo, ImageInfo, ScraperConfig, ScraperStats } from './types.js';
import { ImageDownloader } from './downloader.js';
import {delay, getFilenameFromUrl} from './utils.js';

export class WikiScraper {
  private config: ScraperConfig;
  private downloader: ImageDownloader;
  private stats: ScraperStats;
  private visitedCategories: Set<string>;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.downloader = new ImageDownloader(config);
    this.stats = {
      categoriesExplored: 0,
      imagesFound: 0,
      imagesDownloaded: 0,
      imagesSkipped: 0,
      errors: 0,
    };
    this.visitedCategories = new Set();
  }

  /**
   * Fetches HTML content from a URL
   */
  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * Extracts subcategories from a category page
   */
  private extractSubcategories(html: string, currentUrl: string): CategoryInfo[] {
    const $ = cheerio.load(html);
    const categories: CategoryInfo[] = [];

    // Find subcategory section
    $('#mw-subcategories .mw-category-group li').each((_, element) => {
      const $link = $(element).find('a').first();
      const categoryName = $link.text().trim();
      const categoryPath = $link.attr('href');

      if (categoryPath) {
        const categoryUrl = new URL(categoryPath, this.config.baseUrl).href;

        // Extract file count from text like "Category Name (123 files)"
        const fullText = $(element).text();
        const match = fullText.match(/\((\d+)\s+(?:file|files|C|F)\)/);
        const fileCount = match ? parseInt(match[1], 10) : 0;

        categories.push({
          name: categoryName,
          url: categoryUrl,
          fileCount,
          hasSubcategories: fullText.includes('C') || fullText.includes('categories'),
        });
      }
    });

    return categories;
  }

  /**
   * Extracts image URLs from a category page
   */
  private extractImages(html: string, categoryName: string): ImageInfo[] {
    const $ = cheerio.load(html);
    const images: ImageInfo[] = [];

    // Find images in the gallery
    $('#mw-content-text .mw-category-generated .mw-category-group li').each((_, element) => {
      const $link = $(element).find('a').first();
      const imagePath = $link.attr('href');

      if (imagePath && imagePath.startsWith('/wiki/File:')) {
        // We need to fetch the file page to get the actual image URL
        const filename = $link.attr('title') || $link.text().trim();

        images.push({
          url: '', // Will be resolved later
          filename: filename,
          category: categoryName,
        });
      }
    });

    return images;
  }


  /**
   * Extracts and downloads images from a category page
   */
  private async processImagesInCategory(categoryUrl: string, categoryName: string): Promise<void> {
    try {
      const html = await this.fetchPage(categoryUrl);
      const $ = cheerio.load(html);

      console.log(`\n📷 Processing images in: ${categoryName}`);

      // Find all file links
      const fileLinks: string[] = [];
      $('#mw-content-text .mw-category-generated li a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/wiki/File:')) {
          fileLinks.push(new URL(href, this.config.baseUrl).href);
        }
      });

      console.log(`   Found ${fileLinks.length} images`);
      this.stats.imagesFound += fileLinks.length;

      // Process each image
      for (const filePageUrl of fileLinks) {
        await delay(this.config.delayMs);

        const filename = filePageUrl.split('/File:').pop()

        if (!filename) {
          console.log(`  ⚠️  Could not resolve image URL for ${filePageUrl}`);
          this.stats.errors++;
          continue;
        }
        // Resolve actual image URL
        const imageUrl = await resolveImageUrl(filePageUrl, filename);

        if (!imageUrl) {
          console.log(`  ⚠️  Could not resolve image URL for ${filePageUrl}`);
          this.stats.errors++;
          continue;
        }

        const imageInfo: ImageInfo = {
          url: imageUrl,
          filename,
          category: categoryName,
        };

        // Download the image
        const downloaded = await this.downloader.downloadImage(imageInfo);
        if (downloaded) {
          this.stats.imagesDownloaded++;
        } else {
          this.stats.imagesSkipped++;
        }
      }
    } catch (error) {
      console.error(`Error processing images in ${categoryName}: ${error}`);
      this.stats.errors++;
    }
  }

  /**
   * Recursively explores a category and its subcategories
   */
  async exploreCategory(categoryUrl: string, categoryName: string = 'Root', depth: number = 0): Promise<void> {
    // Avoid visiting the same category twice
    if (this.visitedCategories.has(categoryUrl)) {
      return;
    }
    this.visitedCategories.add(categoryUrl);

    const indent = '  '.repeat(depth);
    console.log(`\n${indent}📁 Exploring: ${categoryName}`);
    this.stats.categoriesExplored++;

    try {
      await delay(this.config.delayMs);
      const html = await this.fetchPage(categoryUrl);

      // Extract and process images in this category
      await this.processImagesInCategory(categoryUrl, categoryName);

      // Extract subcategories
      const subcategories = this.extractSubcategories(html, categoryUrl);

      if (subcategories.length > 0) {
        console.log(`${indent}   Found ${subcategories.length} subcategories`);

        // Recursively explore each subcategory
        for (const subcat of subcategories) {
          await this.exploreCategory(subcat.url, subcat.name, depth + 1);
        }
      }
    } catch (error) {
      console.error(`${indent}❌ Error exploring ${categoryName}: ${error}`);
      this.stats.errors++;
    }
  }

  /**
   * Starts the scraping process
   */
  async start(): Promise<void> {
    console.log('🚀 Starting Hades Wiki Image Scraper...\n');
    console.log(`Base URL: ${this.config.baseUrl}`);
    console.log(`Start URL: ${this.config.startUrl}`);
    console.log(`Output Directory: ${this.config.outputDir}\n`);

    const startTime = Date.now();

    await this.exploreCategory(this.config.startUrl, 'Category:Images');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print final statistics
    console.log('\n' + '='.repeat(60));
    console.log('✨ Scraping Complete!');
    console.log('='.repeat(60));
    console.log(`Categories explored: ${this.stats.categoriesExplored}`);
    console.log(`Images found: ${this.stats.imagesFound}`);
    console.log(`Images downloaded: ${this.stats.imagesDownloaded}`);
    console.log(`Images skipped: ${this.stats.imagesSkipped}`);
    console.log(`Errors: ${this.stats.errors}`);
    console.log(`Duration: ${duration}s`);
    console.log('='.repeat(60));
  }

  getStats(): ScraperStats {
    return { ...this.stats };
  }
}

/**
 * Helper function to resolve image URL (used in processImagesInCategory)
 */
async function resolveImageUrl(filePageUrl: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(filePageUrl);
    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    if (filename) {
      // Find the a.mw-file-description link whose href contains this filename
      let imageUrl: string | undefined;

      $('a.mw-file-description').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href && href.includes(filename)) {
          imageUrl = href;
          return false; // Break the loop
        }
      });

      if (imageUrl) {
        return imageUrl;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
