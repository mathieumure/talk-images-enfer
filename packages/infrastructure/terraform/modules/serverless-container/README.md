# Serverless Container Module

Terraform module for deploying imgproxy as a Scaleway Serverless Container with auto-scaling capabilities.

## Features

- Scaleway Serverless Container running imgproxy
- Auto-scaling with configurable min/max instances
- Scale-to-zero capability (min_scale=0) for cost optimization
- S3 integration for image source
- Comprehensive imgproxy configuration
- Optional URL signature protection
- Custom domain support
- Automatic deployment triggers
- Environment variable management with sensitive data handling

## Usage

```hcl
module "serverless_container" {
  source = "../../modules/serverless-container"

  namespace_name = "imgproxy-prod"
  container_name = "imgproxy"
  region         = "fr-par"

  # S3 Configuration (from object-storage module)
  s3_endpoint          = module.object_storage.bucket_endpoint
  s3_region            = module.object_storage.bucket_region
  s3_access_key_id     = module.iam.imgproxy_access_key_id
  s3_secret_access_key = module.iam.imgproxy_secret_key

  # Scaling configuration
  min_scale = 0  # Scale to zero when idle
  max_scale = 5

  # Resource limits
  cpu_limit    = 1000  # 1 vCPU
  memory_limit = 2048  # 2 GB

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

### Namespace Configuration

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| namespace_name | Name of the container namespace | `string` | n/a | yes |
| namespace_description | Description of the namespace | `string` | `"Namespace for imgproxy..."` | no |
| region | Scaleway region | `string` | `"fr-par"` | no |

### Container Configuration

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| container_name | Name of the imgproxy container | `string` | `"imgproxy"` | no |
| imgproxy_image | Container registry image | `string` | `"darthsim/imgproxy:latest"` | no |
| cpu_limit | CPU limit in mVCPU | `number` | `1000` | no |
| memory_limit | Memory limit in MB | `number` | `2048` | no |
| min_scale | Minimum container instances | `number` | `0` | no |
| max_scale | Maximum container instances | `number` | `5` | no |
| timeout | Request timeout in seconds | `number` | `300` | no |
| privacy | Privacy setting (public/private) | `string` | `"public"` | no |

### S3 Configuration

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| s3_endpoint | S3 endpoint URL | `string` | n/a | yes |
| s3_region | S3 region | `string` | n/a | yes |
| s3_access_key_id | S3 access key ID | `string` | n/a | yes |
| s3_secret_access_key | S3 secret access key | `string` | n/a | yes |

### imgproxy Configuration

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| imgproxy_enable_webp_detection | Enable WebP detection | `string` | `"true"` | no |
| imgproxy_enforce_webp | Enforce WebP format | `string` | `"false"` | no |
| imgproxy_quality | Image quality (0-100) | `number` | `85` | no |
| imgproxy_gzip_level | Gzip compression level (0-9) | `number` | `5` | no |
| imgproxy_max_src_resolution | Max source resolution (MP) | `number` | `50` | no |
| imgproxy_allowed_sources | Allowed source URLs | `string` | `""` | no |
| imgproxy_enable_url_signature | Enable URL signatures | `bool` | `false` | no |
| imgproxy_signature_key | URL signature key | `string` | `""` | no |
| imgproxy_signature_salt | URL signature salt | `string` | `""` | no |

## Outputs

| Name | Description |
|------|-------------|
| namespace_id | The ID of the container namespace |
| namespace_name | The name of the container namespace |
| container_id | The ID of the imgproxy container |
| container_url | The full HTTPS URL for the container |
| container_endpoint | The endpoint URL for the container |
| custom_domain_url | Custom domain URL (if configured) |
| min_scale | Minimum scale configuration |
| max_scale | Maximum scale configuration |

## Resources Created

- `scaleway_container_namespace.main` - Container namespace
- `scaleway_container.imgproxy` - imgproxy container
- `scaleway_container_domain.imgproxy` - Custom domain (optional)
- `scaleway_container_trigger.main` - Deployment trigger (optional)

## Examples

### Basic Usage with Scale-to-Zero

```hcl
module "imgproxy" {
  source = "../../modules/serverless-container"

  namespace_name = "imgproxy-production"

  s3_endpoint          = "https://s3.fr-par.scw.cloud"
  s3_region            = "fr-par"
  s3_access_key_id     = var.imgproxy_access_key
  s3_secret_access_key = var.imgproxy_secret_key

  min_scale = 0  # Scale to zero for cost savings
  max_scale = 10
}
```

### High-Performance Configuration

```hcl
module "imgproxy_high_perf" {
  source = "../../modules/serverless-container"

  namespace_name = "imgproxy-high-perf"

  # More resources
  cpu_limit    = 2000  # 2 vCPU
  memory_limit = 4096  # 4 GB

  # Always-on with higher capacity
  min_scale = 2
  max_scale = 20

  # Higher quality settings
  imgproxy_quality    = 90
  imgproxy_gzip_level = 9

  s3_endpoint          = var.s3_endpoint
  s3_region            = var.s3_region
  s3_access_key_id     = var.s3_access_key_id
  s3_secret_access_key = var.s3_secret_access_key
}
```

### With URL Signature Protection

```hcl
module "imgproxy_secure" {
  source = "../../modules/serverless-container"

  namespace_name = "imgproxy-secure"

  # Enable URL signature protection
  imgproxy_enable_url_signature = true
  imgproxy_signature_key        = var.imgproxy_key
  imgproxy_signature_salt       = var.imgproxy_salt

  # Restrict allowed sources
  imgproxy_allowed_sources = "s3://my-bucket/*"

  s3_endpoint          = var.s3_endpoint
  s3_region            = var.s3_region
  s3_access_key_id     = var.s3_access_key_id
  s3_secret_access_key = var.s3_secret_access_key
}
```

### With Custom Domain

```hcl
module "imgproxy_custom_domain" {
  source = "../../modules/serverless-container"

  namespace_name = "imgproxy-prod"
  custom_domain  = "images.example.com"

  s3_endpoint          = var.s3_endpoint
  s3_region            = var.s3_region
  s3_access_key_id     = var.s3_access_key_id
  s3_secret_access_key = var.s3_secret_access_key
}
```

## imgproxy URL Format

Once deployed, use imgproxy with this URL format:

```
https://<container_url>/<processing_options>/<source_url>
```

Example:
```
https://imgproxy-xxxx.containers.scw.cloud/resize:fill:300:200/s3://bucket-name/image.jpg
```

## Cost Optimization

To minimize costs:

1. **Scale to zero**: Set `min_scale = 0`
2. **Appropriate limits**: Don't over-provision CPU/memory
3. **Caching**: Use a CDN in front of imgproxy
4. **Compression**: Enable gzip compression

Estimated costs (scale-to-zero):
- **Idle**: €0/month
- **Light usage**: ~€2-5/month
- **Medium usage**: ~€10-20/month

## Performance Tuning

- **CPU/Memory ratio**: imgproxy is CPU-intensive, consider 1 vCPU per 2GB RAM
- **Timeout**: Increase for large images (default 300s)
- **Max resolution**: Limit to prevent abuse (default 50MP)
- **Quality**: Balance between quality and size (default 85)

## Security

- S3 credentials stored as secret environment variables
- Optional URL signature protection prevents unauthorized access
- Restrict `imgproxy_allowed_sources` to specific buckets
- Use private containers with authentication if needed
