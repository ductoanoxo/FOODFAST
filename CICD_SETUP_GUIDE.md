# CI/CD Configuration Guide

## Overview
Dự án đã được cấu hình để hỗ trợ CI/CD với GitHub Actions, bao gồm:
- ✅ Automated Docker image builds
- ✅ Multi-architecture support (amd64, arm64)
- ✅ Automated testing
- ✅ Security scanning
- ✅ Production deployment

---

## 📁 Files Đã Cập Nhật

### 1. Docker Configuration

#### **Dockerfiles** (tất cả apps)
- ✅ Multi-stage builds để giảm image size
- ✅ `npm ci` thay vì `npm install` (faster, deterministic)
- ✅ Cache optimization với `--ignore-scripts`
- ✅ Health checks cho tất cả services
- ✅ Security improvements

#### **docker-compose.yml**
- ✅ Environment variables với `.env` support
- ✅ Health checks với `condition: service_healthy`
- ✅ Image tagging cho CI/CD: `${DOCKER_REGISTRY}/${DOCKER_USERNAME}/image:${IMAGE_TAG}`
- ✅ MongoDB upgrade to 7.0-alpine
- ✅ Restart policy: `unless-stopped`
- ✅ Configurable ports với env vars

### 2. GitHub Actions Workflows

#### **.github/workflows/docker-build-push.yml**
Tự động build và push Docker images khi:
- Push to main/develop/DUCTOAN branches
- Create tags (v1.0.0)
- Pull requests

**Features:**
- Matrix strategy (build 5 services parallel)
- Multi-architecture: linux/amd64, linux/arm64
- Image caching để build nhanh hơn
- Auto-tagging: branch name, SHA, version tags
- Push to GitHub Container Registry (ghcr.io)

#### **.github/workflows/ci-test.yml**
Chạy tests và checks khi push/PR:
- Test server app với MongoDB service
- Build tất cả frontend apps
- Linting checks
- Security scanning với Trivy
- Upload build artifacts

#### **.github/workflows/deploy-production.yml**
Deploy to production server:
- Trigger: tags (v*.*.*) hoặc manual
- SSH deployment
- Docker Compose pull & restart
- Health check verification
- Auto cleanup old images

### 3. Configuration Files

#### **.env.example**
Template cho environment variables:
```bash
# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=admin123
MONGO_DATABASE=foodfast_drone_delivery

# Server
NODE_ENV=production
SERVER_PORT=5000
JWT_SECRET=your-secret-key

# Docker Registry
DOCKER_REGISTRY=ghcr.io
DOCKER_USERNAME=ductoanoxo
IMAGE_TAG=latest
```

#### **.dockerignore**
Loại trừ files không cần thiết khỏi Docker context:
- node_modules, .git, .env
- Tests, documentation files
- Dev config files

#### **server_app/API/Routers/healthRouter.js**
Health check endpoints cho monitoring:
- `GET /api/health` - Full health status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

---

## 🚀 Setup CI/CD

### Step 1: GitHub Repository Setup

1. **Enable GitHub Packages**
   - Go to repository Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN

2. **Add Secrets** (for production deployment)
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     SSH_PRIVATE_KEY=<your-server-ssh-key>
     SERVER_HOST=<your-server-ip>
     SERVER_USER=<your-server-username>
     ```

### Step 2: Local Development

1. **Create `.env` file**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Build and test locally**
   ```bash
   # Build all services
   docker-compose build

   # Start services
   docker-compose up -d

   # Check health
   curl http://localhost:5000/api/health

   # View logs
   docker-compose logs -f
   ```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "feat: add CI/CD configuration"
git push origin DUCTOAN
```

**GitHub Actions sẽ tự động:**
1. ✅ Run tests (ci-test.yml)
2. ✅ Build Docker images (docker-build-push.yml)
3. ✅ Push images to ghcr.io
4. ✅ Scan for vulnerabilities

### Step 4: Deploy to Production

**Option A: Tag-based deployment**
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Option B: Manual deployment**
- Go to Actions → Deploy to Production → Run workflow

---

## 📦 Docker Images

### Image Naming Convention
```
ghcr.io/ductoanoxo/foodfast-client:latest
ghcr.io/ductoanoxo/foodfast-client:main
ghcr.io/ductoanoxo/foodfast-client:DUCTOAN-abc123
ghcr.io/ductoanoxo/foodfast-client:v1.0.0
```

### Available Images
1. **foodfast-client** - Client app (Port 3000)
2. **foodfast-restaurant** - Restaurant app (Port 3001)
3. **foodfast-admin** - Admin app (Port 3002)
4. **foodfast-drone** - Drone management (Port 3003)
5. **foodfast-server** - Backend API (Port 5000)

### Pull Images
```bash
docker pull ghcr.io/ductoanoxo/foodfast-client:latest
docker pull ghcr.io/ductoanoxo/foodfast-server:latest
# ... other images
```

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

**Server Health Check**
```bash
# Full health status
curl http://localhost:5000/api/health

# Response:
{
  "status": "OK",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": {
    "status": "connected",
    "readyState": 1
  },
  "memory": {
    "used": 120,
    "total": 256,
    "unit": "MB"
  }
}
```

**Readiness Probe**
```bash
curl http://localhost:5000/api/health/ready
# Returns 200 if database connected
```

**Liveness Probe**
```bash
curl http://localhost:5000/api/health/live
# Returns 200 if server running
```

### Docker Health Checks

All services có built-in health checks:
```bash
# Check container health
docker ps

# View health check logs
docker inspect foodfast_server --format='{{.State.Health.Status}}'
```

---

## 🛠️ Troubleshooting

### Build Issues

**Problem: npm install fails**
```bash
# Clear Docker cache
docker-compose build --no-cache

# Or build specific service
docker-compose build --no-cache server_app
```

**Problem: Permission denied**
```bash
# Fix file permissions
chmod +x .github/workflows/*.yml
```

### Deployment Issues

**Problem: SSH connection failed**
- Check SSH_PRIVATE_KEY secret is correct
- Verify server firewall allows SSH (port 22)
- Test SSH manually: `ssh user@server-ip`

**Problem: Health check fails**
```bash
# Check server logs
docker-compose logs server_app

# Check MongoDB connection
docker-compose exec mongodb mongosh -u admin -p admin123
```

### GitHub Actions Issues

**Problem: Permission denied to push image**
- Go to Settings → Actions → General
- Enable "Read and write permissions"

**Problem: Workflow doesn't trigger**
- Check branch name matches workflow configuration
- Verify `.github/workflows/` directory exists

---

## 📊 CI/CD Pipeline Flow

```
┌─────────────────┐
│  Git Push/Tag   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  CI Test Flow   │──── Run tests, linting
│  (ci-test.yml)  │──── Security scan
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Docker Build   │──── Build 5 services
│ (docker-build) │──── Multi-arch support
│                 │──── Push to ghcr.io
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Deploy (Tag)    │──── SSH to server
│ (deploy-prod)   │──── Docker Compose pull
│                 │──── Restart services
│                 │──── Health check
└─────────────────┘
```

---

## 🎯 Best Practices

### Development
1. ✅ Always test locally with `docker-compose up` before pushing
2. ✅ Update `.env.example` khi thêm env vars mới
3. ✅ Run `docker-compose down -v` để clean test data
4. ✅ Use meaningful commit messages (feat:, fix:, docs:)

### Production
1. ✅ Use strong passwords trong `.env` (production)
2. ✅ Enable HTTPS với reverse proxy (nginx)
3. ✅ Setup monitoring (Prometheus, Grafana)
4. ✅ Regular backups cho MongoDB
5. ✅ Log aggregation (ELK stack)

### CI/CD
1. ✅ Tag releases với semantic versioning (v1.0.0)
2. ✅ Review security scan results
3. ✅ Monitor build times và optimize cache
4. ✅ Test deployment trong staging trước production

---

## 📝 Next Steps

1. **Setup Production Server**
   - Install Docker & Docker Compose
   - Configure firewall rules
   - Setup SSL certificates (Let's Encrypt)

2. **Configure Monitoring**
   - Setup Prometheus for metrics
   - Configure alerting (Slack, Email)
   - Log aggregation

3. **Database Backups**
   - Automated MongoDB backups
   - S3/Cloud storage integration

4. **Security Hardening**
   - Rate limiting
   - WAF (Web Application Firewall)
   - Regular security audits

---

## 📞 Support

Nếu có vấn đề với CI/CD setup:
1. Check GitHub Actions logs
2. Review Docker logs: `docker-compose logs`
3. Test health endpoints
4. Check MongoDB connection

---

## 📚 References

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Health Checks in Docker](https://docs.docker.com/engine/reference/builder/#healthcheck)

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
