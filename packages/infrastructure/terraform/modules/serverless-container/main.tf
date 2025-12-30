terraform {
  required_version = ">= 1.6.0"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.0"
    }
  }
}

# Container Namespace
resource "scaleway_container_namespace" "main" {
  name        = var.namespace_name
  description = var.namespace_description
  region      = var.region

  environment_variables = var.namespace_environment_variables
  secret_environment_variables = var.namespace_secret_environment_variables

  tags = var.tags
}

# imgproxy Container
resource "scaleway_container" "imgproxy" {
  namespace_id = scaleway_container_namespace.main.id
  name         = var.container_name
  description  = "imgproxy image processing service"

  # Container registry configuration
  registry_image = var.imgproxy_image

  # Resource limits
  cpu_limit    = var.cpu_limit
  memory_limit = var.memory_limit

  # Scaling configuration
  min_scale = var.min_scale
  max_scale = var.max_scale

  # Timeout settings
  timeout = var.timeout

  # Privacy settings
  privacy = var.privacy

  # Protocol
  protocol = var.protocol
  port     = var.port

  # HTTP options
  http_option = var.http_option

  # Environment variables for imgproxy configuration
  environment_variables = merge(
    {
      # S3 Configuration
      IMGPROXY_USE_S3        = "true"
      IMGPROXY_S3_ENDPOINT   = var.s3_endpoint
      IMGPROXY_S3_REGION     = var.s3_region

      # Image processing settings
      IMGPROXY_ENABLE_WEBP_DETECTION = var.imgproxy_enable_webp_detection
      IMGPROXY_ENFORCE_WEBP          = var.imgproxy_enforce_webp
      IMGPROXY_QUALITY               = tostring(var.imgproxy_quality)
      IMGPROXY_GZIP_COMPRESSION      = tostring(var.imgproxy_gzip_level)
      IMGPROXY_MAX_SRC_RESOLUTION    = tostring(var.imgproxy_max_src_resolution)

      # Security settings
      IMGPROXY_ALLOWED_SOURCES = var.imgproxy_allowed_sources
      IMGPROXY_ENABLE_URL_SIGNATURE = var.imgproxy_enable_url_signature ? "true" : "false"

      # Performance settings
      IMGPROXY_DOWNLOAD_TIMEOUT = tostring(var.imgproxy_download_timeout)
      IMGPROXY_PROCESS_TIMEOUT  = tostring(var.imgproxy_process_timeout)
    },
    var.additional_environment_variables
  )

  # Secret environment variables for sensitive data (S3 credentials)
  secret_environment_variables = merge(
    {
      AWS_ACCESS_KEY_ID     = var.s3_access_key_id
      AWS_SECRET_ACCESS_KEY = var.s3_secret_access_key
    },
    var.imgproxy_enable_url_signature ? {
      IMGPROXY_KEY  = var.imgproxy_signature_key
      IMGPROXY_SALT = var.imgproxy_signature_salt
    } : {},
    var.additional_secret_environment_variables
  )

  # Deploy configuration
  deploy = var.auto_deploy

  tags = var.tags
}

# Custom domain (optional)
resource "scaleway_container_domain" "imgproxy" {
  count = var.custom_domain != "" ? 1 : 0

  container_id = scaleway_container.imgproxy.id
  hostname     = var.custom_domain
}

# Container triggers for auto-deployment
resource "scaleway_container_trigger" "main" {
  count = var.create_trigger ? 1 : 0

  container_id = scaleway_container.imgproxy.id
  name         = "${var.container_name}-trigger"
  description  = "Trigger for automatic container updates"
}
