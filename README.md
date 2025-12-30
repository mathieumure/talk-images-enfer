# Talk Images Enfer

Monorepo for managing and serving Hades Wiki images with a complete optimization pipeline.

## Overview

This project provides tools to scrape, store, manage, and optimize images from the [Hades Wiki](https://hades.fandom.com/wiki/Hades_Wiki) for presentation and web use.

## Architecture

```
talk-images-enfer/
├── packages/
│   ├── image-scraper/     # Wiki image scraping tool
│   ├── cms/               # Strapi CMS with image optimization
│   └── infrastructure/    # Scaleway infrastructure as code
└── presentation/          # Reveal.js slides (Astro)
```

## Packages

### 📥 [@talk-images/image-scraper](./packages/image-scraper)

Automated scraper that downloads and organizes Hades Wiki images.

**Features:**
- Recursive category exploration
- 1,038 images scraped (42MB)
- Git LFS storage
- Organized by Wiki categories

**Quick Start:**
```bash
cd packages/image-scraper
pnpm install
pnpm start
```

[Read more →](./packages/image-scraper/README.md)

### 📦 [@talk-images/cms](./packages/cms)

Complete image management and optimization stack powered by Strapi.

**Stack:**
- **Strapi CMS** - Content and media management
- **PostgreSQL** - Database backend
- **LocalStack S3** - Local S3-compatible storage (dev)
- **Imgproxy** - On-demand image processing
- **Varnish** - HTTP cache layer

**Features:**
- On-demand image resizing and format conversion
- WebP optimization with quality control
- 24h cache with < 50ms delivery for cached images
- Admin panel for image organization

**Quick Start:**
```bash
cd packages/cms
cp .env.example .env
# Edit .env with your credentials
docker compose up -d
```

[Read more →](./packages/cms/README.md)

### ☁️ [@talk-images/infrastructure](./packages/infrastructure)

Production-ready infrastructure-as-code for deploying the image service on Scaleway.

**Stack:**
- **OpenTofu/Terraform** - Infrastructure provisioning
- **Terragrunt** - DRY configuration management
- **Scaleway S3** - Production object storage
- **Serverless Containers** - Auto-scaling imgproxy
- **GitHub Actions** - CI/CD pipelines

**Features:**
- Modular Terraform architecture (IAM, S3, Serverless)
- Scale-to-zero for cost optimization (~€7-12/month)
- Complete documentation with troubleshooting
- Automated deployment workflows

**Quick Start:**
```bash
cd packages/infrastructure
cp .env.example .env
# Edit .env with Scaleway credentials
source .env
pnpm run setup
pnpm run plan
pnpm run apply
```

[Read more →](./packages/infrastructure/README.md)

## Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** 8+
- **Docker** and Docker Compose (for CMS)
- **Git LFS** (for working with scraped images)

### Installation

```bash
# Clone the repository
git clone git@github.com:mathieumure/talk-images-enfer.git
cd talk-images-enfer

# Install dependencies (all packages)
pnpm install

# Install Git LFS for images
brew install git-lfs
git lfs install
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup instructions.

### Development

```bash
# Run presentation dev server
pnpm dev

# Start image scraper
pnpm --filter @talk-images/image-scraper start

# Start CMS (Docker)
pnpm --filter @talk-images/cms docker:up
```

## Image Optimization Examples

Once the CMS is running, you can process images on-demand:

```bash
# Original
http://localhost:8080/insecure/plain/https://strapi-assets.s3.fr-par.scw.cloud/Zeus_symbol.png

# Thumbnail 300x300
http://localhost:8080/insecure/resize:fill:300:300/plain/https://strapi-assets.s3.fr-par.scw.cloud/Zeus_symbol.png

# Responsive WebP
http://localhost:8080/insecure/resize:fit:800:0/format:webp/plain/https://strapi-assets.s3.fr-par.scw.cloud/Zeus_symbol.png
```

## Project Structure

```
talk-images-enfer/
├── packages/
│   ├── image-scraper/
│   │   ├── src/              # Scraper source code
│   │   ├── images/           # Downloaded images (Git LFS)
│   │   └── README.md
│   ├── cms/
│   │   ├── config/           # Strapi configuration
│   │   ├── docker-compose.yml # 5-service stack
│   │   ├── default.vcl       # Varnish cache config
│   │   └── README.md
│   └── infrastructure/
│       ├── terraform/modules/ # Reusable Terraform modules
│       ├── environments/     # Environment configurations
│       ├── scripts/          # Utility scripts
│       ├── docs/             # Architecture & guides
│       └── README.md
├── .github/workflows/        # CI/CD pipelines
├── src/
│   └── slides/               # Presentation slides
├── public/                   # Static assets
├── .gitattributes            # Git LFS configuration
├── pnpm-workspace.yaml       # Monorepo workspace config
└── README.md
```

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Presentation**: Astro + Reveal.js
- **Scraper**: TypeScript + Cheerio + Node Fetch
- **CMS**: Strapi 5 + PostgreSQL + LocalStack S3
- **Image Processing**: Imgproxy + Varnish Cache
- **Infrastructure**: OpenTofu + Terragrunt + Scaleway
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose
- **Storage**: Git LFS for binary assets

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Setting up the development environment
- Running the project locally
- Submitting pull requests
- Code conventions

## License

MIT