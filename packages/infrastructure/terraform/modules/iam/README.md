# IAM Module

Terraform module for creating and managing IAM service accounts and policies for Scaleway infrastructure.

## Features

- IAM application (service account) for imgproxy with S3 read access
- IAM application for GitHub Actions with infrastructure management permissions
- API keys with optional expiration dates
- Least-privilege IAM policies
- Bucket-specific access policies (optional)
- Sensitive output handling for secrets

## Usage

```hcl
module "iam" {
  source = "../../modules/iam"

  project_id           = var.project_id
  imgproxy_app_name    = "imgproxy-prod"
  github_actions_app_name = "github-actions-prod"
  bucket_name          = "my-images-bucket"

  tags = {
    Environment = "production"
    Project     = "talk-images"
  }
}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.6.0 |
| scaleway | ~> 2.0 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| project_id | Scaleway project ID | `string` | n/a | yes |
| imgproxy_app_name | Name of the IAM application for imgproxy | `string` | `"imgproxy-service"` | no |
| imgproxy_key_expires_at | Expiration date for imgproxy API key (RFC3339) | `string` | `null` | no |
| github_actions_app_name | Name of the IAM application for GitHub Actions | `string` | `"github-actions-ci"` | no |
| create_github_actions_account | Whether to create GitHub Actions account | `bool` | `true` | no |
| github_actions_key_expires_at | Expiration date for GitHub Actions API key (RFC3339) | `string` | `null` | no |
| bucket_name | S3 bucket name for specific policy | `string` | `""` | no |
| tags | Tags to apply to IAM resources | `map(string)` | `{}` | no |

## Outputs

| Name | Description | Sensitive |
|------|-------------|-----------|
| imgproxy_application_id | The ID of the imgproxy IAM application | No |
| imgproxy_application_name | The name of the imgproxy IAM application | No |
| imgproxy_access_key_id | The access key ID for imgproxy | **Yes** |
| imgproxy_secret_key | The secret key for imgproxy | **Yes** |
| imgproxy_api_key_id | The ID of the imgproxy API key | No |
| github_actions_application_id | The ID of the GitHub Actions IAM application | No |
| github_actions_application_name | The name of the GitHub Actions IAM application | No |
| github_actions_access_key_id | The access key ID for GitHub Actions | **Yes** |
| github_actions_secret_key | The secret key for GitHub Actions | **Yes** |
| github_actions_api_key_id | The ID of the GitHub Actions API key | No |
| imgproxy_policy_id | The ID of the imgproxy S3 read policy | No |
| github_actions_policy_id | The ID of the GitHub Actions policy | No |

## Resources Created

- `scaleway_iam_application.imgproxy` - IAM application for imgproxy
- `scaleway_iam_api_key.imgproxy` - API key for imgproxy
- `scaleway_iam_policy.imgproxy_s3_read` - S3 read-only policy
- `scaleway_iam_application.github_actions` - IAM application for CI/CD (optional)
- `scaleway_iam_api_key.github_actions` - API key for GitHub Actions (optional)
- `scaleway_iam_policy.github_actions_infra` - Infrastructure management policy (optional)
- `scaleway_iam_policy.imgproxy_bucket_specific` - Bucket-specific policy (optional)

## Examples

### Basic Usage

```hcl
module "iam" {
  source = "../../modules/iam"

  project_id = "11111111-1111-1111-1111-111111111111"
}
```

### With Custom Names and Bucket

```hcl
module "iam" {
  source = "../../modules/iam"

  project_id              = var.project_id
  imgproxy_app_name       = "imgproxy-production"
  github_actions_app_name = "ci-cd-production"
  bucket_name             = "production-images-bucket"

  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
```

### Without GitHub Actions Account

```hcl
module "iam" {
  source = "../../modules/iam"

  project_id                     = var.project_id
  create_github_actions_account  = false
}
```

### With API Key Expiration

```hcl
module "iam" {
  source = "../../modules/iam"

  project_id                    = var.project_id
  imgproxy_key_expires_at       = "2026-12-31T23:59:59Z"
  github_actions_key_expires_at = "2025-12-31T23:59:59Z"
}
```

## Security Considerations

### Sensitive Outputs

The following outputs are marked as sensitive and will not be displayed in Terraform output:
- `imgproxy_access_key_id`
- `imgproxy_secret_key`
- `github_actions_access_key_id`
- `github_actions_secret_key`

To retrieve these values:
```bash
# Get imgproxy credentials
terraform output -raw imgproxy_access_key_id
terraform output -raw imgproxy_secret_key

# Get GitHub Actions credentials
terraform output -raw github_actions_access_key_id
terraform output -raw github_actions_secret_key
```

### Least Privilege Principle

- **imgproxy**: Only has `ObjectStorageReadOnly` permission
- **GitHub Actions**: Has `AllProductsFullAccess` for infrastructure management
  - In production, consider restricting to specific resources

### API Key Rotation

To rotate API keys:
1. Create new API key with expiration date
2. Update application to use new credentials
3. Delete old API key
4. Remove expiration from new key if desired

```hcl
# Set expiration on existing key
imgproxy_key_expires_at = "2025-01-31T23:59:59Z"

# After rotation, remove expiration
imgproxy_key_expires_at = null
```

## Notes

- API keys are created without expiration by default
- Scaleway IAM doesn't support resource-level permissions yet
- Store sensitive outputs in GitHub Secrets or secret management system
- Never commit API keys to version control
- Consider using temporary credentials where possible
