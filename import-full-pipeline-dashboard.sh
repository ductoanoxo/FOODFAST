#!/bin/bash

# Import Full Pipeline Dashboard to Grafana

echo "📊 Importing Full Pipeline Dashboard to Grafana..."

# Create wrapper JSON
cat > /tmp/dashboard-import.json << 'EOF'
{
  "dashboard": 
EOF

# Append dashboard content
cat monitoring/grafana/cicd-full-pipeline-dashboard.json >> /tmp/dashboard-import.json

# Close wrapper
cat >> /tmp/dashboard-import.json << 'EOF'
  ,
  "overwrite": true,
  "message": "Imported Full Pipeline Dashboard"
}
EOF

# Import to Grafana
RESPONSE=$(curl -s -X POST http://13.220.101.54:3030/api/dashboards/db \
  -H "Content-Type: application/json" \
  -u admin:admin123 \
  -d @/tmp/dashboard-import.json)

# Check response
if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Dashboard imported successfully!"
    echo ""
    echo "🎯 Access your dashboard:"
    echo "   http://13.220.101.54:3030/d/cicd-full-pipeline/foodfast-cicd-full-pipeline"
    echo ""
    echo "Login: admin / admin123"
else
    echo "❌ Import failed:"
    echo "$RESPONSE"
fi

# Cleanup
rm -f /tmp/dashboard-import.json
