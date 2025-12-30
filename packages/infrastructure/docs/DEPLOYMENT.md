# Deployment Guide

Complete guide for deploying the Scaleway image service infrastructure.

## Prerequisites

### Required Tools

Install the following tools before deployment:

1. **OpenTofu** (or Terraform) >= 1.6.0
   ```bash
   # macOS
   brew install opentofu

   # Linux
   snap install --classic opentofu
   ```

2. **Terragrunt** >= 0.54.0
   ```bash
   # Download and install
   wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.54.0/terragrunt_darwin_amd64
   chmod +x terragrunt_darwin_amd64
   sudo mv terragrunt_darwin_amd64 /usr/local/bin/terragrunt
   ```

3. **jq** (optional, for scripts)
   ```bash
   # macOS
   brew install jq

   # Linux
   apt-get install jq
   ```

### Scaleway Account Setup

1. **Create Scaleway Account**
   - Go to https://console.scaleway.com
   - Sign up or log in

2. **Create Project**
   - Navigate to "Projects"
   - Create new project: "talk-images-prod"
   - Note the Project ID

3. **Generate API Keys**
   - Go to "Credentials" in project settings
   - Click "Generate API Key"
   - Save Access Key and Secret Key securely

4. **Get Organization ID**
   - Found in Organization Settings
   - Copy Organization ID

### Environment Variables

Create a `.env` file in `packages/infrastructure/`:

```bash
# Copy example file
cp .env.example .env

# Edit with your credentials
nano .env
```

Add your Scaleway credentials:

```bash
export SCALEWAY_ACCESS_KEY="SCW..."
export SCALEWAY_SECRET_KEY="..."
export SCALEWAY_ORGANIZATION_ID="..."
export SCALEWAY_PROJECT_ID="..."
```

Load variables:

```bash
source .env
```

## Initial Setup

### 1. Verify Setup

Run the setup script to verify all prerequisites:

```bash
pnpm run setup
```

This will:
- Check for required tools
- Verify environment variables
- Initialize Terragrunt modules

Expected output:
```
✓ OpenTofu found: OpenTofu v1.6.0
✓ Terragrunt found: terragrunt version v0.54.0
✓ SCALEWAY_ACCESS_KEY is set (SCW...)
✓ SCALEWAY_SECRET_KEY is set (...)
✓ Setup complete!
```

### 2. Validate Configuration

Validate Terraform modules and Terragrunt configuration:

```bash
pnpm run validate
```

This will:
- Check Terraform formatting
- Validate each module
- Validate Terragrunt configuration

### 3. Review Plan

Preview infrastructure changes:

```bash
pnpm run plan
```

Review the output carefully:
- Resources to be created
- Configuration values
- Estimated costs

## Deployment

### Full Deployment

Deploy all infrastructure components:

```bash
pnpm run apply
```

You'll be prompted to confirm:
```
Do you want to continue? (yes/no):
```

Type `yes` to proceed.

**Deployment takes approximately 5-10 minutes.**

### Module-Specific Deployment

Deploy individual modules:

```bash
# Deploy only IAM
./scripts/apply.sh --module iam

# Deploy only Object Storage
./scripts/apply.sh --module object-storage

# Deploy only Serverless Container
./scripts/apply.sh --module serverless-container
```

### Deployment Order

Terragrunt handles dependencies automatically:

1. **IAM** (no dependencies)
   - Creates service accounts
   - Generates API keys

2. **Object Storage** (no dependencies)
   - Creates S3 bucket
   - Configures CORS and lifecycle rules

3. **Serverless Container** (depends on IAM + Object Storage)
   - Creates namespace
   - Deploys imgproxy container
   - Configures environment variables

## Post-Deployment

### Verify Deployment

1. **Check Outputs**
   ```bash
   cd environments/production/serverless-container
   terragrunt output
   ```

2. **Test imgproxy Endpoint**
   ```bash
   # Get container URL
   CONTAINER_URL=$(cd environments/production/serverless-container && terragrunt output -raw container_url)

   # Test health endpoint
   curl "${CONTAINER_URL}/health"
   ```

3. **Upload Test Image**
   ```bash
   # Using AWS CLI (s3cmd, s3-compatible)
   export AWS_ACCESS_KEY_ID="your-scaleway-access-key"
   export AWS_SECRET_ACCESS_KEY="your-scaleway-secret-key"

   aws s3 cp test.jpg s3://talk-images-prod-images-bucket/ \
     --endpoint-url https://s3.fr-par.scw.cloud
   ```

4. **Test Image Processing**
   ```bash
   # Process test image
   curl "${CONTAINER_URL}/resize:fill:300:200/s3://talk-images-prod-images-bucket/test.jpg" \
     --output processed.jpg
   ```

### Get Infrastructure Info

```bash
# IAM info
cd environments/production/iam
terragrunt output

# Object Storage info
cd environments/production/object-storage
terragrunt output

# Container info
cd environments/production/serverless-container
terragrunt output
```

### Retrieve Sensitive Outputs

API keys and secrets:

```bash
# imgproxy S3 credentials
cd environments/production/iam
terragrunt output -raw imgproxy_access_key_id
terragrunt output -raw imgproxy_secret_key

# GitHub Actions credentials
terragrunt output -raw github_actions_access_key_id
terragrunt output -raw github_actions_secret_key
```

## CI/CD Setup

### GitHub Secrets

Add secrets to GitHub repository:

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add the following secrets:
   - `SCALEWAY_ACCESS_KEY`
   - `SCALEWAY_SECRET_KEY`
   - `SCALEWAY_ORGANIZATION_ID`
   - `SCALEWAY_PROJECT_ID`

### GitHub Actions Workflows

Three workflows are configured:

1. **Validation** (`infrastructure-validate.yml`)
   - Runs on PR
   - Validates configuration
   - Checks formatting

2. **Plan** (`infrastructure-plan.yml`)
   - Runs on PR
   - Shows infrastructure changes
   - Comments plan on PR

3. **Deploy** (`infrastructure-deploy.yml`)
   - Runs on push to `main`
   - Deploys infrastructure
   - Manual trigger available

## Updates & Changes

### Modifying Configuration

1. **Edit Terragrunt files**
   ```bash
   # Example: Change container scaling
   nano environments/production/serverless-container/terragrunt.hcl
   ```

2. **Plan changes**
   ```bash
   pnpm run plan
   ```

3. **Apply changes**
   ```bash
   pnpm run apply
   ```

### Common Updates

**Increase Container Resources**:
```hcl
# environments/production/serverless-container/terragrunt.hcl
inputs = {
  cpu_limit    = 2000  # 2 vCPU
  memory_limit = 4096  # 4 GB
  max_scale    = 10    # More instances
}
```

**Enable URL Signatures**:
```hcl
# environments/production/serverless-container/terragrunt.hcl
inputs = {
  imgproxy_enable_url_signature = true
  imgproxy_signature_key        = get_env("IMGPROXY_KEY")
  imgproxy_signature_salt       = get_env("IMGPROXY_SALT")
}
```

**Change Image Quality**:
```hcl
# environments/production/serverless-container/terragrunt.hcl
inputs = {
  imgproxy_quality = 90  # Higher quality
}
```

## Rollback Procedures

### Rollback to Previous State

If deployment fails or causes issues:

1. **Revert Configuration**
   ```bash
   git revert <commit-hash>
   ```

2. **Re-apply**
   ```bash
   pnpm run apply
   ```

### Complete Rebuild

If state is corrupted:

1. **Backup current state**
   ```bash
   cd environments/production
   terragrunt run-all output > backup-outputs.txt
   ```

2. **Destroy and recreate**
   ```bash
   pnpm run destroy
   pnpm run apply
   ```

## Disaster Recovery

### S3 Bucket Recovery

**Important**: Enable versioning or backups before disaster occurs!

1. **Enable Versioning** (optional):
   ```hcl
   # environments/production/object-storage/terragrunt.hcl
   inputs = {
     enable_versioning = true
   }
   ```

2. **Backup to Another Region**:
   ```bash
   # Use s3cmd or rclone for cross-region backup
   rclone sync scaleway:talk-images-prod-images-bucket/ \
     scaleway-backup:talk-images-backup/
   ```

### State File Recovery

State file is stored in Scaleway S3:
- Bucket: `talk-images-enfer-terraform-state`
- Encryption: Enabled
- Location: `fr-par`

To recover:
```bash
# Download state manually if needed
aws s3 cp s3://talk-images-enfer-terraform-state/production/terraform.tfstate . \
  --endpoint-url https://s3.fr-par.scw.cloud
```

## Cleanup & Destruction

### Full Cleanup

**Warning**: This will permanently delete all infrastructure and data!

```bash
pnpm run destroy
```

You must type `DESTROY` exactly, then confirm with `yes`.

### Partial Cleanup

Destroy specific modules:

```bash
# Destroy only container (keeps S3 data)
./scripts/destroy.sh --module serverless-container

# Destroy only Object Storage (deletes all images!)
./scripts/destroy.sh --module object-storage
```

### Cost Cleanup

To minimize costs without destroying infrastructure:

1. **Scale container to zero**:
   ```hcl
   # Already configured by default
   min_scale = 0
   max_scale = 1
   ```

2. **Clean up old S3 data**:
   ```bash
   # Delete unused images
   aws s3 rm s3://talk-images-prod-images-bucket/old/ --recursive \
     --endpoint-url https://s3.fr-par.scw.cloud
   ```

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Next Steps

After successful deployment:

1. **Add CDN**: Configure Cloudflare or Scaleway CDN
2. **Custom Domain**: Point your domain to imgproxy
3. **Monitoring**: Set up alerts in Scaleway Console
4. **Load Testing**: Test with production traffic patterns
5. **Documentation**: Document your specific use cases

## Support

- **Scaleway Docs**: https://www.scaleway.com/en/docs/
- **imgproxy Docs**: https://docs.imgproxy.net/
- **Terragrunt Docs**: https://terragrunt.gruntwork.io/docs/
- **GitHub Issues**: Report issues in this repository
