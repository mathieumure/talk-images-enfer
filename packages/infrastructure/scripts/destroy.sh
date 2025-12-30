#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Infrastructure Destroy Script"
echo "=================================================="
echo ""

# Parse arguments
SPECIFIC_MODULE=""
AUTO_APPROVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --module)
            SPECIFIC_MODULE="$2"
            shift 2
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--module <module-name>] [--auto-approve]"
            echo "  Modules: iam, object-storage, serverless-container"
            exit 1
            ;;
    esac
done

# Navigate to production environment
cd "$(dirname "$0")/../environments/production"

echo -e "${RED}⚠️  DANGER: This will DESTROY infrastructure on Scaleway${NC}"
echo ""

if [ -n "$SPECIFIC_MODULE" ]; then
    echo "Module to destroy: $SPECIFIC_MODULE"
else
    echo "This will destroy ALL modules:"
    echo "  - Serverless Container (imgproxy)"
    echo "  - Object Storage (S3 bucket and all images)"
    echo "  - IAM (service accounts and API keys)"
fi

echo ""
echo -e "${RED}⚠️  This action is IRREVERSIBLE!${NC}"
echo -e "${RED}⚠️  All data in the S3 bucket will be permanently deleted!${NC}"
echo ""

if [ "$AUTO_APPROVE" = false ]; then
    read -p "Type 'DESTROY' to confirm: " -r
    echo ""

    if [[ $REPLY != "DESTROY" ]]; then
        echo "Aborted. (You must type 'DESTROY' exactly)"
        exit 0
    fi

    echo ""
    read -p "Are you absolutely sure? (yes/no): " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

echo -e "${RED}Destroying infrastructure...${NC}"
echo ""

if [ -n "$SPECIFIC_MODULE" ]; then
    # Destroy specific module
    echo "Destroying module: $SPECIFIC_MODULE"
    cd "$SPECIFIC_MODULE"

    if [ "$AUTO_APPROVE" = true ]; then
        terragrunt destroy -auto-approve
    else
        terragrunt destroy
    fi
else
    # Destroy all modules (in reverse dependency order)
    echo "Destroying all modules..."

    # Note: Terragrunt handles dependency order automatically
    if [ "$AUTO_APPROVE" = true ]; then
        terragrunt run --all --non-interactive -- destroy -auto-approve
    else
        terragrunt run --all --non-interactive -- destroy
    fi
fi

echo ""
echo -e "${GREEN}✓ Infrastructure destroyed successfully${NC}"
echo ""
echo "All resources have been removed from Scaleway."
echo ""
