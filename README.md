# 🍔🚁 **FOODFAST DRONE DELIVERY — Deploy Branch Version**

> 🛰️ *Hệ thống đặt đồ ăn với giao hàng bằng drone*  
> 🍱 *Food delivery system with drone management*  
>  
> **🔖 Version:** *Deploy Branch — Testing Conflict Resolution*  
> **⚙️ CI/CD:** *GitHub Actions • Vercel • Railway*

---

<h2 align="center">🎬 Video Demo</h2>

<p align="center">
  <a href="https://www.youtube.com/watch?v=vwBItmEOFMM" target="_blank">
    <img src="https://img.youtube.com/vi/vwBItmEOFMM/maxresdefault.jpg"
         alt="FoodFast Demo Video" width="720" style="border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.25);">
  </a>
</p>

<p align="center">
  🎥 <i>Click vào ảnh để xem video demo trên YouTube</i>
</p>



---
## Solution Alignment 
<h3 align="center">Solution Alignment</h3>
<p align="center">
  <img src="asset/readme/Solution_Alignment.png" alt="Solution Alignment" width="600">
</p>

### 🧩 Overview (Solution Alignment)

Sơ đồ bên trên thể hiện kiến trúc tổng thể của hệ thống:

- **Frontend**  
  - Deploy trên **Vercel**  
  - Gọi API đến backend  

- **Backend (Node.js)**  
  - Lưu trữ mã nguồn trên **GitHub**  
  - Đóng gói bằng **Docker**  
  - Image được đẩy lên registry để **Kubernetes** pull về  

- **Hạ tầng & Deploy**  
  - **Kubernetes** chạy trên **AWS** để triển khai backend  
  - CI/CD sử dụng GitHub Actions → build → push image → deploy  

- **Database**  
  - **MongoDB** dùng để lưu trữ dữ liệu ứng dụng  
  - Backend kết nối trực tiếp tới MongoDB  

- **Payment Integration**  
  - Tích hợp **VNPAY** để xử lý giao dịch thanh toán  

- **Monitoring**  
  - **Prometheus** thu thập metrics  
  - **Grafana** trực quan hóa và theo dõi trạng thái hệ thống  


---

## ☁️ **Công cụ & Hạ tầng**

> Hình ảnh minh họa các công cụ và nền tảng đã sử dụng (lưu trong `asset/readme/`)

<p align="center">
  <i>🛠️ Các công nghệ và nền tảng được <b>FOODFAST Team</b> sử dụng để xây dựng hệ thống</i>
</p>

---

### 🧠 **Frontend**
<p align="center">
  <img src="asset/readme/reactjs.png" alt="ReactJS" width="110" style="margin:15px;">
  <img src="asset/readme/mern.jpg" alt="MERN Stack" width="110" style="margin:15px;">
  <img src="asset/readme/socket.png" alt="MERN Stack" width="110" style="margin:15px;">
</p>

---

### 💾 **Backend & DevOps**
<p align="center">
  <img src="asset/readme/nodejs.png" alt="NodeJS" width="110" style="margin:15px;">
  <img src="asset/readme/mongodb.png" alt="MongoDB" width="110" style="margin:15px;">
  <img src="asset/readme/docker.png" alt="Docker" width="110" style="margin:15px;">
  <img src="asset/readme/kubernetes.png" alt="Docker" width="110" style="margin:15px;">
  <img src="asset/readme/cloudinary.png" alt="Cloudinary" width="110" style="margin:15px;">
</p>

---

### 🚀 **Deployment & Cloud**
<p align="center">
  <img src="asset/readme/vercel.jpg" alt="Vercel" width="110" style="margin:15px;">
  <img src="asset/readme/awsec2.jpg" alt="AWS EC2" width="110" style="margin:15px;">
  <img src="asset/readme/github-actions.png" alt="GitHub Actions" width="110" style="margin:15px;">
  <img src="asset/readme/railway.png" alt="Railway" width="110" style="margin:15px;">
  <img src="asset/readme/prometheus.jpg" alt="Railway" width="110" style="margin:15px;">
  <img src="asset/readme/grafana.jpg" alt="Railway" width="110" style="margin:15px;">
</p>

---

<p align="center">
  <b>🚁 FOODFAST — Smart Delivery, Smarter Technology</b><br>
  <i>© 2025 FoodFast Team | All rights reserved.</i>
</p>

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
  🌍 **Public IP (hiện tại):** `3.80.219.114`  
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
| 👥 **Client (Người dùng)** | Đặt món, thanh toán, theo dõi đơn hàng | [http://3.80.219.114:3000](http://3.80.219.114:3000) |
| 🍴 **Restaurant (Nhà hàng)** | Quản lý đơn hàng, menu, doanh thu | [http://3.80.219.114:3001](http://3.80.219.114:3001) |
| 🧑‍💼 **Admin Dashboard** | Quản trị hệ thống toàn bộ | [http://3.80.219.114:3002](http://3.80.219.114:3002) |
| ⚙️ **Backend API** | REST API trung tâm | [http://3.80.219.114:5000](http://3.80.219.114:5000) |

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
  - Không nên hard-code IP (`http://3.80.219.114:5000`) trong build args.  
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
ssh -i "C:/Users/ADMIN/Downloads/CNPM_AWS_SGU.pem" ubuntu@3.80.219.114
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

- **users** - Thông tin người dùng (`User.js`)
- **restaurants** - Thông tin nhà hàng / cửa hàng (`Restaurant.js`)
- **products** - Danh sách món ăn / sản phẩm (`Product.js`)
- **categories** - Phân loại món / danh mục (`Category.js`)
- **orders** - Đơn hàng chính (`Order.js`)
- **order_audits** - Lịch sử / audit thay đổi đơn hàng (`OrderAudit.js`)
- **drones** - Thông tin drone (`Drone.js`)
- **reviews** - Đánh giá sản phẩm / nhà hàng (`Review.js`)
- **promotions** - Các chương trình khuyến mãi (`Promotion.js`)
- **promo_usages** - Theo dõi việc sử dụng khuyến mãi (`PromoUsage.js`)
- **vouchers** - Mã giảm giá / voucher (`Voucher.js`)
- **voucher_usages** - Theo dõi việc sử dụng voucher (`VoucherUsage.js`)

### ERD 
<h3 align="center">ERD cho toàn bộ hệ thống</h3>
<p align="center">
  <img src="asset/readme/ERD.png" alt="ERD Diagram" width="600">
</p>

## 🔐 Authentication

Hệ thống sử dụng JWT (JSON Web Token) cho authentication:
- Access Token (expires: 1 day)
- Refresh Token (expires: 7 days)
- Role-based access control (User, Restaurant, Admin, Drone Manager)

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)

- `POST /api/auth/register` - Đăng ký tài khoản mới  
- `POST /api/auth/login` - Đăng nhập  
- `POST /api/auth/logout` - Đăng xuất _(protected)_  
- `GET /api/auth/me` - Lấy thông tin profile hiện tại _(protected)_  
- `GET /api/auth/profile` - Lấy profile _(protected)_  
- `PUT /api/auth/profile` - Cập nhật profile _(protected)_  

---

### 👥 Users (`/api/users`)

- `GET /api/users/check-email` - Kiểm tra email đã tồn tại  
- `GET /api/users/stats` - Thống kê người dùng _(admin)_  
- `GET /api/users` - Lấy danh sách users _(admin)_  
- `GET /api/users/:id` - Lấy thông tin user _(admin)_  
- `PUT /api/users/:id` - Cập nhật user _(admin)_  
- `DELETE /api/users/:id` - Xóa user _(admin)_  
- `GET /api/users/:id/orders` - Lấy đơn hàng của user _(protected)_  

---

### 🍕 Products (`/api/products`)

- `GET /api/products/popular` - Lấy sản phẩm phổ biến  
- `GET /api/products/restaurant` - Lấy sản phẩm theo nhà hàng _(restaurant/admin)_  
- `GET /api/products` - Lấy danh sách sản phẩm  
- `POST /api/products` - Tạo sản phẩm mới _(restaurant/admin, upload image)_  
- `GET /api/products/:id` - Lấy chi tiết sản phẩm  
- `PUT /api/products/:id` - Cập nhật sản phẩm _(restaurant/admin, upload image)_  
- `DELETE /api/products/:id` - Xóa sản phẩm _(restaurant/admin)_  

---

### 📂 Categories (`/api/categories`)

- `GET /api/categories` - Lấy danh sách categories  
- `POST /api/categories` - Tạo category _(admin/restaurant)_  
- `GET /api/categories/restaurant/with-products` - Lấy categories kèm products _(restaurant)_  
- `GET /api/categories/:id` - Lấy category theo id  
- `PUT /api/categories/:id` - Cập nhật category _(admin/restaurant)_  
- `DELETE /api/categories/:id` - Xóa category _(admin/restaurant)_  
- `GET /api/categories/:id/products` - Lấy sản phẩm theo category  

---

### 🏪 Restaurants (`/api/restaurants`)

- `GET /api/restaurants/nearby` - Lấy nhà hàng gần vị trí  
- `GET /api/restaurants` - Lấy danh sách nhà hàng  
- `POST /api/restaurants` - Tạo nhà hàng _(admin)_  
- `POST /api/restaurants/create-with-account` - Tạo nhà hàng kèm tài khoản _(admin)_  
- `GET /api/restaurants/:id` - Lấy chi tiết nhà hàng  
- `PUT /api/restaurants/:id` - Cập nhật nhà hàng _(restaurant/admin, upload image)_  
- `DELETE /api/restaurants/:id` - Xóa nhà hàng _(admin)_  
- `GET /api/restaurants/:id/menu` - Lấy menu nhà hàng  
- `GET /api/restaurants/:id/orders` - Lấy đơn hàng nhà hàng _(restaurant/admin)_  
- `PATCH /api/restaurants/:id/toggle-status` - Bật/tắt trạng thái _(restaurant/admin)_  
- `GET /api/restaurants/:id/stats` - Thống kê nhà hàng _(restaurant/admin)_  

---

### 📦 Orders (`/api/orders`)

- `POST /api/orders/calculate-fee` - Tính phí giao hàng _(protected)_  
- `GET /api/orders/history` - Lịch sử đơn hàng _(protected)_  
- `GET /api/orders/restaurant` - Đơn hàng theo nhà hàng _(restaurant/admin)_  
- `GET /api/orders` - Lấy danh sách đơn hàng _(protected)_  
- `POST /api/orders` - Tạo đơn hàng mới _(protected)_  
- `GET /api/orders/:id` - Chi tiết đơn hàng _(protected)_  
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn _(restaurant/admin)_  
- `PATCH /api/orders/:id/cancel` - Hủy đơn hàng _(protected)_  
- `POST /api/orders/:id/confirm-delivery` - Xác nhận giao hàng _(protected)_  
- `POST /api/orders/:id/restaurant-confirm-handover` - Xác nhận bàn giao _(restaurant)_  
- `GET /api/orders/:id/track` - Theo dõi đơn hàng _(protected)_  

---

### 🚁 Drones (`/api/drones`)

- `GET /api/drones/simulations` - Lấy simulations đang chạy _(admin)_  
- `GET /api/drones/nearby` - Lấy drone gần _(admin)_  
- `GET /api/drones` - Lấy danh sách drone  
- `POST /api/drones` - Tạo drone _(admin)_  
- `GET /api/drones/:id` - Chi tiết drone  
- `PUT /api/drones/:id` - Cập nhật drone _(drone/admin)_  
- `DELETE /api/drones/:id` - Xóa drone _(admin)_  
- `PATCH /api/drones/:id/location` - Cập nhật vị trí _(drone/admin)_  
- `PATCH /api/drones/:id/status` - Cập nhật trạng thái _(drone/admin)_  
- `PATCH /api/drones/:id/battery` - Cập nhật pin _(drone/admin)_  
- `POST /api/drones/:id/assign` - Gán drone cho đơn _(admin)_  
- `POST /api/drones/:id/start-delivery` - Bắt đầu giao hàng simulation _(admin/drone)_  
- `POST /api/drones/:id/stop-delivery` - Dừng simulation _(admin)_  
- `GET /api/drones/:id/stats` - Thống kê drone _(admin)_  

---

### 💳 Payment (`/api/payment`)

- `POST /api/payment/vnpay/create` - Tạo giao dịch VNPay _(protected)_  
- `GET /api/payment/vnpay/return` - Callback VNPay  
- `GET /api/payment/vnpay/ipn` - IPN VNPay  
- `POST /api/payment/vnpay/querydr` - Truy vấn giao dịch VNPay _(protected)_  
- `POST /api/payment/vnpay/refund` - Hoàn tiền VNPay _(protected)_  
- `POST /api/payment/momo/create` - Tạo giao dịch Momo _(protected)_  
- `POST /api/payment/momo/callback` - Callback Momo  
- `GET /api/payment/methods` - Lấy danh sách phương thức thanh toán  
- `GET /api/payment/:orderId` - Thông tin thanh toán đơn hàng _(protected)_  

---

### ⭐ Reviews (`/api/reviews`)

- `POST /api/reviews` - Tạo đánh giá _(protected)_  
- `GET /api/reviews/product/:productId` - Đánh giá sản phẩm  
- `GET /api/reviews/user/:userId` - Đánh giá của user  
- `GET /api/reviews/restaurant/:restaurantId` - Đánh giá nhà hàng  
- `PUT /api/reviews/:id` - Cập nhật đánh giá _(protected)_  
- `DELETE /api/reviews/:id` - Xóa đánh giá _(protected)_  

---

### 📤 Upload (`/api/upload`)

- `POST /api/upload/image` - Upload 1 ảnh _(protected)_  
- `POST /api/upload/images` - Upload nhiều ảnh _(protected)_  
- `DELETE /api/upload/:publicId` - Xóa ảnh _(admin)_  

---

### 🎟️ Vouchers (`/api/vouchers`)

- `GET /api/vouchers/public/:restaurantId` - Lấy voucher công khai  
- `POST /api/vouchers/validate` - Validate voucher _(protected)_  
- `GET /api/vouchers` - Danh sách voucher _(protected)_  
- `POST /api/vouchers` - Tạo voucher _(protected)_  
- `GET /api/vouchers/:id` - Chi tiết voucher _(protected)_  
- `PUT /api/vouchers/:id` - Cập nhật voucher _(protected)_  
- `DELETE /api/vouchers/:id` - Xóa voucher _(protected)_  
- `GET /api/vouchers/:id/stats` - Thống kê voucher _(protected)_  

---

### 🎁 Promotions (`/api/promotions`)

- `GET /api/promotions/active/:restaurantId` - Khuyến mãi đang hoạt động  
- `GET /api/promotions/products/:restaurantId` - Sản phẩm có khuyến mãi  
- `GET /api/promotions` - Danh sách khuyến mãi _(restaurant)_  
- `POST /api/promotions` - Tạo khuyến mãi _(restaurant)_  
- `PUT /api/promotions/:id` - Cập nhật khuyến mãi _(restaurant)_  
- `DELETE /api/promotions/:id` - Xóa khuyến mãi _(restaurant)_  
- `PATCH /api/promotions/:id/toggle` - Bật/tắt khuyến mãi _(restaurant)_  

---

### 💰 Refunds (`/api/refunds`)

- `GET /api/refunds/stats` - Thống kê refund _(admin)_  
- `GET /api/refunds` - Danh sách refund requests _(admin)_  
- `POST /api/refunds/:orderId/process` - Xử lý refund thủ công _(admin)_  
- `GET /api/refunds/:orderId/logs` - Logs refund _(admin)_  

---

### 👨‍💼 Admin (`/api/admin`)

- `GET /api/admin/orders/pending` - Đơn hàng chờ xử lý _(admin)_  
- `GET /api/admin/drones/available` - Drone sẵn sàng _(admin)_  
- `GET /api/admin/drones/performance` - Hiệu suất drone _(admin)_  
- `POST /api/admin/assign-drone` - Gán drone _(admin)_  
- `POST /api/admin/reassign-order` - Gán lại đơn _(admin)_  
- `GET /api/admin/fleet/stats` - Thống kê fleet _(admin)_  
- `GET /api/admin/fleet/map` - Bản đồ fleet _(admin)_  

---

### 📊 Dashboard (`/api/dashboard`)

- `GET /api/dashboard/stats` - Số liệu dashboard _(admin)_  
- `GET /api/dashboard/recent-orders` - Đơn hàng gần đây _(admin)_  
- `GET /api/dashboard/top-restaurants` - Top nhà hàng _(admin)_  
- `GET /api/dashboard/order-stats` - Thống kê đơn hàng _(admin)_  

---

### 🗺️ Map (`/api/map`)

- `GET /api/map/geocode` - Chuyển địa chỉ sang tọa độ  
- `GET /api/map/reverse-geocode` - Chuyển tọa độ sang địa chỉ  
- `GET /api/map/distance` - Tính khoảng cách  
- `GET /api/map/autocomplete` - Autocomplete địa chỉ  
- `GET /api/map/place/:placeId` - Thông tin địa điểm  

---

### 🏥 Health Check (`/api/health`)

- `GET /api/health` - Health check tổng quát  
- `GET /api/health/ready` - Readiness probe  
- `GET /api/health/live` - Liveness probe  

---

### 🧪 Drone Simulation (`/api/drone-sim`)

- `POST /api/drone-sim/arrive/:orderId` - Simulate drone arrival  
- `POST /api/drone-sim/confirm/:orderId` - Simulate customer confirmation  
- `GET /api/drone-sim/status/:orderId` - Delivery status  

---

### 📈 Metrics

- `GET /metrics` - Prometheus metrics  


## 🧪 Testing

```bash
# Backend tests
cd server_app
npm test

# Frontend tests
cd client_app
npm test
```



## DEPLOY BẰNG VERCEL ( CHO FRONTEND ) + RAILWAY ( CHO BACKEND ) 

Đây là các đường dẫn chính đến các thành phần của ứng dụng **FoodFast**:

* **🌐 Ứng dụng Khách hàng (Client/User)**:
    * Truy cập tại: [https://foodfast.vercel.app/](https://foodfast.vercel.app/)

* **🔑 Ứng dụng Quản trị viên (Admin)**:
    * Truy cập tại: [https://foodfast-admin.vercel.app](https://foodfast-admin.vercel.app/login)

* **🍴 Ứng dụng Nhà hàng (Restaurant)**:
    * Truy cập tại: [https://foodfast-restaurant.vercel.app](https://foodfast-restaurant.vercel.app/dashboard)

---
# 🚀 Triển khai Vercel — FOODFAST
**(Hướng dẫn triển khai toàn bộ repository FoodFast lên Vercel)**

Tài liệu này hướng dẫn chi tiết quá trình triển khai **toàn bộ hệ thống FoodFast** lên **Vercel**, bao gồm nhiều mô-đun frontend như:

- **Client App**
- **Admin App**
- **Restaurant App**
- *(và các module mở rộng như Drone Manage, Dashboard, v.v.)*

> 📂 Ảnh minh họa và tài liệu triển khai được lưu trong thư mục `asset/Vercel/`.

---

## 🧭 1. Tổng quan cách triển khai

Bạn có thể triển khai repository này theo **2 cách chính** tùy vào nhu cầu quản lý và release:

### 1️⃣ Mỗi ứng dụng = 1 Project trên Vercel (khuyến nghị)
- Tạo **một project riêng** cho từng thư mục: `client_app`, `admin_app`, `restaurant_app`, ...
- Vào **Project → Settings → Git → Root Directory** và trỏ tới thư mục con tương ứng.
- Mỗi project có thể gắn **domain riêng**:  
  - `foodfast.vercel.app`  
  - `foodfast-restaurant.vercel.app`  
  - `foodfast-admin.vercel.app`  
- Dễ quản lý log, rollback và phân quyền.

### 2️⃣ Monorepo — 1 Project duy nhất
- Dùng file `vercel.json` để cấu hình nhiều build và routes.
- Phù hợp nếu bạn muốn **1 project Vercel duy nhất** cho toàn bộ hệ thống.
- Cần cấu hình routes để trỏ tới đúng thư mục build.

---

## ⚙️ 2. Cấu hình Build & Framework (Vite + React)

Dưới đây là cấu hình gợi ý cho từng app:

| Ứng dụng | Root Directory | Build Command | Output Directory | Ghi chú |
|----------|----------------|---------------|------------------|---------|
| **Client App** | `client_app/` | `npm run build` | `dist` | Giao diện người dùng |
| **Admin App** | `admin_app/` | `npm run build` | `dist` | Trang quản trị |
| **Restaurant App** | `restaurant_app/` | `npm run build` | `dist` | Cổng dành cho nhà hàng |
| **Drone Manage** *(nếu là frontend)* | `drone_manage/` | `npm run build` | `dist` | Áp dụng nếu là Vite/React |

> 💡 Với Vite: cần có trong `package.json`:
> ```json
> {
>   "scripts": {
>     "build": "vite build"
>   }
> }
> ```
> và trong Vercel để:
> - **Build Command**: `npm run build`
> - **Output Directory**: `dist`

---

## 🔐 3. Biến môi trường (Environment Variables)

Thêm trong: **Vercel → Project → Settings → Environment Variables**.

Các biến thường dùng:

| Biến | Mô tả | Ví dụ |
|------|-------|--------|
| `VITE_API_URL` / `REACT_APP_API_URL` | URL backend | `https://api.foodfast.dev` |
| `CLOUDINARY_CLOUD_NAME` | Dùng cho upload ảnh |  |
| `CLOUDINARY_API_KEY` |  |  |
| `CLOUDINARY_API_SECRET` | **(Secret)** |  |


> ⚠️ **Không commit** các secret này vào repo.  
> ⚠️ Nếu dùng Vite thì biến phải bắt đầu bằng `VITE_...`.

---

## 🔁 4. Redeploy & Rollback

### 🔄 Redeploy
1. Vào **Project → Deployments**
2. Chọn deployment cần chạy lại
3. Bấm **Redeploy**

Hoặc **push lên nhánh đang kết nối** (thường là `main`) → Vercel sẽ tự build.

### ⏪ Rollback
- Vào **Deployments**
- Chọn bản cũ
- Bấm **Instant Rollback** (nếu plan hỗ trợ)

---

## 🖼️ 5. Hình ảnh minh họa

> 📂 Toàn bộ ảnh nằm trong thư mục: `asset/Vercel/`

---

### 🧩 Tổng quan giao diện triển khai

<table>
  <tr>
    <td align="center"><b>Hình 1 — foodfast-client</b><br><img src="asset/Vercel/1.png" width="400"/></td>
    <td align="center"><b>Hình 2 — foodfast-admin</b><br><img src="asset/Vercel/2.png" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>Hình 3 — foodfast-restaurant</b><br><img src="asset/Vercel/3.png" width="400"/></td>
    <td align="center"><b>Hình 4 — Framework Settings (Restaurant)</b><br><img src="asset/Vercel/4.png" width="400"/></td>
  </tr>
</table>

---

### ⚙️ Cấu hình chi tiết từng ứng dụng

<table>
  <tr>
    <td align="center"><b>Hình 5 — Framework Settings (Admin)</b><br><img src="asset/Vercel/5.png" width="400"/></td>
    <td align="center"><b>Hình 6 — Framework Settings (Client)</b><br><img src="asset/Vercel/6.png" width="400"/></td>
  </tr>
</table>

---

### 🌿 Thông tin nhánh & triển khai

<table>
  <tr>
    <td align="center"><b>Hình 7 — Các nhánh đang hoạt động</b><br><img src="asset/Vercel/7.png" width="400"/></td>
    <td align="center"><b>Hình 8 — Lịch sử Deployments</b><br><img src="asset/Vercel/8.png" width="400"/></td>
  </tr>
</table>

---
## 📁 6. Quy ước thêm ảnh mới

1. Lưu ảnh mới vào: `asset/Vercel/`
2. Đặt tên tiếp theo: `9.png`, `10.png`, `11.png`, ...
3. Thêm vào phần **Hình ảnh minh họa** giống mẫu trên.

---

## ✅ 7. Ghi chú nhanh

- Mỗi app đang dùng **Vite** → Output luôn là **`dist`**.
- Vercel sẽ **tự động build** nếu root trỏ đúng thư mục.
- Có thể **bật Skip deployments** cho các nhánh không quan trọng.
- Nên tách **Production** và **Preview** bằng các nhánh khác nhau.

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
## 📝 License

MIT License - Copyright (c) 2025
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue.
---

<p align="center">
  Made with by <b>FOODFAST Team SGU</b>
</p>

