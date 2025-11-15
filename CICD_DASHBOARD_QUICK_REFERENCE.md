# 🚀 CI/CD Dashboard - Quick Reference

## 📊 Dashboard Overview

**Version**: 2.0 Enhanced  
**File**: `monitoring/grafana/cicd-dashboard.json`  
**Size**: 40 KB (1,407 lines)  
**Panels**: 19 visualization panels  
**Variables**: 3 filters (Workflow, Branch, Actor)  
**Links**: 3 quick access links

---

## 🎯 Quick Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana Dashboard** | http://13.220.101.54:3030 | admin / admin123 |
| **Prometheus** | http://13.220.101.54:9090 | No auth |
| **Pushgateway** | http://13.220.101.54:9091 | No auth |
| **GitHub Actions** | https://github.com/ductoanoxo/FOODFAST/actions | GitHub login |

---

## 📈 19 Panels At A Glance

### Overview (Panels 1-6)
1. 📋 **Dashboard Overview** - Header with info
2. 📊 **Total Workflow Runs** - Counter
3. ✅ **Successful Runs** - Green counter
4. ❌ **Failed Runs** - Red counter
5. 📈 **Success Rate** - Gauge (0-100%)
6. ⏱️ **Average Duration** - Seconds

### Trends (Panels 7-9, 16)
7. 📊 **Workflow Runs Over Time** - Line chart
8. ✅❌ **Success vs Failure Rate** - Stacked bars
9. ⏱️ **Workflow Duration by Type** - Duration lines
16. 📊 **Workflow Execution Rate** - Rate per hour

### Analysis (Panels 10-13)
10. 📋 **Workflow Status Table** - Detailed status
11. 🌿 **Runs by Branch** - Pie chart
12. 👤 **Runs by Actor** - Pie chart
13. 🔢 **Recent Workflow Runs** - Run numbers table

### Comparison (Panels 14-15, 17-18)
14. 🔧 **Workflow Runs by Type** - Bar chart
15. ⏱️ **Average Duration by Workflow** - Duration bars
17. ❌ **Failure Rate by Workflow** - Percentage gauge
18. ⏱️ **Latest Workflow Duration** - Current duration

### Documentation (Panel 19)
19. ℹ️ **Dashboard Information & Help** - Full docs

---

## 🔍 Filter Variables

### 🔧 Workflow Filter
Options: All, CI - Test and Lint, Docker Build and Push, Auto Deploy, Export Metrics

### 🌿 Branch Filter  
Options: All, main, kiet, DUCTOAN, deploy

### 👤 Actor Filter
Options: All, ductoanoxo, kiet, [contributors]

---

## 📊 Key Metrics

| Metric | Description | Type |
|--------|-------------|------|
| `github_workflow_run_total` | Total runs | Counter |
| `github_workflow_success_total` | Successful runs | Counter |
| `github_workflow_failure_total` | Failed runs | Counter |
| `github_workflow_duration_seconds` | Duration in seconds | Gauge |
| `github_workflow_status` | Current status (1/0/-1) | Gauge |
| `github_workflow_run_number` | Run sequence number | Gauge |

---

## ⚡ Quick Commands

### Check Metrics Available
```bash
curl http://13.220.101.54:9091/metrics | grep github_workflow
```

### Check Prometheus Targets
```bash
curl http://13.220.101.54:9090/api/v1/targets | grep pushgateway
```

### Restart Grafana (if needed)
```bash
docker restart foodfast_grafana
```

### View Grafana Logs
```bash
docker logs -f foodfast_grafana
```

---

## 💡 Common Use Cases

### As Developer
1. Filter by **Actor** = your username
2. Filter by **Branch** = your feature branch
3. Monitor your workflow success rate
4. Check your build durations

### As DevOps
1. Check overall **Success Rate** (should be > 95%)
2. Monitor **Execution Rate** for load
3. Check **Failure Rate by Workflow**
4. Review **Average Duration** trends

### Troubleshooting
1. Check **Workflow Status Table** for recent failures
2. Look at **Duration by Type** for slow workflows
3. Review **Latest Workflow Duration** for current issues
4. Filter by failed **Branch** to identify problem areas

---

## 🔧 Customization

### Change Time Range
- Top-right corner selector
- Options: 5m, 15m, 1h, 6h, 12h, 24h, 2d, 7d, 30d

### Change Refresh Rate
- Top-right dropdown
- Options: 10s, 30s, 1m, 5m, 15m, 30m, 1h, 2h

### Export Dashboard
```bash
# From Grafana UI
Dashboard Settings → JSON Model → Copy to clipboard

# Or get from file
cat monitoring/grafana/cicd-dashboard.json
```

---

## 📦 Files Location

```
FOODFAST/
├── monitoring/
│   ├── grafana/
│   │   ├── cicd-dashboard.json          ← Main dashboard (v2.0)
│   │   ├── dashboards.yml                ← Dashboard provisioning
│   │   ├── datasources.yml               ← Prometheus datasource
│   │   └── foodfast-dashboard.json       ← App monitoring
│   ├── prometheus.yml                     ← Prometheus config
│   └── alerts.yml                         ← Alert rules
├── .github/
│   └── workflows/
│       └── export-cicd-metrics.yml        ← Metrics exporter
├── docker-compose.yml                     ← Services definition
├── CICD_DASHBOARD_GUIDE.md               ← Detailed guide
├── CICD_DASHBOARD_ENHANCED_SUMMARY.md    ← Full changelog
└── CICD_MONITORING_QUICKSTART.md         ← Quick setup
```

---

## 🚨 Alerts (Coming Soon)

Suggested alert rules:
- Success Rate < 80%
- Average Duration > 600s (10 min)
- Failure Rate > 20%
- No workflow runs in last 24h

---

## 📞 Support

**Issues?** Check:
1. Prometheus targets: http://13.220.101.54:9090/targets
2. Pushgateway metrics: http://13.220.101.54:9091/metrics
3. Grafana logs: `docker logs foodfast_grafana`
4. GitHub Actions logs: Repository → Actions tab

**Documentation**:
- [Full Guide](./CICD_DASHBOARD_GUIDE.md)
- [Enhanced Summary](./CICD_DASHBOARD_ENHANCED_SUMMARY.md)
- [Quick Start](./CICD_MONITORING_QUICKSTART.md)

---

**Last Updated**: November 15, 2025  
**Status**: ✅ Production Ready
