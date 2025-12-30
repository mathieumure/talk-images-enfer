# Serverless Container Module Configuration for Production

include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../terraform/modules/serverless-container"
}

locals {
  # Load environment variables
  env_vars = read_terragrunt_config("${get_terragrunt_dir()}/../terragrunt.hcl")

  # Load region config
  region_vars = read_terragrunt_config("${get_terragrunt_dir()}/../region.hcl")

  # Extract common values
  name_prefix = local.env_vars.inputs.name_prefix
  region      = local.env_vars.inputs.region
  tags        = local.env_vars.inputs.tags
}

# Dependencies - this module depends on IAM and Object Storage
dependency "iam" {
  config_path = "../iam"

  # Mock outputs for plan/validate
  mock_outputs = {
    imgproxy_access_key_id = "mock-access-key"
    imgproxy_secret_key    = "mock-secret-key"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs_merge_strategy_with_state  = "shallow"
}

dependency "object_storage" {
  config_path = "../object-storage"

  # Mock outputs for plan/validate
  mock_outputs = {
    bucket_endpoint = "https://s3.fr-par.scw.cloud"
    bucket_region   = "fr-par"
    bucket_name     = "mock-bucket"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs_merge_strategy_with_state  = "shallow"
}

inputs = {
  # Namespace configuration
  namespace_name        = "${local.name_prefix}-imgproxy"
  namespace_description = "Production imgproxy namespace for image processing"
  region                = local.region

  # Container configuration
  container_name = "imgproxy"
  imgproxy_image = "darthsim/imgproxy:latest"

  # Resource limits
  cpu_limit    = 1000  # 1 vCPU
  memory_limit = 2048  # 2 GB

  # Scaling configuration (scale to zero for cost optimization)
  min_scale = 0  # Scale to zero when idle
  max_scale = 5  # Maximum instances

  # Timeout settings
  timeout = 300  # 5 minutes

  # Privacy and protocol
  privacy     = "public"
  protocol    = "http1"
  port        = 8080
  http_option = "enabled"

	# Base url
	imgproxy_base_url = dependency.object_storage.outputs.bucket_api_endpoint

  # Auto-deploy
  auto_deploy = true

  # S3 Configuration (from dependencies)
  s3_endpoint          = dependency.object_storage.outputs.bucket_endpoint
  s3_region            = dependency.object_storage.outputs.bucket_region
  s3_access_key_id     = dependency.iam.outputs.imgproxy_access_key_id
  s3_secret_access_key = dependency.iam.outputs.imgproxy_secret_key

  # imgproxy Configuration (matching docker-compose.yml)
  imgproxy_enable_webp_detection = "true"
  imgproxy_enforce_webp          = "false"
  imgproxy_quality               = 85
  imgproxy_gzip_level            = 5
  imgproxy_max_src_resolution    = 50

  # Security settings
  imgproxy_allowed_sources = ""  # Allow all sources, restrict in production
  imgproxy_enable_url_signature = false
  # If URL signature is enabled, set these:
  # imgproxy_signature_key  = get_env("IMGPROXY_KEY", "")
  # imgproxy_signature_salt = get_env("IMGPROXY_SALT", "")

  # Performance settings
  imgproxy_download_timeout = 10
  imgproxy_process_timeout  = 10

  # Custom domain (optional)
  custom_domain = ""  # Set to your custom domain if needed

  # Container trigger for auto-deployment
  create_trigger = false

  # Tags
  tags = local.tags
}
