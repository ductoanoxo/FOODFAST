# 🚁 Hướng dẫn sử dụng Quản lý Drone

## 📍 Truy cập

```
URL: http://localhost:3002/drones
Login: admin@foodfast.com / admin123
```

## ⚡ Các chức năng

### 1️⃣ Thêm Drone Mới

**Bước 1:** Click nút **"Thêm Drone Mới"** (màu xanh, góc trên cùng)

**Bước 2:** Điền thông tin:
- **Tên drone**: Ví dụ "Drone Echo"
- **Model**: Ví dụ "DJI Air 3"
- **Serial Number**: CHỮ IN HOA + SỐ, ví dụ "DRONE005"
- **Vị trí Home**:
  - Vĩ độ (lat): 10.7731 (từ -90 đến 90)
  - Kinh độ (lng): 106.6947 (từ -180 đến 180)
- **Mức pin**: 0-100% (mặc định 100)
- **Tầm bay tối đa**: km (mặc định 10)
- **Trọng tải tối đa**: kg (mặc định 5)
- **Tốc độ**: km/h (mặc định 60)
- **Trạng thái**: Chọn từ dropdown

**Bước 3:** Click **"Thêm"**

✅ **Kết quả:**
- Thông báo "Thêm drone thành công!"
- Drone xuất hiện trong bảng
- Drone hiển thị trên Fleet Map

---

### 2️⃣ Xem Chi tiết Drone

**Bước 1:** Click nút **"Chi tiết"** (màu xanh) trên hàng drone

**Bước 2:** Xem thông tin:
- 📊 **Thống kê**: Pin, chuyến bay, quãng đường
- 📋 **Thông tin cơ bản**: Tên, model, serial
- ⚙️ **Thông số kỹ thuật**: Tốc độ, tầm bay, trọng tải
- 📍 **Vị trí**: Home location & current location
- 🔧 **Bảo trì**: Lịch sử bảo trì (nếu có)
- 📦 **Đơn hàng**: Order đang giao (nếu có)

**Bước 3:** Click **"Đóng"** để thoát

---

### 3️⃣ Sửa Drone

**Bước 1:** Click nút **"Sửa"** (màu xám) trên hàng drone

**Bước 2:** Form sẽ mở với dữ liệu hiện tại đã điền sẵn

**Bước 3:** Chỉnh sửa thông tin cần thiết:
- Có thể sửa: Tên, model, tọa độ, pin, status, ...
- **Không nên sửa**: Serial Number (trừ khi sai)

**Bước 4:** Click **"Cập nhật"**

✅ **Kết quả:**
- Thông báo "Cập nhật drone thành công!"
- Dữ liệu cập nhật trong bảng
- Fleet Map tự động refresh

---

### 4️⃣ Xóa Drone

**Bước 1:** Click nút **"Xóa"** (màu đỏ) trên hàng drone

**Bước 2:** Popup xác nhận xuất hiện:
```
Xác nhận xóa drone
Bạn có chắc chắn muốn xóa drone "Drone Echo" (DRONE005)?
```

**Bước 3:** Click **"Xóa"** để xác nhận hoặc **"Hủy"** để hủy

✅ **Kết quả (nếu xóa):**
- Thông báo "Xóa drone thành công!"
- Drone biến khỏi bảng
- Drone biến khỏi Fleet Map

⚠️ **Lưu ý:**
- **KHÔNG THỂ xóa** drone đang giao hàng
- Nếu cố xóa sẽ có lỗi: "Cannot delete drone that is currently assigned to an order"

---

## 🗂️ Bảng Drone - Các cột

| Cột | Mô tả |
|-----|-------|
| **Tên drone** | Tên đặt cho drone |
| **Model** | Model máy bay |
| **Serial Number** | Mã số duy nhất |
| **Pin** | % pin còn lại (có màu sắc) |
| **Trạng thái** | Sẵn sàng / Đang giao / Sạc / Bảo trì / Offline |
| **Tổng chuyến bay** | Số chuyến đã giao |
| **Hành động** | Nút Chi tiết / Sửa / Xóa |

---

## 🎨 Trạng thái Drone

| Trạng thái | Màu | Ý nghĩa |
|------------|-----|---------|
| **Sẵn sàng** | 🟢 Xanh lá | Có thể gán đơn hàng |
| **Đang giao** | 🟠 Cam | Đang giao hàng |
| **Đang sạc** | 🔵 Xanh dương | Đang sạc pin |
| **Bảo trì** | 🔴 Đỏ | Đang bảo trì |
| **Offline** | ⚫ Xám | Không hoạt động |

---

## 📍 Tọa độ hợp lệ (Việt Nam)

### Một số vị trí mẫu:

**TP. Hồ Chí Minh:**
```
lat: 10.7731, lng: 106.6947  (Quận 1)
lat: 10.7756, lng: 106.7006  (Quận 2)
lat: 10.7543, lng: 106.6811  (Quận 3)
lat: 10.8231, lng: 106.6297  (Tân Bình)
```

**Hà Nội:**
```
lat: 21.0285, lng: 105.8542  (Hoàn Kiếm)
lat: 21.0245, lng: 105.8412  (Ba Đình)
```

**Đà Nẵng:**
```
lat: 16.0471, lng: 108.2068  (Hải Châu)
```

---

## ⚠️ Validation Rules

### Serial Number:
- ✅ DRONE001, DRONE-002, ABC123
- ❌ drone001 (phải in hoa)
- ❌ Drone 001 (không có space)

### Tọa độ:
- **Vĩ độ (lat)**: -90 đến 90
- **Kinh độ (lng)**: -180 đến 180

### Battery:
- 0 đến 100 (%)

### Các giá trị số:
- **MaxRange**: Tối thiểu 1 km
- **MaxWeight**: Tối thiểu 0.1 kg
- **Speed**: Tối thiểu 1 km/h

---

## 🔄 Realtime Sync

Khi một admin thao tác (thêm/sửa/xóa drone):
- ✅ Tất cả admins khác sẽ thấy cập nhật **TỰ ĐỘNG**
- ✅ Fleet Map cập nhật **NGAY LẬP TỨC**
- ✅ Không cần refresh trang

---

## 🆘 Xử lý lỗi

### Lỗi thường gặp:

**1. "Serial Number already exists"**
- **Nguyên nhân**: Serial number đã được dùng
- **Giải pháp**: Đổi serial number khác

**2. "Cannot delete drone that is currently assigned to an order"**
- **Nguyên nhân**: Drone đang giao hàng
- **Giải pháp**: Đợi drone hoàn thành order hoặc reassign

**3. "Vĩ độ phải từ -90 đến 90"**
- **Nguyên nhân**: Nhập tọa độ sai
- **Giải pháp**: Kiểm tra lại tọa độ

**4. "Chỉ chấp nhận chữ in hoa và số"**
- **Nguyên nhân**: Serial có chữ thường hoặc ký tự đặc biệt
- **Giải pháp**: Chỉ dùng A-Z và 0-9

---

## 💡 Tips & Tricks

1. **Xem drone trên map**: Sau khi tạo drone, vào Fleet Map để xem vị trí

2. **Copy tọa độ**: Click vào Google Maps → Right click → Copy coordinates

3. **Filter nhanh**: Dùng Sort icon trên header bảng để sắp xếp theo pin, số chuyến bay

4. **Keyboard shortcuts**:
   - `Esc`: Đóng modal
   - `Enter`: Submit form (khi focus trong input)

5. **Bulk operations**: Nếu cần xóa nhiều drones, xóa từng cái một (chưa có bulk delete)

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Console (F12) xem có lỗi không
2. Check Network tab xem API call có thành công không
3. Verify token chưa hết hạn (logout/login lại)
4. Check server logs (terminal chạy backend)

---

## ✅ Checklist trước khi deploy

- [ ] Tất cả drones seed data hiển thị đúng
- [ ] Create drone mới thành công
- [ ] Edit drone cập nhật đúng dữ liệu
- [ ] Delete drone với confirmation
- [ ] Không thể xóa drone đang busy
- [ ] Socket notifications hoạt động
- [ ] Fleet Map sync realtime
- [ ] Validation messages rõ ràng
- [ ] Mobile responsive (nếu cần)

---

**🚀 Happy Drone Managing!**
