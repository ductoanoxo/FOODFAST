
# Danh sách các endpoint API — FoodFast (thư mục `server_app`)

Dưới đây là bản dịch tiếng Việt của toàn bộ các endpoint được tìm thấy trong `server_app`. Mỗi dòng gồm: phương thức HTTP, đường dẫn đầy đủ (bao gồm prefix từ `index.js`), ghi chú về middleware/quyền hạn, và tên handler/Controller nơi xử lý.

Base router (từ `server_app/index.js`):

- `/api/auth` -> `API/Routers/authRouter.js`
- `/api/users` -> `API/Routers/userRouter.js`
- `/api/products` -> `API/Routers/productRouter.js`
- `/api/categories` -> `API/Routers/categoryRouter.js`
- `/api/restaurants` -> `API/Routers/restaurantRouter.js`
- `/api/orders` -> `API/Routers/orderRouter.js`
- `/api/drones` -> `API/Routers/droneRouter.js`
- `/api/payment` -> `API/Routers/paymentRouter.js`
- `/api/reviews` -> `API/Routers/reviewRouter.js`
- `/api/upload` -> `API/Routers/uploadRouter.js`
- `/api/vouchers` -> `API/Routers/voucherRouter.js`
- `/api/promotions` -> `API/Routers/promotionRouter.js`
- `/api/admin` -> `API/Routers/adminRouter.js` (tất cả route đã được bảo vệ và yêu cầu role `admin`)
- `/api/dashboard` -> `API/Routers/dashboardRouter.js` (bảo vệ, yêu cầu role `admin`)

---

## `/api/auth` (Controller: `API/Controllers/authController.js`)

- POST `/api/auth/register` — public — đăng ký (register)
- POST `/api/auth/login` — public — đăng nhập (login)
- POST `/api/auth/logout` — protected — đăng xuất (logout)
- GET `/api/auth/me` — protected — lấy profile hiện tại (getProfile) (alias /me)
- GET `/api/auth/profile` — protected — lấy profile (getProfile)
- PUT `/api/auth/profile` — protected — cập nhật profile (updateProfile)

## `/api/users` (Controller: `API/Controllers/userController.js`)

- GET `/api/users/check-email` — public — kiểm tra email đã tồn tại
- GET `/api/users/stats` — protected, role `admin` — thống kê người dùng
- GET `/api/users/` — protected, role `admin` — lấy danh sách người dùng
- GET `/api/users/:id` — protected, role `admin` — lấy thông tin 1 user
- PUT `/api/users/:id` — protected, role `admin` — cập nhật user
- DELETE `/api/users/:id` — protected, role `admin` — xóa user
- GET `/api/users/:id/orders` — protected — lấy đơn hàng của user

## `/api/products` (Controller: `API/Controllers/productController.js`)

- GET `/api/products/popular` — public — sản phẩm phổ biến
- GET `/api/products/restaurant` — protected, role `restaurant` or `admin` — lấy sản phẩm theo nhà hàng (scope restaurant)
- GET `/api/products/` — public — lấy danh sách sản phẩm (pagination/filters tùy controller)
- POST `/api/products/` — protected, role `restaurant` or `admin`, multipart (image) — tạo sản phẩm (upload ảnh qua `multipart/form-data` field `image`)
- GET `/api/products/:id` — public — lấy chi tiết sản phẩm
- PUT `/api/products/:id` — protected, role `restaurant` or `admin`, multipart (image) — cập nhật sản phẩm (có thể upload ảnh mới)
- DELETE `/api/products/:id` — protected, role `restaurant` or `admin` — xóa sản phẩm

## `/api/categories` (Controller: `API/Controllers/categoryController.js`)

- GET `/api/categories/` — public — lấy danh sách categories
- POST `/api/categories/` — protected, role `admin` hoặc `restaurant` — tạo category
- GET `/api/categories/restaurant/with-products` — protected, role `restaurant` — lấy categories kèm products cho restaurant
- GET `/api/categories/:id` — public — lấy category theo id
- PUT `/api/categories/:id` — protected, role `admin` hoặc `restaurant` — cập nhật category
- DELETE `/api/categories/:id` — protected, role `admin` hoặc `restaurant` — xóa category
- GET `/api/categories/:id/products` — public — lấy sản phẩm thuộc category

## `/api/restaurants` (Controller: `API/Controllers/restaurantController.js`)

- GET `/api/restaurants/nearby` — public — lấy nhà hàng gần vị trí
- GET `/api/restaurants/` — public — lấy danh sách nhà hàng
- POST `/api/restaurants/` — protected, role `admin` — tạo nhà hàng
- POST `/api/restaurants/create-with-account` — protected, role `admin` — tạo nhà hàng kèm tài khoản
- GET `/api/restaurants/:id` — public — chi tiết nhà hàng
- PUT `/api/restaurants/:id` — protected, role `restaurant` or `admin`, multipart (image) — cập nhật nhà hàng (upload ảnh qua field `image`)
- DELETE `/api/restaurants/:id` — protected, role `admin` — xóa nhà hàng
- GET `/api/restaurants/:id/menu` — public — lấy menu (sản phẩm) của nhà hàng
- GET `/api/restaurants/:id/orders` — protected, role `restaurant` or `admin` — lấy đơn hàng của nhà hàng
- PATCH `/api/restaurants/:id/toggle-status` — protected, role `restaurant` or `admin` — bật/tắt trạng thái nhà hàng
- GET `/api/restaurants/:id/stats` — protected, role `restaurant` or `admin` — thống kê nhà hàng

## `/api/orders` (Controller: `API/Controllers/orderController.js`)

- GET `/api/orders/history` — protected — lịch sử đơn hàng (user)
- GET `/api/orders/restaurant` — protected, role `restaurant` or `admin` — lấy đơn hàng theo nhà hàng
- GET `/api/orders/` — protected — lấy danh sách đơn hàng (tuỳ role logic ở controller)
- POST `/api/orders/` — protected — tạo đơn hàng
- GET `/api/orders/:id` — protected — lấy chi tiết đơn hàng
- PATCH `/api/orders/:id/status` — protected, role `restaurant` or `admin` — cập nhật trạng thái đơn
- PATCH `/api/orders/:id/cancel` — protected — huỷ đơn
- POST `/api/orders/:id/confirm-delivery` — protected — xác nhận giao hàng
- GET `/api/orders/:id/track` — protected — theo dõi đơn hàng (tracking)

## `/api/drones` (Controller: `API/Controllers/droneController.js`)

- GET `/api/drones/nearby` — protected, role `admin` — lấy các drone gần
- GET `/api/drones/` — public — lấy danh sách drone
- POST `/api/drones/` — protected, role `admin` — tạo drone
- GET `/api/drones/:id` — public — chi tiết drone
- PUT `/api/drones/:id` — protected, role `drone` or `admin` — cập nhật drone
- DELETE `/api/drones/:id` — protected, role `admin` — xóa drone
- PATCH `/api/drones/:id/location` — protected, role `drone` or `admin` — cập nhật vị trí drone
- PATCH `/api/drones/:id/status` — protected, role `drone` or `admin` — cập nhật trạng thái
- PATCH `/api/drones/:id/battery` — protected, role `drone` or `admin` — cập nhật pin
- POST `/api/drones/:id/assign` — protected, role `admin` — gán drone cho đơn
- GET `/api/drones/:id/stats` — protected, role `admin` — thống kê drone

## `/api/payment` (Controller: `API/Controllers/paymentController.js`)

- POST `/api/payment/vnpay/create` — protected — tạo giao dịch VNPay
- GET `/api/payment/vnpay/return` — public — callback/return VNPay
- GET `/api/payment/vnpay/ipn` — public — IPN VNPay
- POST `/api/payment/vnpay/querydr` — protected — truy vấn giao dịch VNPay
- POST `/api/payment/vnpay/refund` — protected — refund VNPay
- POST `/api/payment/momo/create` — protected — tạo giao dịch Momo
- POST `/api/payment/momo/callback` — public — callback Momo
- GET `/api/payment/:orderId` — protected — thông tin thanh toán cho order
- GET `/api/payment/methods` — public — trả về danh sách phương thức thanh toán (static)

## `/api/reviews` (Controller: `API/Controllers/reviewController.js`)

- POST `/api/reviews/` — protected — tạo đánh giá
- GET `/api/reviews/product/:productId` — public — lấy đánh giá của sản phẩm
- GET `/api/reviews/user/:userId` — public — lấy đánh giá của user
- GET `/api/reviews/restaurant/:restaurantId` — public — lấy đánh giá của nhà hàng
- PUT `/api/reviews/:id` — protected — cập nhật đánh giá
- DELETE `/api/reviews/:id` — protected — xóa đánh giá

## `/api/upload` (Controller: `API/Controllers/uploadController.js`)

- POST `/api/upload/image` — protected, multipart (image) — upload 1 ảnh (field `image`)
- POST `/api/upload/images` — protected, multipart (images[]) — upload nhiều ảnh (field `images`)
- DELETE `/api/upload/:filename` — protected, role `admin` — xóa file ảnh theo tên

## `/api/vouchers` (Controller: `API/Controllers/voucherController.js`)

- GET `/api/vouchers/public/:restaurantId` — public — lấy voucher công khai của nhà hàng
- POST `/api/vouchers/validate` — protected — validate voucher (áp dụng cho user)
- GET `/api/vouchers/` — protected — lấy danh sách voucher (owner)
- POST `/api/vouchers/` — protected — tạo voucher
- GET `/api/vouchers/:id` — protected — lấy chi tiết voucher
- PUT `/api/vouchers/:id` — protected — cập nhật voucher
- DELETE `/api/vouchers/:id` — protected — xóa voucher
- GET `/api/vouchers/:id/stats` — protected — thống kê voucher

## `/api/promotions` (Controller: `API/Controllers/promotionController.js`)

- GET `/api/promotions/active/:restaurantId` — public — lấy chương trình khuyến mãi đang hoạt động
- GET `/api/promotions/products/:restaurantId` — public — lấy sản phẩm có khuyến mãi
- GET `/api/promotions/` — protected, role `restaurant` — lấy danh sách khuyến mãi (owner)
- POST `/api/promotions/` — protected, role `restaurant` — tạo khuyến mãi
- PUT `/api/promotions/:id` — protected, role `restaurant` — cập nhật khuyến mãi
- DELETE `/api/promotions/:id` — protected, role `restaurant` — xóa khuyến mãi
- PATCH `/api/promotions/:id/toggle` — protected, role `restaurant` — bật/tắt khuyến mãi

## `/api/admin` (Controller: `API/Controllers/adminController.js`)

> Lưu ý: router `/api/admin` áp dụng `protect` và `authorize('admin')` cho toàn bộ route.

- GET `/api/admin/orders/pending` — danh sách đơn chờ xử lý
- GET `/api/admin/drones/available` — drone sẵn sàng
- GET `/api/admin/drones/performance` — hiệu suất drone
- POST `/api/admin/assign-drone` — gán drone cho đơn
- POST `/api/admin/reassign-order` — gán lại đơn
- GET `/api/admin/fleet/stats` — thống kê fleet
- GET `/api/admin/fleet/map` — bản đồ fleet

## `/api/dashboard` (Controller: `API/Controllers/dashboardController.js`)

> Lưu ý: router `/api/dashboard` áp dụng `protect` và `authorize('admin')` cho toàn bộ route.

- GET `/api/dashboard/stats` — số liệu dashboard
- GET `/api/dashboard/recent-orders` — đơn hàng gần đây
- GET `/api/dashboard/top-restaurants` — top nhà hàng
- GET `/api/dashboard/order-stats` — thống kê theo đơn

---

Ghi chú & giả định:

- Middleware `protect` nghĩa là cần xác thực (token/cookie). `authorize(...)` là kiểm tra role.
- Một số route nhận uploads (cấu hình bằng multer trong router). Đã ghi chú multipart khi có.
- Các hàm controller nằm trong `server_app/API/Controllers/` (file cụ thể không liệt kê chi tiết request/response ở đây).

Bạn muốn mình tiếp theo làm gì?
- Mở rộng từng Controller để mô tả request/response và ví dụ payload.
- Sinh OpenAPI (Swagger) spec (YAML/JSON) từ danh sách này.
- Tạo Postman collection hoặc ví dụ curl cho từng endpoint.
- Sửa format Markdown (nếu muốn tuân lint chặt hơn).

