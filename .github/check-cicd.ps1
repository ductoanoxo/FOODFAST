# CI/CD Verification Script for FOODFAST
Write-Host "🔍 FOODFAST CI/CD Configuration Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# Check GitHub Actions workflows
Write-Host "📋 Checking GitHub Actions Workflows..." -ForegroundColor Yellow
$workflows = @(
    ".github\workflows\ci-test.yml",
    ".github\workflows\docker-build-push.yml",
    ".github\workflows\code-quality.yml",
    ".github\workflows\e2e-tests.yml",
    ".github\workflows\pr-checks.yml",
    ".github\workflows\deploy.yml"
)

foreach ($workflow in $workflows) {
    if (Test-Path $workflow) {
        Write-Host "✓ Found: $workflow" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "✗ Missing: $workflow" -ForegroundColor Red
        $failed++
    }
}
Write-Host ""

# Check Dependabot
Write-Host "🤖 Checking Dependabot..." -ForegroundColor Yellow
if (Test-Path ".github\dependabot.yml") {
    Write-Host "✓ Found: .github\dependabot.yml" -ForegroundColor Green
    $passed++
} else {
    Write-Host "✗ Missing: .github\dependabot.yml" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Check Docker files
Write-Host "🐳 Checking Docker files..." -ForegroundColor Yellow
$dockerFiles = @(
    "docker-compose.yml",
    "client_app\Dockerfile",
    "restaurant_app\Dockerfile",
    "admin_app\Dockerfile",
    "drone_manage\Dockerfile",
    "server_app\Dockerfile"
)

foreach ($file in $dockerFiles) {
    if (Test-Path $file) {
        Write-Host "✓ Found: $file" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "✗ Missing: $file" -ForegroundColor Red
        $failed++
    }
}
Write-Host ""

# Check package.json files
Write-Host "📦 Checking package.json files..." -ForegroundColor Yellow
$packageFiles = @(
    "package.json",
    "client_app\package.json",
    "restaurant_app\package.json",
    "admin_app\package.json",
    "drone_manage\package.json",
    "server_app\package.json"
)

foreach ($file in $packageFiles) {
    if (Test-Path $file) {
        Write-Host "✓ Found: $file" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "✗ Missing: $file" -ForegroundColor Red
        $failed++
    }
}
Write-Host ""

# Check Git
Write-Host "🔧 Checking Git..." -ForegroundColor Yellow
if (Test-Path ".git" -PathType Container) {
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
    $passed++
} else {
    Write-Host "✗ Git not initialized" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "✓ Passed: $passed" -ForegroundColor Green
Write-Host "✗ Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 CI/CD configuration looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push your code to GitHub"
    Write-Host "2. Check Actions tab for workflow runs"
    Write-Host "3. Configure branch protection rules"
    exit 0
} else {
    Write-Host "⚠️ Some issues found. Please fix them." -ForegroundColor Red
    exit 1
}
