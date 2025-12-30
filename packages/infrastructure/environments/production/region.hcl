# Region Configuration for Production Environment

locals {
  # Scaleway region and zone
  region = "fr-par"
  zone   = "fr-par-1"

  # Region-specific settings
  region_config = {
    # S3 endpoint for this region
    s3_endpoint = "https://s3.fr-par.scw.cloud"

    # Container registry endpoint
    registry_endpoint = "rg.fr-par.scw.cloud"
  }
}
