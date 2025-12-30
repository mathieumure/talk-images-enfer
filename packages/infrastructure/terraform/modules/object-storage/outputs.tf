output "bucket_id" {
  description = "The ID of the created bucket"
  value       = scaleway_object_bucket.images.id
}

output "bucket_name" {
  description = "The name of the created bucket"
  value       = scaleway_object_bucket.images.name
}

output "bucket_region" {
  description = "The region where the bucket is located"
  value       = scaleway_object_bucket.images.region
}

output "bucket_endpoint" {
  description = "The S3 endpoint URL for the bucket"
  value       = "https://s3.${scaleway_object_bucket.images.region}.scw.cloud"
}

output "bucket_api_endpoint" {
  description = "The full S3 API endpoint for the bucket"
  value       = "https://s3.${scaleway_object_bucket.images.region}.scw.cloud/${scaleway_object_bucket.images.name}"
}

output "bucket_arn" {
  description = "The ARN of the bucket (for IAM policies)"
  value       = "arn:aws:s3:::${scaleway_object_bucket.images.name}"
}

output "versioning_enabled" {
  description = "Whether versioning is enabled on the bucket"
  value       = var.enable_versioning
}

output "public_access_enabled" {
  description = "Whether public access is enabled on the bucket"
  value       = var.enable_public_access
}
