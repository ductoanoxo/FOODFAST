# Dashboard Multi-Branch Support Test

Dashboard đã được config để support nhiều branches:

## ✅ Features:

1. **Branch Filter Dropdown**
   - Dashboard có dropdown "Branch" ở phía trên
   - Có thể chọn: All, main, kiet, hoặc bất kỳ branch nào
   - Filter tất cả panels theo branch đã chọn

2. **Workflow Filter Dropdown**
   - Dashboard có dropdown "Workflow" ở phía trên  
   - Chọn workflow cụ thể để xem metrics

3. **Pie Chart by Branch**
   - Panel "Runs by Branch" hiển thị phân bố workflows theo branch
   - Màu sắc khác nhau cho mỗi branch

4. **Table with Branch Column**
   - Tables hiển thị cột "Branch" để dễ phân biệt
   - Sort theo branch được

## 🔍 Queries Support Multi-Branch:

```promql
# Tổng runs theo branch
sum(github_workflow_run_total) by (branch)

# Workflow cụ thể trên branch cụ thể  
github_workflow_run_total{workflow="CI - Test", branch="kiet"}

# Duration theo workflow và branch
github_workflow_duration_seconds{workflow="...", branch="..."}
```

## 📊 Test:

Khi bạn push code lên nhiều branches khác nhau:
- Branch `main` → workflows chạy → metrics có label `branch="main"`
- Branch `kiet` → workflows chạy → metrics có label `branch="kiet"`  
- Branch `develop` → workflows chạy → metrics có label `branch="develop"`

Dashboard tự động detect và hiển thị tất cả branches trong dropdown!

## 🎯 Demo:

1. Push commit lên branch `kiet` → CI runs → export metrics
2. Push commit lên branch `main` → CI runs → export metrics  
3. Vào Grafana dashboard
4. Click dropdown "Branch" → sẽ thấy: All, kiet, main
5. Chọn "kiet" → chỉ hiển thị metrics từ branch kiet
6. Chọn "All" → hiển thị tất cả branches

**Dashboard ĐÃ BIẾT phân biệt và filter theo nhiều branches!** ✅
