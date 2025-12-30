# Infrastructure Architecture

This document describes the architecture of the Scaleway-based image service infrastructure.

## Overview

The infrastructure provides a complete, production-ready image service using Scaleway's cloud services:

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Serverless Container                        │
│                    (imgproxy)                                │
│                                                              │
│  • Image processing and transformation                       │
│  • Auto-scaling (0-5 instances)                             │
│  • HTTPS endpoint                                            │
│  • WebP detection & conversion                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ S3 API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Object Storage (S3)                        │
│                                                              │
│  • Source image storage                                      │
│  • Public read access                                        │
│  • Lifecycle policies                                        │
│  • CORS enabled                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ IAM Policies
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      IAM Layer                               │
│                                                              │
│  • imgproxy service account (S3 read-only)                  │
│  • GitHub Actions service account (full access)              │
│  • API keys & permissions                                    │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Object Storage (S3)

**Purpose**: Store source images with public read access

**Resources**:
- S3-compatible bucket
- Public read ACL
- CORS configuration
- Lifecycle rules

**Configuration**:
- Region: `fr-par` (Paris, France)
- Bucket name: `talk-images-prod-images`
- Public access: Enabled
- Versioning: Disabled (to reduce costs)

**Features**:
- Automatic cleanup of incomplete uploads (7 days)
- CORS for browser access
- No versioning to minimize costs

### 2. IAM (Identity & Access Management)

**Purpose**: Secure access control for services and CI/CD

**Service Accounts**:

1. **imgproxy Service Account**
   - Permission: `ObjectStorageReadOnly`
   - Used by: Serverless Container
   - Access: Read images from S3 bucket

2. **GitHub Actions Service Account**
   - Permission: `AllProductsFullAccess`
   - Used by: CI/CD pipelines
   - Access: Manage all infrastructure resources

**API Keys**:
- Generated for each service account
- No expiration by default
- Stored securely in GitHub Secrets

### 3. Serverless Container (imgproxy)

**Purpose**: On-demand image processing and transformation

**Container Specification**:
- Image: `darthsim/imgproxy:latest`
- CPU: 1 vCPU (1000 mVCPU)
- Memory: 2 GB (2048 MB)
- Port: 8080
- Protocol: HTTP/1.1

**Scaling**:
- Min instances: 0 (scale to zero)
- Max instances: 5
- Timeout: 300 seconds

**imgproxy Configuration**:
```yaml
IMGPROXY_USE_S3: true
IMGPROXY_S3_ENDPOINT: https://s3.fr-par.scw.cloud
IMGPROXY_S3_REGION: fr-par
IMGPROXY_ENABLE_WEBP_DETECTION: true
IMGPROXY_ENFORCE_WEBP: false
IMGPROXY_QUALITY: 85
IMGPROXY_GZIP_COMPRESSION: 5
IMGPROXY_MAX_SRC_RESOLUTION: 50
```

**Environment Variables** (Secrets):
- `AWS_ACCESS_KEY_ID`: From IAM module
- `AWS_SECRET_ACCESS_KEY`: From IAM module

## Data Flow

### Image Request Flow

```
1. User → HTTPS Request → imgproxy Container
   Example: https://imgproxy-xxx.containers.scw.cloud/resize:fill:300:200/s3://bucket/image.jpg

2. imgproxy → Parses URL → Extracts S3 path and transformations

3. imgproxy → S3 API Request → Downloads source image
   Uses: IAM credentials (read-only access)

4. imgproxy → Processes image → Applies transformations
   - Resize, crop, format conversion
   - WebP conversion if supported
   - Compression

5. imgproxy → Response → Optimized image
   - HTTPS delivery
   - Gzip compression
   - Cache headers
```

## Security Model

### Access Control

1. **S3 Bucket**:
   - Public read access for images
   - Write access only via IAM credentials
   - No anonymous uploads

2. **imgproxy Container**:
   - Public HTTPS endpoint
   - No URL signature (can be enabled)
   - S3 credentials stored as secrets

3. **IAM Policies**:
   - Least privilege principle
   - imgproxy: Read-only S3 access
   - GitHub Actions: Full infrastructure access

### Secrets Management

```
┌─────────────────────┐
│  GitHub Secrets     │
│                     │
│  • SCALEWAY_ACCESS  │
│  • SCALEWAY_SECRET  │
│  • ORG_ID           │
│  • PROJECT_ID       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Terraform State    │
│  (Scaleway S3)      │
│                     │
│  • Encrypted        │
│  • IAM protected    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Container Secrets  │
│                     │
│  • S3 credentials   │
│  • Environment vars │
└─────────────────────┘
```

### Network Security

- All communication over HTTPS
- No custom VPC required
- Public endpoints with rate limiting

## Cost Optimization

### Scale-to-Zero Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Traffic Pattern          │  Instances  │  Cost        │
├──────────────────────────────────────────────────────────┤
│  No traffic (idle)        │      0      │  €0/month    │
│  Low traffic (< 1 req/s)  │      1      │  ~€2/month   │
│  Medium (1-10 req/s)      │    1-3      │  ~€10/month  │
│  High (> 10 req/s)        │    3-5      │  ~€20/month  │
└─────────────────────────────────────────────────────────┘
```

### Storage Costs

- S3 storage: ~€0.02/GB/month
- Data transfer: ~€0.01/GB (first 75GB free)
- No charges for idle storage

### Best Practices

1. **Enable CDN**: Cache processed images
2. **Lifecycle rules**: Clean up old versions
3. **Compression**: Enable gzip (already configured)
4. **Quality tuning**: Balance quality vs size (85 is optimal)

## Monitoring & Observability

### Available Metrics (Scaleway Console)

**Container Metrics**:
- Request count
- Request duration
- Active instances
- CPU usage
- Memory usage
- Error rate

**S3 Metrics**:
- Storage size
- Request count
- Bandwidth usage

### Logging

**Container Logs**:
- Available in Scaleway Console
- Real-time log streaming
- 7-day retention (default)

**Access Logs**:
- S3 access logging (optional)
- Request timing
- Error tracking

## Disaster Recovery

### Backup Strategy

1. **S3 Data**:
   - Source images stored in S3
   - No automatic backups (single region)
   - Consider manual backup to another region

2. **Terraform State**:
   - Stored in S3 bucket
   - Encrypted at rest
   - No versioning (optional to enable)

### Recovery Procedures

1. **Container Failure**:
   - Auto-recovery via Scaleway platform
   - New instance spawned automatically
   - No manual intervention needed

2. **S3 Bucket Deletion**:
   - **Prevention**: Lifecycle policies
   - **Recovery**: Restore from backups (if enabled)
   - **Critical**: No built-in point-in-time recovery

3. **Infrastructure Destruction**:
   - Terraform state allows full recreation
   - Re-run: `terragrunt run-all apply`
   - Restore S3 data from backups

## Scalability

### Horizontal Scaling

- **Container**: Auto-scales 0-5 instances
- **S3**: Unlimited storage capacity
- **Bandwidth**: Scaleway CDN for global distribution

### Vertical Scaling

**Container Resources** (modify in Terragrunt):
```hcl
cpu_limit    = 2000  # 2 vCPU
memory_limit = 4096  # 4 GB
max_scale    = 20    # More instances
```

### Geographic Scaling

**Multi-Region Deployment**:
1. Create separate environments per region
2. Deploy infrastructure in each region
3. Use DNS-based routing (Route53, Cloudflare)

## Design Decisions

### Why Serverless Container?

**Pros**:
- Scale to zero (cost savings)
- No server management
- Auto-scaling
- Pay per use

**Cons**:
- Cold start latency (mitigated with min_scale)
- Regional limitations

### Why Single Region?

**Pros**:
- Simpler architecture
- Lower latency within region
- Reduced costs

**Cons**:
- No geographic redundancy
- Higher latency for distant users

**Mitigation**: Add CDN for global distribution

### Why No URL Signatures?

**Current State**: Disabled for simplicity

**Production Recommendation**: Enable for security
```hcl
imgproxy_enable_url_signature = true
imgproxy_signature_key        = "<secret-key>"
imgproxy_signature_salt       = "<secret-salt>"
```

## Future Enhancements

1. **CDN Integration**: Add Cloudflare/Scaleway CDN
2. **URL Signatures**: Enable for production
3. **Multi-Region**: Deploy in additional regions
4. **Monitoring**: Prometheus/Grafana integration
5. **Backups**: Automated S3 cross-region replication
6. **Custom Domain**: Configure custom domain for imgproxy
7. **Rate Limiting**: Implement rate limiting per IP
