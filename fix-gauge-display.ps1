# ============================================
# FIX GRAFANA GAUGE - Hiển thị đúng màu và scale
# ============================================

Write-Host "🎯 CÁCH FIX GAUGE HIỂN THỊ SAI (11% mà đỏ, gần full):" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 VẤN ĐỀ HIỆN TẠI:" -ForegroundColor Yellow
Write-Host "   • Query đã tính đúng: 11% CPU"
Write-Host "   • Nhưng Gauge hiển thị 11% gần full và màu đỏ"
Write-Host "   • Lý do: Gauge max value và thresholds sai"
Write-Host ""

Write-Host "🔧 CÁCH SỬA (3 BƯỚC):" -ForegroundColor Green
Write-Host ""

Write-Host "BƯỚC 1: Set Gauge Max Value" -ForegroundColor Cyan
Write-Host "   1. Click vào panel 'CPU USAGE HPA'"
Write-Host "   2. Click 'Edit' (icon bút chì)"
Write-Host "   3. Kéo xuống bên phải → tìm 'Gauge' section"
Write-Host "   4. Tìm 'Max' field"
Write-Host "   5. Set Max = 100 (vì query của bạn đã * 100)"
Write-Host ""

Write-Host "BƯỚC 2: Set Thresholds (ngưỡng màu)" -ForegroundColor Cyan
Write-Host "   1. Vẫn trong panel settings"
Write-Host "   2. Tìm 'Thresholds' section (thường ở trên cùng)"
Write-Host "   3. Click 'Add threshold'"
Write-Host "   4. Set như sau:"
Write-Host "      • Base (màu xanh lá):  0"
Write-Host "      • Yellow (màu vàng):  30  ← HPA threshold"
Write-Host "      • Red (màu đỏ):       70  ← Production threshold"
Write-Host ""

Write-Host "BƯỚC 3: Set Unit (tùy chọn)" -ForegroundColor Cyan
Write-Host "   1. Tìm 'Standard options' → 'Unit'"
Write-Host "   2. Chọn 'Misc' → 'Percent (0-100)'"
Write-Host "   3. Hoặc để 'None' nếu thích hiển thị 11.0 thay vì 11.0%"
Write-Host ""

Write-Host "✅ KẾT QUẢ SAU KHI FIX:" -ForegroundColor Green
Write-Host "   • 0-30%:   Màu xanh lá (bình thường)"
Write-Host "   • 30-70%:  Màu vàng (cảnh báo, sắp scale)"
Write-Host "   • 70-100%: Màu đỏ (nguy hiểm, cần scale gấp)"
Write-Host ""
Write-Host "   • 11% hiện tại → Màu XANH LÁ, gauge chỉ 11/100"
Write-Host ""

Write-Host "📸 HÌNH MINH HỌA CÀI ĐẶT:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Panel Settings (bên phải):"
Write-Host "   ┌─────────────────────────────────┐"
Write-Host "   │ Gauge                           │"
Write-Host "   │   Show threshold labels: ON     │"
Write-Host "   │   Show threshold markers: ON    │"
Write-Host "   │   Min: 0                        │"
Write-Host "   │   Max: 100          ← SỬA Ở ĐÂY│"
Write-Host "   │                                 │"
Write-Host "   │ Thresholds                      │"
Write-Host "   │   Mode: Absolute                │"
Write-Host "   │   🟢 Base:    0                 │"
Write-Host "   │   🟡 Warning: 30    ← THÊM      │"
Write-Host "   │   🔴 Critical: 70   ← THÊM      │"
Write-Host "   └─────────────────────────────────┘"
Write-Host ""

Write-Host "🎨 TẠI SAO 11% LẠI ĐỎ?" -ForegroundColor Magenta
Write-Host "   • Nếu Max = 1 → 11% tương đương 0.11 → vượt max → đỏ"
Write-Host "   • Nếu threshold base = 0, red = 10 → 11 > 10 → đỏ"
Write-Host "   • Sau khi set Max=100, threshold 30/70 → 11 < 30 → xanh!"
Write-Host ""

Write-Host "🚀 TEST AUTOSCALING XEM MÀU ĐỔI:" -ForegroundColor Cyan
Write-Host "   .\test-autoscale.ps1 -Target server -Duration 120 -Threads 20"
Write-Host "   → CPU tăng 30-70% → màu vàng"
Write-Host "   → CPU > 70% → màu đỏ"
Write-Host "   → Xem realtime trong Grafana!"
Write-Host ""

Write-Host "💡 LƯU Ý:" -ForegroundColor Yellow
Write-Host "   • Query của bạn ĐÃ ĐÚNG (11% là thật)"
Write-Host "   • Chỉ cần fix visualization settings"
Write-Host "   • Đừng sửa query, giữ nguyên * 100"
Write-Host ""
