variable "bucket_name" {
  description = "Name of the S3 bucket for images"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", var.bucket_name))
    error_message = "Bucket name must be 3-63 characters, lowercase alphanumeric with hyphens, and cannot start or end with a hyphen."
  }
}

variable "region" {
  description = "Scaleway region for the bucket"
  type        = string
  default     = "fr-par"

  validation {
    condition     = contains(["fr-par", "nl-ams", "pl-waw"], var.region)
    error_message = "Region must be one of: fr-par, nl-ams, pl-waw."
  }
}

variable "enable_public_access" {
  description = "Enable public read access to the bucket"
  type        = bool
  default     = true
}

variable "enable_versioning" {
  description = "Enable versioning for the bucket"
  type        = bool
  default     = false
}

variable "lifecycle_rules_enabled" {
  description = "Enable lifecycle rules for automatic cleanup"
  type        = bool
  default     = true
}

variable "noncurrent_version_expiration_days" {
  description = "Number of days to keep non-current versions before deletion"
  type        = number
  default     = 30

  validation {
    condition     = var.noncurrent_version_expiration_days >= 1
    error_message = "Expiration days must be at least 1."
  }
}

variable "abort_incomplete_uploads_days" {
  description = "Number of days after which to abort incomplete multipart uploads"
  type        = number
  default     = 7

  validation {
    condition     = var.abort_incomplete_uploads_days >= 1
    error_message = "Abort incomplete uploads days must be at least 1."
  }
}

variable "enable_website" {
  description = "Enable static website hosting on the bucket"
  type        = bool
  default     = false
}

variable "enable_cors" {
  description = "Enable CORS configuration for browser access"
  type        = bool
  default     = true
}

variable "cors_allowed_headers" {
  description = "List of allowed headers for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "cors_allowed_methods" {
  description = "List of allowed HTTP methods for CORS"
  type        = list(string)
  default     = ["GET", "HEAD"]
}

variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "cors_expose_headers" {
  description = "List of headers to expose in CORS responses"
  type        = list(string)
  default     = ["ETag"]
}

variable "cors_max_age_seconds" {
  description = "Maximum time in seconds that browsers can cache CORS preflight responses"
  type        = number
  default     = 3600
}

variable "tags" {
  description = "Tags to apply to the bucket"
  type        = map(string)
  default     = {}
}
