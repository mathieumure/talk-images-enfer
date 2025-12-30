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

# Note: Lifecycle rules, CORS, and website configuration are not supported
# as separate Terraform resources in the Scaleway provider.
# These can be configured via AWS CLI or S3 API if needed, as Scaleway S3
# is compatible with AWS S3.
