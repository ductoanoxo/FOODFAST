# Tạo Panel HPA Đơn Giản - Hiển thị: Current: 3.2% / Target: 30%

Write-Host "`n📊 TẠO PANEL HPA ĐƠN GIẢN" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n✅ HƯỚNG DẪN TỪNG BƯỚC:" -ForegroundColor Yellow

Write-Host "`n1️⃣  Mở Grafana: http://localhost:32000" -ForegroundColor Cyan

Write-Host "`n2️⃣  Tạo Panel mới:" -ForegroundColor Cyan
Write-Host "   • Click '+' → Dashboard → Add new panel" -ForegroundColor Gray

Write-Host "`n3️⃣  Panel Settings:" -ForegroundColor Cyan
Write-Host "   • Panel type: Stat" -ForegroundColor White
Write-Host "   • Title: Server CPU - HPA Status" -ForegroundColor Gray

Write-Host "`n4️⃣  Thêm 2 Queries:" -ForegroundColor Cyan

Write-Host "`n   Query A (Current CPU %):" -ForegroundColor Yellow
Write-Host "   100 * sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"})" -ForegroundColor White
Write-Host "   Legend: Current" -ForegroundColor Gray

Write-Host "`n   Query B (Target):" -ForegroundColor Yellow
Write-Host "   30" -ForegroundColor White
Write-Host "   Legend: Target" -ForegroundColor Gray

Write-Host "`n5️⃣  Field Settings (bên phải):" -ForegroundColor Cyan
Write-Host "   Standard options:" -ForegroundColor Yellow
Write-Host "   • Unit: Percent (0-100)" -ForegroundColor White
Write-Host "   • Decimals: 1" -ForegroundColor Gray

Write-Host "`n   Thresholds:" -ForegroundColor Yellow
Write-Host "   • 0 = Green (OK)" -ForegroundColor Green
Write-Host "   • 30 = Yellow (At target)" -ForegroundColor Yellow
Write-Host "   • 70 = Red (Critical)" -ForegroundColor Red

Write-Host "`n6️⃣  Value Options:" -ForegroundColor Cyan
Write-Host "   • Show: All values" -ForegroundColor Gray
Write-Host "   • Calculation: Last (not null)" -ForegroundColor Gray
Write-Host "   • Orientation: Horizontal" -ForegroundColor Gray
Write-Host "   • Text mode: Value and name" -ForegroundColor Gray
Write-Host "   • Color mode: Background" -ForegroundColor Gray

Write-Host "`n7️⃣  Kết quả hiển thị:" -ForegroundColor Cyan
Write-Host "`n   ┌────────────────────────────────┐" -ForegroundColor Gray
Write-Host "   │  Server CPU - HPA Status       │" -ForegroundColor White
Write-Host "   │                                │" -ForegroundColor Gray
Write-Host "   │  Current: 3.2%                 │" -ForegroundColor Green
Write-Host "   │  Target:  30.0%                │" -ForegroundColor Gray
Write-Host "   │                                │" -ForegroundColor Gray
Write-Host "   │  Status: ✓ Below Target        │" -ForegroundColor Green
Write-Host "   └────────────────────────────────┘" -ForegroundColor Gray

Write-Host "`n💡 TÙY CHỌN NÂNG CAO:" -ForegroundColor Yellow

Write-Host "`n   Để hiển thị 1 dòng: 'Current: 3.2% / Target: 30%'" -ForegroundColor Cyan
Write-Host "   • Dùng Text panel với custom HTML/Markdown" -ForegroundColor Gray
Write-Host "   • Hoặc dùng Transform → Organize fields → Merge" -ForegroundColor Gray

Write-Host "`n   Option 1 - Stat Panel với Value Mapping:" -ForegroundColor Yellow
Write-Host "   • Query: " -ForegroundColor Gray
Write-Host "     100 * sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"})" -ForegroundColor White
Write-Host "   • Value mappings:" -ForegroundColor Gray
Write-Host "     Range 0-30: 'OK ({{value}}%)'" -ForegroundColor Green
Write-Host "     Range 30-70: 'Warning ({{value}}%)'" -ForegroundColor Yellow
Write-Host "     Range 70-100: 'Critical ({{value}}%)'" -ForegroundColor Red

Write-Host "`n   Option 2 - Singlestat Panel (legacy):" -ForegroundColor Yellow
Write-Host "   • Panel type: Stat" -ForegroundColor Gray
Write-Host "   • Display name: 'Current: `$__value / Target: 30%'" -ForegroundColor Gray

Write-Host "`n   Option 3 - Text Panel với query variable:" -ForegroundColor Yellow
Write-Host "   • Panel type: Text" -ForegroundColor Gray
Write-Host "   • Mode: Markdown" -ForegroundColor Gray
Write-Host "   • Content:" -ForegroundColor Gray
Write-Host "     ## Server CPU Status" -ForegroundColor White
Write-Host "     **Current:** `${A:percentencode}%  /  **Target:** 30%" -ForegroundColor White
Write-Host "     Status: ✓ OK" -ForegroundColor Green

Write-Host "`n🎨 PANEL ĐƠN GIẢN NHẤT (RECOMMENDED):" -ForegroundColor Green

Write-Host "`n   Panel Type: Stat" -ForegroundColor White
Write-Host "   Title: CPU: Current vs Target" -ForegroundColor Gray
Write-Host "   Query:" -ForegroundColor Yellow
Write-Host "   100 * sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"})" -ForegroundColor White

Write-Host "`n   Options → Text:" -ForegroundColor Yellow
Write-Host "   • Value: `${__value.text}%" -ForegroundColor Gray
Write-Host "   • Title: 'Current / Target (30%)'" -ForegroundColor Gray

Write-Host "`n   Thresholds:" -ForegroundColor Yellow
Write-Host "   • Base: Green" -ForegroundColor Green
Write-Host "   • 30: Yellow (HPA target)" -ForegroundColor Yellow
Write-Host "   • 70: Red" -ForegroundColor Red

Write-Host "`n   Result:" -ForegroundColor Cyan
Write-Host "   3.2% (màu xanh)" -ForegroundColor Green
Write-Host "   Current / Target (30%)" -ForegroundColor Gray

Write-Host "`n✅ HOÀN THÀNH!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray
