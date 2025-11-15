#!/bin/bash

# Script để kiểm tra xem Dashboard CI/CD có cập nhật real-time không

PROM_URL="http://13.220.101.54:9090"
GRAFANA_URL="http://13.220.101.54:3030"

echo "🔍 KIỂM TRA CẬP NHẬT REAL-TIME CI/CD DASHBOARD"
echo "==============================================="
echo ""

# Lấy metrics hiện tại
echo "📊 Đang lấy metrics từ Prometheus..."
TOTAL_RESPONSE=$(curl -s "$PROM_URL/api/v1/query?query=sum(github_workflow_run_total)")
SUCCESS_RESPONSE=$(curl -s "$PROM_URL/api/v1/query?query=sum(github_workflow_success_total)")

# Parse giá trị
TOTAL=$(echo $TOTAL_RESPONSE | grep -o '"value":\[[^]]*\]' | grep -o '[0-9.]\+' | tail -1 | cut -d. -f1)
SUCCESS=$(echo $SUCCESS_RESPONSE | grep -o '"value":\[[^]]*\]' | grep -o '[0-9.]\+' | tail -1 | cut -d. -f1)

echo ""
echo "✅ METRICS HIỆN TẠI:"
echo "   📈 Total Workflow Runs: $TOTAL"
echo "   ✅ Successful Runs: $SUCCESS"
echo "   ⏰ Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Kiểm tra GitHub Actions status
echo "🔗 LIÊN KẾT QUAN TRỌNG:"
echo ""
echo "   📊 Grafana Dashboard:"
echo "      → $GRAFANA_URL"
echo "      (Xem 'Total Workflow Runs' panel - phải là: $TOTAL)"
echo ""
echo "   🔧 GitHub Actions:"
echo "      → https://github.com/ductoanoxo/FOODFAST/actions"
echo "      (Kiểm tra workflow đã hoàn thành chưa)"
echo ""
echo "   📊 Prometheus:"
echo "      → $PROM_URL"
echo ""

# Lưu vào file để so sánh sau
echo "$TOTAL" > /tmp/cicd_baseline_total.txt
echo "$SUCCESS" > /tmp/cicd_baseline_success.txt
echo "$(date +%s)" > /tmp/cicd_baseline_time.txt

echo "💾 Đã lưu baseline vào /tmp/cicd_baseline_*.txt"
echo ""
echo "🔄 CÁCH KIỂM TRA CẬP NHẬT:"
echo ""
echo "   1. Mở Grafana dashboard và GHI NHỚ số: $TOTAL"
echo "   2. Đợi workflow GitHub Actions hoàn thành (~2-3 phút)"
echo "   3. Chạy lại script này: ./check-cicd-update.sh"
echo "   4. So sánh số mới với số cũ"
echo ""
echo "   NẾU SỐ TĂNG LÊN → Dashboard đang real-time! ✅"
echo "   NẾU SỐ KHÔNG ĐỔI → Có vấn đề cần kiểm tra ❌"
echo ""

# Nếu có baseline cũ, hiển thị sự thay đổi
if [ -f /tmp/cicd_baseline_total.txt.old ]; then
    OLD_TOTAL=$(cat /tmp/cicd_baseline_total.txt.old)
    OLD_TIME=$(cat /tmp/cicd_baseline_time.txt.old)
    DIFF=$((TOTAL - OLD_TOTAL))
    TIME_DIFF=$(($(date +%s) - OLD_TIME))
    
    if [ $DIFF -gt 0 ]; then
        echo "📈 PHÁT HIỆN THAY ĐỔI!"
        echo "   Trước: $OLD_TOTAL"
        echo "   Sau:   $TOTAL"
        echo "   Tăng:  +$DIFF workflow(s)"
        echo "   Thời gian: ${TIME_DIFF}s trước"
        echo ""
        echo "   ✅ Dashboard ĐANG HOẠT ĐỘNG REAL-TIME!"
    else
        echo "⏳ Chưa có thay đổi so với lần check trước"
        echo "   (${TIME_DIFF}s trước: $OLD_TOTAL)"
    fi
fi

# Backup baseline
cp /tmp/cicd_baseline_total.txt /tmp/cicd_baseline_total.txt.old 2>/dev/null
cp /tmp/cicd_baseline_success.txt /tmp/cicd_baseline_success.txt.old 2>/dev/null
cp /tmp/cicd_baseline_time.txt /tmp/cicd_baseline_time.txt.old 2>/dev/null
