# 🍔🚁 FOODFAST DRONE DELIVERY - DEPLOY BRANCH VERSION

> Hệ thống đặt đồ ăn với giao hàng bằng drone - Food delivery system with drone management
> 
> **Version:** Deploy Branch - Testing Conflict Resolution
**CI/CD Status:** GitHub Actions + Vercel + Railway


<p align="center">
  🎥 <i>Click vào ảnh để xem video demo trên YouTube</i>
</p>
---

## Công cụ & Hạ tầng
Hình ảnh các công cụ và nền tảng đã sử dụng (từ `asset/readme/`):

<p align="center">
  <i>Những công nghệ và nền tảng được FOODFAST Team sử dụng để xây dựng hệ thống</i>
</p>

---

### 🧠 Frontend
<p align="center">
  <a href="#"><img src="asset/readme/reactjs.png" alt="ReactJS" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
</p>

### 💾 Backend & DevOps
<p align="center">
  <a href="#"><img src="asset/readme/nodejs.png" alt="NodeJS" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
  <a href="#"><img src="asset/readme/mongodb.png" alt="MongoDB" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
  <a href="#"><img src="asset/readme/docker.png" alt="Docker" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
  <a href="#"><img src="asset/readme/cloudinary.png" alt="Cloudinary" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
</p>

### ☁️ Deployment & Cloud
<p align="center">
  <a href="#"><img src="asset/readme/vercel.jpg" alt="Vercel" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
  <a href="#"><img src="asset/readme/awsec2.jpg" alt="AWS EC2" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
  <a href="#"><img src="asset/readme/mern.jpg" alt="MERN Stack" width="120" height="120" style="margin:20px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/></a>
</p>

---
### 🖼️ Hình ảnh minh họa (AWS EC2)

<p align="center">
  <i>Ảnh minh họa quá trình triển khai hệ thống FOODFAST Drone Delivery trên AWS EC2.</i>
</p>

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="./asset/AWS/1.png" alt="AWS EC2 Dashboard" width="350"><br>
      <b>1️⃣ AWS EC2 Instance Dashboard</b><br>
      Giao diện quản lý EC2 hiển thị instance đang chạy tại khu vực US-East-1 (Virginia).
    </td>
    <td align="center" width="50%">
      <img src="./asset/AWS/2.png" alt="Security Group" width="350"><br>
      <b>2️⃣ AWS Security Group Rules</b><br>
      Cấu hình inbound rule mở các port cần thiết (3000–3003, 5000, 22) cho các ứng dụng và SSH.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./asset/AWS/3.png" alt="Search EC2" width="350"><br>
      <b>3️⃣ Truy cập dịch vụ EC2</b><br>
      Tìm kiếm và mở nhanh dịch vụ EC2 trong AWS Management Console.
    </td>
    <td align="center">
      <img src="./asset/AWS/4.png" alt="Docker Containers" width="350"><br>
      <b>4️⃣ Kiểm tra Docker Containers</b><br>
      SSH vào EC2 và chạy lệnh <code>docker ps</code> để xem các container FoodFast đang hoạt động.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./asset/AWS/5.png" alt="GitHub Actions CI/CD" width="350"><br>
      <b>5️⃣ GitHub Actions - CI/CD Pipeline</b><br>
      Pipeline tự động build và deploy dự án FoodFast lên EC2 mỗi khi có thay đổi trên branch.
    </td>
    <td align="center">
      <img src="./asset/AWS/6.png" alt="GitHub Secrets" width="350"><br>
      <b>6️⃣ GitHub Repository Secrets</b><br>
      Cấu hình các biến môi trường và khóa bảo mật (SSH, API URL, GHCR token) cho CI/CD workflow.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./asset/AWS/7.png" alt="Branch Protection" width="350"><br>
      <b>7️⃣ Branch Protection Rule</b><br>
      Thiết lập rule bảo vệ branch <code>main</code> để đảm bảo chỉ merge qua Pull Request hợp lệ.
    </td>
    <td align="center">
      <img src="./asset/AWS/8.png" alt="Required Checks" width="350"><br>
      <b>8️⃣ Required Status Checks</b><br>
      Bật kiểm tra bắt buộc trước khi merge (Build & Lint, Docker Build & Push) để đảm bảo CI/CD thành công.
    </td>
  </tr>
</table>
---

# ☁️ FOODFAST — CI/CD & Triển khai Production trên AWS EC2  

Tài liệu này mô tả toàn bộ quy trình **CI/CD và triển khai production của FOODFAST** trên **AWS EC2**, bao gồm các workflow GitHub Actions, cấu hình cần thiết, cách thức hoạt động của GHCR và hướng dẫn kiểm tra khi gặp sự cố.

---

## 🧭 Tổng quan ngắn

- **Source:** GitHub repository  
- **CI/CD Engine:** GitHub Actions (`.github/workflows/`)  
- **Image Registry:** GitHub Container Registry (GHCR)  
- **Production Host:** AWS EC2 (Ubuntu 22.04, Docker + Docker Compose)

**Quy trình tổng quát:**
```
GitHub → GitHub Actions (CI/Test) → Docker Build & Push (GHCR)
        → Deploy Workflow → AWS EC2 (pull & run containers)
        → FOODFAST Running
```

---

## 🌐 Hạ tầng triển khai

- **Máy chủ Production:** AWS EC2  
  🌍 **Public IP (hiện tại):** `54.221.100.67`  
- **Registry:** GitHub Container Registry (**GHCR**)  
- **CI/CD Pipeline:** GitHub Actions (3 workflow chính)  
- **Runtime:** Docker + Docker Compose  

> ⚠️ **Lưu ý về địa chỉ IP EC2:**  
> Public IP này **sẽ thay đổi khi EC2 restart hoặc stop/start lại** (nếu chưa gán Elastic IP).  
> Nếu bạn **clone dự án hoặc triển khai EC2 mới**, hãy:  
> 1. Vào **AWS Console → EC2 → Instances → Public IPv4 address** để lấy IP mới  
> 2. Cập nhật IP đó trong **README**, **.env**, **GitHub Secrets**, và **frontend config**  
> 3. Nếu muốn IP cố định → gán **Elastic IP** trong AWS  

---

## 🔗 Đường dẫn truy cập (HTTP)

| Ứng dụng | Mô tả | URL |
|----------|--------|------|
| 👥 **Client (Người dùng)** | Đặt món, thanh toán, theo dõi đơn hàng | [http://54.221.100.67:3000](http://54.221.100.67:3000) |
| 🍴 **Restaurant (Nhà hàng)** | Quản lý đơn hàng, menu, doanh thu | [http://54.221.100.67:3001](http://54.221.100.67:3001) |
| 🧑‍💼 **Admin Dashboard** | Quản trị hệ thống toàn bộ | [http://54.221.100.67:3002](http://54.221.100.67:3002) |
| ⚙️ **Backend API** | REST API trung tâm | [http://54.221.100.67:5000](http://54.221.100.67:5000) |

**📍 Healthcheck Endpoints:**  
- `/health`  
- `/api/health`  

---

## ⚙️ CI/CD — Các Workflow Chính

### 🧪 1. `ci-test.yml` — Continuous Integration
- **Mục đích:** Kiểm thử, lint, security scan trước khi build image.  
- **Trigger:** Push hoặc PR vào `main` hoặc `develop`.  
- **Kết quả:**  
  - ✅ Pass → cho phép build/push  
  - ❌ Fail → dừng pipeline

---

### 🏗️ 2. `docker-build-push.yml` — Build & Push Images  
- **Chức năng:** Build Docker images cho 5 services:
  - `client_app`, `restaurant_app`, `admin_app`, `drone_manage`, `server_app`
- **Registry đích:** GHCR  
  ```bash
  ghcr.io/<user-or-org>/foodfast-<service>:latest
  ```
- **Trigger:** Tự động chạy khi `ci-test.yml` hoàn tất thành công.  
- **Lưu ý:**  
  - Không nên hard-code IP (`http://54.221.100.67:5000`) trong build args.  
  - Thay thế bằng domain hoặc biến môi trường (`API_URL` từ secrets).

---

### 🚀 3. `deploy-production.yml` — Triển khai lên EC2  
- **Trigger:** Khi `docker-build-push.yml` hoàn tất (branch `main`) hoặc manual (`workflow_dispatch`).  
- **Các bước thực hiện:**
  1. SSH vào EC2 bằng `PROD_SSH_KEY` và `PROD_SERVER_HOST`
  2. Upload script `remote-deploy.sh` lên EC2
  3. EC2 login vào GHCR qua `GHCR_TOKEN`
  4. Pull image mới nhất của từng service
  5. Chạy container:
     - `foodfast-server` (port 5000, env: `MONGO_URI`, `JWT_SECRET`, …)
     - `foodfast-client`, `foodfast-restaurant`, `foodfast-admin`, `foodfast-drone`
  6. Thiết lập `--restart unless-stopped`
  7. Healthcheck bằng `curl` đến `/health` và `/api/health`

---

## 🔐 GitHub Secrets bắt buộc (Settings → Secrets → Actions)

| Tên biến | Mô tả |
|-----------|--------|
| `PROD_SSH_KEY` | Private key SSH để GitHub runner truy cập EC2 |
| `PROD_SERVER_HOST` | IP hoặc domain EC2 |
| `PROD_SERVER_USER` | User SSH (thường là `ubuntu`) |
| `GHCR_TOKEN` | Token có quyền `read:packages` để pull images |
| `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE` | Biến môi trường backend |
| `PROD_API_URL`, `CORS_ORIGIN` | (tùy chọn) URL và domain frontend |

> 🔧 **Gợi ý:** Khi EC2 đổi IP, cập nhật ngay `PROD_SERVER_HOST` để workflow deploy không bị lỗi SSH.

---

## 🧩 Hành động deploy (Chi tiết hoạt động)

1. GitHub Actions runner nhận event (`workflow_run` hoặc manual).  
2. Thiết lập SSH agent với key từ secrets.  
3. Gửi file `remote-deploy.sh` lên EC2.  
4. EC2 login vào GHCR và pull images mới nhất.  
5. Khởi động lại các container (`docker compose up -d`).  
6. Runner kiểm tra `/health` để xác nhận hệ thống chạy ổn định.

---

## 🔍 Kiểm tra nhanh trên EC2

SSH vào server (Windows PowerShell hoặc WSL):

```bash
ssh -i "C:/Users/ADMIN/Downloads/CNPM_AWS_SGU.pem" ubuntu@54.221.100.67
```

Sau khi đăng nhập:
```bash
sudo docker ps
sudo docker logs -f foodfast-server
curl -I http://localhost:5000/health
sudo ss -tulpn | grep -E ':(80|443|5000|3000|3001|3002)'
df -h
```

---

## 🧠 Tóm tắt cho người mới clone hoặc triển khai lại

- FOODFAST chạy production hoàn toàn trên **AWS EC2**  
- CI/CD tự động qua **GitHub Actions + GHCR**
- Mỗi lần push code → pipeline sẽ tự:
  1. Test code  
  2. Build Docker image  
  3. Push lên GHCR  
  4. SSH vào EC2 và pull/run container mới  
- Nếu bạn tạo EC2 mới:
  - Cập nhật **Public IP** trong `.env`, README, GitHub Secrets  
  - Hoặc gán **Elastic IP** để giữ IP cố định  
- Nếu deploy thất bại, kiểm tra:
  - `GHCR_TOKEN`, `SSH_KEY`, `docker logs`, `Security Group`

---

✨ **Kết luận:**  
Hệ thống **FOODFAST** được triển khai theo mô hình **CI/CD tự động hóa hiện đại**, đảm bảo **build ổn định, deploy nhanh và an toàn**.  
Toàn bộ pipeline vận hành giữa **GitHub Actions → GHCR → AWS EC2 → Docker**, giúp rút ngắn thời gian release và giảm rủi ro thao tác thủ công.

---
## ⚡ QUICK START (BẮT ĐẦU NGAY!)

### 🐳 Cách 1: Chạy với Docker (KHUYẾN NGHỊ - Nhanh nhất!)

```bash
# Chỉ cần 1 lệnh!
docker compose up -d --build
```

**Hoặc dùng script:**
```bash
# Linux/Mac
./start-docker.sh

# Windows PowerShell
.\start-docker.ps1
```

**Mở trình duyệt:**
- 👥 Client: http://localhost:3000
- 🏪 Restaurant: http://localhost:3001
- 👨‍💼 Admin: http://localhost:3002
- 🚁 Drone: http://localhost:3003

> 📖 **Chi tiết:** Đọc [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)

---

### 💻 Cách 2: Chạy ở local (Development)

```bash
npm run install-all
npm run seed
npm run dev
```

**Mở trình duyệt:** http://localhost:3000  
**Login:** `user@foodfast.com` / `user123`

> 💡 **Lưu ý:** Cần cập nhật `MONGO_URI` trong file `.env` trước khi seed!  
> 📖 **Chi tiết:** Đọc [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 📋 Tổng quan dự án

FOODFAST DRONE DELIVERY là một hệ thống đặt đồ ăn hiện đại, cho phép khách hàng đặt món từ nhiều nhà hàng và cửa hàng khác nhau, với tính năng giao hàng tự động bằng drone.

### 🎯 Tính năng chính

- **Client App**: Ứng dụng cho khách hàng đặt món ăn
- **Restaurant App**: Quản lý đơn hàng cho nhà hàng/cửa hàng
- **Admin Dashboard**: Quản lý toàn bộ hệ thống
- **Drone Management**: Theo dõi và điều khiển drone giao hàng

## 🏗️ Kiến trúc hệ thống

```
FOODFAST-DRONE-DELIVERY/
├── client_app/          # ReactJS - Ứng dụng khách hàng (Port: 3000)
├── restaurant_app/      # ReactJS - Ứng dụng nhà hàng (Port: 3001)
├── admin_app/          # ReactJS - Admin Dashboard (Port: 3002)
├── drone_manage/       # ReactJS - Quản lý Drone (Port: 3003)
├── server_app/         # NodeJS + Express - Backend API (Port: 5000)
└── docker-compose.yml  # Docker configuration
```

## 🚀 Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Ant Design** - UI Components
- **Axios** - HTTP Client
- **Socket.io-client** - Real-time communication
- **Leaflet/Google Maps** - Map visualization

### Backend
- **Node.js & Express** - REST API
- **MongoDB & Mongoose** - Database
- **Socket.io** - WebSocket
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer & Cloudinary** - File upload
- **Node-cron** - Task scheduling

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn
- Docker & Docker Compose (optional)

### 1. Clone repository
```bash
git clone <your-repo-url>
cd FOODFAST-DRONE-DELIVERY
```

### 2. Cài đặt dependencies
```bash
# Cài đặt cho tất cả các app
npm run install-all

# Hoặc cài đặt từng app
cd client_app && npm install
cd ../restaurant_app && npm install
cd ../admin_app && npm install
cd ../drone_manage && npm install
cd ../server_app && npm install
```

### 3. Cấu hình môi trường
Copy file `.env` và điền thông tin:
```bash
cp .env.example .env
```

### 4. Chạy ứng dụng

#### Development mode
```bash
# Chạy tất cả services
npm run dev

# Hoặc chạy từng service
npm run dev:client      # Port 3000
npm run dev:restaurant  # Port 3001
npm run dev:admin       # Port 3002
npm run dev:drone       # Port 3003
npm run dev:server      # Port 5000
```

#### Production mode với Docker
```bash
docker-compose up -d
```

## 🌐 Truy cập ứng dụng

- **Client App**: http://localhost:3000
- **Restaurant App**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002
- **Drone Management**: http://localhost:3003
- **Backend API**: http://localhost:5000

## 📱 Chức năng chi tiết

### Client App (Khách hàng)
- 🔐 Đăng ký/Đăng nhập
- 🍕 Tìm kiếm món ăn từ nhiều nhà hàng
- 🛒 Giỏ hàng đa nhà hàng
- 💳 Thanh toán online (VNPay, Momo)
- 📍 Theo dõi đơn hàng real-time
- 🚁 Xem vị trí drone giao hàng
- ⭐ Đánh giá và review
- 📱 Quản lý profile và lịch sử đơn hàng

### Restaurant App (Nhà hàng)
- 📊 Dashboard thống kê
- 📦 Quản lý đơn hàng
- 🍔 Quản lý menu và món ăn
- 📦 Quản lý kho
- 📈 Báo cáo doanh thu
- 🔔 Thông báo đơn hàng mới

### Admin Dashboard
- 👥 Quản lý người dùng
- 🏪 Quản lý nhà hàng/cửa hàng
- 📦 Quản lý đơn hàng toàn hệ thống
- 🚁 Quản lý drone
- 📊 Báo cáo và thống kê
- ⚙️ Cấu hình hệ thống

### Drone Management
- 🚁 Danh sách drone
- 🗺️ Theo dõi real-time trên bản đồ
- 📍 Quản lý lộ trình
- 🔋 Giám sát trạng thái drone
- 📊 Telemetry data

## 🗄️ Database Schema

### Collections chính
- **users** - Thông tin người dùng
- **restaurants** - Nhà hàng/cửa hàng
- **products** - Món ăn/sản phẩm
- **orders** - Đơn hàng
- **drones** - Thông tin drone
- **deliveries** - Lịch sử giao hàng
- **reviews** - Đánh giá
- **notifications** - Thông báo

## 🔐 Authentication

Hệ thống sử dụng JWT (JSON Web Token) cho authentication:
- Access Token (expires: 1 day)
- Refresh Token (expires: 7 days)
- Role-based access control (User, Restaurant, Admin, Drone Manager)

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Lấy danh sách món ăn
- `GET /api/products/:id` - Chi tiết món ăn
- `POST /api/products` - Tạo món ăn mới

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái

### Drones
- `GET /api/drones` - Danh sách drone
- `GET /api/drones/:id/location` - Vị trí drone
- `PATCH /api/drones/:id/assign` - Gán drone cho đơn hàng

## 🧪 Testing

```bash
# Backend tests
cd server_app
npm test

# Frontend tests
cd client_app
npm test
```

## 📝 License

MIT License - Copyright (c) 2025
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue.

## 📞 Liên hệ & Đường dẫn

Đây là các đường dẫn chính đến các thành phần của ứng dụng **FoodFast**:

* **🌐 Ứng dụng Khách hàng (Client/User)**:
    * Truy cập tại: [https://foodfast.vercel.app/](https://foodfast.vercel.app/)

* **🔑 Ứng dụng Quản trị viên (Admin)**:
    * Truy cập tại: [https://foodfast-admin.vercel.app](https://foodfast-admin.vercel.app/login)

* **🍴 Ứng dụng Nhà hàng (Restaurant)**:
    * Truy cập tại: [https://foodfast-restaurant.vercel.app](https://foodfast-restaurant.vercel.app/dashboard)

---
 
## 📚 Tài liệu dự án

Các tài liệu liên quan tới dự án (thiết kế, hướng dẫn, báo cáo) được lưu trên Google Drive:

- Link: https://drive.google.com/drive/folders/1fDCRw3aPJLWgHBDVebtkhJkbzpHZQ9YL?usp=sharing

Vui lòng truy cập link để xem chi tiết các tài liệu và file liên quan.

<h1 align="center">🎨 Demo Giao Diện</h1>
<table>
  <tr>
    <th>🧑‍🍳 Client</th>
    <th>🏪 Restaurant</th>
    <th>👨‍💼 Admin</th>
  </tr>
  <tr>
    <td align="center" valign="top">
      <img src="./asset/Client/CacCuaHangClient.png" width="280"><br>
      <img src="./asset/Client/LichSuDonHangClient.png" width="280"><br>
      <img src="./asset/Client/ThucDonClientApp.png" width="280"><br>
      <img src="./asset/Client/TrangCaNhanClientAPP.png" width="280"><br>
      <img src="./asset/Client/TrangChuClientAPP.png" width="280"><br>
      <img src="./asset/Client/TrangChuClientAPP2.png" width="280"><br>
    </td>
    <td align="center" valign="top">
      <img src="./asset/Restaurant/1.png" width="280"><br>
      <img src="./asset/Restaurant/2.png" width="280"><br>
      <img src="./asset/Restaurant/3.png" width="280"><br>
      <img src="./asset/Restaurant/4.png" width="280"><br>
      <img src="./asset/Restaurant/5.png" width="280"><br>
      <img src="./asset/Restaurant/6.png" width="280"><br>
      <img src="./asset/Restaurant/7.png" width="280"><br>
      <img src="./asset/Restaurant/8.png" width="280"><br>
      <img src="./asset/Restaurant/9.png" width="280"><br>
      <img src="./asset/Restaurant/10.png" width="280"><br>
    </td>
    <td align="center" valign="top">
      <img src="./asset/Admin/1.png" width="280"><br>
      <img src="./asset/Admin/2.png" width="280"><br>
      <img src="./asset/Admin/3.png" width="280"><br>
      <img src="./asset/Admin/4.png" width="280"><br>
      <img src="./asset/Admin/5.png" width="280"><br>
      <img src="./asset/Admin/6.png" width="280"><br>
      <img src="./asset/Admin/7.png" width="280"><br>
      <img src="./asset/Admin/7.png" width="280"><br>
    </td>
  </tr>
</table>



### Ghi chú:
Các đường dẫn này đều đang được triển khai trên **Vercel**. Vui lòng đăng nhập vào các ứng dụng **Admin** và **Restaurant** để truy cập các chức năng.
## 📚 Tài liệu Dự án

Tất cả các **tài liệu liên quan đến dự án** (bao gồm thiết kế, hướng dẫn, báo cáo, v.v.) được lưu trữ trên **Google Drive**.

---

<p align="center">
  <b>📁 Bấm vào logo bên dưới để mở thư mục Google Drive:</b><br><br>
  <a href="https://drive.google.com/drive/folders/1fDCRw3aPJLWgHBDVebtkhJkbzpHZQ9YL?usp=sharing">
    <img src="./asset/readme/drive.png" alt="Google Drive" width="150"/>
  </a>
</p>

---

### 📂 Nội dung bao gồm:
- 🧩 **Thiết kế hệ thống**  
- 🧭 **Tài liệu hướng dẫn sử dụng & triển khai**  
- 📈 **Báo cáo tiến độ và tổng kết dự án**  
- 🗂️ **Các file hỗ trợ khác**

---

> 💡 **Lưu ý:** Hãy đảm bảo bạn có quyền truy cập trước khi mở liên kết.  
> Nếu không thể truy cập, vui lòng liên hệ quản trị viên dự án để được cấp quyền.

---
## 👥 Liên hệ / Thành viên Dự án

<p align="center">
  <b>FOODFAST Team - Đại học Sài Gòn (SGU)</b><br>
  Cùng nhau xây dựng & phát triển dự án 
</p>

<table align="center">
  <tr>
    <th>Thành viên</th>
    <th>Liên kết GitHub</th>
  </tr>
  <tr>
    <td>🧑‍💻 <b>Đức Toàn</b></td>
    <td><a href="https://github.com/ductoanoxo" target="_blank">github.com/ductoanoxo</a></td>
  </tr>
  <tr>
    <td>👨‍💻 <b>Kiệt</b></td>
    <td><a href="https://github.com/Kietnehi" target="_blank">github.com/Kietnehi</a></td>
  </tr>
</table>


<div align="center">

---
# 🚀 **FoodFast Delivery — Full Project Documentation**

🍔💨 *Hệ thống đặt đồ ăn nhanh toàn diện — từ giao diện người dùng đến hạ tầng CI/CD!*

---

### 🔗 **Truy cập toàn bộ tài liệu, sơ đồ & source code tại đây:**

<a href="https://drive.google.com/drive/folders/1KmEJCDPMThQXyVds2Eht9d1j-Xj3OZ1T" target="_blank">
  <img src="https://img.shields.io/badge/🔗_Open_Google_Drive-Full_Documentation-blue?style=for-the-badge&logo=google-drive&logoColor=white" alt="Google Drive Link"/>
</a>

---

📦 **Bao gồm đầy đủ:**
| Thành phần | Mô tả ngắn |
|-------------|-------------|
| 🖥️ **Frontend (ReactJS + React Native)** | Giao diện đặt hàng chuyên nghiệp cho Web & Mobile |
| 🧩 **Backend (3-Layer Architecture)** | Tách biệt Controller - Service - Repository rõ ràng |
| ⚙️ **Microservices** | Gồm 4 service: User, Product, Order, Payment |
| 🚀 **CI/CD & Monitoring** | Triển khai và giám sát toàn hệ thống 3 lớp |
| 🧠 **CI/CD từng service** | Pipeline riêng cho từng service, dễ mở rộng và rollback |

---

✨ *Click vào nút trên để khám phá toàn bộ diagram, tài liệu chi tiết và code mẫu!*

</div>


## 🧭 Giới thiệu
Repository này liên kết đến thư mục Google Drive chứa **toàn bộ tài liệu và tài nguyên** của dự án **FoodFast Delivery** – một hệ thống đặt đồ ăn nhanh toàn diện, bao gồm **Frontend**, **Backend**, **Microservices**, và **CI/CD Monitoring System**.

---

## ⚙️ Nội dung chính

### 1. 🖥️ Frontend Development (FE DEV)
- **Công nghệ:** ReactJS (Web) & React Native (Mobile)  
- **Mục tiêu:**  
  - Xây dựng giao diện người dùng chuyên nghiệp, tối ưu UX/UI cho quy trình đặt hàng.  
  - Tích hợp luồng đăng nhập, chọn món, giỏ hàng, thanh toán.  
  - Responsive trên đa nền tảng (Mobile/Web).

---

### 2. 🧩 Backend Development (BE DEV — 3-Layer Architecture)
- **Mô hình 3 lớp:**
  - `Controller` — nhận và xử lý request từ client.
  - `Service` — xử lý logic nghiệp vụ.
  - `Repository` — giao tiếp với cơ sở dữ liệu.  
- **Mục tiêu:** Tối ưu khả năng mở rộng và bảo trì.

---

### 3. 🔗 Microservices Architecture
Triển khai hệ thống **4 service** chính, giao tiếp qua API Gateway hoặc Message Queue:
- **User Service:** quản lý thông tin người dùng, xác thực, phân quyền.  
- **Product Service:** quản lý danh mục món ăn, giá, trạng thái tồn kho.  
- **Order Service:** xử lý đặt hàng, trạng thái giao hàng.  
- **Payment Service:** xử lý thanh toán, xác thực giao dịch.  

---

### 4. 🚀 CI/CD & System Monitoring (3-Layer System)
- Thiết lập **CI/CD pipeline** để tự động hóa build, test, deploy.  
- Giám sát toàn hệ thống 3 lớp qua Prometheus + Grafana hoặc tương đương.  
- Tích hợp cảnh báo khi có sự cố hoặc downtime.

---

### 5. 🧠 CI/CD & Monitoring cho từng Service
- Mỗi service có pipeline riêng:  
  - Build → Test → Deploy → Monitor  
- Theo dõi log và hiệu năng qua các công cụ như ELK Stack / Loki / Prometheus.  
- Dễ dàng mở rộng hoặc rollback từng service độc lập.

---

## 📚 Tài liệu đính kèm
- **Diagram tổng quan hệ thống**  
- **Flow chart xử lý yêu cầu đặt hàng**  
- **Kiến trúc microservices & giao tiếp giữa các module**  
- **Hướng dẫn cài đặt và chạy project (local & production)**  

---

## 🏁 Tổng kết
Thư mục Drive trên là **nguồn tài nguyên đầy đủ nhất** cho dự án **FoodFast Delivery**, bao gồm từ kiến trúc hệ thống đến triển khai thực tế.  
Hãy truy cập link để tham khảo chi tiết từng phần!

---

> ✉️ **Liên hệ:** Vui lòng mở issue hoặc contact trực tiếp qua repo này nếu bạn muốn đóng góp hoặc thảo luận thêm về dự án.
---
<p align="center">
  💬 Mọi thắc mắc hoặc góp ý vui lòng liên hệ qua GitHub để được hỗ trợ nhanh nhất.
</p>

---

<p align="center">
  Made with by <b>FOODFAST Team SGU</b>
</p>


