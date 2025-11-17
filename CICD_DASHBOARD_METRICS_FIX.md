# 🔧 CI/CD Dashboard Metrics Fix - rate() vs sum()

## ❌ Vấn đề phát hiện

Dashboard hiển thị **47 workflows** trong "Last 5 minutes" trong khi thực tế chỉ có **2 workflows**!

### Nguyên nhân

Query sử dụng `rate()` function không phù hợp với Pushgateway counter metrics:

```promql
# ❌ Query SAI (trước khi fix)
sum(rate(github_workflow_success_total[5m])) * 300

# Kết quả: 47 (CON SỐ ẢO!)
```

## 🧠 Giải thích chi tiết

### rate() Function hoạt động như thế nào?

`rate()` tính **tốc độ thay đổi per second** của counter metric:

```
rate(metric[5m]) = (value_now - value_5min_ago) / 300_seconds
```

Sau đó nhân với 300 để extrapolate ra 5 phút.

### Tại sao rate() KHÔNG phù hợp với Pushgateway?

#### 1. Pushgateway lưu metrics TĨNH
- Pushgateway **không phải** time series database
- Mỗi workflow push metrics **1 lần duy nhất**
- Metrics không tăng dần liên tục theo thời gian

#### 2. Counter metrics từ workflows
Mỗi workflow push:
```prometheus
github_workflow_success_total{workflow="CI", actor="Kietnehi"} 1
```

Với 2 workflows:
```prometheus
github_workflow_success_total{workflow="CI", run_id="123"} 1
github_workflow_success_total{workflow="Deploy", run_id="124"} 1
```

Total: `sum() = 2` ✅

#### 3. rate() tính toán sai

Prometheus sees:
- T0 (5 min ago): 0 workflows
- T1 (now): 2 workflows
- Rate: (2 - 0) / 300s = 0.00667 workflows/second
- Extrapolate 5 min: 0.00667 * 300 = **47 workflows** ❌

**Số này KHÔNG có ý nghĩa thực tế!**

## ✅ Giải pháp

Sử dụng **sum()** thay vì **rate()** để đếm số thực tế:

```promql
# ✅ Query ĐÚNG (sau khi fix)
sum(github_workflow_success_total)

# Kết quả: 2 (SỐ THẬT!)
```

## 📊 So sánh queries

### Top Panels (Stat panels) - ✅ ĐÚNG từ đầu

```promql
# Panel "Tổng số Runs"
sum(github_workflow_run_total)  # → 2

# Panel "Thành công"
sum(github_workflow_success_total)  # → 2

# Panel "Thất bại"
sum(github_workflow_failure_total)  # → 0

# Panel "Tỷ lệ thành công"
(sum(github_workflow_success_total) / 
 (sum(github_workflow_success_total) + sum(github_workflow_failure_total))) * 100
# → 100%
```

### Time Series Chart - ❌ SAI (đã fix)

**TRƯỚC:**
```promql
sum(rate(github_workflow_success_total[5m])) * 300  # → 47 ❌
sum(rate(github_workflow_failure_total[5m])) * 300  # → 0
```

**SAU:**
```promql
sum(github_workflow_success_total)  # → 2 ✅
sum(github_workflow_failure_total)  # → 0 ✅
```

## 🔍 Khi nào dùng rate()?

### ✅ Dùng rate() khi:

1. **Time series liên tục** (không phải Pushgateway)
   - Node Exporter metrics
   - Application metrics từ /metrics endpoint
   - Metrics được scrape liên tục

2. **Muốn biết tốc độ**
   ```promql
   # Requests per second
   rate(http_requests_total[5m])
   
   # Errors per minute
   rate(http_errors_total[1m]) * 60
   ```

3. **Counter tăng liên tục**
   - HTTP requests counter
   - Bytes transferred counter
   - Events processed counter

### ❌ KHÔNG dùng rate() khi:

1. **Metrics từ Pushgateway**
   - CI/CD workflow metrics
   - Batch job metrics
   - One-time event metrics

2. **Muốn đếm số lượng thực tế**
   ```promql
   # Số workflows chạy
   sum(github_workflow_run_total)
   
   # Số deployments
   sum(deployment_count_total)
   ```

3. **Counter không tăng liên tục**
   - Metrics push từ scripts
   - Scheduled job metrics

## 🎯 Best Practices cho Pushgateway Metrics

### 1. Luôn dùng sum() hoặc count()

```promql
# ✅ ĐÚNG
sum(github_workflow_run_total)
count(github_workflow_status == 1)
sum(github_workflow_run_total) by (workflow)
```

### 2. Dùng increase() thay vì rate() (nếu cần)

```promql
# Số workflows tăng trong 1 giờ qua
increase(github_workflow_run_total[1h])
```

**Lưu ý**: `increase()` cũng có thể cho kết quả không chính xác với Pushgateway!

### 3. Filter theo labels để đếm chính xác

```promql
# Workflows của user cụ thể
sum(github_workflow_run_total{actor="Kietnehi"})

# Workflows trên branch main
sum(github_workflow_run_total{branch="main"})

# Workflows thành công
sum(github_workflow_success_total)
```

### 4. Dùng instant queries cho stats

```promql
# Panel type: Stat, Gauge, Bar Gauge
# Query type: Instant (không cần range)
sum(github_workflow_run_total)
```

### 5. Time series với sum() over time

```promql
# Panel type: Time series
# Hiển thị tổng số workflows theo thời gian
sum(github_workflow_run_total)

# Hoặc theo workflow
sum(github_workflow_run_total) by (workflow)
```

## 📈 Dashboard Panels Updated

### Panel: "📊 Tổng số Workflows (Success vs Failed)"

**Old Query (Fixed):**
```promql
# Query A
sum(rate(github_workflow_success_total[5m])) * 300

# Query B  
sum(rate(github_workflow_failure_total[5m])) * 300
```

**New Query:**
```promql
# Query A - Success
sum(github_workflow_success_total)

# Query B - Failed
sum(github_workflow_failure_total)
```

**Visualization:**
- Type: Time series
- Draw style: Line
- Line interpolation: Smooth
- Fill opacity: 30%
- Legend: Bottom table with sum and mean

**Result:**
- Shows actual workflow counts over time
- Green line = successful workflows
- Red line = failed workflows
- Values are real counts, not extrapolated rates

## 🧪 Testing the Fix

### 1. Check current metrics

```bash
curl http://3.89.225.219:9091/metrics | grep github_workflow_success_total
```

Expected output:
```
github_workflow_success_total{...} 1
github_workflow_success_total{...} 1
```

### 2. Query Prometheus

```bash
curl -G http://3.89.225.219:9090/api/v1/query \
  --data-urlencode 'query=sum(github_workflow_success_total)'
```

Expected: `"value": [timestamp, "2"]`

### 3. Check Dashboard

Open: http://3.89.225.219:3030/d/foodfast-cicd

**Before fix:**
- "Hoạt động theo thời gian" shows 47 (wrong)

**After fix:**
- "Tổng số Workflows" shows 2 (correct)

## 🔄 Deployment

### Update dashboard on server:

```bash
# Push changes
git push origin main

# Dashboard will sync when deploy workflow runs
# OR manually sync:
scp monitoring/grafana/cicd-dashboard.json user@server:~/grafana-config/dashboards/
ssh user@server 'docker restart foodfast-grafana'
```

Wait 10-30 seconds for Grafana to reload.

## 📝 Lessons Learned

1. **Pushgateway ≠ Time Series Database**
   - Don't treat it like Prometheus scraped metrics
   - Metrics are static snapshots, not continuous streams

2. **Counter metrics from batch jobs**
   - Use sum() to count
   - Don't use rate() or increase()
   - Filter by labels for specific counts

3. **Test queries in Prometheus first**
   - Verify results before adding to dashboard
   - Compare with actual data in Pushgateway

4. **Understand metric types**
   - Counter: monotonically increasing (usually)
   - Gauge: can go up or down
   - Histogram/Summary: distribution data

5. **Dashboard design**
   - Choose right visualization for metric type
   - Use instant queries for current values
   - Use range queries only when showing trends

## 🎉 Result

Dashboard now shows **REAL DATA**:
- ✅ Tổng số Runs: 2 (not 47)
- ✅ Thành công: 2 (not 47)
- ✅ Thất bại: 0
- ✅ Success rate: 100%
- ✅ Charts show actual counts over time

---

**Fixed**: 2025-01-15  
**Issue**: rate() extrapolation with Pushgateway counters  
**Solution**: Use sum() for actual counts  
**Status**: ✅ Resolved
