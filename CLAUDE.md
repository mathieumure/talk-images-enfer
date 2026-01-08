# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for a Reveal.js presentation about image optimization, featuring tools to scrape, manage, and optimize Hades Wiki images. The project demonstrates image format comparison (JPEG, WebP, AVIF) and includes a complete image optimization pipeline.

## Key Commands

### Presentation Development
```bash
# Run presentation dev server (Astro + Reveal.js)
pnpm dev                              # Access at http://localhost:4321

# Build presentation for production
pnpm build

# Preview production build
pnpm preview

# Generate image comparison assets
pnpm generate:format-comparison       # Creates JPEG/WebP/AVIF comparisons in public/
pnpm generate:problem-images         # Generates test images
```

### Workspace Commands
```bash
# Install all dependencies across monorepo
pnpm install

# Run commands in specific packages
pnpm --filter @talk-images/image-scraper start
pnpm --filter @talk-images/cms docker:up
```

### Image Scraper Package
```bash
cd packages/image-scraper
pnpm start                           # Scrape Hades Wiki images
pnpm build                           # Compile TypeScript
pnpm lint                            # Lint code
```

### CMS Package
```bash
cd packages/cms
docker compose up -d                 # Start Strapi + PostgreSQL + Imgproxy + Varnish
docker compose logs -f strapi        # View logs
docker compose down                  # Stop all services
docker compose build --no-cache      # Rebuild containers

# Access points:
# - Strapi Admin: http://localhost:1337/admin
# - Strapi API: http://localhost:1337/api
# - Image Processing: http://localhost:8080
```

### Infrastructure Package
```bash
cd packages/infrastructure
source .env                          # Load Scaleway credentials
pnpm run setup                       # Initialize Terraform
pnpm run plan                        # Preview infrastructure changes
pnpm run apply                       # Apply changes
pnpm run destroy                     # Destroy infrastructure
pnpm run fmt                         # Format Terraform files
```

## Architecture

### Monorepo Structure

This is a pnpm workspace with three main packages:

1. **Root (Presentation)**: Astro-based Reveal.js presentation at `/`
2. **image-scraper**: TypeScript tool to scrape Hades Wiki images
3. **cms**: Strapi CMS with image optimization stack (Docker-based)
4. **infrastructure**: OpenTofu/Terraform IaC for Scaleway deployment

### Presentation Architecture

The presentation is built with **Astro + Reveal.js** and follows a slide-component pattern:

- **Entry point**: `src/pages/index.astro` - Imports and sequences all slides
- **Layout**: `src/layouts/Layout.astro` - Initializes Reveal.js, handles QR code generation
- **Slides**: `src/slides/*.astro` - Individual presentation slides
- **Components**: `src/components/*.astro` - Reusable UI components

Key architectural patterns:

**Slide Components**: Each major section is a separate `.astro` file in `src/slides/`. Slides are imported and ordered in `src/pages/index.astro`.

**Interactive Image Comparison**: The `ImageComparison.astro` component (`src/components/ImageComparison.astro`) provides sophisticated image format comparison:
- Two-up side-by-side comparison using `two-up-element` web component
- Synchronized pinch-zoom on both images using `pinch-zoom-element`
- Format/quality selectors that dynamically load comparison images
- Real-time size metrics and savings calculations
- Loads data from `/public/image-format-comparison/compression-data.json`

**QR Code System**: Slides can display QR codes via `data-qrcode` attribute. The layout listens to Reveal.js slide changes and generates/displays QR codes dynamically.

**Scripts**: The `/scripts` directory contains TypeScript utilities run via `tsx`:
- `generate-format-comparison.ts` - Uses Sharp to generate JPEG/WebP/AVIF images at various quality levels, outputs to `public/image-format-comparison/`
- `generate-problem-images.ts` - Creates test images demonstrating optimization issues

### CMS Architecture

The CMS uses a Docker Compose stack with 5 services:

1. **Strapi**: Node.js CMS for image management (port 1337)
2. **PostgreSQL**: Database backend
3. **LocalStack**: S3-compatible storage for development
4. **Imgproxy**: On-demand image resizing/format conversion (port 8080)
5. **Varnish**: HTTP cache layer (24h cache)

Images flow: Strapi → S3 (LocalStack in dev, Scaleway in prod) → Imgproxy → Varnish → Client

### Infrastructure Architecture

Production deployment uses:
- **OpenTofu/Terraform** for infrastructure provisioning
- **Terragrunt** for DRY configuration across environments
- **Scaleway S3** for production object storage
- **Serverless Containers** for auto-scaling imgproxy (scale-to-zero)
- **GitHub Actions** for CI/CD

Modular Terraform structure with separate modules for IAM, S3, and serverless containers.

## Important Patterns

### Git LFS for Images

All images in `packages/image-scraper/images/` are tracked by Git LFS (configured in `.gitattributes`). This repo contains 1,038 images (42MB).

**Working with LFS images:**
```bash
git lfs install                      # Initialize LFS globally
git lfs pull                         # Download all LFS objects
git lfs status                       # Check LFS status
git lfs ls-files                     # List tracked files
```

New images added to `packages/image-scraper/images/` are automatically tracked by LFS.

### Astro + Reveal.js Integration

Reveal.js is initialized in `src/layouts/Layout.astro` with custom configuration:
- No transitions (`transition: "none"`)
- History enabled for URL navigation
- Auto-animate with custom easing
- Full width/height slides (no scaling)
- QR code integration via `slidechanged` event listener

Custom fonts are loaded via `@fontsource` packages (Caesar Dressing, Spectral SC, Lato) plus a custom P22Underground font in `/public/fonts/`.

### Image Comparison Data Flow

1. Run `pnpm generate:format-comparison` to create comparison images
2. Script processes `packages/image-scraper/images/Character models/Model_Sheet_Achilles.jpg`
3. Generates 60 images (20 quality levels × 3 formats) in `public/image-format-comparison/`
4. Outputs `compression-data.json` with size metadata
5. `ImageComparison.astro` component fetches this JSON and displays interactive comparison

### Web Components

The presentation uses custom elements for advanced interactions:
- `<two-up>` - Split-screen comparison slider
- `<pinch-zoom>` - Touch-friendly zoom/pan
- `<QRCode>` - Dynamic QR code generation

These are imported in component scripts, not globally registered.

## Prerequisites

- **Node.js** 20+ (required)
- **pnpm** 8+ (required)
- **Git LFS** 3+ (required for working with images)
- **Docker** + Docker Compose (optional, only needed for CMS development)
- **OpenTofu/Terraform** (optional, only needed for infrastructure work)

## Configuration Files

- `pnpm-workspace.yaml` - Defines monorepo packages
- `astro.config.mjs` - Astro configuration (minimal, sets site URL)
- `.gitattributes` - Git LFS configuration for image tracking
- `packages/cms/docker-compose.yml` - Full CMS stack definition
- `packages/infrastructure/.env` - Scaleway credentials (not in git)

## Development Workflow

When working on the presentation:
1. Ensure Git LFS is initialized (`git lfs install`)
2. Pull LFS objects if needed (`git lfs pull`)
3. Run `pnpm install` from root
4. Start dev server with `pnpm dev`
5. Slides auto-reload on changes

When adding new slides:
1. Create slide component in `src/slides/`
2. Import and add to sequence in `src/pages/index.astro`
3. Use existing slides as templates for consistent styling

When modifying image comparisons:
1. Update source images or quality levels in `scripts/generate-format-comparison.ts`
2. Run `pnpm generate:format-comparison`
3. Component will automatically use new data on next page load