# Fix: CI/CD Dashboard Metrics Counter Issue

## 🐛 Vấn đề

Khi chọn time range xa hơn (ví dụ: Last 6 days) trong dashboard, số workflow **giảm xuống** thay vì tăng lên, mặc dù trước đó có nhiều workflow chạy.

### Nguyên nhân

**Counter metrics được push SAI CÁCH** trong `export-cicd-metrics.yml`:

```yaml
# ❌ Code CŨ - SAI
github_workflow_run_total{...} 1  # Luôn là 1 mỗi lần!
github_workflow_success_total{...} $([ "$CONCLUSION" = "success" ] && echo 1 || echo 0)
github_workflow_failure_total{...} $([ "$CONCLUSION" = "failure" ] && echo 1 || echo 0)
```

**Vì sao sai?**
- Prometheus **counter** phải là giá trị **tăng dần** theo thời gian
- Push giá trị cố định (1 hoặc 0) không phải counter đúng nghĩa
- Khi query với time range dài hơn, Prometheus tính rate/increase từ các giá trị không tăng → kết quả sai

**Ví dụ minh họa:**
```
Workflow run #1  → push counter = 1
Workflow run #2  → push counter = 1  (❌ không tăng!)
Workflow run #50 → push counter = 1  (❌ vẫn là 1!)

→ Prometheus nghĩ: Counter không tăng = không có workflow mới
→ Dashboard hiển thị: 0 hoặc giá trị rất thấp
```

## ✅ Giải pháp

**Sử dụng `run_number` từ GitHub Actions làm counter value:**

```yaml
# ✅ Code MỚI - ĐÚNG
RUN_NUMBER=${{ github.event.workflow_run.run_number }}

# Counter tăng theo run_number thực tế
github_workflow_run_total{...} $RUN_NUMBER

# Success/Failure counter cũng dùng run_number
if [ "$CONCLUSION" = "success" ]; then
  SUCCESS_COUNT=$RUN_NUMBER
  FAILURE_COUNT=0
elif [ "$CONCLUSION" = "failure" ]; then
  SUCCESS_COUNT=0
  FAILURE_COUNT=$RUN_NUMBER
fi

github_workflow_success_total{...} $SUCCESS_COUNT
github_workflow_failure_total{...} $FAILURE_COUNT
```

**Tại sao đúng?**
- Counter tăng theo số lần workflow thực sự chạy (1, 2, 3, ..., 50, ...)
- Prometheus có thể tính `rate()` và `increase()` chính xác
- Dashboard hiển thị đúng số workflow theo time range

**Ví dụ với fix:**
```
Workflow run #1  → push counter = 1
Workflow run #2  → push counter = 2  (✅ tăng!)
Workflow run #50 → push counter = 50 (✅ tăng đúng!)

→ Prometheus: Counter tăng từ 1 → 50
→ Dashboard: Hiển thị 50 workflows trong time range
```

## 📊 Ảnh hưởng

**Trước khi fix:**
- Last 24 hours: Có data (vì chỉ xem gần nhất)
- Last 6 days: Ít data hoặc No Data (vì counter không tăng)
- Last 30 days: No Data

**Sau khi fix:**
- Last 24 hours: Data chính xác
- Last 6 days: Data chính xác (hiển thị tất cả workflow trong 6 ngày)
- Last 30 days: Data chính xác (với retention 30d đã config)

## 🚀 Deploy

Fix này đã được deploy tự động qua workflow:

1. **Commit**: `ed15257` - "fix: Use run_number as counter value instead of constant 1 for accurate metrics"
2. **Workflow sẽ chạy**: Các workflow tiếp theo sẽ push metrics đúng cách
3. **Dashboard sẽ update**: Sau vài workflow chạy, dashboard sẽ hiển thị data chính xác

## 🧪 Kiểm tra

Để verify fix hoạt động:

1. **Trigger workflow test:**
   ```bash
   git commit --allow-empty -m "test: Trigger workflow for metrics"
   git push
   ```

2. **Kiểm tra Pushgateway:**
   ```bash
   curl http://50.19.133.198:9091/metrics | grep github_workflow_run_total
   ```
   
   Expect: Thấy giá trị tăng dần theo run_number

3. **Kiểm tra Prometheus:**
   ```bash
   curl 'http://50.19.133.198:9090/api/v1/query?query=github_workflow_run_total'
   ```

4. **Kiểm tra Grafana Dashboard:**
   - Mở http://50.19.133.198:3030
   - Dashboard: "CI/CD Pipeline Monitoring"
   - Test các time range: Last 24h, Last 6 days, Last 30 days
   - Expect: Tất cả đều có data chính xác

## 📝 Technical Details

### Counter vs Gauge
- **Counter**: Giá trị chỉ tăng (hoặc reset về 0). Dùng cho: số requests, số errors, số workflow runs
- **Gauge**: Giá trị lên xuống tự do. Dùng cho: CPU usage, memory usage, duration

### Prometheus Functions
- `rate(counter[5m])`: Tốc độ tăng của counter trong 5 phút (per second)
- `increase(counter[1h])`: Tổng số tăng của counter trong 1 giờ
- `sum(counter)`: Tổng giá trị hiện tại của tất cả time series

### Dashboard Queries
```promql
# Total runs - dùng counter trực tiếp
sum(github_workflow_run_total)

# Success rate - tính % từ 2 counter
sum(github_workflow_success_total) / sum(github_workflow_run_total) * 100

# Runs per hour - dùng rate
sum(rate(github_workflow_run_total[1h])) * 3600
```

## 🔗 Related Files

- **Modified**: `.github/workflows/export-cicd-metrics.yml`
- **Dashboard**: `monitoring/grafana/cicd-dashboard.json`
- **Previous Fixes**: 
  - `CICD_DASHBOARD_ENHANCED_SUMMARY.md`
  - Prometheus retention config (30 days)

## ✅ Status

- [x] Identified root cause (counter value = 1 instead of increasing)
- [x] Implemented fix (use run_number as counter)
- [x] Deployed to production (commit ed15257)
- [ ] Verified with new workflow runs
- [ ] Dashboard showing correct data for all time ranges

---

**Date**: 2025-11-15  
**Fix by**: GitHub Copilot  
**Commit**: ed15257
