# 🔍 KIỂM TRA KẾT NỐI DATABASE

## Tình trạng hiện tại

✅ **Backend API đã kết nối database thành công:**
```json
{
  "status": "OK",
  "database": {
    "status": "connected",
    "readyState": 1
  }
}
```

✅ **API trả về dữ liệu:**
```bash
curl http://localhost:30050/api/products
# Kết quả: 13 products từ MongoDB Atlas
```

## ❌ Vấn đề: Frontend không hiển thị data

### Nguyên nhân có thể:
1. **Build-time environment variable** - URL API đã được hard-coded trong bundle
2. **CORS issue** - Browser block request
3. **Network request lỗi** - Fetch API không hoạt động

---

## 🧪 CÁCH KIỂM TRA

### 1. Mở Browser Console (F12)

```
http://localhost:30000
```

Kiểm tra tab **Console** và tab **Network**

### 2. Kiểm tra trong Console

Chạy lệnh sau trong Console:

```javascript
// Kiểm tra API URL trong app
console.log(import.meta.env.VITE_API_URL)

// Hoặc kiểm tra window object
console.log(window)

// Test fetch trực tiếp
fetch('http://localhost:30050/api/products')
  .then(res => res.json())
  .then(data => console.log('✅ Products:', data))
  .catch(err => console.error('❌ Error:', err))
```

### 3. Kiểm tra Network Tab

- Mở tab **Network** trong DevTools
- Refresh trang (Ctrl+R)
- Tìm request đến `/api/products` hoặc `/api/...`
- Xem status code (200, 404, CORS error?)

---

## 🔧 TROUBLESHOOTING

### Case 1: Không có request đến API

**Nguyên nhân:** Bundle vẫn dùng API URL cũ

**Giải pháp:**
```powershell
# Force rebuild without cache
docker build --no-cache --build-arg VITE_API_URL=http://localhost:30050 -t ductoanoxo/foodfast-client:latest ./client_app

# Restart pod
kubectl delete pod -l app=client-app -n foodfast
```

### Case 2: CORS Error

**Lỗi trong Console:**
```
Access to fetch at 'http://localhost:30050' from origin 'http://localhost:30000' 
has been blocked by CORS policy
```

**Giải pháp:** Check server CORS config
```powershell
kubectl logs deployment/server-app -n foodfast | Select-String "cors"
```

### Case 3: API URL sai

**Kiểm tra trong bundle:**
```powershell
# Xem file JS trong pod
kubectl exec -it deployment/client-app -n foodfast -- cat /usr/share/nginx/html/assets/index-*.js | grep "localhost:30050"
```

### Case 4: Network Timeout

**Lỗi:** Request bị timeout

**Giải pháp:**
```powershell
# Test từ trong pod
kubectl exec -it deployment/client-app -n foodfast -- wget -O- http://localhost:30050/api/health
```

---

## 📋 CHECKLIST DEBUG

- [ ] Mở http://localhost:30000 trong browser
- [ ] Mở DevTools (F12) → Console tab
- [ ] Kiểm tra có lỗi gì không?
- [ ] Chuyển sang Network tab
- [ ] Refresh trang (Ctrl+R)
- [ ] Tìm request `/api/products` hoặc tương tự
- [ ] Xem Status Code của request (200? 404? CORS?)
- [ ] Check Response data có gì không?

---

## 🎯 Expected Behavior

**Đúng:**
- Network tab có requests đến `http://localhost:30050/api/...`
- Status Code: **200 OK**
- Response: JSON data từ database
- Console: Không có lỗi CORS

**Sai:**
- Không có request nào đến API server
- CORS error
- 404 Not Found
- Connection refused

---

## 💡 Quick Fix Commands

```powershell
# 1. Rebuild client với URL đúng
docker build --no-cache --build-arg VITE_API_URL=http://localhost:30050 --build-arg VITE_SOCKET_URL=http://localhost:30050 -t ductoanoxo/foodfast-client:latest ./client_app

# 2. Restart pods
kubectl rollout restart deployment/client-app -n foodfast

# 3. Wait for ready
kubectl rollout status deployment/client-app -n foodfast

# 4. Check logs
kubectl logs deployment/client-app -n foodfast --tail=20

# 5. Test API từ browser
# Mở http://localhost:30000 và F12
```

---

## 📸 Screenshot cần chụp

1. **Console Tab:**
   - Có lỗi gì không?
   - Output của `fetch()` test

2. **Network Tab:**
   - List các requests
   - Status code của `/api/products`
   - Response data

3. **Application Tab:**
   - Local Storage
   - Session Storage
   - Có token không?

---

## ✅ Xác nhận kết nối thành công

Khi mọi thứ hoạt động đúng, bạn sẽ thấy:

1. **Console:** Không có lỗi
2. **Network:** Requests đến `http://localhost:30050/api/...` → 200 OK
3. **Page:** Products hiển thị từ database
4. **Server logs:** GET requests từ client

```powershell
# Check server logs
kubectl logs deployment/server-app -n foodfast --tail=50
# Should see: GET /api/products 200
```

---

## 🆘 Nếu vẫn không được

Gửi cho tôi:
1. Screenshot Console tab (F12)
2. Screenshot Network tab
3. Output của lệnh:
```powershell
kubectl logs deployment/client-app -n foodfast --tail=20
kubectl logs deployment/server-app -n foodfast --tail=50
```

