# 📖 Hướng dẫn sử dụng Restaurant App

## 🎯 Giới thiệu

Restaurant App là ứng dụng quản lý nhà hàng trong hệ thống giao đồ ăn bằng drone FOODFAST. Ứng dụng giúp chủ nhà hàng:
- Quản lý đơn hàng từ khách hàng
- Cập nhật trạng thái đơn hàng
- Quản lý thực đơn món ăn
- Xem thống kê và báo cáo
- Cập nhật thông tin nhà hàng

---

## 🚀 Bắt đầu

### 1. Đăng nhập

1. Mở trình duyệt và truy cập: `http://localhost:3001`
2. Bạn sẽ thấy trang đăng nhập
3. Nhập thông tin:
   - **Email**: `restaurant@foodfast.com`
   - **Mật khẩu**: `restaurant123`
4. Click nút **"Đăng nhập"**
5. Hệ thống sẽ chuyển bạn đến trang Dashboard

> 💡 **Lưu ý**: Chỉ tài khoản có vai trò "restaurant" mới được phép đăng nhập.

---

## 📊 Dashboard (Trang chủ)

Trang Dashboard hiển thị tổng quan về hoạt động nhà hàng của bạn.

### Thông tin hiển thị:

#### 📈 Thống kê tổng quan
1. **Tổng đơn hàng**: Tổng số đơn hàng của nhà hàng
2. **Đang xử lý**: Số đơn đang chờ xác nhận hoặc đang chuẩn bị
3. **Hoàn thành**: Số đơn đã giao thành công
4. **Doanh thu hôm nay**: Tổng doanh thu trong ngày

#### 📊 Biểu đồ
1. **Doanh thu 7 ngày qua**:
   - Biểu đồ cột hiển thị doanh thu theo ngày
   - Giúp theo dõi xu hướng kinh doanh

2. **Trạng thái đơn hàng**:
   - Biểu đồ tròn hiển thị phân bố đơn hàng
   - Màu sắc tương ứng với từng trạng thái

#### 📋 Đơn hàng gần đây
- Bảng hiển thị 5 đơn hàng mới nhất
- Thông tin: Mã đơn, Khách hàng, Số tiền, Trạng thái, Thời gian

---

## 🛒 Quản lý đơn hàng

### Truy cập
Click menu **"Đơn hàng"** trên thanh bên trái.

### Các tab trạng thái:

#### 1. **Tất cả**
Hiển thị toàn bộ đơn hàng

#### 2. **Chờ xác nhận** 🟠
- Đơn hàng mới từ khách hàng
- Cần xác nhận để bắt đầu chuẩn bị

**Hành động**: 
- Click **"Xác nhận đơn"** để chuyển sang trạng thái "Đang chuẩn bị"

#### 3. **Đang chuẩn bị** 🔵
- Đơn hàng đang được chế biến
- Nhà bếp đang làm món

**Hành động**:
- Click **"Sẵn sàng"** khi món ăn đã hoàn thành

#### 4. **Sẵn sàng giao** 🟦
- Món ăn đã sẵn sàng
- Chờ drone đến lấy hàng

**Hành động**:
- Click **"Giao hàng"** khi drone đã nhận hàng

#### 5. **Đang giao** 🟣
- Drone đang giao hàng cho khách
- Không thể thay đổi trạng thái (do drone quản lý)

#### 6. **Hoàn thành** 🟢
- Đơn hàng đã giao thành công
- Không thể thay đổi

### Xem chi tiết đơn hàng:

1. Click nút **"Chi tiết"** trên card đơn hàng
2. Modal sẽ hiển thị:
   - **Thông tin khách hàng**: Tên, SĐT, Địa chỉ giao hàng
   - **Chi tiết món ăn**: Tên món, số lượng, giá
   - **Thông tin thanh toán**: Tổng tiền, phí ship, phương thức
   - **Lịch sử**: Timeline các thay đổi trạng thái
   - **Ghi chú**: Yêu cầu đặc biệt từ khách (nếu có)

### Thông báo real-time:

🔔 Khi có đơn hàng mới:
- Thông báo popup góc phải màn hình
- Âm thanh thông báo (nếu bật)
- Tab "Chờ xác nhận" tăng số lượng
- Danh sách tự động cập nhật

---

## 🍕 Quản lý thực đơn

### Truy cập
Click menu **"Thực đơn"** trên thanh bên trái.

### Thêm món ăn mới:

1. Click nút **"Thêm món mới"** ở góc phải
2. Điền thông tin trong form:
   - **Tên món ăn** (*): Tên món (VD: Phở bò đặc biệt)
   - **Mô tả**: Mô tả chi tiết món ăn
   - **Giá** (*): Giá bán (VD: 50000)
   - **Danh mục** (*): Chọn loại món
     - 🍚 Cơm
     - 🍜 Mì/Phở
     - 🥤 Đồ uống
     - 🍿 Đồ ăn vặt
     - 🍰 Tráng miệng
     - 🍽️ Khác
   - **Trạng thái** (*): Còn hàng / Hết hàng
   - **Hình ảnh**: Upload ảnh món ăn
3. Click **"Thêm mới"**

> 💡 **Lưu ý upload ảnh**:
> - Kích thước tối đa: 2MB
> - Định dạng: JPG, PNG, GIF, WebP
> - Nên dùng ảnh chất lượng cao, tỷ lệ vuông

### Chỉnh sửa món ăn:

1. Click nút **"Sửa"** trên card món ăn
2. Form sẽ hiển thị với thông tin hiện tại
3. Thay đổi thông tin cần sửa
4. Click **"Cập nhật"**

### Xóa món ăn:

1. Click nút **"Xóa"** trên card món ăn
2. Xác nhận trong popup
3. Món ăn sẽ bị xóa khỏi hệ thống

> ⚠️ **Cảnh báo**: Không thể khôi phục sau khi xóa!

### Tìm kiếm và lọc:

#### Tìm kiếm:
- Nhập tên món trong ô **"Tìm kiếm món ăn..."**
- Kết quả hiển thị ngay khi gõ

#### Lọc theo danh mục:
- Chọn danh mục trong dropdown
- Chỉ hiển thị món thuộc danh mục đó

#### Lọc theo trạng thái:
- **Tất cả**: Hiển thị tất cả món
- **Còn hàng**: Chỉ món đang có sẵn
- **Hết hàng**: Chỉ món tạm hết

### Cập nhật trạng thái nhanh:

Khi món ăn tạm thời hết:
1. Click **"Sửa"** trên món đó
2. Chuyển **Trạng thái** thành "Hết hàng"
3. Click **"Cập nhật"**

Khách hàng sẽ không thấy món này khi đặt hàng.

---

## 👤 Quản lý hồ sơ

### Truy cập
Click menu **"Cá nhân"** trên thanh bên trái.

### Cập nhật thông tin nhà hàng:

#### Thông tin chung:
1. **Tên nhà hàng**: Tên hiển thị cho khách
2. **Mô tả**: Giới thiệu về nhà hàng
3. **Địa chỉ**: Địa chỉ thực tế của nhà hàng
4. **Số điện thoại**: SĐT liên hệ
5. **Email**: Email liên hệ
6. **Giờ mở cửa**: VD: "8:00 - 22:00"

Sau khi sửa, click **"Cập nhật thông tin"**

### Trạng thái hoạt động:

**Toggle Mở cửa/Đóng cửa**:
- **BẬT** (Mở cửa): Nhà hàng đang hoạt động, nhận đơn
- **TẮT** (Đóng cửa): Tạm ngưng nhận đơn

Khách hàng không thể đặt hàng khi nhà hàng đóng cửa.

### Thống kê:

Xem thông tin:
- **Đánh giá**: Điểm trung bình từ khách hàng
- **Số lượt đánh giá**: Tổng số người đánh giá

---

## 🔔 Thông báo

### Các loại thông báo:

#### 1. Đơn hàng mới
- **Màu xanh**
- Hiển thị khi có đơn mới
- Âm thanh thông báo

#### 2. Cập nhật thành công
- **Màu xanh lá**
- Khi lưu thông tin thành công

#### 3. Lỗi
- **Màu đỏ**
- Khi có lỗi xảy ra

#### 4. Cảnh báo
- **Màu vàng**
- Các thông báo quan trọng

---

## ⚙️ Cài đặt

### Đăng xuất:

1. Click **avatar** ở góc phải header
2. Chọn **"Đăng xuất"**
3. Hệ thống sẽ đưa bạn về trang đăng nhập

---

## 💡 Mẹo sử dụng

### Tối ưu hiệu quả:

1. **Kiểm tra đơn hàng thường xuyên**:
   - Trang đơn hàng tự động refresh mỗi 30 giây
   - Nhưng nên chủ động kiểm tra khi bận

2. **Cập nhật trạng thái kịp thời**:
   - Xác nhận đơn ngay khi nhận
   - Đánh dấu sẵn sàng khi món xong
   - Giúp drone phối hợp giao hàng tốt hơn

3. **Quản lý menu hiệu quả**:
   - Cập nhật trạng thái khi hết nguyên liệu
   - Thêm ảnh đẹp để thu hút khách
   - Mô tả rõ ràng về món ăn

4. **Theo dõi thống kê**:
   - Xem dashboard mỗi ngày
   - Phân tích doanh thu
   - Điều chỉnh chiến lược kinh doanh

### Phím tắt:

- **F5**: Refresh trang
- **Ctrl + K**: Focus vào ô tìm kiếm (sắp có)
- **Esc**: Đóng modal/popup

---

## ❓ FAQ - Câu hỏi thường gặp

### 1. Tôi quên mật khẩu, làm sao?
Liên hệ admin để reset mật khẩu.

### 2. Tại sao không thấy đơn hàng mới?
- Kiểm tra kết nối internet
- Refresh trang (F5)
- Kiểm tra nhà hàng đang mở cửa chưa

### 3. Upload ảnh bị lỗi?
- Kiểm tra kích thước file < 2MB
- Chỉ dùng file JPG, PNG, GIF, WebP
- Thử nén ảnh trước khi upload

### 4. Làm sao biết có đơn mới?
- Thông báo popup góc phải
- Số lượng trên tab tăng
- Âm thanh thông báo (nếu bật)

### 5. Có thể hủy đơn hàng không?
Không, nhà hàng không thể hủy đơn. Liên hệ khách hàng hoặc admin.

### 6. Đổi giá món ăn có ảnh hưởng đơn cũ?
Không, đơn cũ vẫn giữ nguyên giá cũ.

### 7. Thống kê có chính xác không?
Có, dữ liệu real-time từ hệ thống.

### 8. Có thể xem đơn hàng của ngày hôm qua?
Có, tất cả đơn lưu trong tab "Tất cả" và "Hoàn thành".

---

## 🆘 Hỗ trợ

### Gặp vấn đề?

1. **Làm mới trang**: Thử refresh (F5)
2. **Xóa cache**: Ctrl + Shift + Del
3. **Đăng xuất/nhập lại**: Có thể fix lỗi token
4. **Liên hệ hỗ trợ**: 

📞 **Hotline**: 1900-XXXX  
📧 **Email**: support@foodfast.com  
💬 **Chat**: Trong app (sắp có)

### Báo lỗi:

Khi gặp lỗi, cung cấp:
- Screenshot màn hình
- Thông tin lỗi (nếu có)
- Các bước tái hiện lỗi
- Thời gian xảy ra lỗi

---

## 📱 Sử dụng trên di động

App được tối ưu cho mobile:
- Responsive design
- Touch-friendly
- Hoạt động mượt trên điện thoại

**Khuyến nghị**:
- Dùng Chrome, Safari, Edge
- Kết nối wifi ổn định
- Cho phép thông báo

---

## 🎓 Video hướng dẫn

(Sẽ cập nhật)

- [ ] Video đăng nhập
- [ ] Video quản lý đơn hàng
- [ ] Video quản lý menu
- [ ] Video xem thống kê

---

## 📞 Liên hệ

**FOODFAST Support Team**

🏢 Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM  
📞 Hotline: 1900-XXXX  
📧 Email: support@foodfast.com  
🌐 Website: www.foodfast.com  

**Giờ làm việc**: 8:00 - 22:00 (Thứ 2 - CN)

---

## 📝 Ghi chú bổ sung

- App yêu cầu kết nối internet
- Dữ liệu được lưu trên server, an toàn
- Hỗ trợ Chrome, Edge, Safari, Firefox
- Tương thích Windows, Mac, Linux
- Responsive trên mobile, tablet, desktop

---

**Chúc bạn kinh doanh thành công với FOODFAST! 🚀🍕**
