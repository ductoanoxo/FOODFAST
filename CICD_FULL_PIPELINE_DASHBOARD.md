# 🚀 CI/CD Full Pipeline Dashboard - Complete Guide

## 📊 Tổng quan

Dashboard **CI/CD Full Pipeline** là phiên bản nâng cao để theo dõi **TOÀN BỘ quy trình CI/CD** từ commit code đến deployment production.

---

## 🎯 Mục đích

Dashboard này giúp bạn:

### 1. **Theo dõi toàn bộ pipeline flow:**
```
📝 Commit → 1️⃣ CI Test → 2️⃣ Docker Build → 3️⃣ Deploy EC2 → ✅ Production
```

### 2. **Giám sát từng stage:**
- **Stage 1: CI - Test & Lint** 
  - Run tests (vitest, jest)
  - Check code quality (eslint)
  - Status: ✅ SUCCESS / ❌ FAILURE
  
- **Stage 2: Docker Build & Push**
  - Build 5 services (client, server, admin, restaurant, drone)
  - Push to GitHub Container Registry (GHCR)
  - Status: ✅ SUCCESS / ❌ FAILURE

- **Stage 3: Deploy to EC2**
  - Pull images from GHCR
  - Deploy to production server
  - Health checks
  - Status: ✅ SUCCESS / ❌ FAILURE

### 3. **Metrics quan trọng:**
- **Full Pipeline Success Rate**: Tỷ lệ thành công của cả pipeline (%)
- **Time to Production**: Tổng thời gian từ commit → production (seconds)
- **Deployment Frequency**: Số lần deploy production trong khoảng thời gian
- **Failed Stage Detection**: Xác định stage nào fail
- **Stage Duration**: Thời gian mỗi stage
- **Deployment Trend**: Xu hướng deploy (tăng/giảm)

---

## 📈 Dashboard Panels (16 panels)

### **Row 1: Overview (4 panels)**

#### 1️⃣ **Dashboard Overview Header**
- Giới thiệu dashboard
- Pipeline flow visualization
- Hướng dẫn sử dụng nhanh

#### 2️⃣ **Full Pipeline Success Rate** (Gauge)
- Tỷ lệ pipeline thành công
- Formula: `(Deploy success / Total deploys) * 100`
- Thresholds:
  - 🟢 Green: ≥90% (Excellent)
  - 🟡 Yellow: 70-90% (Good)
  - 🟠 Orange: 50-70% (Warning)
  - 🔴 Red: <50% (Critical)

#### 3️⃣ **Time to Production** (Stat)
- Tổng thời gian: CI + Build + Deploy
- Formula: `sum(duration_seconds{CI|Build|Deploy})`
- Thresholds:
  - 🟢 Green: <600s (10 min)
  - 🟡 Yellow: 600-1200s (10-20 min)
  - 🟠 Orange: 1200-1800s (20-30 min)
  - 🔴 Red: >1800s (>30 min)

#### 4️⃣ **Deployment Frequency** (Stat)
- Số lần deploy production
- Filter: `branch="main"`
- Cho biết team deploy bao nhiêu lần/ngày

#### 5️⃣ **Last Deployment** (Stat)
- Thời gian deploy gần nhất
- Format: "X minutes ago" / "X hours ago"

---

### **Row 2: Stage Status (3 panels)**

#### 6️⃣ **1️⃣ CI - Test & Lint Status** (Stat)
- Trạng thái stage CI Test
- Values:
  - ✅ SUCCESS (green background)
  - ❌ FAILURE (red background)
  - ⏸️ CANCELLED (yellow)
  - ⏭️ SKIPPED (blue)

#### 7️⃣ **2️⃣ Docker Build & Push Status** (Stat)
- Trạng thái stage Build
- Same format như CI status

#### 8️⃣ **3️⃣ Deploy to EC2 Status** (Stat)
- Trạng thái stage Deploy
- Same format như CI status

**→ Nhìn 3 panels này biết ngay stage nào đang fail!**

---

### **Row 3: Stage Performance (1 panel)**

#### 9️⃣ **Stage Duration Comparison** (Bar Chart)
- So sánh thời gian chạy từng stage
- 3 bars:
  - 🔵 **CI Test**: Avg duration
  - 🟣 **Docker Build**: Avg duration  
  - 🟢 **Deploy**: Avg duration
- Stats: Mean, Max, Last
- **Use case**: Tìm stage nào chậm nhất để optimize

---

### **Row 4: Pipeline Timeline (1 panel)**

#### 🔟 **Full Pipeline Execution Timeline** (Time Series)
- Timeline tất cả pipeline runs
- 3 lines:
  - CI Test runs
  - Build runs
  - Deploy runs
- Zoom in/out để xem trends
- **Use case**: Xem tần suất chạy pipeline theo thời gian

---

### **Row 5: Success vs Failure Analysis (2 panels)**

#### 1️⃣1️⃣ **Success vs Failure by Stage** (Stacked Time Series)
- So sánh success/failure từng stage
- 2 series cho mỗi stage:
  - Green line: Success count
  - Red line: Failure count
- **Use case**: Phát hiện stage có failure rate cao

#### 1️⃣2️⃣ **Failure Rate by Stage** (Bar Gauge)
- Phần trăm failure của mỗi stage
- Formula: `(failures / total) * 100`
- Thresholds:
  - 🟢 Green: 0% (Perfect!)
  - 🟡 Yellow: 5% (Acceptable)
  - 🟠 Orange: 15% (Needs attention)
  - 🔴 Red: 30%+ (Critical)
- **Use case**: Nhanh chóng xác định stage có vấn đề

---

### **Row 6: Branch & Contributor Activity (2 panels)**

#### 1️⃣3️⃣ **Deployment Activity by Branch** (Time Series)
- Activity của các branches (main, develop, deploy)
- **Use case**: 
  - Xem branch nào deploy nhiều
  - Detect unusual activity

#### 1️⃣4️⃣ **Pipeline Activity by Contributor** (Bar Chart)
- Top contributors (actor)
- Số lần trigger workflows
- **Use case**: Team productivity tracking

---

### **Row 7: Deployment Trend (1 panel)**

#### 1️⃣5️⃣ **Deployment Frequency Trend** (Time Series)
- Deploys per day trend line
- Thresholds:
  - 🔴 Red: <1 deploy/day (Low)
  - 🟡 Yellow: 1-3 deploys/day (Medium)
  - 🟢 Green: 3+ deploys/day (High velocity)
- **Use case**: Track CI/CD maturity

---

### **Row 8: Help Section (1 panel)**

#### 1️⃣6️⃣ **Dashboard Information & Help**
- Available metrics documentation
- Labels explained
- Tips & tricks
- Quick links
- Troubleshooting guide

---

## 🎛️ Dashboard Variables (3 filters)

### 1. **🔧 Workflow Filter**
```promql
label_values(github_workflow_run_count_total, workflow)
```
**Options:**
- All (default)
- CI - Test and Lint
- Docker Build and Push
- Auto Deploy Foodfast to EC2
- Export CI/CD Metrics

**Use case**: Xem specific stage

---

### 2. **🌿 Branch Filter**
```promql
label_values(github_workflow_run_count_total, branch)
```
**Options:**
- All (default)
- main (production)
- develop
- deploy
- feature branches

**Use case**: Theo dõi activity theo branch

---

### 3. **👤 Actor Filter**
```promql
label_values(github_workflow_run_count_total, actor)
```
**Options:**
- All (default)
- Kietnehi
- ductoanoxo
- Other contributors

**Use case**: Team member tracking

---

## 🚀 Setup & Access

### **1. Import Dashboard**

**Option A: Via Grafana UI**
```
1. Login: http://13.220.101.54:3030
   - Username: admin
   - Password: admin123

2. Left sidebar → Dashboards → Import

3. Upload JSON file:
   monitoring/grafana/cicd-full-pipeline-dashboard.json

4. Select Prometheus datasource

5. Click Import
```

**Option B: Via API**
```bash
cd /c/Users/ADMIN/Desktop/FOODFAST

curl -X POST http://13.220.101.54:3030/api/dashboards/db \
  -H "Content-Type: application/json" \
  -u admin:admin123 \
  -d @monitoring/grafana/cicd-full-pipeline-dashboard.json
```

**Option C: Auto-import (already configured)**
```bash
# Dashboard tự động load khi start Grafana
docker-compose up -d grafana
```

---

### **2. Access Dashboard**

**Direct URL:**
```
http://13.220.101.54:3030/d/cicd-full-pipeline/foodfast-cicd-full-pipeline
```

**Via Grafana Home:**
```
1. http://13.220.101.54:3030
2. Home → Dashboards
3. Search: "FoodFast CI/CD Full Pipeline"
4. Click to open
```

---

## 📊 Use Cases & Examples

### **Use Case 1: Monitor Production Deployments**

**Goal**: Xem tất cả deployments lên production

**Steps:**
1. Open dashboard
2. Set filters:
   - Workflow: "Auto Deploy Foodfast to EC2"
   - Branch: "main"
   - Actor: All
3. Time range: Last 7 days
4. Look at:
   - Deployment Frequency panel
   - Last Deployment time
   - Deployment Trend

**Insights:**
- Bao nhiêu lần deploy/tuần?
- Deploy có đều đặn không?
- Có period nào không deploy? (outage?)

---

### **Use Case 2: Troubleshoot Failed Pipeline**

**Goal**: Tìm xem stage nào fail

**Steps:**
1. Check "Success vs Failure by Stage" panel
2. Identify stage with red spikes
3. Filter by that workflow
4. Check "Failure Rate by Stage"
5. Click on failed timestamp
6. Go to GitHub Actions logs

**Example:**
```
❌ Docker Build stage has 30% failure rate
→ Check logs: Image build timeout?
→ Fix: Optimize Dockerfile
→ Monitor: Failure rate drops to 0%
```

---

### **Use Case 3: Optimize Pipeline Performance**

**Goal**: Giảm Time to Production

**Steps:**
1. Check "Time to Production" panel
2. Current: 1500s (25 minutes)
3. Check "Stage Duration Comparison"
4. Identify bottleneck:
   - CI Test: 300s ✅
   - Docker Build: 900s 🐌 (Slow!)
   - Deploy: 300s ✅

**Actions:**
```
Docker Build is the bottleneck!

Optimizations:
1. Enable Docker layer caching
2. Use multi-stage builds
3. Parallelize service builds
4. Use smaller base images

Result:
- Before: 900s
- After: 300s
- Time to Production: 1500s → 900s (40% faster!)
```

---

### **Use Case 4: Track Team Productivity**

**Goal**: Xem team member nào active nhất

**Steps:**
1. Look at "Pipeline Activity by Contributor"
2. Time range: Last 30 days
3. Results:
   - Kietnehi: 45 commits
   - ductoanoxo: 38 commits
   - Others: 12 commits

**Insights:**
- Workload distribution
- Identify inactive members
- Plan sprints better

---

### **Use Case 5: Compare Branch Activity**

**Goal**: So sánh activity giữa main vs develop

**Steps:**
1. Set time range: Last 7 days
2. Look at "Deployment Activity by Branch"
3. Results:
   - main: 10 deploys (production)
   - develop: 35 commits (active development)
   - deploy: 5 hotfixes

**Insights:**
- Develop branch is very active
- Good release cadence (10 deploys/week)
- Some hotfixes needed (deploy branch)

---

## 🔧 Troubleshooting

### **Problem 1: Dashboard shows "No Data"**

**Cause**: No metrics collected yet

**Solution:**
```bash
# 1. Check if workflows are running
Open: https://github.com/ductoanoxo/FOODFAST/actions

# 2. Check Pushgateway has metrics
curl http://13.220.101.54:9091/metrics | grep github_workflow

# 3. Trigger a workflow manually
git commit --allow-empty -m "test: trigger ci/cd"
git push origin main

# 4. Wait 1-2 minutes, refresh dashboard
```

---

### **Problem 2: Filters are empty**

**Cause**: No label values in Prometheus

**Solution:**
```bash
# Check if Prometheus is scraping
Open: http://13.220.101.54:9090/targets

# Should see "pushgateway" target as UP

# Check metrics exist
curl http://13.220.101.54:9090/api/v1/label/workflow/values

# If empty, push test data
bash test-realtime-cicd.sh
```

---

### **Problem 3: Old dashboard still showing**

**Cause**: Dashboard cache

**Solution:**
```bash
# Reimport dashboard
curl -X POST http://13.220.101.54:3030/api/dashboards/db \
  -H "Content-Type: application/json" \
  -u admin:admin123 \
  -d @monitoring/grafana/cicd-full-pipeline-dashboard.json

# Or restart Grafana
docker-compose restart grafana

# Hard refresh browser: Ctrl + Shift + R
```

---

### **Problem 4: Wrong time range data**

**Cause**: Prometheus retention or time filter

**Solution:**
```bash
# Check Prometheus retention
docker exec -it foodfast_prometheus cat /etc/prometheus/prometheus.yml

# Should have retention (default 15 days):
# --storage.tsdb.retention.time=15d

# Adjust dashboard time range:
# Click top-right time picker
# Select: Last 6h / 24h / 7d
```

---

## 📚 Advanced: Custom Queries

### **Query 1: Pipeline Success Rate by Branch**
```promql
(
  sum(github_workflow_run_success_total{workflow=~".*Deploy.*"}) by (branch)
  /
  sum(github_workflow_run_count_total{workflow=~".*Deploy.*"}) by (branch)
) * 100
```

---

### **Query 2: Average Time to Production**
```promql
sum(avg_over_time(
  github_workflow_run_duration_seconds{workflow=~"CI.*|.*Build.*|.*Deploy.*"}[1h]
))
```

---

### **Query 3: Deployment Rate per Hour**
```promql
rate(
  github_workflow_run_count_total{workflow=~".*Deploy.*", branch="main"}[1h]
) * 3600
```

---

### **Query 4: Failed Stages in Last 24h**
```promql
sum(
  increase(
    github_workflow_run_failure_total[24h]
  )
) by (workflow)
```

---

## 🎯 Key Differences vs Old Dashboard

| Feature | Old Dashboard | Full Pipeline Dashboard |
|---------|--------------|------------------------|
| **Focus** | Individual workflows | Complete pipeline flow |
| **Panels** | 19 panels | 16 panels (more focused) |
| **Stage Tracking** | ❌ No | ✅ Yes (3 stages) |
| **Pipeline Success** | Per workflow | ✅ Full pipeline |
| **Time to Prod** | ❌ No | ✅ Yes |
| **Stage Comparison** | ❌ No | ✅ Yes |
| **Failed Stage Detection** | ❌ No | ✅ Yes |
| **Deployment Trend** | Basic | ✅ Advanced |
| **Branch Activity** | Basic stats | ✅ Deployment focus |

---

## 🎓 Best Practices

### **1. Daily Monitoring**
```
Morning routine:
1. Open dashboard
2. Check Full Pipeline Success Rate
   - Target: ≥95%
3. Check Last Deployment time
   - Should be recent (within 24h)
4. Review Failure Rate by Stage
   - Any stage >5%? Investigate!
```

---

### **2. Weekly Review**
```
Friday team review:
1. Set time range: Last 7 days
2. Review:
   - Total deployments this week
   - Average Time to Production
   - Failed stages (if any)
   - Team member contributions
3. Plan improvements for next week
```

---

### **3. Monthly Planning**
```
End of month:
1. Set time range: Last 30 days
2. Analyze:
   - Deployment Frequency Trend
     - Increasing? (Good!)
     - Decreasing? (Why?)
   - Success Rate Trend
     - Stable? (Good!)
     - Dropping? (Fix!)
3. Set goals for next month:
   - Target: 100 deploys/month
   - Target: <600s Time to Production
   - Target: 98% Success Rate
```

---

### **4. Incident Response**
```
When pipeline fails:
1. Check stage status panels (6-8)
   - Identify failed stage
2. Filter by that workflow
3. Check timeline for pattern
4. Go to GitHub Actions for logs
5. Fix and re-run
6. Monitor dashboard for green status
```

---

## 📊 Metrics Collection Flow

```
Developer pushes code
         ↓
GitHub Actions triggers
         ↓
1️⃣ CI - Test & Lint workflow runs
         ↓ (success)
2️⃣ Docker Build workflow runs
         ↓ (success + main branch)
3️⃣ Deploy workflow runs
         ↓ (always after any workflow)
4️⃣ Export Metrics workflow runs
         ↓
Extract metrics:
  - workflow name
  - status (success/failure)
  - duration (seconds)
  - branch
  - actor
  - run_id
         ↓
Push to Pushgateway (:9091)
         ↓
Prometheus scrapes (every 10s)
         ↓
Grafana queries Prometheus
         ↓
Dashboard updates (auto-refresh 30s)
         ↓
You see real-time CI/CD status! 🎉
```

---

## 🔗 Related Documentation

- **[CICD_MONITORING_QUICKSTART.md](./CICD_MONITORING_QUICKSTART.md)** - Quick setup guide
- **[CICD_DASHBOARD_GUIDE.md](./CICD_DASHBOARD_GUIDE.md)** - Original dashboard guide
- **[CICD_SETUP_GUIDE.md](./CICD_SETUP_GUIDE.md)** - Full CI/CD setup
- **[CICD_DASHBOARD_ENHANCED_SUMMARY.md](./CICD_DASHBOARD_ENHANCED_SUMMARY.md)** - v2.0 changes

---

## 🆘 Support

### **Need Help?**

1. **Check Logs:**
   ```bash
   docker logs foodfast_grafana
   docker logs foodfast_prometheus
   docker logs foodfast_pushgateway
   ```

2. **Verify Services:**
   ```bash
   docker ps | grep -E "grafana|prometheus|pushgateway"
   ```

3. **Test Metrics:**
   ```bash
   curl http://13.220.101.54:9091/metrics | grep github_workflow
   ```

4. **Check GitHub Actions:**
   ```
   https://github.com/ductoanoxo/FOODFAST/actions
   ```

---

## ✅ Success Checklist

- [ ] Dashboard imported successfully
- [ ] All 16 panels visible
- [ ] 3 filter variables working
- [ ] At least 1 workflow run collected
- [ ] Stage status panels showing data
- [ ] Time to Production calculated
- [ ] Deployment frequency showing
- [ ] Filters populated with options
- [ ] Auto-refresh working (30s)
- [ ] Can identify failed stages
- [ ] Team can access and use dashboard

---

## 🎉 You're Ready!

Dashboard này cho phép bạn:

✅ Theo dõi **FULL CI/CD pipeline** từ commit → production  
✅ Xác định **stage nào fail** ngay lập tức  
✅ Optimize **Time to Production**  
✅ Track **deployment frequency** và trends  
✅ Monitor **team productivity**  
✅ Make **data-driven decisions** để improve CI/CD  

**Happy Monitoring! 🚀📊**

---

**Dashboard Version**: 3.0 Full Pipeline  
**Last Updated**: November 15, 2025  
**Status**: ✅ Production Ready
