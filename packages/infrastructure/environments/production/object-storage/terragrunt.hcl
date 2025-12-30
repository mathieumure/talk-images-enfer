# Object Storage Module Configuration for Production

include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../terraform/modules/object-storage"
}

# Dependencies
# Object Storage has no dependencies

locals {
  # Load environment variables
  env_vars = read_terragrunt_config("${get_terragrunt_dir()}/../terragrunt.hcl")

  # Bucket name must be globally unique
  bucket_name = "${local.env_vars.inputs.name_prefix}-images"
  region      = local.env_vars.inputs.region
  tags        = local.env_vars.inputs.tags
}

inputs = {
  # Bucket configuration
  bucket_name          = local.bucket_name
  region               = local.region
  enable_public_access = true
  enable_versioning    = false

  # Lifecycle rules for cost optimization
  lifecycle_rules_enabled            = true
  noncurrent_version_expiration_days = 30
  abort_incomplete_uploads_days      = 7

  # Website hosting (optional)
  enable_website = false

  # CORS for browser access
  enable_cors = true
  cors_allowed_origins = [
    "*"  # In production, restrict to specific domains
  ]
  cors_allowed_methods = ["GET", "HEAD"]
  cors_allowed_headers = ["*"]
  cors_expose_headers  = ["ETag"]
  cors_max_age_seconds = 3600

  # Tags
  tags = local.tags
}
