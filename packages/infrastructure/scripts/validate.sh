#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Infrastructure Validation Script"
echo "=================================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Check for Terraform/OpenTofu
if command -v tofu &> /dev/null; then
    TERRAFORM_CMD="tofu"
elif command -v terraform &> /dev/null; then
    TERRAFORM_CMD="terraform"
else
    echo -e "${RED}✗${NC} Neither OpenTofu nor Terraform found"
    exit 1
fi

echo "Step 1: Format check..."
echo "Checking Terraform formatting..."

if $TERRAFORM_CMD fmt -check -recursive terraform/; then
    echo -e "${GREEN}✓${NC} All Terraform files are properly formatted"
else
    echo -e "${YELLOW}⚠${NC} Some files need formatting"
    echo "Run '$TERRAFORM_CMD fmt -recursive terraform/' to fix"
    echo ""
fi

echo ""
echo "Step 2: Validate Terraform modules..."

# Validate each module individually
MODULES=(
    "terraform/modules/object-storage"
    "terraform/modules/iam"
    "terraform/modules/serverless-container"
)

for module in "${MODULES[@]}"; do
    echo "Validating $module..."
    (
        cd "$module"
        $TERRAFORM_CMD init -backend=false > /dev/null 2>&1
        if $TERRAFORM_CMD validate; then
            echo -e "${GREEN}✓${NC} $module is valid"
        else
            echo -e "${RED}✗${NC} $module validation failed"
            exit 1
        fi
    )
done

echo ""
echo "Step 3: Validate Terragrunt configuration..."

# Navigate to production environment
cd environments/production

# Validate all modules with Terragrunt
echo "Running 'terragrunt run --all -- validate'..."
if terragrunt run --all --non-interactive -- validate; then
    echo -e "${GREEN}✓${NC} All Terragrunt configurations are valid"
else
    echo -e "${RED}✗${NC} Terragrunt validation failed"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Validation complete!${NC}"
echo ""
echo "All checks passed. You can now run 'pnpm run plan' to preview changes."
echo ""
