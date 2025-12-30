#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables and export AWS credentials for S3 backend
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    # Export AWS credentials for S3 backend (using Scaleway credentials)
    export AWS_ACCESS_KEY_ID=$SCALEWAY_ACCESS_KEY
    export AWS_SECRET_ACCESS_KEY=$SCALEWAY_SECRET_KEY
else
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    exit 1
fi

echo "=================================================="
echo "  Infrastructure Plan Script"
echo "=================================================="
echo ""

# Parse arguments
SPECIFIC_MODULE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --module)
            SPECIFIC_MODULE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--module <module-name>]"
            echo "  Modules: iam, object-storage, serverless-container"
            exit 1
            ;;
    esac
done

# Navigate to production environment
cd "$(dirname "$0")/../environments/production"

echo -e "${BLUE}Planning infrastructure changes...${NC}"
echo ""

if [ -n "$SPECIFIC_MODULE" ]; then
    # Plan specific module
    echo "Planning module: $SPECIFIC_MODULE"
    cd "$SPECIFIC_MODULE"
    terragrunt plan
else
    # Plan all modules
    echo "Planning all modules..."
    terragrunt run --all --non-interactive -- plan
fi

echo ""
echo -e "${GREEN}✓ Plan complete!${NC}"
echo ""

if [ -z "$SPECIFIC_MODULE" ]; then
    echo "Review the plan above to verify the changes."
    echo ""
    echo "To plan a specific module:"
    echo "  ./scripts/plan.sh --module iam"
    echo "  ./scripts/plan.sh --module object-storage"
    echo "  ./scripts/plan.sh --module serverless-container"
    echo ""
fi

echo "To apply these changes, run: pnpm run apply"
echo ""
