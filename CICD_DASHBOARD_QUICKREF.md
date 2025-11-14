# 🚀 CI/CD Dashboard Quick Reference

## 📊 Dashboard URL
```
http://13.220.101.54:3000
Dashboard: "FoodFast CI/CD Pipeline"
```

## ⚡ Quick Commands

### Test metrics collection:
```bash
bash test-cicd-metrics.sh
```

### View current metrics:
```bash
curl http://13.220.101.54:9091/metrics | grep github_workflow
```

### Check last update time:
```bash
curl -s http://13.220.101.54:9091/metrics | grep push_time_seconds | tail -1
```

### Trigger manual workflow:
Go to: https://github.com/ductoanoxo/FOODFAST/actions
→ Select workflow → Run workflow

## 🎯 Key Metrics

| Metric | Description | Type |
|--------|-------------|------|
| `github_workflow_run_total` | Total workflow runs | Counter |
| `github_workflow_success_total` | Successful runs | Counter |
| `github_workflow_failure_total` | Failed runs | Counter |
| `github_workflow_duration_seconds` | Run duration | Gauge |
| `github_workflow_status` | Current status (1/0/-1) | Gauge |
| `github_workflow_last_run_time` | Last run timestamp | Gauge |

## 🔍 Common Queries

### Success rate (last 24h):
```promql
(sum(increase(github_workflow_success_total[24h])) / 
 (sum(increase(github_workflow_success_total[24h])) + 
  sum(increase(github_workflow_failure_total[24h])))) * 100
```

### Failed workflows (last 1h):
```promql
sum(increase(github_workflow_failure_total[1h])) by (workflow, branch)
```

### Average duration:
```promql
avg(github_workflow_duration_seconds)
```

### Time since last run:
```promql
time() - (github_workflow_last_run_time / 1000)
```

## 🚨 Troubleshooting Matrix

| Issue | Check | Fix |
|-------|-------|-----|
| No data | `curl http://13.220.101.54:9091/metrics` | Trigger workflow |
| Stale data | Check "Time Since Last Run" panel | Trigger new workflow |
| Missing metrics | Run `test-cicd-metrics.sh` | Check workflow logs |
| Dashboard error | Prometheus targets: `:9090/targets` | Restart Prometheus |

## 🎨 Dashboard Panels Quick Guide

### Row 1 - KPIs (Top Metrics)
- **Total Runs** → Tổng số lần chạy (24h)
- **Success** → Số lần thành công (24h)  
- **Failed** → Số lần thất bại (24h)
- **Success %** → Tỷ lệ thành công
- **Avg Duration** → Thời gian TB

### Row 2 - Freshness Indicator
- **Last Run** → Workflow cuối chạy bao lâu rồi
  - 🟢 < 1h | 🟡 1-2h | 🔴 > 2h

### Row 3 - Trends
- **Run Rate** → Rate chạy workflow (5m)
- **Success vs Failure** → Biểu đồ so sánh (hourly)
- **Duration** → Thời gian theo workflow

### Row 4 - Breakdown
- **Status Table** → Chi tiết từng workflow
- **By Branch** → Phân bố theo branch (24h)
- **By Actor** → Phân bố theo người chạy (24h)

### Row 5 - Recent Activity
- **Recent Runs** → Workflow runs gần đây

## ⚙️ Settings

### Auto-refresh: 30 seconds
Change in dashboard settings → Refresh → Select interval

### Time range: Last 6 hours
Change in top-right → Time range picker

### Variables:
- **$workflow** → Filter by workflow name
- **$branch** → Filter by branch name

## 📋 Health Check Checklist

Daily checks:
- [ ] Dashboard loads without errors
- [ ] "Last Run" < 24 hours
- [ ] Success rate > 80%
- [ ] No stuck/failing workflows

Weekly checks:
- [ ] Review failure trends
- [ ] Check average duration trends
- [ ] Verify all workflows reporting
- [ ] Update dashboard if needed

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `.github/workflows/export-cicd-metrics.yml` | Export metrics workflow |
| `monitoring/grafana/cicd-dashboard.json` | Dashboard definition |
| `monitoring/prometheus.yml` | Prometheus config |
| `test-cicd-metrics.sh` | Test metrics script |
| `CICD_DASHBOARD_REALTIME_GUIDE.md` | Full documentation |

## 💡 Pro Tips

1. **Bookmark dashboard** - Add to browser favorites
2. **Set alerts** - Get notified on failures
3. **Use variables** - Filter specific workflows/branches
4. **Check trends** - Look for patterns in charts
5. **Keep fresh** - Regular workflow runs = fresh data

## 📞 Support

- Issues: https://github.com/ductoanoxo/FOODFAST/issues
- Workflow Logs: https://github.com/ductoanoxo/FOODFAST/actions
- Prometheus: http://localhost:9090
- Pushgateway: http://13.220.101.54:9091

---
**Version**: 2.0 | **Updated**: 2025-01-15
