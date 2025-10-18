# Tóm tắt sửa lỗi giá đơn hàng

## Vấn đề
Khi đặt hàng, giá đơn hàng bị tính sai - không áp dụng đúng các khuyến mãi và voucher mà đang hiển thị ở trang checkout.

## Nguyên nhân
1. **Client**: Khi thêm sản phẩm vào giỏ hàng, giá gốc (chưa áp dụng discount) được lưu vào cart
2. **Cart**: Hiển thị và tính tổng với giá gốc 
3. **Backend**: Tính lại giá từ database với discount
4. **Kết quả**: Frontend hiển thị giá A, nhưng backend lưu giá B

## Giải pháp đã thực hiện

### 1. Client Side - Tính giá đúng khi add vào cart
**File: `client_app/src/components/Product/ProductCard.jsx`**
- Xóa function `handleAddToCart` cũ không dùng
- Cập nhật `handleAddToCartChecked`: Tính giá sau discount trước khi add vào cart
```javascript
const finalPrice = product.discount 
  ? Math.round(product.price * (1 - product.discount / 100))
  : product.price

dispatch(addToCart({ ...product, price: finalPrice }))
```

**File: `client_app/src/pages/Product/ProductDetailPage.jsx`**
- Tính giá sau discount khi add vào cart
- Hiển thị đúng tổng tiền trên button "Thêm vào giỏ hàng"

### 2. Cart Page - Tự động cập nhật giá
**File: `client_app/src/pages/Cart/CartPage.jsx`**
- Thêm useEffect để tự động cập nhật giá từ database khi load trang
- Đảm bảo giá trong cart luôn đồng bộ với database
- Import thêm `productAPI` và `updateItemDetails`

### 3. Checkout Page - Gửi thông tin validation
**File: `client_app/src/pages/Checkout/CheckoutPage.jsx`**
- Thêm `clientCalculatedTotal` và `clientDiscount` vào orderData
- Backend sẽ dùng để validation

### 4. Backend - Validation và logging
**File: `server_app/API/Controllers/orderController.js`**
- Nhận `clientCalculatedTotal` và `clientDiscount` từ request
- So sánh giá tính từ server vs client
- Log warning nếu có sai lệch (> 1 VND)
- Vẫn sử dụng giá từ server để đảm bảo an toàn

## Cách kiểm tra
1. Xóa giỏ hàng cũ (nếu có)
2. Thêm sản phẩm có discount vào giỏ hàng
3. Chọn voucher tại trang checkout
4. Đặt hàng và kiểm tra:
   - Giá hiển thị ở checkout
   - Giá được lưu trong database
   - Console log để xem validation

## Lưu ý
- Giá trong cart bây giờ là giá **sau discount sản phẩm**
- Backend vẫn tính toán lại để đảm bảo an toàn
- Voucher discount được áp dụng riêng ở backend
- Nếu có sai lệch giá, check console log ở backend

## Test cases
- [ ] Sản phẩm không có discount
- [ ] Sản phẩm có discount
- [ ] Đơn hàng có voucher
- [ ] Đơn hàng có cả discount sản phẩm và voucher
- [ ] Giỏ hàng cũ được cập nhật giá mới
