variable "project_id" {
  description = "Scaleway project ID where resources will be created"
  type        = string
}

variable "imgproxy_app_name" {
  description = "Name of the IAM application for imgproxy"
  type        = string
  default     = "imgproxy-service"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,50}$", var.imgproxy_app_name))
    error_message = "Application name must be 3-50 characters, lowercase alphanumeric with hyphens."
  }
}

variable "imgproxy_key_expires_at" {
  description = "Expiration date for imgproxy API key (RFC3339 format, e.g., '2025-12-31T23:59:59Z'). Leave null for no expiration."
  type        = string
  default     = null
}

variable "github_actions_app_name" {
  description = "Name of the IAM application for GitHub Actions"
  type        = string
  default     = "github-actions-ci"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,50}$", var.github_actions_app_name))
    error_message = "Application name must be 3-50 characters, lowercase alphanumeric with hyphens."
  }
}

variable "create_github_actions_account" {
  description = "Whether to create a service account for GitHub Actions"
  type        = bool
  default     = true
}

variable "github_actions_key_expires_at" {
  description = "Expiration date for GitHub Actions API key (RFC3339 format). Leave null for no expiration."
  type        = string
  default     = null
}

variable "bucket_name" {
  description = "S3 bucket name for bucket-specific IAM policy (leave empty to skip)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to IAM resources"
  type        = map(string)
  default     = {}
}
