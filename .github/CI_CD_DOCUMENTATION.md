# CI/CD Pipeline Documentation

## 🚀 Overview

This project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline includes automated testing, building, security scanning, and deployment workflows.

## 📋 Workflows

### 1. CI Test (`ci-test.yml`)
**Triggers:** Push and PR to main, develop, DUCTOAN, kiet branches

**Jobs:**
- **Test Server App**
  - Sets up MongoDB service
  - Runs unit and integration tests
  - Generates code coverage reports
  - Validates syntax

- **Test Frontend Apps**
  - Tests all 4 frontend applications (client, restaurant, admin, drone)
  - Runs linting
  - Builds applications
  - Uploads build artifacts

- **Security Scan**
  - Runs Trivy vulnerability scanner
  - Uploads results to GitHub Security tab

### 2. Docker Build and Push (`docker-build-push.yml`)
**Triggers:** Push to main, develop, DUCTOAN, kiet branches, tags, and PRs

**Features:**
- Builds Docker images for all 5 services
- Pushes to GitHub Container Registry (ghcr.io)
- Multi-platform support (amd64, arm64)
- Layer caching for faster builds
- Semantic versioning with git tags

**Images:**
- `ghcr.io/{owner}/foodfast-server`
- `ghcr.io/{owner}/foodfast-client`
- `ghcr.io/{owner}/foodfast-restaurant`
- `ghcr.io/{owner}/foodfast-admin`
- `ghcr.io/{owner}/foodfast-drone`

### 3. Code Quality (`code-quality.yml`)
**Triggers:** Push and PR to main, develop branches

**Jobs:**
- ESLint analysis for all frontend apps
- Code coverage reporting
- Dependency security checks
- Dockerfile linting

### 4. E2E Tests (`e2e-tests.yml`)
**Triggers:** Push, PR, and daily at 2 AM UTC

**Features:**
- Runs Cypress end-to-end tests
- Tests against running server
- Captures screenshots on failure
- Records test videos

### 5. Pull Request Checks (`pr-checks.yml`)
**Triggers:** PR events

**Validations:**
- PR title follows conventional commit format
- No merge conflicts
- Build size analysis
- Automated PR comments with status

### 6. Deploy (`deploy.yml`)
**Triggers:** Release published, manual workflow dispatch

**Features:**
- Deploy to production/staging
- Pull latest Docker images
- Health checks
- Deployment notifications

## 🔧 Setup Instructions

### 1. Enable GitHub Actions
Actions are automatically enabled. Check `.github/workflows/` directory.

### 2. Configure Secrets
Add these secrets in GitHub repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:
- `GITHUB_TOKEN` (automatically provided)

Optional secrets for production:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `DEPLOY_SSH_KEY`
- `PRODUCTION_SERVER`

### 3. Enable Container Registry
1. Go to repository Settings → Packages
2. Make sure "Inherit access from source repository" is enabled
3. Connect package to repository

### 4. Configure Branch Protection
Recommended settings for `main` branch:

```
Settings → Branches → Add rule
```

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - test-server
  - test-client-apps
  - security-scan
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### 5. Enable Dependabot
Dependabot is configured via `.github/dependabot.yml`:
- Weekly dependency updates
- Separate updates for each app
- GitHub Actions updates
- Docker image updates

## 📊 Status Badges

Add these to your README.md:

```markdown
![CI Test](https://github.com/{owner}/{repo}/workflows/CI%20-%20Test%20and%20Lint/badge.svg)
![Docker Build](https://github.com/{owner}/{repo}/workflows/Docker%20Build%20and%20Push/badge.svg)
![Code Quality](https://github.com/{owner}/{repo}/workflows/Code%20Quality/badge.svg)
![Security](https://github.com/{owner}/{repo}/workflows/Security%20Scan/badge.svg)
```

## 🔍 Monitoring

### View Workflow Runs
```
Repository → Actions tab
```

### Check Build Artifacts
```
Actions → Select workflow run → Artifacts section
```

### Security Alerts
```
Security → Code scanning alerts
```

### Coverage Reports
```
Actions → Select test run → Download coverage-report artifact
```

## 🚨 Troubleshooting

### Tests Failing
1. Check workflow logs in Actions tab
2. Verify MongoDB connection
3. Check environment variables

### Docker Build Failing
1. Verify Dockerfile syntax
2. Check build context
3. Review dependency installation

### Permission Errors
1. Ensure GITHUB_TOKEN has correct permissions
2. Check workflow permissions in workflow file
3. Verify repository settings

### Failed Deployments
1. Check server connectivity
2. Verify Docker images exist
3. Review deployment logs

## 📝 Best Practices

### Commit Messages
Follow conventional commit format:
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Pull Requests
- Always create PR from feature branch
- Wait for all checks to pass
- Get at least one approval
- Keep PRs small and focused

### Version Control
- Use semantic versioning for releases
- Tag releases: `v1.0.0`, `v1.0.1`, etc.
- Create release notes

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────┐
│              Code Push/PR                       │
└────────────┬────────────────────────────────────┘
             │
             ├──────► CI Tests (Unit + Integration)
             │
             ├──────► Code Quality Checks
             │
             ├──────► Security Scanning
             │
             └──────► Docker Build & Push
                            │
                            ├──► GHCR Registry
                            │
                            └──► Deploy (on release)
                                       │
                                       └──► Health Checks
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Jest Documentation](https://jestjs.io/)

## 🆘 Support

If you encounter issues:
1. Check workflow logs
2. Review this documentation
3. Create an issue in the repository
4. Contact the DevOps team

---

**Last Updated:** October 2025
**Maintained by:** FOODFAST Team
