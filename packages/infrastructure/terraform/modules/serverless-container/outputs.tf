# Namespace outputs
output "namespace_id" {
  description = "The ID of the container namespace"
  value       = scaleway_container_namespace.main.id
}

output "namespace_name" {
  description = "The name of the container namespace"
  value       = scaleway_container_namespace.main.name
}

output "namespace_region" {
  description = "The region where the namespace is located"
  value       = scaleway_container_namespace.main.region
}

output "namespace_registry_endpoint" {
  description = "The registry endpoint for the namespace"
  value       = scaleway_container_namespace.main.registry_endpoint
}

# Container outputs
output "container_id" {
  description = "The ID of the imgproxy container"
  value       = scaleway_container.imgproxy.id
}

output "container_name" {
  description = "The name of the imgproxy container"
  value       = scaleway_container.imgproxy.name
}

output "container_status" {
  description = "The status of the container"
  value       = scaleway_container.imgproxy.status
}

output "container_endpoint" {
  description = "The endpoint URL for the container"
  value       = scaleway_container.imgproxy.domain_name
}

output "container_url" {
  description = "The full HTTPS URL for accessing the container"
  value       = "https://${scaleway_container.imgproxy.domain_name}"
}

output "container_registry_image" {
  description = "The registry image used by the container"
  value       = scaleway_container.imgproxy.registry_image
}

output "container_region" {
  description = "The region where the container is deployed"
  value       = var.region
}

# Custom domain outputs
output "custom_domain" {
  description = "The custom domain configured for the container (if any)"
  value       = var.custom_domain != "" ? var.custom_domain : null
}

output "custom_domain_url" {
  description = "The full HTTPS URL using the custom domain (if configured)"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : null
}

# Scaling configuration outputs
output "min_scale" {
  description = "The minimum scale configured for the container"
  value       = var.min_scale
}

output "max_scale" {
  description = "The maximum scale configured for the container"
  value       = var.max_scale
}

# Resource allocation outputs
output "cpu_limit" {
  description = "The CPU limit configured for the container (in mVCPU)"
  value       = var.cpu_limit
}

output "memory_limit" {
  description = "The memory limit configured for the container (in MB)"
  value       = var.memory_limit
}

# Trigger outputs
output "trigger_id" {
  description = "The ID of the container trigger (if created)"
  value       = var.create_trigger ? scaleway_container_trigger.main[0].id : null
}

output "trigger_url" {
  description = "The URL to trigger container deployment (if created)"
  value       = var.create_trigger ? scaleway_container_trigger.main[0].url : null
  sensitive   = true
}
