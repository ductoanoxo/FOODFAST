#!/bin/bash

# CI/CD Verification Script for FOODFAST
# This script checks if all CI/CD components are properly configured

echo "🔍 FOODFAST CI/CD Configuration Checker"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
passed=0
failed=0
warnings=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((failed++))
        return 1
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((failed++))
        return 1
    fi
}

# Check GitHub Actions workflows
echo "📋 Checking GitHub Actions Workflows..."
check_file ".github/workflows/ci-test.yml"
check_file ".github/workflows/docker-build-push.yml"
check_file ".github/workflows/code-quality.yml"
check_file ".github/workflows/e2e-tests.yml"
check_file ".github/workflows/pr-checks.yml"
check_file ".github/workflows/deploy.yml"
echo ""

# Check Dependabot
echo "🤖 Checking Dependabot Configuration..."
check_file ".github/dependabot.yml"
echo ""

# Check Documentation
echo "📚 Checking Documentation..."
check_file ".github/CI_CD_DOCUMENTATION.md"
check_file ".github/CI_CD_QUICK_REFERENCE.md"
check_file "README.md"
echo ""

# Check Docker files
echo "🐳 Checking Docker Configuration..."
check_file "docker-compose.yml"
check_file "client_app/Dockerfile"
check_file "restaurant_app/Dockerfile"
check_file "admin_app/Dockerfile"
check_file "drone_manage/Dockerfile"
check_file "server_app/Dockerfile"
echo ""

# Check if Git is initialized
echo "🔧 Checking Git Configuration..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    ((passed++))
    
    # Check if remote is set
    if git remote -v | grep -q "origin"; then
        echo -e "${GREEN}✓${NC} Git remote 'origin' is set"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC} Git remote 'origin' not set"
        ((warnings++))
    fi
    
    # Check current branch
    current_branch=$(git branch --show-current)
    echo -e "${GREEN}ℹ${NC} Current branch: $current_branch"
else
    echo -e "${RED}✗${NC} Git not initialized"
    ((failed++))
fi
echo ""

# Check Node.js and npm
echo "🟢 Checking Node.js Environment..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $node_version"
    ((passed++))
else
    echo -e "${RED}✗${NC} Node.js not installed"
    ((failed++))
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $npm_version"
    ((passed++))
else
    echo -e "${RED}✗${NC} npm not installed"
    ((failed++))
fi
echo ""

# Check Docker
echo "🐋 Checking Docker Environment..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo -e "${GREEN}✓${NC} Docker installed: $docker_version"
    ((passed++))
    
    # Check if Docker daemon is running
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC} Docker daemon not running"
        ((warnings++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker not installed (optional for CI/CD)"
    ((warnings++))
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose available"
    ((passed++))
else
    echo -e "${YELLOW}⚠${NC} Docker Compose not available (optional for CI/CD)"
    ((warnings++))
fi
echo ""

# Check package.json files
echo "📦 Checking package.json files..."
check_file "package.json"
check_file "client_app/package.json"
check_file "restaurant_app/package.json"
check_file "admin_app/package.json"
check_file "drone_manage/package.json"
check_file "server_app/package.json"
echo ""

# Check test configuration
echo "🧪 Checking Test Configuration..."
check_file "server_app/jest.config.js"
check_file "cypress.config.js"

# Check if tests exist
if [ -d "server_app/__tests__" ]; then
    test_count=$(find server_app/__tests__ -name "*.test.js" -o -name "*.spec.js" | wc -l)
    echo -e "${GREEN}✓${NC} Found $test_count test files in server_app"
    ((passed++))
else
    echo -e "${YELLOW}⚠${NC} No test directory in server_app"
    ((warnings++))
fi

if [ -d "cypress/e2e" ]; then
    e2e_count=$(find cypress/e2e -name "*.cy.js" | wc -l)
    echo -e "${GREEN}✓${NC} Found $e2e_count Cypress E2E test files"
    ((passed++))
else
    echo -e "${YELLOW}⚠${NC} No Cypress E2E tests found"
    ((warnings++))
fi
echo ""

# Summary
echo "========================================"
echo "📊 Summary:"
echo -e "${GREEN}✓ Passed:${NC} $passed"
echo -e "${RED}✗ Failed:${NC} $failed"
echo -e "${YELLOW}⚠ Warnings:${NC} $warnings"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 CI/CD configuration looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Check Actions tab for workflow runs"
    echo "3. Configure branch protection rules"
    echo "4. Set up required secrets (if needed)"
    exit 0
else
    echo -e "${RED}⚠️  Some issues found. Please fix them before proceeding.${NC}"
    exit 1
fi
