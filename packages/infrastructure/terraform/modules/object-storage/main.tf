terraform {
  required_version = ">= 1.6.0"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.0"
    }
  }
}

# S3 bucket for storing images
resource "scaleway_object_bucket" "images" {
  name   = var.bucket_name
  region = var.region

  # Enable versioning if specified
  versioning {
    enabled = var.enable_versioning
  }

  tags = var.tags
}

# Bucket ACL for public read access
resource "scaleway_object_bucket_acl" "images" {
  count = var.enable_public_access ? 1 : 0

  bucket = scaleway_object_bucket.images.name
  region = var.region
  acl    = "public-read"
}

# Lifecycle policy for automatic cleanup of old versions
resource "scaleway_object_bucket_lifecycle_rule" "images" {
  count = var.lifecycle_rules_enabled ? 1 : 0

  bucket = scaleway_object_bucket.images.name
  region = var.region

  rule {
    id      = "cleanup-old-versions"
    enabled = true

    # Delete non-current versions after specified days
    noncurrent_version_expiration {
      days = var.noncurrent_version_expiration_days
    }

    # Abort incomplete multipart uploads
    abort_incomplete_multipart_upload {
      days_after_initiation = var.abort_incomplete_uploads_days
    }
  }
}

# Optional: Bucket website configuration for direct access
resource "scaleway_object_bucket_website_configuration" "images" {
  count = var.enable_website ? 1 : 0

  bucket = scaleway_object_bucket.images.name
  region = var.region

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# CORS configuration for browser access
resource "scaleway_object_bucket_cors_rule" "images" {
  count = var.enable_cors ? 1 : 0

  bucket = scaleway_object_bucket.images.name
  region = var.region

  cors_rule {
    allowed_headers = var.cors_allowed_headers
    allowed_methods = var.cors_allowed_methods
    allowed_origins = var.cors_allowed_origins
    expose_headers  = var.cors_expose_headers
    max_age_seconds = var.cors_max_age_seconds
  }
}
