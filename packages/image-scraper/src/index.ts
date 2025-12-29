import * as path from 'path';
import { WikiScraper } from './scraper.js';
import { ScraperConfig } from './types.js';

async function main() {
  const config: ScraperConfig = {
    baseUrl: 'https://hades.fandom.com',
    startUrl: 'https://hades.fandom.com/wiki/Category:Images',
    outputDir: path.join(process.cwd(), 'images'),
    delayMs: 10, // 1 second delay between requests
    maxRetries: 3,
  };

  const scraper = new WikiScraper(config);

  try {
    await scraper.start();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
