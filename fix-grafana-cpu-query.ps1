# FIX GRAFANA QUERY - Hiển thị đúng % CPU như HPA

Write-Host "`n🔧 SỬA QUERY GRAFANA" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n❌ QUERY SAI (hiện 65% sai lệch):" -ForegroundColor Red
Write-Host "100 * sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"})" -ForegroundColor Gray

Write-Host "`n⚠️  VẤN ĐỀ:" -ForegroundColor Yellow
Write-Host "   • Không chia cho số cores đúng" -ForegroundColor White
Write-Host "   • kube_pod_container_resource_requests trả về giá trị tuyệt đối (250m = 0.25 cores)" -ForegroundColor White
Write-Host "   • rate() trả về cores/second" -ForegroundColor White
Write-Host "   • Công thức sai → kết quả sai!" -ForegroundColor White

Write-Host "`n✅ QUERY ĐÚNG (Option 1 - Giống HPA):" -ForegroundColor Green
Write-Host "sum(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`",container=`"server-app`"}[5m])) / sum(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) * 100" -ForegroundColor White

Write-Host "`n✅ QUERY ĐÚNG (Option 2 - Đơn giản hơn):" -ForegroundColor Green
Write-Host "avg(rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`",container=`"server-app`"}[5m])) / avg(kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) * 100" -ForegroundColor White

Write-Host "`n✅ QUERY ĐÚNG (Option 3 - Từng pod):" -ForegroundColor Green
Write-Host "sum by(pod) (rate(container_cpu_usage_seconds_total{namespace=`"foodfast`",pod=~`"server-app.*`",container=`"server-app`"}[5m])) / sum by(pod) (kube_pod_container_resource_requests{namespace=`"foodfast`",pod=~`"server-app.*`",resource=`"cpu`"}) * 100" -ForegroundColor White

Write-Host "`n📊 CÁCH SỬA TRONG GRAFANA:" -ForegroundColor Cyan

Write-Host "`n1. Click vào panel 'HPA - CPU Usage vs Target'" -ForegroundColor Yellow
Write-Host "2. Click 'Edit' (icon bút chì)" -ForegroundColor Yellow
Write-Host "3. Trong 'Queries', thay query bằng 1 trong 3 query trên" -ForegroundColor Yellow
Write-Host "4. Click 'Apply' ở góc phải trên" -ForegroundColor Yellow
Write-Host "5. Save dashboard" -ForegroundColor Yellow

Write-Host "`n🎯 KẾT QUẢ MONG ĐỢI:" -ForegroundColor Green
Write-Host "   • Hiển thị: ~2-3% (giống kubectl get hpa)" -ForegroundColor White
Write-Host "   • Màu xanh (vì < 30% threshold)" -ForegroundColor Green
Write-Host "   • Không scale up vô tội vạ" -ForegroundColor White

Write-Host "`n💡 GIẢI THÍCH TẠI SAO 65% SAI:" -ForegroundColor Yellow

Write-Host "`n   Server request: 250m (0.25 cores) × 2 pods = 0.5 cores total" -ForegroundColor Gray
Write-Host "   CPU usage: ~8m (0.008 cores) × 2 pods = 0.016 cores total" -ForegroundColor Gray
Write-Host "   Đúng: 0.016 / 0.5 × 100 = 3.2%" -ForegroundColor Green
Write-Host "   Sai query tính: 0.016 / (0.25/1000) × 100 = 6400% ???" -ForegroundColor Red

Write-Host "`n🔍 XÁC MINH QUERY ĐÚNG:" -ForegroundColor Cyan

Write-Host "`n   Mở Prometheus: http://localhost:32001" -ForegroundColor White
Write-Host "   Graph → Paste query mới" -ForegroundColor Gray
Write-Host "   Execute → Phải thấy ~2-3%" -ForegroundColor Gray

Write-Host "`n⚙️  VỀ HPA SCALING:" -ForegroundColor Yellow

Write-Host "`n   HPA target: 30%" -ForegroundColor White
Write-Host "   Current: 2% < 30% → Không scale" -ForegroundColor Green
Write-Host "   Nếu CPU > 30% → Scale up" -ForegroundColor Yellow
Write-Host "   Nếu CPU > 70% → Scale up nhanh (critical)" -ForegroundColor Red

Write-Host "`n   KHÔNG SỢ 'scale lên xún':" -ForegroundColor Green
Write-Host "   • maxReplicas: 10 → Tối đa 10 pods" -ForegroundColor White
Write-Host "   • scaleDown policy: 50% mỗi 60s → Scale down từ từ" -ForegroundColor White
Write-Host "   • stabilizationWindow: 300s → Đợi 5 phút mới scale down" -ForegroundColor White
Write-Host "   • Có limits CPU: 500m → Không vượt quá" -ForegroundColor White

Write-Host "`n🎚️  ĐIỀU CHỈNH HPA (nếu cần):" -ForegroundColor Cyan

Write-Host "`n   Nếu muốn ít scale hơn:" -ForegroundColor Yellow
Write-Host "   • Tăng target: 30% → 50% hoặc 70%" -ForegroundColor Gray
Write-Host "   • File: k8s/hpa.yaml" -ForegroundColor White
Write-Host "   • Apply: kubectl apply -f k8s/hpa.yaml" -ForegroundColor Gray

Write-Host "`n   Nếu muốn production (ổn định):" -ForegroundColor Yellow
Write-Host "   • averageUtilization: 70% (CPU)" -ForegroundColor White
Write-Host "   • averageUtilization: 80% (Memory)" -ForegroundColor White
Write-Host "   • minReplicas: 3 (always có dự phòng)" -ForegroundColor White

Write-Host "`n✅ TÓM TẮT:" -ForegroundColor Green
Write-Host "   1. Query Grafana SAI → Sửa lại query" -ForegroundColor White
Write-Host "   2. CPU thực tế 2% → Rất bình thường" -ForegroundColor White
Write-Host "   3. HPA hoạt động ĐÚNG → Không scale vì < 30%" -ForegroundColor White
Write-Host "   4. Có maxReplicas → Không scale vô tận" -ForegroundColor White

Write-Host "`n" -ForegroundColor Gray
