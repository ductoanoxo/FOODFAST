# ✅ CI/CD Real-time Monitoring Checklist

## 📋 Pre-deployment Checklist

### 1. GitHub Secrets Configuration
- [ ] `PUSHGATEWAY_URL` = http://3.89.225.219:9091
- [ ] `PROMETHEUS_URL` = http://3.89.225.219:9090  
- [ ] `GRAFANA_URL` = http://3.89.225.219:3030

### 2. Workflows Ready
- [ ] `.github/workflows/ci-test.yml` - CI workflow
- [ ] `.github/workflows/docker-build-push.yml` - Build workflow
- [ ] `.github/workflows/deploy-production.yml` - Deploy workflow
- [ ] `.github/workflows/export-cicd-metrics.yml` - **Metrics exporter** ⭐

### 3. Monitoring Stack Deployed
- [ ] Pushgateway running on port 9091
- [ ] Prometheus running on port 9090
- [ ] Grafana running on port 3030
- [ ] Node Exporter running on port 9100
- [ ] cAdvisor running on port 8080

### 4. Configuration Files
- [ ] `monitoring/prometheus.yml` - Prometheus config
- [ ] `monitoring/grafana/cicd-dashboard.json` - Dashboard config
- [ ] `monitoring/grafana/datasources.yml` - Grafana datasource

## 🧪 Testing Checklist

### Step 1: Trigger Workflow
```bash
echo "test" >> test-cicd.txt
git add test-cicd.txt
git commit -m "test: CI/CD monitoring"
git push origin main
```

- [ ] Push successful
- [ ] GitHub Actions triggered

### Step 2: Monitor GitHub Actions
Go to: https://github.com/ductoanoxo/FOODFAST/actions

- [ ] "CI - Test and Lint" workflow started
- [ ] "CI - Test and Lint" workflow completed
- [ ] "Docker Build and Push" workflow started (if CI passed)
- [ ] "Docker Build and Push" workflow completed
- [ ] **"Export CI/CD Metrics to Prometheus" workflow triggered** ⭐
- [ ] **"Export CI/CD Metrics to Prometheus" workflow completed** ⭐

### Step 3: Check Pushgateway
Open: http://3.89.225.219:9091

Or run:
```bash
curl http://3.89.225.219:9091/metrics | grep github_workflow
```

- [ ] Pushgateway UI loads
- [ ] Metrics visible in UI
- [ ] `github_workflow_run_total` present
- [ ] `github_workflow_success_total` present
- [ ] `github_workflow_failure_total` present
- [ ] `github_workflow_duration_seconds` present
- [ ] `github_workflow_status` present

### Step 4: Check Prometheus
Open: http://3.89.225.219:9090

#### 4.1 Check Targets
- [ ] Go to Status → Targets
- [ ] Find job `pushgateway`
- [ ] Status = **UP** ⭐
- [ ] Last Scrape < 15s ago

#### 4.2 Query Metrics
In the Query box, try:
```promql
github_workflow_run_total
```

- [ ] Query returns results
- [ ] Labels include: workflow, branch, actor, run_id
- [ ] Values are correct

Other queries to try:
```promql
sum(github_workflow_run_total)
sum(github_workflow_success_total)
sum(github_workflow_failure_total)
avg(github_workflow_duration_seconds)
```

- [ ] All queries return data
- [ ] Values make sense

### Step 5: Check Grafana Dashboard
Open: http://3.89.225.219:3030/d/foodfast-cicd

Login: `admin` / `admin123`

#### 5.1 Dashboard Loads
- [ ] Dashboard loads without errors
- [ ] Title: "GitHub Actions CI/CD Monitor"
- [ ] Auto-refresh: 30s (visible in top right)

#### 5.2 Top Stats Panels
- [ ] "📊 Tổng số Runs" shows total runs
- [ ] "✅ Thành công" shows success count
- [ ] "❌ Thất bại" shows failure count
- [ ] "📈 Tỷ lệ thành công" shows success rate %
- [ ] "⏱️ Thời gian TB" shows average duration

#### 5.3 Workflow Details Table
- [ ] Table "📋 Workflow Runs - Chi tiết" visible
- [ ] Columns: Actor, Workflow, Branch, Run ID, Status, Duration
- [ ] Your recent workflow appears
- [ ] Status shows ✅ Success or ❌ Failed
- [ ] Duration is correct (in seconds)

#### 5.4 Charts
- [ ] "📊 Hoạt động theo thời gian" shows line chart
- [ ] Green line = Success, Red line = Failed
- [ ] "⏱️ Thời gian chạy Workflow" shows duration over time
- [ ] Time series data visible

#### 5.5 Pie Charts
- [ ] "👥 Top Contributors" shows your username
- [ ] "🔧 Top Workflows" shows workflow names
- [ ] "🌿 Active Branches" shows main/develop/etc

#### 5.6 Bar Gauges
- [ ] "❌ Tỷ lệ thất bại theo Workflow" shows failure rates
- [ ] "⏱️ Thời gian TB theo Workflow" shows avg durations

### Step 6: Real-time Updates
Wait 30 seconds (or click refresh icon)

- [ ] Stats update automatically
- [ ] New data appears without manual refresh
- [ ] Timestamp at bottom updates

## 🔍 Verification Queries

### Query 1: Total Runs
```promql
sum(github_workflow_run_total)
```
**Expected**: Number increases with each workflow run

### Query 2: Success Rate
```promql
(sum(github_workflow_success_total) / 
 (sum(github_workflow_success_total) + sum(github_workflow_failure_total))) * 100
```
**Expected**: Percentage between 0-100

### Query 3: Average Duration
```promql
avg(github_workflow_duration_seconds)
```
**Expected**: Seconds (e.g., 180 = 3 minutes)

### Query 4: Runs by Workflow
```promql
sum(github_workflow_run_total) by (workflow)
```
**Expected**: Multiple entries, one per workflow

### Query 5: Runs by Actor
```promql
sum(github_workflow_run_total) by (actor)
```
**Expected**: Your GitHub username appears

### Query 6: Recent Status
```promql
github_workflow_status
```
**Expected**: 1 for success, 0 for failure

## 🚨 Troubleshooting Checklist

### Issue: No metrics in Pushgateway

- [ ] Check workflow "Export CI/CD Metrics" completed successfully
- [ ] Check workflow logs for errors
- [ ] Verify PUSHGATEWAY_URL secret is correct
- [ ] Try manual curl:
```bash
curl -X POST http://3.89.225.219:9091/metrics/job/test \
  --data-binary @- <<EOF
# TYPE test_metric counter
test_metric{label="value"} 1
EOF
```
- [ ] Check Pushgateway logs: `docker logs foodfast-pushgateway`

### Issue: Prometheus not scraping Pushgateway

- [ ] Prometheus targets show pushgateway as UP
- [ ] Check prometheus.yml has pushgateway job
- [ ] Check Prometheus logs: `docker logs foodfast-prometheus`
- [ ] Check network connectivity: both in same Docker network?
- [ ] Try query in Prometheus: `up{job="pushgateway"}`

### Issue: Grafana shows "No Data"

- [ ] Datasource configured correctly
- [ ] Datasource test passes
- [ ] Queries have correct metric names
- [ ] Time range includes when workflows ran
- [ ] Refresh dashboard manually (Ctrl+R or refresh icon)
- [ ] Check Grafana logs: `docker logs foodfast-grafana`

### Issue: Dashboard not updating

- [ ] Auto-refresh is enabled (check top right)
- [ ] Interval is 30s or less
- [ ] Browser not in background (some browsers pause timers)
- [ ] Try hard refresh (Ctrl+Shift+R)

### Issue: Wrong values displayed

- [ ] Check time range (default: Last 6 hours)
- [ ] Check filters (Workflow, Branch, User dropdowns)
- [ ] Verify metric calculations in panel queries
- [ ] Compare with Prometheus query results

## 📊 Expected Metrics After First Test

After running one successful CI workflow:

| Metric | Expected Value |
|--------|---------------|
| Total Runs | ≥ 1 |
| Success | ≥ 1 |
| Failure | 0 (if passed) |
| Success Rate | 100% (if all passed) |
| Duration | 180-300s typical |

## ✅ Success Criteria

Your CI/CD monitoring is working correctly when:

1. ✅ Workflows trigger on push
2. ✅ Export metrics workflow runs after each workflow
3. ✅ Metrics appear in Pushgateway within 10 seconds
4. ✅ Prometheus scrapes metrics every 10 seconds
5. ✅ Grafana shows metrics within 30 seconds
6. ✅ Dashboard auto-refreshes every 30 seconds
7. ✅ All panels show data
8. ✅ Values are accurate
9. ✅ Historical data is retained

## 🎯 Next Steps

Once all checks pass:

- [ ] Run multiple workflows to see trends
- [ ] Test with failed workflows
- [ ] Test with different branches
- [ ] Test with different users
- [ ] Set up Grafana alerts
- [ ] Share dashboard with team
- [ ] Document any custom changes

## 📝 Notes

- Dashboard UID: `foodfast-cicd`
- Refresh interval: 30s (configurable)
- Data retention: 30 days (Prometheus)
- Pushgateway persistence: Enabled

---

**Last Updated**: 2025-01-15  
**Status**: Production Ready  
**Tested**: ✅
