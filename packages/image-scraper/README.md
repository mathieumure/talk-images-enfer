# @talk-images/image-scraper

Automated scraper to download and organize images from the [Hades Wiki](https://hades.fandom.com/wiki/Hades_Wiki).

## Overview

This scraper navigates through the [Category:Images](https://hades.fandom.com/wiki/Category:Images) page and all its subcategories to download game assets including:
- Character portraits and artwork
- Achievement icons
- Boon icons from all Gods
- Weapon images and aspects
- Keepsake icons
- Resource icons
- Status effect icons
- Concept art
- And more...

All images are saved in the `images/` directory, organized by category in subdirectories.

## Current Dataset

The repository includes **1,038 scraped images** (42MB total) tracked with Git LFS:
- **Average size**: ~38KB per image
- **Formats**: PNG, JPG, WebP
- **Organization**: Categorized in subdirectories matching Wiki categories

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

## Git LFS Storage

Images are tracked with **Git LFS** (Large File Storage) for efficient version control of binary files. This allows us to:
- Keep the Git repository lightweight
- Version control the complete image dataset
- Share images across the team efficiently

### Prerequisites for Contributors

If you plan to contribute or update images, you'll need Git LFS installed:

```bash
# macOS
brew install git-lfs

# Initialize Git LFS in the repo
git lfs install
```

### How It Works

All files in `images/**` are automatically tracked by Git LFS via `.gitattributes`. When you clone the repository:
- Small pointer files are downloaded initially
- Actual images are fetched from LFS storage on demand
- Full images are available when needed

### Storage Stats

- **Total size**: 42MB
- **Number of files**: 1,038
- **LFS tracking pattern**: `packages/image-scraper/images/**`
