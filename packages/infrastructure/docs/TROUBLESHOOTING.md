# Troubleshooting Guide

Common issues and solutions for the Scaleway infrastructure.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Deployment Issues](#deployment-issues)
- [Runtime Issues](#runtime-issues)
- [State Management Issues](#state-management-issues)
- [Performance Issues](#performance-issues)
- [Cost Issues](#cost-issues)

## Setup Issues

### Error: OpenTofu/Terraform not found

**Symptom**:
```
✗ Neither OpenTofu nor Terraform found
```

**Solution**:
Install OpenTofu or Terraform:

```bash
# macOS
brew install opentofu

# Linux
snap install --classic opentofu
```

Verify installation:
```bash
tofu version
# or
terraform version
```

### Error: Terragrunt not found

**Symptom**:
```
✗ Terragrunt not found
```

**Solution**:
Install Terragrunt:

```bash
# Download latest release
wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.54.0/terragrunt_darwin_amd64
chmod +x terragrunt_darwin_amd64
sudo mv terragrunt_darwin_amd64 /usr/local/bin/terragrunt

# Verify
terragrunt --version
```

### Error: Missing environment variables

**Symptom**:
```
✗ SCALEWAY_ACCESS_KEY is not set
```

**Solution**:

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add credentials:
   ```bash
   export SCALEWAY_ACCESS_KEY="SCW..."
   export SCALEWAY_SECRET_KEY="..."
   export SCALEWAY_ORGANIZATION_ID="..."
   export SCALEWAY_PROJECT_ID="..."
   ```

3. Load environment:
   ```bash
   source .env
   ```

4. Verify:
   ```bash
   echo $SCALEWAY_ACCESS_KEY
   ```

## Deployment Issues

### Error: State bucket not found

**Symptom**:
```
Error: Failed to get existing workspaces: operation error S3: ListBuckets
```

**Cause**: Terraform state bucket doesn't exist yet.

**Solution**:

Create the state bucket manually:

```bash
# Using AWS CLI with Scaleway endpoint
aws s3 mb s3://talk-images-enfer-terraform-state \
  --endpoint-url https://s3.fr-par.scw.cloud \
  --region fr-par

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket talk-images-enfer-terraform-state \
  --endpoint-url https://s3.fr-par.scw.cloud \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Error: Bucket name already taken

**Symptom**:
```
Error: Error creating bucket: BucketAlreadyExists
```

**Cause**: S3 bucket names must be globally unique.

**Solution**:

Change bucket name in `environments/production/object-storage/terragrunt.hcl`:

```hcl
locals {
  bucket_name = "talk-images-prod-images-${random_id}"
  # Or use your custom name
  bucket_name = "your-unique-bucket-name"
}
```

### Error: Invalid credentials

**Symptom**:
```
Error: error configuring Scaleway provider: token is required
```

**Cause**: Invalid or missing Scaleway credentials.

**Solution**:

1. Verify credentials in Scaleway Console
2. Generate new API keys if needed
3. Update `.env` file
4. Re-source environment:
   ```bash
   source .env
   ```

### Error: Resource already exists

**Symptom**:
```
Error: A resource with this name already exists
```

**Cause**: Resource was created outside Terraform or state is out of sync.

**Solution**:

**Option 1**: Import existing resource
```bash
cd environments/production/<module>
terragrunt import <resource_type>.<resource_name> <resource_id>
```

**Option 2**: Remove from Terraform (if created manually)
```bash
# Remove from configuration
# Then apply
terragrunt apply
```

**Option 3**: Delete and recreate
```bash
# Manually delete in Scaleway Console
# Then apply
terragrunt apply
```

### Error: Module dependency failure

**Symptom**:
```
Error: Module dependency failed to provide outputs
```

**Cause**: Parent module failed or hasn't been applied yet.

**Solution**:

Deploy modules in order:

```bash
# 1. Deploy IAM first
./scripts/apply.sh --module iam

# 2. Deploy Object Storage
./scripts/apply.sh --module object-storage

# 3. Deploy Serverless Container (depends on both)
./scripts/apply.sh --module serverless-container
```

## Runtime Issues

### Error: Container not starting

**Symptom**: Container shows as "error" in Scaleway Console

**Diagnostic**:
```bash
# Check container logs in Scaleway Console
# Or use Scaleway CLI
scw container container get <container-id>
```

**Common Causes**:

1. **Invalid S3 credentials**
   - Verify IAM credentials in module outputs
   - Check container environment variables

2. **Port mismatch**
   - Ensure port 8080 is configured
   - Check protocol is set to http1

3. **Memory limits too low**
   - Increase memory limit in configuration

**Solution**:
```hcl
# environments/production/serverless-container/terragrunt.hcl
inputs = {
  memory_limit = 4096  # Increase to 4GB
  cpu_limit    = 2000  # Increase to 2 vCPU
}
```

### Error: 403 Forbidden when accessing images

**Symptom**:
```
403 Forbidden
Access Denied
```

**Cause**: S3 bucket ACL not set to public-read

**Solution**:

1. Verify bucket configuration:
   ```bash
   cd environments/production/object-storage
   terragrunt output
   ```

2. Ensure public access is enabled:
   ```hcl
   # environments/production/object-storage/terragrunt.hcl
   inputs = {
     enable_public_access = true
   }
   ```

3. Re-apply:
   ```bash
   terragrunt apply
   ```

### Error: imgproxy can't access S3

**Symptom**:
```
Error downloading source image
```

**Cause**: Invalid S3 credentials or permissions

**Diagnostic**:

1. Check imgproxy logs in Scaleway Console
2. Verify S3 credentials:
   ```bash
   cd environments/production/iam
   terragrunt output imgproxy_access_key_id
   ```

3. Test S3 access manually:
   ```bash
   export AWS_ACCESS_KEY_ID="<imgproxy-key>"
   export AWS_SECRET_ACCESS_KEY="<imgproxy-secret>"

   aws s3 ls s3://talk-images-prod-images-bucket/ \
     --endpoint-url https://s3.fr-par.scw.cloud
   ```

**Solution**:

Recreate IAM credentials:
```bash
cd environments/production/iam
terragrunt destroy
terragrunt apply

# Update serverless container with new credentials
cd ../serverless-container
terragrunt apply
```

### Error: Cold start timeout

**Symptom**: First request after idle period times out

**Cause**: Container scaling from zero takes time

**Solution**:

Set minimum instances to keep container warm:

```hcl
# environments/production/serverless-container/terragrunt.hcl
inputs = {
  min_scale = 1  # Keep 1 instance always running
}
```

**Trade-off**: Increases costs (~€2-5/month for 1 instance)

## State Management Issues

### Error: State lock timeout

**Symptom**:
```
Error: Error acquiring the state lock
```

**Cause**: Concurrent Terraform operations or stale lock

**Solution**:

**If you're sure no other operations are running**:

1. Wait 10 minutes for lock to timeout
2. Or force unlock (use with caution):
   ```bash
   cd environments/production/<module>
   terragrunt force-unlock <lock-id>
   ```

### Error: State file corrupted

**Symptom**:
```
Error: State file appears to be corrupted
```

**Solution**:

1. **Backup current state**:
   ```bash
   aws s3 cp s3://talk-images-enfer-terraform-state/production/ ./state-backup/ \
     --recursive --endpoint-url https://s3.fr-par.scw.cloud
   ```

2. **Restore from backup** (if available):
   ```bash
   aws s3 cp ./state-backup/ s3://talk-images-enfer-terraform-state/production/ \
     --recursive --endpoint-url https://s3.fr-par.scw.cloud
   ```

3. **Or rebuild state**:
   ```bash
   # Import existing resources
   terragrunt import <resource> <id>
   ```

### Error: State drift detected

**Symptom**: Terraform wants to recreate resources that already exist

**Cause**: Manual changes in Scaleway Console

**Solution**:

1. **See what changed**:
   ```bash
   terragrunt plan
   ```

2. **Option 1**: Apply changes to match Terraform
   ```bash
   terragrunt apply
   ```

3. **Option 2**: Update Terraform to match reality
   ```bash
   # Import resource
   terragrunt import <resource> <id>

   # Or update configuration to match
   ```

4. **Option 3**: Refresh state
   ```bash
   terragrunt refresh
   ```

## Performance Issues

### Slow image processing

**Symptom**: Images take long time to process

**Diagnostic**:

1. Check container metrics in Scaleway Console
2. Look for:
   - High CPU usage → Need more CPU
   - High memory usage → Need more memory
   - Many concurrent requests → Need more instances

**Solution**:

Increase resources:
```hcl
# environments/production/serverless-container/terragrunt.hcl
inputs = {
  cpu_limit    = 2000  # 2 vCPU
  memory_limit = 4096  # 4 GB
  max_scale    = 10    # More concurrent instances
}
```

### High latency from certain regions

**Symptom**: Slow response times from specific geographic locations

**Cause**: Single region deployment (fr-par)

**Solution**:

1. **Short term**: Add CDN
   - Cloudflare
   - Scaleway CDN
   - AWS CloudFront

2. **Long term**: Multi-region deployment
   - Deploy infrastructure in multiple regions
   - Use GeoDNS routing

### Container scaling too slowly

**Symptom**: Requests timeout during traffic spikes

**Solution**:

Keep minimum instances running:
```hcl
inputs = {
  min_scale = 2  # Always keep 2 instances warm
  max_scale = 10  # Can scale up to 10
}
```

## Cost Issues

### Unexpected high costs

**Diagnostic**:

1. Check Scaleway billing console
2. Look for:
   - Always-running containers (min_scale > 0)
   - High storage usage
   - High bandwidth usage

**Solution**:

1. **Scale to zero when idle**:
   ```hcl
   inputs = {
     min_scale = 0
   }
   ```

2. **Clean up old images**:
   ```bash
   # Delete unused images
   aws s3 rm s3://talk-images-prod-images-bucket/old/ --recursive \
     --endpoint-url https://s3.fr-par.scw.cloud
   ```

3. **Enable lifecycle rules** (already configured):
   ```hcl
   inputs = {
     lifecycle_rules_enabled = true
     noncurrent_version_expiration_days = 30
   }
   ```

4. **Add CDN to reduce bandwidth**

### Container not scaling to zero

**Symptom**: Container still running with no traffic

**Diagnostic**:

Check Scaleway Console for container metrics

**Cause**:
- Health checks keeping it warm
- Background requests
- min_scale set too high

**Solution**:

```hcl
inputs = {
  min_scale = 0  # Allow scaling to zero
}
```

## Debugging Tips

### Enable verbose logging

```bash
# Terraform debug
export TF_LOG=DEBUG
terragrunt plan

# Terragrunt debug
terragrunt plan --terragrunt-log-level debug
```

### Check container logs

```bash
# Using Scaleway Console
# Navigate to: Containers → Select container → Logs tab

# Or use Scaleway CLI
scw container container logs <container-id>
```

### Test S3 access

```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# List bucket
aws s3 ls s3://talk-images-prod-images-bucket/ \
  --endpoint-url https://s3.fr-par.scw.cloud

# Upload test file
aws s3 cp test.jpg s3://talk-images-prod-images-bucket/ \
  --endpoint-url https://s3.fr-par.scw.cloud

# Download test file
aws s3 cp s3://talk-images-prod-images-bucket/test.jpg . \
  --endpoint-url https://s3.fr-par.scw.cloud
```

### Test imgproxy directly

```bash
# Get container URL
CONTAINER_URL=$(cd environments/production/serverless-container && terragrunt output -raw container_url)

# Health check
curl "${CONTAINER_URL}/health"

# Process test image
curl "${CONTAINER_URL}/resize:fill:300:200/s3://talk-images-prod-images-bucket/test.jpg" \
  --output test-processed.jpg
```

## Getting Help

### Check Documentation

- [Scaleway Docs](https://www.scaleway.com/en/docs/)
- [imgproxy Docs](https://docs.imgproxy.net/)
- [Terragrunt Docs](https://terragrunt.gruntwork.io/docs/)

### Scaleway Support

- Console: https://console.scaleway.com/support
- Community: https://www.scaleway.com/en/community/

### GitHub Issues

Report issues in this repository with:
- Error messages
- Steps to reproduce
- Terraform/Terragrunt versions
- Environment configuration (sanitized)

## Emergency Procedures

### Complete Infrastructure Failure

1. **Stay calm** - Infrastructure can be rebuilt

2. **Check Scaleway status**:
   - https://status.scaleway.com/

3. **Verify credentials**:
   ```bash
   source .env
   echo $SCALEWAY_ACCESS_KEY
   ```

4. **Rebuild from state**:
   ```bash
   cd environments/production
   terragrunt run-all plan
   terragrunt run-all apply
   ```

5. **If state is lost**:
   - Restore from backup
   - Or recreate infrastructure and import resources

### Data Loss Prevention

**Critical**: Set up backups BEFORE disaster occurs!

1. **Enable S3 versioning**:
   ```hcl
   enable_versioning = true
   ```

2. **Cross-region backup**:
   ```bash
   rclone sync scaleway:source-bucket scaleway:backup-bucket
   ```

3. **Regular state backups**:
   ```bash
   # Download state weekly
   aws s3 sync s3://talk-images-enfer-terraform-state/ ./state-backup/ \
     --endpoint-url https://s3.fr-par.scw.cloud
   ```
