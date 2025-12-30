# Namespace variables
variable "namespace_name" {
  description = "Name of the container namespace"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]{1,50}$", var.namespace_name))
    error_message = "Namespace name must be lowercase alphanumeric with hyphens, max 50 characters."
  }
}

variable "namespace_description" {
  description = "Description of the container namespace"
  type        = string
  default     = "Namespace for imgproxy image processing service"
}

variable "region" {
  description = "Scaleway region for the container"
  type        = string
  default     = "fr-par"

  validation {
    condition     = contains(["fr-par", "nl-ams", "pl-waw"], var.region)
    error_message = "Region must be one of: fr-par, nl-ams, pl-waw."
  }
}

variable "namespace_environment_variables" {
  description = "Environment variables for the namespace"
  type        = map(string)
  default     = {}
}

variable "namespace_secret_environment_variables" {
  description = "Secret environment variables for the namespace"
  type        = map(string)
  default     = {}
  sensitive   = true
}

# Container variables
variable "container_name" {
  description = "Name of the imgproxy container"
  type        = string
  default     = "imgproxy"

  validation {
    condition     = can(regex("^[a-z0-9-]{1,50}$", var.container_name))
    error_message = "Container name must be lowercase alphanumeric with hyphens, max 50 characters."
  }
}

variable "imgproxy_image" {
  description = "Container registry image for imgproxy"
  type        = string
  default     = "darthsim/imgproxy:latest"
}

# Resource limits
variable "cpu_limit" {
  description = "CPU limit in mVCPU (1000 = 1 vCPU)"
  type        = number
  default     = 1000

  validation {
    condition     = var.cpu_limit >= 140 && var.cpu_limit <= 16000
    error_message = "CPU limit must be between 140 and 16000 mVCPU."
  }
}

variable "memory_limit" {
  description = "Memory limit in MB"
  type        = number
  default     = 2048

  validation {
    condition     = var.memory_limit >= 128 && var.memory_limit <= 32768
    error_message = "Memory limit must be between 128 and 32768 MB."
  }
}

# Scaling configuration
variable "min_scale" {
  description = "Minimum number of container instances (0 for scale-to-zero)"
  type        = number
  default     = 0

  validation {
    condition     = var.min_scale >= 0 && var.min_scale <= 20
    error_message = "Min scale must be between 0 and 20."
  }
}

variable "max_scale" {
  description = "Maximum number of container instances"
  type        = number
  default     = 5

  validation {
    condition     = var.max_scale >= 1 && var.max_scale <= 20
    error_message = "Max scale must be between 1 and 20."
  }
}

variable "timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300

  validation {
    condition     = var.timeout >= 10 && var.timeout <= 900
    error_message = "Timeout must be between 10 and 900 seconds."
  }
}

variable "privacy" {
  description = "Privacy setting for the container (public or private)"
  type        = string
  default     = "public"

  validation {
    condition     = contains(["public", "private"], var.privacy)
    error_message = "Privacy must be either 'public' or 'private'."
  }
}

variable "protocol" {
  description = "Protocol for the container (http1 or h2c)"
  type        = string
  default     = "http1"

  validation {
    condition     = contains(["http1", "h2c"], var.protocol)
    error_message = "Protocol must be either 'http1' or 'h2c'."
  }
}

variable "port" {
  description = "Port on which the container listens"
  type        = number
  default     = 8080

  validation {
    condition     = var.port >= 1 && var.port <= 65535
    error_message = "Port must be between 1 and 65535."
  }
}

variable "http_option" {
  description = "HTTP option for the container (enabled or redirected)"
  type        = string
  default     = "enabled"

  validation {
    condition     = contains(["enabled", "redirected"], var.http_option)
    error_message = "HTTP option must be either 'enabled' or 'redirected'."
  }
}

variable "auto_deploy" {
  description = "Whether to automatically deploy the container"
  type        = bool
  default     = true
}

# S3 Configuration
variable "s3_endpoint" {
  description = "S3 endpoint URL (e.g., https://s3.fr-par.scw.cloud)"
  type        = string
}

variable "s3_region" {
  description = "S3 region"
  type        = string
}

variable "s3_access_key_id" {
  description = "S3 access key ID (from IAM module)"
  type        = string
  sensitive   = true
}

variable "s3_secret_access_key" {
  description = "S3 secret access key (from IAM module)"
  type        = string
  sensitive   = true
}

# imgproxy Configuration
variable "imgproxy_enable_webp_detection" {
  description = "Enable WebP detection"
  type        = string
  default     = "true"
}

variable "imgproxy_enforce_webp" {
  description = "Enforce WebP format"
  type        = string
  default     = "false"
}

variable "imgproxy_quality" {
  description = "Image quality (0-100)"
  type        = number
  default     = 85

  validation {
    condition     = var.imgproxy_quality >= 0 && var.imgproxy_quality <= 100
    error_message = "Quality must be between 0 and 100."
  }
}

variable "imgproxy_gzip_level" {
  description = "Gzip compression level (0-9)"
  type        = number
  default     = 5

  validation {
    condition     = var.imgproxy_gzip_level >= 0 && var.imgproxy_gzip_level <= 9
    error_message = "Gzip level must be between 0 and 9."
  }
}

variable "imgproxy_max_src_resolution" {
  description = "Maximum source image resolution in megapixels"
  type        = number
  default     = 50

  validation {
    condition     = var.imgproxy_max_src_resolution > 0
    error_message = "Max source resolution must be greater than 0."
  }
}

variable "imgproxy_allowed_sources" {
  description = "Comma-separated list of allowed source URLs"
  type        = string
  default     = ""
}

variable "imgproxy_enable_url_signature" {
  description = "Enable URL signature protection"
  type        = bool
  default     = false
}

variable "imgproxy_signature_key" {
  description = "URL signature key (required if URL signature is enabled)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "imgproxy_signature_salt" {
  description = "URL signature salt (required if URL signature is enabled)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "imgproxy_download_timeout" {
  description = "Timeout for downloading source images in seconds"
  type        = number
  default     = 10
}

variable "imgproxy_process_timeout" {
  description = "Timeout for image processing in seconds"
  type        = number
  default     = 10
}

variable "imgproxy_base_url" {
  description = "Base url used by image proxy"
  type        = string
  default     = ""
}

# Additional configuration
variable "additional_environment_variables" {
  description = "Additional environment variables"
  type        = map(string)
  default     = {}
}

variable "additional_secret_environment_variables" {
  description = "Additional secret environment variables"
  type        = map(string)
  default     = {}
  sensitive   = true
}

# Custom domain
variable "custom_domain" {
  description = "Custom domain for the container (leave empty to skip)"
  type        = string
  default     = ""
}

variable "create_trigger" {
  description = "Whether to create a container trigger for auto-deployment"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
