# @talk-images/infrastructure

Infrastructure as Code for deploying a production-ready image service on Scaleway using OpenTofu and Terragrunt.

## Architecture Overview

This package deploys a complete image service infrastructure on Scaleway:

```
Internet → Serverless Container (imgproxy) → Object Storage S3
                     ↓
            IAM Service Account
```

**Components:**
- **Object Storage S3**: Scaleway S3-compatible storage for images
- **Serverless Container**: imgproxy running in Scaleway Serverless Containers for image processing
- **IAM**: Service accounts and permissions for secure access

## Prerequisites

Before using this infrastructure, you need:

1. **Scaleway Account**
   - Organization ID
   - Project ID
   - Access Key & Secret Key

2. **Required Tools**
   - [OpenTofu](https://opentofu.org/) >= 1.6.0 (or Terraform >= 1.6.0)
   - [Terragrunt](https://terragrunt.gruntwork.io/) >= 0.54.0
   - [jq](https://stedolan.github.io/jq/) (for scripts)

3. **Environment Variables**
   ```bash
   export SCALEWAY_ACCESS_KEY="<your-access-key>"
   export SCALEWAY_SECRET_KEY="<your-secret-key>"
   export SCALEWAY_ORGANIZATION_ID="<your-organization-id>"
   export SCALEWAY_PROJECT_ID="<your-project-id>"
   ```

## Quick Start

### 1. Setup

Initialize and verify prerequisites:

```bash
pnpm run setup
```

### 2. Validate

Check infrastructure configuration:

```bash
pnpm run validate
```

### 3. Plan

Preview infrastructure changes:

```bash
pnpm run plan
```

### 4. Deploy

Apply infrastructure (requires confirmation):

```bash
pnpm run apply
```

### 5. Destroy

Remove all infrastructure (requires confirmation):

```bash
pnpm run destroy
```

## Project Structure

```
packages/infrastructure/
├── terraform/modules/          # Reusable Terraform modules
│   ├── object-storage/        # S3 bucket configuration
│   ├── iam/                   # IAM service accounts & policies
│   └── serverless-container/  # imgproxy serverless container
├── environments/              # Environment configurations
│   ├── terragrunt.hcl        # Root Terragrunt config
│   └── production/           # Production environment
├── scripts/                   # Utility scripts
├── docs/                      # Detailed documentation
└── .github/workflows/         # CI/CD pipelines
```

## Cost Estimation

Estimated monthly costs for production environment (fr-par region):

- **Object Storage S3**: ~€0.02/GB storage + €0.01/GB transfer
- **Serverless Container**: ~€0.10/vCPU-hour + €0.10/GB-hour (with min_scale=0)
- **Estimated Total**: €7-12/month (varies with usage)

Costs can be significantly reduced by:
- Setting `min_scale=0` (container scales to zero when idle)
- Using lifecycle policies for old images
- Enabling compression

## Documentation

- [Architecture Details](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## Modules

### Object Storage

S3-compatible object storage for images with public read access and lifecycle policies.

[Module Documentation](./terraform/modules/object-storage/README.md)

### IAM

Service accounts and IAM policies for imgproxy and GitHub Actions.

[Module Documentation](./terraform/modules/iam/README.md)

### Serverless Container

imgproxy running in Scaleway Serverless Containers with auto-scaling.

[Module Documentation](./terraform/modules/serverless-container/README.md)

## CI/CD

GitHub Actions workflows are provided for:
- **Validation**: Format check and validation on PRs
- **Planning**: Preview infrastructure changes on PRs
- **Deployment**: Auto-deploy on push to main

See [GitHub Actions Workflows](./.github/workflows/) for details.

## Security

- IAM follows principle of least privilege
- Secrets managed via GitHub Secrets (never committed)
- State stored securely in Scaleway S3 with encryption
- Service accounts have minimal required permissions

## Contributing

This infrastructure follows the monorepo structure. All modules are self-contained and reusable.

## License

MIT
