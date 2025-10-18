# Quick Reference: Docker Commands

## 🚀 Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d server_app

# Start with rebuild
docker-compose up -d --build

# View startup logs
docker-compose up
```

## 🛑 Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean data)
docker-compose down -v

# Stop specific service
docker-compose stop server_app
```

## 📋 Viewing Logs

```bash
# All services
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Specific service
docker-compose logs -f server_app

# Last 100 lines
docker-compose logs --tail=100 server_app
```

## 🔍 Checking Status

```bash
# Container status
docker-compose ps

# Detailed container info
docker inspect foodfast_server

# Service health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Resource usage
docker stats
```

## 🔧 Debugging

```bash
# Enter container shell
docker exec -it foodfast_server sh

# Run command in container
docker exec foodfast_server node -v

# Check MongoDB
docker exec foodfast_mongodb mongosh -u admin -p admin123

# View container logs directly
docker logs foodfast_server
```

## 🏗️ Building

```bash
# Build all images
docker-compose build

# Build with no cache
docker-compose build --no-cache

# Build specific service
docker-compose build server_app

# Pull latest base images
docker-compose pull
```

## 🔄 Restarting

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server_app

# Restart with rebuild
docker-compose up -d --build --force-recreate
```

## 🧹 Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused everything
docker system prune -a --volumes

# Remove specific image
docker rmi ghcr.io/ductoanoxo/foodfast-server:latest
```

## 📦 Images

```bash
# List images
docker images

# Pull image
docker pull ghcr.io/ductoanoxo/foodfast-server:latest

# Push image
docker push ghcr.io/ductoanoxo/foodfast-server:latest

# Tag image
docker tag foodfast-server:latest ghcr.io/ductoanoxo/foodfast-server:v1.0.0
```

## 🔐 Registry Login

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Login to Docker Hub
docker login
```

## 📊 Health Checks

```bash
# Check server health
curl http://localhost:5000/api/health

# Check all endpoints
curl http://localhost:5000/api/health/ready
curl http://localhost:5000/api/health/live

# In container
docker exec foodfast_server curl http://localhost:5000/api/health
```

## 🗄️ Database

```bash
# MongoDB shell
docker exec -it foodfast_mongodb mongosh -u admin -p admin123

# Backup database
docker exec foodfast_mongodb mongodump --out /backup

# Restore database
docker exec foodfast_mongodb mongorestore /backup

# Export data
docker exec foodfast_mongodb mongoexport --db foodfast_drone_delivery --collection users --out /data/users.json
```

## 🌐 Network

```bash
# List networks
docker network ls

# Inspect network
docker network inspect foodfast_foodfast_network

# Connect container to network
docker network connect foodfast_foodfast_network container_name
```

## 💾 Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect foodfast_mongodb_data

# Remove volume
docker volume rm foodfast_mongodb_data

# Backup volume
docker run --rm -v foodfast_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .
```

## 🔍 Troubleshooting

```bash
# Check why container stopped
docker ps -a
docker logs foodfast_server

# View container processes
docker top foodfast_server

# Real-time events
docker events

# Disk usage
docker system df

# Check port mapping
docker port foodfast_server
```

## 📝 Environment Variables

```bash
# Run with custom env file
docker-compose --env-file .env.production up -d

# Override environment variable
docker-compose run -e NODE_ENV=development server_app

# View environment variables
docker exec foodfast_server env
```

## 🧪 Testing

```bash
# Run tests in container
docker-compose run server_app npm test

# Run one-off command
docker-compose run --rm server_app node seed.js

# Interactive shell
docker-compose run --rm server_app sh
```

## 🚀 Production Deployment

```bash
# Pull latest images
docker-compose pull

# Update and restart
docker-compose up -d --force-recreate

# Zero-downtime update
docker-compose up -d --no-deps --build server_app

# View resource limits
docker inspect foodfast_server | grep -A 10 Resources
```

## 📈 Monitoring

```bash
# Container stats
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Export logs
docker logs foodfast_server > server.log 2>&1

# Watch health status
watch -n 5 'docker ps --format "table {{.Names}}\t{{.Status}}"'
```

---

## Common Workflows

### 🔄 Complete Restart
```bash
docker-compose down
docker-compose build
docker-compose up -d
docker-compose logs -f
```

### 🧪 Test Deployment
```bash
# Windows
.\test-deployment.ps1

# Linux/Mac
./test-deployment.sh
```

### 🔄 Update Single Service
```bash
docker-compose build server_app
docker-compose up -d --no-deps server_app
docker-compose logs -f server_app
```

### 🗄️ Reset Database
```bash
docker-compose down -v
docker-compose up -d mongodb
sleep 10
docker-compose up -d
```

### 📦 Backup Everything
```bash
# Backup MongoDB
docker exec foodfast_mongodb mongodump --archive=/backup/mongodb_$(date +%Y%m%d).archive

# Backup volumes
docker run --rm -v foodfast_mongodb_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/volumes_$(date +%Y%m%d).tar.gz -C /data .
```

---

**Quick Tips:**
- Use `-d` for detached mode (background)
- Use `-f` to follow logs in real-time
- Use `--no-cache` when dependencies change
- Use `--force-recreate` to fully restart containers
- Use `--build` to rebuild before starting
