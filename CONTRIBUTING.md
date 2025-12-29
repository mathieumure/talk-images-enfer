# Contributing to Talk Images Enfer

Thank you for your interest in contributing! This document provides guidelines and instructions for setting up the development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Package-Specific Setup](#package-specific-setup)
- [Git LFS for Images](#git-lfs-for-images)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** 20.0.0 or higher
- **pnpm** 8.0.0 or higher
- **Git** 2.30.0 or higher
- **Git LFS** 3.0.0 or higher (for working with images)

### Optional (for CMS development)

- **Docker** 24.0.0 or higher
- **Docker Compose** 2.0.0 or higher

### Installation Commands

#### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (via nvm recommended)
brew install nvm
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm

# Install Git LFS
brew install git-lfs

# Install Docker Desktop
brew install --cask docker
```

#### Linux (Ubuntu/Debian)

```bash
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm

# Install Git LFS
sudo apt-get install git-lfs

# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

#### Windows

```powershell
# Install via Chocolatey
choco install nodejs-lts pnpm git git-lfs docker-desktop
```

## Installation

### 1. Clone the Repository

```bash
git clone git@github.com:mathieumure/talk-images-enfer.git
cd talk-images-enfer
```

### 2. Initialize Git LFS

```bash
# Initialize Git LFS globally
git lfs install

# Fetch LFS objects (images)
git lfs pull
```

This will download the 1,038 images (42MB) tracked by Git LFS.

### 3. Install Dependencies

```bash
# Install all package dependencies (monorepo)
pnpm install
```

This will install dependencies for:
- Root workspace
- `@talk-images/image-scraper`
- `@talk-images/cms`
- Presentation (Astro)

### 4. Verify Installation

```bash
# Check Node.js version
node --version  # Should be 20.x or higher

# Check pnpm version
pnpm --version  # Should be 8.x or higher

# Check Git LFS
git lfs version  # Should be 3.x or higher

# Check Docker (if installed)
docker --version
docker compose version
```

## Development Workflow

### Running the Presentation

```bash
# Start development server with hot reload
pnpm dev

# Access at http://localhost:4321
```

### Working with Image Scraper

```bash
# Navigate to package
cd packages/image-scraper

# Install dependencies (if not done from root)
pnpm install

# Run the scraper
pnpm start

# Build TypeScript
pnpm build

# Lint code
pnpm lint
```

### Working with CMS

```bash
# Navigate to package
cd packages/cms

# Copy environment template
cp .env.example .env

# Edit .env with your Scaleway S3 credentials
# See packages/cms/README.md for Scaleway setup

# Start all services (Strapi, PostgreSQL, Imgproxy, Varnish)
docker compose up -d

# View logs
docker compose logs -f strapi

# Stop services
docker compose down

# Rebuild containers
docker compose build --no-cache
docker compose up -d
```

**Access Points:**
- Strapi Admin: http://localhost:1337/admin
- Strapi API: http://localhost:1337/api
- Image Processing: http://localhost:8080

## Package-Specific Setup

### Image Scraper

No additional setup required beyond pnpm install.

**Available Scripts:**
```bash
pnpm start      # Run scraper
pnpm build      # Compile TypeScript
pnpm lint       # Run linter
```

## Git LFS for Images

All images in `packages/image-scraper/images/` are tracked with Git LFS.

### Working with Images

```bash
# Check LFS status
git lfs status

# List tracked files
git lfs ls-files

# Pull latest images
git lfs pull

# Push new/modified images
git lfs push origin <branch-name>
```

### Adding New Images

If you add new images to `packages/image-scraper/images/`:

```bash
# They're automatically tracked by .gitattributes
git add packages/image-scraper/images/
git commit -m "feat: add new images"
git push
```

### Troubleshooting LFS

If images aren't downloading:

```bash
# Re-initialize LFS
git lfs install --force

# Fetch all LFS objects
git lfs fetch --all
git lfs checkout
```

## Additional Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Git LFS Documentation](https://git-lfs.github.com/)
- [Strapi Documentation](https://docs.strapi.io/)
- [Astro Documentation](https://docs.astro.build/)
- [Docker Compose](https://docs.docker.com/compose/)

Thank you for contributing! 🎉
