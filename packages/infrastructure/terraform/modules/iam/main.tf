terraform {
  required_version = ">= 1.6.0"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.0"
    }
  }
}

# IAM Application for imgproxy service
resource "scaleway_iam_application" "imgproxy" {
  name        = var.imgproxy_app_name
  description = "Service account for imgproxy serverless container to access S3 bucket"

  # Convert map to list of "key:value" strings for IAM application tags
  tags = [for k, v in var.tags : "${k}:${v}"]
}

# API Key for imgproxy application
resource "scaleway_iam_api_key" "imgproxy" {
  application_id = scaleway_iam_application.imgproxy.id
  description    = "API key for imgproxy to access S3"

  # API keys don't expire by default, but we can set an expiration date if needed
  expires_at = var.imgproxy_key_expires_at
}

# IAM Policy for imgproxy - S3 read access
resource "scaleway_iam_policy" "imgproxy_s3_read" {
  name        = "${var.imgproxy_app_name}-s3-read"
  description = "Allow imgproxy to read from S3 bucket"

  application_id = scaleway_iam_application.imgproxy.id

  rule {
    project_ids          = [var.project_id]
    permission_set_names = ["ObjectStorageReadOnly"]
  }
}

# IAM Application for GitHub Actions
resource "scaleway_iam_application" "github_actions" {
  count = var.create_github_actions_account ? 1 : 0

  name        = var.github_actions_app_name
  description = "Service account for GitHub Actions CI/CD pipelines"

  # Convert map to list of "key:value" strings for IAM application tags
  tags = [for k, v in var.tags : "${k}:${v}"]
}

# API Key for GitHub Actions
resource "scaleway_iam_api_key" "github_actions" {
  count = var.create_github_actions_account ? 1 : 0

  application_id = scaleway_iam_application.github_actions[0].id
  description    = "API key for GitHub Actions to manage infrastructure"

  expires_at = var.github_actions_key_expires_at
}

# IAM Policy for GitHub Actions - Infrastructure management
resource "scaleway_iam_policy" "github_actions_infra" {
  count = var.create_github_actions_account ? 1 : 0

  name        = "${var.github_actions_app_name}-infra-admin"
  description = "Allow GitHub Actions to manage infrastructure resources"

  application_id = scaleway_iam_application.github_actions[0].id

  rule {
    project_ids = [var.project_id]
    # Grant broad permissions for infrastructure management
    # In production, you should restrict this to specific resources
    permission_set_names = [
      "AllProductsFullAccess"
    ]
  }
}

# Optional: Custom IAM Policy for specific S3 bucket access
resource "scaleway_iam_policy" "imgproxy_bucket_specific" {
  count = var.bucket_name != "" ? 1 : 0

  name        = "${var.imgproxy_app_name}-bucket-${var.bucket_name}"
  description = "Allow imgproxy access to specific bucket ${var.bucket_name}"

  application_id = scaleway_iam_application.imgproxy.id

  rule {
    project_ids = [var.project_id]
    # This would be more restrictive in a real scenario
    # Scaleway IAM doesn't support resource-level permissions yet
    permission_set_names = ["ObjectStorageReadOnly"]
  }
}
