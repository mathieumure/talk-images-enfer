# IAM Module Configuration for Production

include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  # Load environment variables
  env_vars = read_terragrunt_config("${get_terragrunt_dir()}/../terragrunt.hcl")

  # Extract inputs
  name_prefix = local.env_vars.inputs.name_prefix
  tags        = local.env_vars.inputs.tags
	project_id  = local.env_vars.inputs.project_id
}

terraform {
  source = "../../../terraform/modules/iam"
}

# Dependencies
# IAM has no dependencies

inputs = {
  # IAM Application names
  imgproxy_app_name       = "${local.name_prefix}-imgproxy"
  github_actions_app_name = "${local.name_prefix}-github-actions"

  # Create GitHub Actions service account
  create_github_actions_account = true

  # API key expiration (optional)
  # imgproxy_key_expires_at       = "2026-12-31T23:59:59Z"
  # github_actions_key_expires_at = "2025-12-31T23:59:59Z"

  # Bucket name for specific IAM policy (will be set after object-storage is created)
  bucket_name = "${local.name_prefix}-images-bucket"
	project_id  = local.project_id

  # Tags
  tags = local.tags
}
