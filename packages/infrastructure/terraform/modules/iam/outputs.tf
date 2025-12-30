# imgproxy outputs
output "imgproxy_application_id" {
  description = "The ID of the imgproxy IAM application"
  value       = scaleway_iam_application.imgproxy.id
}

output "imgproxy_application_name" {
  description = "The name of the imgproxy IAM application"
  value       = scaleway_iam_application.imgproxy.name
}

output "imgproxy_access_key_id" {
  description = "The access key ID for imgproxy (AWS_ACCESS_KEY_ID)"
  value       = scaleway_iam_api_key.imgproxy.access_key
  sensitive   = true
}

output "imgproxy_secret_key" {
  description = "The secret key for imgproxy (AWS_SECRET_ACCESS_KEY)"
  value       = scaleway_iam_api_key.imgproxy.secret_key
  sensitive   = true
}

output "imgproxy_api_key_id" {
  description = "The ID of the imgproxy API key"
  value       = scaleway_iam_api_key.imgproxy.id
}

# GitHub Actions outputs
output "github_actions_application_id" {
  description = "The ID of the GitHub Actions IAM application"
  value       = var.create_github_actions_account ? scaleway_iam_application.github_actions[0].id : null
}

output "github_actions_application_name" {
  description = "The name of the GitHub Actions IAM application"
  value       = var.create_github_actions_account ? scaleway_iam_application.github_actions[0].name : null
}

output "github_actions_access_key_id" {
  description = "The access key ID for GitHub Actions (SCALEWAY_ACCESS_KEY)"
  value       = var.create_github_actions_account ? scaleway_iam_api_key.github_actions[0].access_key : null
  sensitive   = true
}

output "github_actions_secret_key" {
  description = "The secret key for GitHub Actions (SCALEWAY_SECRET_KEY)"
  value       = var.create_github_actions_account ? scaleway_iam_api_key.github_actions[0].secret_key : null
  sensitive   = true
}

output "github_actions_api_key_id" {
  description = "The ID of the GitHub Actions API key"
  value       = var.create_github_actions_account ? scaleway_iam_api_key.github_actions[0].id : null
}

# Policy outputs
output "imgproxy_policy_id" {
  description = "The ID of the imgproxy S3 read policy"
  value       = scaleway_iam_policy.imgproxy_s3_read.id
}

output "github_actions_policy_id" {
  description = "The ID of the GitHub Actions infrastructure policy"
  value       = var.create_github_actions_account ? scaleway_iam_policy.github_actions_infra[0].id : null
}
