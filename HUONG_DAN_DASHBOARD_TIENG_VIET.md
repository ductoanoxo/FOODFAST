# 🎯 Hướng dẫn sử dụng Dashboard CI/CD - Đơn giản

## 🚀 Bắt đầu nhanh

### 1. Mở Dashboard
```
Địa chỉ: http://13.220.101.54:3000
Tìm dashboard: "FoodFast CI/CD Pipeline"
```

### 2. Kiểm tra xem có dữ liệu chưa
Chạy lệnh này trong Git Bash:
```bash
bash test-cicd-metrics.sh
```

Nếu báo "No data" → Làm bước 3

### 3. Tạo dữ liệu mới
Có 2 cách:
- **Cách 1**: Push code lên GitHub (workflow tự chạy)
- **Cách 2**: Vào GitHub Actions → Chọn workflow → Bấm "Run workflow"

### 4. Xem kết quả
Đợi khoảng 1-2 phút, refresh dashboard → Sẽ thấy dữ liệu!

---

## 📊 Dashboard hiển thị gì?

### Hàng 1 - Số liệu tổng quan (24 giờ qua)
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Tổng số lần  │ Số lần       │ Số lần       │ Tỷ lệ        │ Thời gian    │
│ chạy         │ thành công   │ thất bại     │ thành công   │ trung bình   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Hàng 2 - Chỉ báo độ mới của dữ liệu
```
┌─────────────────────────────────────────────────────────────────┐
│  ⏰ Workflow chạy lần cuối cách đây: 15 phút                   │
│  [Màu xanh lá = mới | Màu vàng = hơi cũ | Màu đỏ = quá cũ]    │
└─────────────────────────────────────────────────────────────────┘
```
- 🟢 **Xanh lá** (< 1 giờ): Dữ liệu mới, yên tâm!
- 🟡 **Vàng** (1-2 giờ): Hơi cũ, nên chạy workflow mới
- 🔴 **Đỏ** (> 2 giờ): Quá cũ, cần chạy workflow ngay!

### Hàng 3 - Biểu đồ theo thời gian
- **Workflow Runs Rate**: Tần suất workflow chạy (5 phút)
- **Success vs Failure**: So sánh thành công/thất bại theo giờ
- **Duration**: Thời gian chạy của từng workflow

### Hàng 4 - Chi tiết
- **Status Table**: Bảng chi tiết từng workflow
- **By Branch**: Workflow chạy ở branch nào nhiều nhất
- **By Actor**: Ai trigger workflow nhiều nhất

### Hàng 5 - Hoạt động gần đây
- Danh sách các lần chạy workflow gần đây

---

## 🎨 Cách sử dụng

### ✅ **Xem tổng quan hàng ngày**
1. Mở dashboard
2. Nhìn hàng đầu tiên (5 ô số liệu)
3. Check:
   - Tỷ lệ thành công có > 80% không? ✅
   - Có workflow nào fail không? ❌
   - Thời gian chạy có bình thường không? ⏱️

### ✅ **Khi có workflow fail**
1. Nhìn bảng "Workflow Status Table"
2. Tìm dòng có icon ❌ (failed)
3. Xem workflow name và run number
4. Vào GitHub Actions để xem log chi tiết
5. Fix lỗi và chạy lại

### ✅ **Khi muốn xem chi tiết 1 workflow cụ thể**
1. Ở đầu dashboard, có 2 dropdown:
   - **Workflow**: Chọn workflow muốn xem
   - **Branch**: Chọn branch muốn xem
2. Dashboard sẽ tự động filter theo lựa chọn

### ✅ **Khi dashboard không có dữ liệu**
```bash
# Chạy lệnh này để check
bash test-cicd-metrics.sh

# Nếu báo "No data":
# → Vào GitHub Actions
# → Chạy bất kỳ workflow nào
# → Đợi 1-2 phút
# → Refresh dashboard
```

---

## 🔍 Các tình huống thực tế

### **Tình huống 1: Sáng đến office, muốn xem CI/CD tối qua có ổn không**
1. Mở dashboard
2. Nhìn "Success Rate %" → Nên > 80%
3. Nhìn biểu đồ "Success vs Failure" → Màu xanh nhiều hơn đỏ
4. Check bảng "Recent Workflow Runs" → Xem có lỗi gì không

### **Tình huống 2: Push code lên, muốn xem workflow có pass không**
1. Push code lên GitHub
2. Đợi 2-3 phút
3. Refresh dashboard
4. Check "Recent Workflow Runs" → Tìm run mới nhất
5. Xem status: ✅ = Pass, ❌ = Fail

### **Tình huống 3: Deploy production, muốn monitor**
1. Trigger deploy workflow
2. Mở dashboard
3. Nhìn biểu đồ "Workflow Duration by Type"
4. Xem deploy workflow có chạy lâu hơn bình thường không
5. Check "Workflow Status Table" → Đợi thấy ✅

### **Tình huống 4: Weekly review với team**
1. Mở dashboard
2. Đổi time range thành "Last 7 days" (góc trên phải)
3. Screenshot các biểu đồ:
   - Success Rate
   - Success vs Failure
   - Runs by Branch
   - Runs by Actor
4. Discuss trong meeting

---

## ⚠️ Lưu ý quan trọng

### **Dashboard tự động refresh 30 giây**
- Không cần F5 liên tục
- Data sẽ tự động update
- Nếu muốn refresh ngay → Bấm F5

### **Data hiển thị trong 24 giờ**
- Các số liệu KPI đều tính trong 24h gần nhất
- Muốn xem data cũ hơn → Đổi time range ở góc trên phải

### **Workflow phải chạy mới có data**
- Dashboard chỉ hiển thị khi có workflow chạy
- Không tự động generate fake data
- Cần trigger workflow thường xuyên để có data fresh

---

## 🆘 Khi gặp vấn đề

### ❓ **Dashboard báo "No data"**
**Giải pháp:**
1. Chạy: `bash test-cicd-metrics.sh`
2. Nếu không có metrics → Trigger workflow trên GitHub
3. Đợi workflow chạy xong
4. Refresh dashboard

### ❓ **Data hiển thị nhưng là màu đỏ (quá cũ)**
**Giải pháp:**
1. Trigger bất kỳ workflow nào trên GitHub
2. Đợi 1-2 phút
3. Dashboard sẽ tự động update

### ❓ **Dashboard bị lỗi, không load được**
**Giải pháp:**
```bash
# Check Grafana có chạy không
curl http://13.220.101.54:3000

# Nếu không response → Grafana đang down
# → Liên hệ DevOps team
```

### ❓ **Muốn xem data cũ hơn**
**Giải pháp:**
1. Góc trên phải dashboard
2. Bấm vào time range (vd: "Last 6 hours")
3. Chọn range khác (Last 24 hours, Last 7 days, etc.)

---

## 📞 Liên hệ

- **Dashboard URL**: http://13.220.101.54:3000
- **GitHub Actions**: https://github.com/ductoanoxo/FOODFAST/actions
- **Hướng dẫn chi tiết**: Xem file `CICD_DASHBOARD_REALTIME_GUIDE.md`
- **Quick reference**: Xem file `CICD_DASHBOARD_QUICKREF.md`

---

## ✨ Tips hay

1. **Bookmark dashboard** → Không phải tìm mỗi lần mở
2. **Mở dashboard trên màn hình phụ** → Monitor liên tục khi làm việc
3. **Check dashboard mỗi sáng** → Biết tình hình CI/CD ngay
4. **Screenshot khi có lỗi** → Dễ report và discuss
5. **Đổi dark/light theme** → User icon → Preferences → UI Theme

---

**Chúc bạn monitoring hiệu quả! 🚀**
