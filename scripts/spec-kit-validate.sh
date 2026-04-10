#!/usr/bin/env bash
# Spec-Kit Build Integration Script
# Part of MR-94: Build System Spec-Kit Integration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Spec-Kit Build Integration Check ===${NC}"

# Change to project root
cd "${PROJECT_ROOT}"

# Check if specify CLI is available
if ! command -v specify &> /dev/null; then
    echo -e "${RED}ERROR: specify CLI not found. Please install with:${NC}"
    echo "  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.4.3"
    exit 1
fi

# Check CLI version
echo "Checking specify CLI version..."
SPECIFY_VERSION=$(specify version 2>&1 | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)
if [[ -z "${SPECIFY_VERSION}" ]]; then
    SPECIFY_VERSION="unknown"
fi
if [[ "${SPECIFY_VERSION}" != "0.4.3" ]]; then
    echo -e "${YELLOW}WARNING: specify version ${SPECIFY_VERSION} detected, expected 0.4.3${NC}"
fi

# Check that all required tools are installed
echo "Checking required tools..."
if ! specify check > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Required tools check failed${NC}"
    exit 1
fi

# Check specification files exist
echo "Checking specifications..."
SPEC_COUNT=$(find spec-kit/specs -name "*.spec.md" | wc -l)
if [[ ${SPEC_COUNT} -eq 0 ]]; then
    echo -e "${RED}ERROR: No specifications found in spec-kit/specs/${NC}"
    exit 1
fi

# Check canonical workflow/roadmap specs exist
echo "Checking canonical workflow and roadmap specs..."
for required_spec in \
    "spec-kit/specs/workflow.specify-delivery.spec.md" \
    "spec-kit/specs/roadmap.delivery.spec.md"; do
    if [[ ! -f "${required_spec}" ]]; then
        echo -e "${RED}ERROR: Required spec not found: ${required_spec}${NC}"
        exit 1
    fi
done

# Check configuration file exists
echo "Checking configuration..."
if [[ ! -f "spec-kit/config.json" ]]; then
    echo -e "${RED}ERROR: Configuration file spec-kit/config.json not found${NC}"
    exit 1
fi

# Validate config.json is valid JSON
echo "Validating configuration..."
if ! python3 -c "import json; json.load(open('spec-kit/config.json'))" 2>/dev/null; then
    echo -e "${RED}ERROR: Configuration file is not valid JSON${NC}"
    exit 1
fi

echo -e "${GREEN}=== Build Integration Check Complete ===${NC}"
echo "Specifications: ${SPEC_COUNT}"
echo "Configuration: Valid"
echo "CLI Version: ${SPECIFY_VERSION}"
echo "Status: Success"

exit 0
