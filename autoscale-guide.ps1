# ========================================
# HƯỚNG DẪN TEST AUTO-SCALING
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔥 HƯỚNG DẪN TEST AUTO-SCALING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra HPA status
Write-Host "📊 Step 1: Kiểm tra HPA hiện tại..." -ForegroundColor Yellow
kubectl get hpa -n foodfast
Write-Host ""

# Kiểm tra Metrics Server
Write-Host "📊 Step 2: Kiểm tra Metrics Server..." -ForegroundColor Yellow
$metricsAvailable = kubectl top pods -n foodfast 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Metrics Server hoạt động:" -ForegroundColor Green
    $metricsAvailable
} else {
    Write-Host "❌ Metrics Server chưa sẵn sàng!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Chạy lệnh sau để cài Metrics Server:" -ForegroundColor Yellow
    Write-Host "kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml" -ForegroundColor Cyan
    Write-Host "kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{\`"op\`": \`"add\`", \`"path\`": \`"/spec/template/spec/containers/0/args/-\`", \`"value\`": \`"--kubelet-insecure-tls\`"}]'" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
Write-Host ""

# Kiểm tra pods
Write-Host "📊 Step 3: Kiểm tra Pods..." -ForegroundColor Yellow
kubectl get pods -n foodfast
Write-Host ""

# Hướng dẫn test
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 CÁC CÁCH TEST AUTO-SCALING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "CÁCH 1: Dùng script tự động (KHUYÊN DÙNG)" -ForegroundColor Green
Write-Host "   Terminal 1: .\monitor-autoscale.ps1" -ForegroundColor Cyan
Write-Host "   Terminal 2: .\test-autoscale.ps1 -Target server -Duration 120 -Threads 20" -ForegroundColor Cyan
Write-Host ""

Write-Host "CÁCH 2: Dùng kubectl run (Tạo CPU load)" -ForegroundColor Green
Write-Host "   kubectl run load-generator --image=busybox --restart=Never -n foodfast -- /bin/sh -c 'while true; do wget -q -O- http://server-svc:5000/api/products; done'" -ForegroundColor Cyan
Write-Host "   # Tạo nhiều load generator:" -ForegroundColor Gray
Write-Host "   for (\$i=1; \$i -le 5; \$i++) { kubectl run load-generator-\$i --image=busybox --restart=Never -n foodfast -- /bin/sh -c 'while true; do wget -q -O- http://server-svc:5000/api/products; done' }" -ForegroundColor Cyan
Write-Host ""

Write-Host "CÁCH 3: Dùng Apache Bench (ab)" -ForegroundColor Green
Write-Host "   # Install: choco install apache-httpd" -ForegroundColor Gray
Write-Host "   ab -n 100000 -c 100 http://localhost:30050/api/products" -ForegroundColor Cyan
Write-Host ""

Write-Host "CÁCH 4: Dùng curl loop" -ForegroundColor Green
Write-Host "   while (\$true) { curl http://localhost:30050/api/products; Start-Sleep -Milliseconds 10 }" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 LỆNH MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Watch HPA:              kubectl get hpa -n foodfast -w" -ForegroundColor Yellow
Write-Host "Watch Pods:             kubectl get pods -n foodfast -w" -ForegroundColor Yellow
Write-Host "Watch Metrics:          watch kubectl top pods -n foodfast" -ForegroundColor Yellow
Write-Host "Describe HPA:           kubectl describe hpa server-app-hpa -n foodfast" -ForegroundColor Yellow
Write-Host "View HPA Events:        kubectl get events -n foodfast --sort-by='.lastTimestamp'" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 EXPECTED BEHAVIOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server App:" -ForegroundColor Yellow
Write-Host "  - Min: 2 pods" -ForegroundColor Gray
Write-Host "  - Max: 10 pods" -ForegroundColor Gray
Write-Host "  - Scale khi CPU > 70% hoặc Memory > 80%" -ForegroundColor Gray
Write-Host ""
Write-Host "Client App:" -ForegroundColor Yellow
Write-Host "  - Min: 2 pods" -ForegroundColor Gray
Write-Host "  - Max: 5 pods" -ForegroundColor Gray
Write-Host "  - Scale khi CPU > 70%" -ForegroundColor Gray
Write-Host ""

Write-Host "⏱️  Scale Up: ~30 giây sau khi CPU/Memory vượt ngưỡng" -ForegroundColor Cyan
Write-Host "⏱️  Scale Down: ~5 phút sau khi CPU/Memory giảm xuống" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ SẴN SÀNG TEST!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
