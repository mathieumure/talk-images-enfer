#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Infrastructure Apply Script"
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

echo -e "${YELLOW}⚠ WARNING: This will create/modify infrastructure on Scaleway${NC}"
echo ""

if [ "$AUTO_APPROVE" = false ]; then
    if [ -n "$SPECIFIC_MODULE" ]; then
        echo "Module to deploy: $SPECIFIC_MODULE"
    else
        echo "This will deploy ALL modules:"
        echo "  - IAM (service accounts and policies)"
        echo "  - Object Storage (S3 bucket)"
        echo "  - Serverless Container (imgproxy)"
    fi
    echo ""
    echo -e "${YELLOW}This action will incur costs on your Scaleway account.${NC}"
    echo ""
    read -p "Do you want to continue? (yes/no): " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

echo -e "${BLUE}Applying infrastructure changes...${NC}"
echo ""

if [ -n "$SPECIFIC_MODULE" ]; then
    # Apply specific module
    echo "Applying module: $SPECIFIC_MODULE"
    cd "$SPECIFIC_MODULE"

    if [ "$AUTO_APPROVE" = true ]; then
        terragrunt apply -auto-approve
    else
        terragrunt apply
    fi
else
    # Apply all modules
    echo "Applying all modules..."

    if [ "$AUTO_APPROVE" = true ]; then
        terragrunt run --all --non-interactive -- apply -auto-approve
    else
        terragrunt run --all --non-interactive -- apply
    fi
fi

echo ""
echo -e "${GREEN}✓ Infrastructure deployed successfully!${NC}"
echo ""

# Show outputs
echo "Fetching outputs..."
echo ""

if [ -z "$SPECIFIC_MODULE" ]; then
    echo "=== IAM Outputs ==="
    (cd iam && terragrunt output 2>/dev/null || echo "No outputs available")
    echo ""

    echo "=== Object Storage Outputs ==="
    (cd object-storage && terragrunt output 2>/dev/null || echo "No outputs available")
    echo ""

    echo "=== Serverless Container Outputs ==="
    (cd serverless-container && terragrunt output 2>/dev/null || echo "No outputs available")
    echo ""

    echo -e "${GREEN}imgproxy URL:${NC}"
    (cd serverless-container && terragrunt output -raw container_url 2>/dev/null || echo "Not available yet")
    echo ""
else
    (cd "$SPECIFIC_MODULE" && terragrunt output 2>/dev/null || echo "No outputs available")
fi

echo ""
echo "Infrastructure is now live! 🚀"
echo ""
