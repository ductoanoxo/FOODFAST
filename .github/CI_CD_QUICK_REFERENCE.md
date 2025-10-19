# 🚀 CI/CD Quick Reference

## Status Badges

![CI Test](https://github.com/ductoanoxo/FOODFAST/workflows/CI%20-%20Test%20and%20Lint/badge.svg)
![Docker Build](https://github.com/ductoanoxo/FOODFAST/workflows/Docker%20Build%20and%20Push/badge.svg)
![Code Quality](https://github.com/ductoanoxo/FOODFAST/workflows/Code%20Quality/badge.svg)

## 📋 Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI Test | Push, PR | Run tests and security scans |
| Docker Build | Push, PR, Tag | Build and push Docker images |
| Code Quality | Push, PR | ESLint, coverage, security audit |
| E2E Tests | Push, PR, Daily | Cypress end-to-end tests |
| PR Checks | PR only | Validate PR title and size |
| Deploy | Release, Manual | Deploy to production/staging |

## 🔄 Workflow Sequence

```
Push Code → CI Tests → Build Docker → Security Scan
                ↓
         All Passed? → Merge to Main
                ↓
         Tagged Release? → Deploy
                ↓
         Health Checks → Complete ✅
```

## 🐳 Docker Images

All images are pushed to GitHub Container Registry:

```bash
ghcr.io/ductoanoxo/foodfast-server:latest
ghcr.io/ductoanoxo/foodfast-client:latest
ghcr.io/ductoanoxo/foodfast-restaurant:latest
ghcr.io/ductoanoxo/foodfast-admin:latest
ghcr.io/ductoanoxo/foodfast-drone:latest
```

## 🔑 Required Secrets

Configure in: `Settings → Secrets and variables → Actions`

- `GITHUB_TOKEN` - Auto-provided, used for GHCR

## ⚙️ Branch Protection

Recommended rules for `main` branch:

- ✅ Require PR reviews (1 approval)
- ✅ Require status checks:
  - `test-server`
  - `test-client-apps`
  - `security-scan`
- ✅ Require branches up to date
- ✅ Include administrators

## 📝 Commit Convention

Follow conventional commits:

```
feat: add new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code refactoring
test: add tests
chore: maintenance
ci: CI/CD changes
perf: performance improvement
```

## 🎯 Quick Commands

### View Workflows
```bash
# In GitHub
Repository → Actions tab
```

### Pull Docker Images
```bash
docker pull ghcr.io/ductoanoxo/foodfast-server:latest
```

### Manual Deploy
```bash
# In GitHub
Actions → Deploy to Production → Run workflow
```

### Check Coverage
```bash
cd server_app
npm test -- --coverage
```

## 🔍 Monitoring

- **Workflow Runs**: `Actions` tab
- **Build Artifacts**: `Actions → Run → Artifacts`
- **Security Alerts**: `Security → Code scanning`
- **Coverage Reports**: Download from artifacts

## 🆘 Troubleshooting

### Tests Failing?
1. Check MongoDB service status
2. Verify environment variables
3. Review test logs

### Build Failing?
1. Check Dockerfile syntax
2. Verify dependencies
3. Check build context

### Deploy Failing?
1. Verify secrets configured
2. Check Docker image exists
3. Review deployment logs

## 📚 Full Documentation

For complete documentation, see:
- [CI/CD Documentation](.github/CI_CD_DOCUMENTATION.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Docker Guide](./DOCKER_QUICKSTART.md)

---

**Last Updated**: October 2025
