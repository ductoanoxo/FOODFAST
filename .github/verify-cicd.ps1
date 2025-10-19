# CI/CD Verification Script for FOODFAST
# This script checks if all CI/CD components are properly configured

Write-Host "🔍 FOODFAST CI/CD Configuration Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check counter
$script:passed = 0
$script:failed = 0
$script:warnings = 0

# Function to check file existence
function Check-File {
    param([string]$path)
    if (Test-Path $path) {
        Write-Host "✓ Found: $path" -ForegroundColor Green
        $script:passed++
        return $true
    }
    else {
        Write-Host "✗ Missing: $path" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

# Function to check directory
function Check-Dir {
    param([string]$path)
    if (Test-Path $path -PathType Container) {
        Write-Host "✓ Found: $path" -ForegroundColor Green
        $script:passed++
        return $true
    }
    else {
        Write-Host "✗ Missing: $path" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

# Check GitHub Actions workflows
Write-Host "📋 Checking GitHub Actions Workflows..." -ForegroundColor Yellow
Check-File ".github\workflows\ci-test.yml"
Check-File ".github\workflows\docker-build-push.yml"
Check-File ".github\workflows\code-quality.yml"
Check-File ".github\workflows\e2e-tests.yml"
Check-File ".github\workflows\pr-checks.yml"
Check-File ".github\workflows\deploy.yml"
Write-Host ""

# Check Dependabot
Write-Host "🤖 Checking Dependabot Configuration..." -ForegroundColor Yellow
Check-File ".github\dependabot.yml"
Write-Host ""

# Check Documentation
Write-Host "📚 Checking Documentation..." -ForegroundColor Yellow
Check-File ".github\CI_CD_DOCUMENTATION.md"
Check-File ".github\CI_CD_QUICK_REFERENCE.md"
Check-File "README.md"
Write-Host ""

# Check Docker files
Write-Host "🐳 Checking Docker Configuration..." -ForegroundColor Yellow
Check-File "docker-compose.yml"
Check-File "client_app\Dockerfile"
Check-File "restaurant_app\Dockerfile"
Check-File "admin_app\Dockerfile"
Check-File "drone_manage\Dockerfile"
Check-File "server_app\Dockerfile"
Write-Host ""

# Check if Git is initialized
Write-Host "🔧 Checking Git Configuration..." -ForegroundColor Yellow
if (Test-Path ".git" -PathType Container) {
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
    $script:passed++
    
    # Check if remote is set
    $remotes = git remote -v 2>$null
    if ($remotes -match "origin") {
        Write-Host "✓ Git remote 'origin' is set" -ForegroundColor Green
        $script:passed++
    }
    else {
        Write-Host "⚠ Git remote 'origin' not set" -ForegroundColor Yellow
        $script:warnings++
    }
    
    # Check current branch
    $currentBranch = git branch --show-current 2>$null
    Write-Host "ℹ Current branch: $currentBranch" -ForegroundColor Cyan
}
else {
    Write-Host "✗ Git not initialized" -ForegroundColor Red
    $script:failed++
}
Write-Host ""

# Check Node.js and npm
Write-Host "🟢 Checking Node.js Environment..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
        $script:passed++
    }
}
catch {
    Write-Host "✗ Node.js not installed" -ForegroundColor Red
    $script:failed++
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
        $script:passed++
    }
}
catch {
    Write-Host "✗ npm not installed" -ForegroundColor Red
    $script:failed++
}
Write-Host ""

# Check Docker
Write-Host "🐋 Checking Docker Environment..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
        $script:passed++
        
        # Check if Docker daemon is running
        $dockerPs = docker ps 2>$null
        if ($dockerPs) {
            Write-Host "✓ Docker daemon is running" -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host "⚠ Docker daemon not running" -ForegroundColor Yellow
            $script:warnings++
        }
    }
}
catch {
    Write-Host "⚠ Docker not installed (optional for CI/CD)" -ForegroundColor Yellow
    $script:warnings++
}

try {
    $composeVersion = docker compose version 2>$null
    if ($composeVersion) {
        Write-Host "✓ Docker Compose available" -ForegroundColor Green
        $script:passed++
    }
}
catch {
    Write-Host "⚠ Docker Compose not available (optional for CI/CD)" -ForegroundColor Yellow
    $script:warnings++
}
Write-Host ""

# Check package.json files
Write-Host "📦 Checking package.json files..." -ForegroundColor Yellow
Check-File "package.json"
Check-File "client_app\package.json"
Check-File "restaurant_app\package.json"
Check-File "admin_app\package.json"
Check-File "drone_manage\package.json"
Check-File "server_app\package.json"
Write-Host ""

# Check test configuration
Write-Host "🧪 Checking Test Configuration..." -ForegroundColor Yellow
Check-File "server_app\jest.config.js"
Check-File "cypress.config.js"

# Check if tests exist
if (Test-Path "server_app\__tests__" -PathType Container) {
    $testCount = (Get-ChildItem -Path "server_app\__tests__" -Recurse -Include "*.test.js", "*.spec.js" | Measure-Object).Count
    Write-Host "✓ Found $testCount test files in server_app" -ForegroundColor Green
    $script:passed++
}
else {
    Write-Host "⚠ No test directory in server_app" -ForegroundColor Yellow
    $script:warnings++
}

if (Test-Path "cypress\e2e" -PathType Container) {
    $e2eCount = (Get-ChildItem -Path "cypress\e2e" -Recurse -Include "*.cy.js" | Measure-Object).Count
    Write-Host "✓ Found $e2eCount Cypress E2E test files" -ForegroundColor Green
    $script:passed++
}
else {
    Write-Host "⚠ No Cypress E2E tests found" -ForegroundColor Yellow
    $script:warnings++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "✓ Passed: $($script:passed)" -ForegroundColor Green
Write-Host "✗ Failed: $($script:failed)" -ForegroundColor Red
Write-Host "⚠ Warnings: $($script:warnings)" -ForegroundColor Yellow
Write-Host ""

if ($script:failed -eq 0) {
    Write-Host "🎉 CI/CD configuration looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push your code to GitHub"
    Write-Host "2. Check Actions tab for workflow runs"
    Write-Host "3. Configure branch protection rules"
    Write-Host "4. Set up required secrets (if needed)"
    exit 0
}
else {
    Write-Host "⚠️ Some issues found. Please fix them before proceeding." -ForegroundColor Red
    exit 1
}
