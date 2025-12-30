# Production Environment Configuration

include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  # Load region configuration
  region_vars = read_terragrunt_config("${get_terragrunt_dir()}/region.hcl")

  # Environment-specific variables
  environment = "production"

  # Resource naming prefix
  name_prefix = "talk-images-prod"

  # Environment-specific tags
  env_tags = {
    Environment = local.environment
    CostCenter  = "production"
  }
}

# Environment-wide inputs
inputs = {
  # Region configuration
  region          = local.region_vars.locals.region
  zone            = local.region_vars.locals.zone

  # Scaleway credentials (from environment variables)
  organization_id = get_env("SCALEWAY_ORGANIZATION_ID", "")
  project_id      = get_env("SCALEWAY_PROJECT_ID", "")

  # Common naming
  environment = local.environment
  name_prefix = local.name_prefix

  # Merge environment tags with common tags
  tags = {}
}
