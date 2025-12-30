#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Infrastructure Setup Script"
echo "=================================================="
echo ""

# Check required tools
echo "Checking required tools..."

# Check for Terraform/OpenTofu
if command -v tofu &> /dev/null; then
    TERRAFORM_CMD="tofu"
    echo -e "${GREEN}✓${NC} OpenTofu found: $(tofu version | head -n 1)"
elif command -v terraform &> /dev/null; then
    TERRAFORM_CMD="terraform"
    echo -e "${GREEN}✓${NC} Terraform found: $(terraform version | head -n 1)"
else
    echo -e "${RED}✗${NC} Neither OpenTofu nor Terraform found"
    echo "Please install OpenTofu (https://opentofu.org/) or Terraform (https://www.terraform.io/)"
    exit 1
fi

# Check for Terragrunt
if command -v terragrunt &> /dev/null; then
    echo -e "${GREEN}✓${NC} Terragrunt found: $(terragrunt --version)"
else
    echo -e "${RED}✗${NC} Terragrunt not found"
    echo "Please install Terragrunt: https://terragrunt.gruntwork.io/docs/getting-started/install/"
    exit 1
fi

# Check for jq
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✓${NC} jq found: $(jq --version)"
else
    echo -e "${YELLOW}⚠${NC} jq not found (optional, but recommended)"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
fi

echo ""
echo "Checking environment variables..."

# Check for required environment variables
REQUIRED_VARS=(
    "SCALEWAY_ACCESS_KEY"
    "SCALEWAY_SECRET_KEY"
    "SCALEWAY_ORGANIZATION_ID"
    "SCALEWAY_PROJECT_ID"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
        echo -e "${RED}✗${NC} $var is not set"
    else
        # Show first 4 characters only for security
        value="${!var}"
        masked="${value:0:4}..."
        echo -e "${GREEN}✓${NC} $var is set ($masked)"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required environment variables${NC}"
    echo ""
    echo "Please set the following variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  export $var=\"your-value\""
    done
    echo ""
    echo "You can also create a .env file in the infrastructure directory:"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your credentials"
    echo "  source .env"
    exit 1
fi

echo ""
echo "Initializing Terragrunt modules..."

# Navigate to production environment
cd "$(dirname "$0")/../environments/production"

# Initialize all modules
echo "Running 'terragrunt run --all -- init'..."
terragrunt run --all --non-interactive -- init

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review configuration in environments/production/"
echo "  2. Run 'pnpm run validate' to validate the configuration"
echo "  3. Run 'pnpm run plan' to preview changes"
echo "  4. Run 'pnpm run apply' to deploy infrastructure"
echo ""
