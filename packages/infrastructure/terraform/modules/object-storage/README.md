# Object Storage Module

Terraform module for creating and configuring a Scaleway Object Storage S3 bucket for image storage.

## Features

- S3-compatible object storage bucket
- Configurable public read access
- Optional versioning
- Lifecycle policies for automatic cleanup
- CORS configuration for browser access
- Optional static website hosting
- Automatic cleanup of incomplete multipart uploads

## Usage

```hcl
module "object_storage" {
  source = "../../modules/object-storage"

  bucket_name         = "my-images-bucket"
  region              = "fr-par"
  enable_public_access = true
  enable_versioning   = false

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
| bucket_name | Name of the S3 bucket for images | `string` | n/a | yes |
| region | Scaleway region for the bucket | `string` | `"fr-par"` | no |
| enable_public_access | Enable public read access to the bucket | `bool` | `true` | no |
| enable_versioning | Enable versioning for the bucket | `bool` | `false` | no |
| lifecycle_rules_enabled | Enable lifecycle rules for automatic cleanup | `bool` | `true` | no |
| noncurrent_version_expiration_days | Days to keep non-current versions | `number` | `30` | no |
| abort_incomplete_uploads_days | Days after which to abort incomplete uploads | `number` | `7` | no |
| enable_website | Enable static website hosting | `bool` | `false` | no |
| enable_cors | Enable CORS configuration | `bool` | `true` | no |
| cors_allowed_headers | Allowed headers for CORS | `list(string)` | `["*"]` | no |
| cors_allowed_methods | Allowed HTTP methods for CORS | `list(string)` | `["GET", "HEAD"]` | no |
| cors_allowed_origins | Allowed origins for CORS | `list(string)` | `["*"]` | no |
| cors_expose_headers | Headers to expose in CORS responses | `list(string)` | `["ETag"]` | no |
| cors_max_age_seconds | Max age for CORS preflight cache | `number` | `3600` | no |
| tags | Tags to apply to the bucket | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| bucket_id | The ID of the created bucket |
| bucket_name | The name of the created bucket |
| bucket_region | The region where the bucket is located |
| bucket_endpoint | The S3 endpoint URL for the bucket |
| bucket_api_endpoint | The full S3 API endpoint for the bucket |
| bucket_website_endpoint | The website endpoint URL (if enabled) |
| bucket_arn | The ARN of the bucket (for IAM policies) |
| versioning_enabled | Whether versioning is enabled |
| public_access_enabled | Whether public access is enabled |

## Resources Created

- `scaleway_object_bucket.images` - Main S3 bucket
- `scaleway_object_bucket_acl.images` - Public read ACL (if enabled)
- `scaleway_object_bucket_lifecycle_rule.images` - Lifecycle rules (if enabled)
- `scaleway_object_bucket_website_configuration.images` - Website config (if enabled)
- `scaleway_object_bucket_cors_rule.images` - CORS configuration (if enabled)

## Examples

### Public Read Bucket with Versioning

```hcl
module "versioned_bucket" {
  source = "../../modules/object-storage"

  bucket_name           = "my-versioned-images"
  region                = "fr-par"
  enable_public_access  = true
  enable_versioning     = true

  # Keep old versions for 90 days
  noncurrent_version_expiration_days = 90
}
```

### Private Bucket for Backend Storage

```hcl
module "private_bucket" {
  source = "../../modules/object-storage"

  bucket_name          = "my-private-images"
  region               = "fr-par"
  enable_public_access = false
  enable_cors          = false
}
```

### Bucket with Custom CORS

```hcl
module "custom_cors_bucket" {
  source = "../../modules/object-storage"

  bucket_name         = "my-cors-images"
  region              = "fr-par"

  enable_cors         = true
  cors_allowed_origins = ["https://example.com", "https://www.example.com"]
  cors_allowed_methods = ["GET", "HEAD", "PUT"]
  cors_max_age_seconds = 7200
}
```

## Notes

- Bucket names must be globally unique within Scaleway
- Public access requires explicit ACL configuration
- Lifecycle rules help reduce storage costs by cleaning up old data
- CORS is recommended if bucket will be accessed from browsers
- Versioning can significantly increase storage costs
