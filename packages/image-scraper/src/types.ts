export interface ImageInfo {
  url: string;
  filename: string;
  category: string;
}

export interface CategoryInfo {
  name: string;
  url: string;
  fileCount: number;
  hasSubcategories: boolean;
}

export interface ScraperConfig {
  baseUrl: string;
  startUrl: string;
  outputDir: string;
  delayMs: number;
  maxRetries: number;
}

export interface ScraperStats {
  categoriesExplored: number;
  imagesFound: number;
  imagesDownloaded: number;
  imagesSkipped: number;
  errors: number;
}