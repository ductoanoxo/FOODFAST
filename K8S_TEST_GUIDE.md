# 🧪 KUBERNETES DEPLOYMENT - TEST GUIDE

## ✅ Deployment Status

All services are running successfully on Kubernetes!

```bash
kubectl get pods -n foodfast
kubectl get svc -n foodfast
```

---

## 🌐 Access URLs

| App | URL | Port |
|-----|-----|------|
| 🛒 **Client App** | http://localhost:30000 | 30000 |
| 🍔 **Restaurant App** | http://localhost:30001 | 30001 |
| ⚙️ **Admin App** | http://localhost:30002 | 30002 |
| 🚁 **Drone App** | http://localhost:30003 | 30003 |
| 🔌 **API Server** | http://localhost:30050 | 30050 |

---

## 🔍 Testing Steps

### 1. **Test API Connection**

```powershell
# Check API health
curl http://localhost:30050/api/health

# Expected response:
# {
#   "status": "OK",
#   "database": {
#     "status": "connected",
#     "readyState": 1
#   }
# }
```

### 2. **Test Database Connection**

```powershell
# Get products from database
curl http://localhost:30050/api/products

# Should return list of products
```

### 3. **Test Frontend Apps**

Open in browser:

#### **Client App** (http://localhost:30000)
- ✅ Homepage loads
- ✅ Products display from database
- ✅ Can add to cart
- ✅ Can view menu categories

#### **Restaurant App** (http://localhost:30001)
- ✅ Login page loads
- ✅ Can login with restaurant credentials
- ✅ Can view incoming orders
- ✅ Can update order status

#### **Admin App** (http://localhost:30002)
- ✅ Login page loads
- ✅ Can login with admin credentials
- ✅ Dashboard shows statistics
- ✅ Can manage products/users

#### **Drone App** (http://localhost:30003)
- ✅ Login page loads
- ✅ Can login with drone credentials
- ✅ Can view assigned deliveries
- ✅ Real-time location tracking

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to API"

**Browser Console Error:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solution:**
```powershell
# Check if server is running
kubectl get pods -n foodfast
kubectl logs deployment/server-app -n foodfast

# Restart server if needed
kubectl rollout restart deployment/server-app -n foodfast
```

---

### Issue 2: "Database not connected"

**Check logs:**
```powershell
kubectl logs deployment/server-app -n foodfast | Select-String "mongo|database"
```

**Should see:**
```
✅ MongoDB Connected: ac-g7iux7w-shard-00-00.dwb8wtz.mongodb.net
```

**If not connected:**
1. Check secret values:
   ```powershell
   kubectl get secret foodfast-secret -n foodfast -o yaml
   ```
2. Update `k8s/secret.yaml` with correct MongoDB URI
3. Reapply:
   ```powershell
   kubectl apply -f k8s/secret.yaml
   kubectl rollout restart deployment/server-app -n foodfast
   ```

---

### Issue 3: "Products not loading in frontend"

**Cause:** Frontend was built with wrong API URL

**Solution:** Rebuild images with correct URL (already done!)
```powershell
docker build --build-arg VITE_API_URL=http://localhost:30050 -t ductoanoxo/foodfast-client:latest ./client_app
```

---

### Issue 4: "CORS errors"

**Browser Console:**
```
Access to fetch at 'http://localhost:30050' from origin 'http://localhost:30000' has been blocked by CORS
```

**Check server logs:**
```powershell
kubectl logs deployment/server-app -n foodfast | Select-String "CORS"
```

**Fix:** Update ConfigMap with correct CORS origins
```yaml
CLIENT_URL: "http://localhost:30000"
RESTAURANT_URL: "http://localhost:30001"
```

---

## 📊 Monitoring Commands

### Check Pod Status
```powershell
kubectl get pods -n foodfast -w
```

### Check Logs (Real-time)
```powershell
# Server logs
kubectl logs -f deployment/server-app -n foodfast

# Client logs
kubectl logs -f deployment/client-app -n foodfast

# Specific pod
kubectl logs -f <pod-name> -n foodfast
```

### Check Resource Usage
```powershell
kubectl top pods -n foodfast
```

### Check Events
```powershell
kubectl get events -n foodfast --sort-by=.lastTimestamp
```

### Describe Pod (for troubleshooting)
```powershell
kubectl describe pod <pod-name> -n foodfast
```

---

## 🔄 Useful Operations

### Restart All Services
```powershell
kubectl rollout restart deployment -n foodfast
```

### Scale Replicas
```powershell
# Scale client app to 3 replicas
kubectl scale deployment client-app --replicas=3 -n foodfast

# Scale server to 5 replicas
kubectl scale deployment server-app --replicas=5 -n foodfast
```

### Update ConfigMap
```powershell
kubectl apply -f k8s/configmap.yaml
kubectl rollout restart deployment -n foodfast
```

### Update Secrets
```powershell
kubectl apply -f k8s/secret.yaml
kubectl rollout restart deployment/server-app -n foodfast
```

---

## 🧹 Cleanup Commands

### Delete All Resources
```powershell
kubectl delete namespace foodfast
```

### Delete Specific Deployment
```powershell
kubectl delete deployment client-app -n foodfast
```

### Delete Specific Pod (will auto-recreate)
```powershell
kubectl delete pod <pod-name> -n foodfast
```

---

## 🎯 Test Checklist

### Before Demo/Presentation

- [ ] All pods are Running: `kubectl get pods -n foodfast`
- [ ] API health check passes: `curl http://localhost:30050/api/health`
- [ ] Database connected (check logs)
- [ ] Client app loads: http://localhost:30000
- [ ] Products display from database
- [ ] Restaurant app login works: http://localhost:30001
- [ ] Admin app dashboard loads: http://localhost:30002
- [ ] Drone app tracking works: http://localhost:30003
- [ ] Socket.IO real-time updates working
- [ ] VNPay payment flow (if testing)

---

## 📝 Notes

### Current Configuration

- **Database:** MongoDB Atlas (cloud)
- **MongoDB URI:** `mongodb+srv://toantra349:***@ktpm.dwb8wtz.mongodb.net/FOODFASTDRONEDELIVERY`
- **JWT Secret:** (in secret.yaml)
- **API URL:** http://localhost:30050
- **Socket URL:** http://localhost:30050

### Build Arguments Used

All frontend apps built with:
```bash
--build-arg VITE_API_URL=http://localhost:30050
--build-arg VITE_SOCKET_URL=http://localhost:30050
```

### Port Mapping

- **30000** → Client App (port 80 internal)
- **30001** → Restaurant App (port 80 internal)
- **30002** → Admin App (port 80 internal)
- **30003** → Drone App (port 80 internal)
- **30050** → API Server (port 5000 internal)

---

## 🚀 Next Steps (Production Deployment)

1. **Push images to Docker Hub:**
   ```powershell
   docker push ductoanoxo/foodfast-server:latest
   docker push ductoanoxo/foodfast-client:latest
   docker push ductoanoxo/foodfast-restaurant:latest
   docker push ductoanoxo/foodfast-admin:latest
   docker push ductoanoxo/foodfast-drone:latest
   ```

2. **Deploy to AWS EKS** (see K8S_SETUP.md)

3. **Setup Ingress with real domain**

4. **Enable HTTPS with cert-manager**

5. **Setup monitoring (Prometheus/Grafana)**

6. **Setup CI/CD with GitHub Actions**

---

## ✅ Success Criteria

Your deployment is successful if:

1. ✅ All 7 pods are Running
2. ✅ API returns `"database": {"status": "connected"}`
3. ✅ Client app shows products from database
4. ✅ Login/authentication works across all apps
5. ✅ Real-time updates work (Socket.IO)
6. ✅ No CORS errors in browser console

---

**Last Updated:** November 13, 2025  
**Status:** ✅ All services running and connected to database
