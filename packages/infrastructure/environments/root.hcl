# Root Terragrunt Configuration
# This file contains common configuration for all environments

# Configure Terragrunt to use S3-compatible backend on Scaleway for state management
remote_state {
  backend = "s3"

  config = {
    # Scaleway Object Storage endpoint
    endpoint = "https://s3.fr-par.scw.cloud"
    region   = "fr-par"

    # State bucket and key
    bucket = "talk-images-enfer-terraform-state"
    key    = "${path_relative_to_include()}/terraform.tfstate"

    # S3-compatible settings
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_metadata_api_check     = true
    use_path_style              = false

    # Encryption
    encrypt = true
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# Generate provider configuration
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"

  contents = <<-EOF
    provider "scaleway" {
      # Credentials and settings from environment variables:
      # - SCALEWAY_ACCESS_KEY
      # - SCALEWAY_SECRET_KEY
      # - SCALEWAY_ORGANIZATION_ID
      # - SCALEWAY_PROJECT_ID
      # Region is set via module inputs
    }
  EOF
}

# Inputs that are common to all modules
inputs = {
  # These will be overridden by environment-specific values
  region          = ""
  zone            = ""
  organization_id = ""
  project_id      = ""
}
