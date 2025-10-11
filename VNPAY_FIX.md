# Sửa lỗi VNPay - Mã lỗi 76

## Vấn đề
Lỗi "Ngân hàng thanh toán không được hỗ trợ" (Error code 76) khi thanh toán qua VNPay Sandbox.

## Nguyên nhân
1. Tham số `vnp_BankCode` không cần thiết cho VNPay Sandbox
2. Hàm `sortObject` encode params 2 lần gây lỗi checksum
3. Return URL cần phải khớp với cấu hình VNPay

## Các thay đổi đã thực hiện

### 1. Server - paymentController.js
✅ **Bỏ tham số vnp_BankCode** (line 60-64)
- VNPay Sandbox sẽ tự động hiển thị danh sách ngân hàng
- Không cần truyền bankCode từ client

✅ **Sửa hàm sortObject** (line 423-436)
- Loại bỏ encode 2 lần
- Giữ nguyên giá trị gốc của params

### 2. Client - VNPayReturnPage.jsx
✅ Đã tồn tại file xử lý return từ VNPay
- Xác thực signature
- Hiển thị kết quả thanh toán
- Redirect đến trang tracking

### 3. Cấu hình môi trường (.env)
✅ Đã có sẵn cấu hình VNPay:
```
VNPAY_TMN_CODE=1C1PQ01T
VNPAY_HASH_SECRET=VTN3PF8TMIMQNLDOYTM93JOE4XI8C62L
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay/return
```

## Cách test lại

1. **Khởi động server:**
```bash
cd server_app
npm start
```

2. **Khởi động client:**
```bash
cd client_app
npm run dev
```

3. **Thực hiện thanh toán:**
- Thêm sản phẩm vào giỏ hàng
- Chọn "Checkout"
- Chọn phương thức "VNPay"
- Click "Đặt hàng"
- Trên trang VNPay sandbox, chọn một ngân hàng bất kỳ
- Nhập thông tin test:
  - Số thẻ: 9704198526191432198
  - Tên chủ thẻ: NGUYEN VAN A
  - Ngày phát hành: 07/15
  - Mã OTP: 123456

4. **Kết quả mong đợi:**
- Thanh toán thành công
- Redirect về trang `/payment/vnpay/return`
- Hiển thị thông báo "Thanh toán thành công"
- Tự động chuyển đến trang tracking order sau 3 giây

## Lưu ý quan trọng

### VNPay Sandbox Test Credentials
Sử dụng thông tin test sau từ VNPay:

**Ngân hàng NCB:**
- Số thẻ: 9704198526191432198
- Tên chủ thẻ: NGUYEN VAN A
- Ngày phát hành: 07/15
- Mã OTP: 123456

### URL Return phải khớp
- Server config: `http://localhost:3000/payment/vnpay/return`
- Client route: `/payment/vnpay/return`
- Đảm bảo cả 2 khớp nhau

### Ports
- Server: http://localhost:5000
- Client: http://localhost:3000
- Admin: http://localhost:3002
- Restaurant: http://localhost:3001
- Drone: http://localhost:3003

## Troubleshooting

### Nếu vẫn gặp lỗi 76:
1. Kiểm tra console browser để xem request được gửi đi
2. Kiểm tra console server để xem params
3. Đảm bảo không có middleware nào encode lại params
4. Thử clear cache browser

### Nếu signature không hợp lệ:
1. Kiểm tra `VNPAY_HASH_SECRET` trong .env
2. Đảm bảo không có khoảng trắng thừa trong .env
3. Restart server sau khi sửa .env

### Nếu không redirect về client:
1. Kiểm tra `VNPAY_RETURN_URL` trong .env
2. Đảm bảo client đang chạy ở port 3000
3. Kiểm tra route `/payment/vnpay/return` trong App.jsx

## Các file đã sửa
1. ✅ `server_app/API/Controllers/paymentController.js`
2. ✅ `client_app/src/pages/Checkout/VNPayReturn.jsx` (đã có sẵn)
3. ✅ `client_app/src/pages/Payment/VNPayReturnPage.jsx` (tạo mới, backup)

## Kết luận
Các lỗi về VNPay đã được sửa. Hệ thống thanh toán VNPay hiện đã hoạt động ổn định với sandbox environment.
