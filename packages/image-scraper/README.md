# image-scraper

Tool to scrape and download images from the [Hades Wiki](https://hades.fandom.com/wiki/Hades_Wiki).

## Overview

This scraper navigates through the [Category:Images](https://hades.fandom.com/wiki/Category:Images) page and all its subcategories to download game assets including:
- Character portraits
- Achievement icons
- Boon icons
- Weapon images
- Concept art
- And more...

All images are saved in the `images/` folder, organized by category in subdirectories.

## Installation

```bash
pnpm install
```

## Usage

To start the scraper:

```bash
pnpm start
```

The scraper will:
1. Explore the main Category:Images page
2. Recursively navigate through all subcategories
3. Download all images to `images/[category-name]/`
4. Skip already downloaded images to avoid duplicates
5. Display progress and statistics

## Features

- **Recursive category exploration**: Automatically discovers and explores nested subcategories
- **Organized storage**: Images are saved in subdirectories matching their category names
- **Duplicate prevention**: Skips images that have already been downloaded
- **Rate limiting**: Respectful delays between requests to avoid overloading the server
- **Error handling**: Retry logic for failed downloads
- **Progress tracking**: Real-time logging of scraping progress

## Output Structure

```
images/
├── Achievement icons/
├── Aspect icons/
├── Character portraits/
├── Boon icons/
├── Weapon images/
└── ...
```

## Note

Images are not versioned with git (see `.gitignore`).
