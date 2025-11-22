#!/bin/bash

echo "🚀 FOODFAST AUTOSCALING DEMO"
echo "============================"
echo ""

SERVER="ubuntu@100.25.98.10"
KEY="/c/Users/ADMIN/Downloads/EKS.pem"

echo "📊 Step 1: Preparing Environment"
echo "---------------------------------"
echo "Scaling down other apps to free resources..."
ssh -i "$KEY" $SERVER 'kubectl scale deployment foodfast-admin foodfast-client foodfast-drone foodfast-restaurant --replicas=0 -n foodfast'
echo "✅ Other apps scaled down"
echo ""
sleep 5

echo "📊 Step 2: Current Status"
echo "-------------------------"
ssh -i "$KEY" $SERVER 'kubectl get hpa foodfast-server-hpa -n foodfast && echo "" && kubectl get pods -n foodfast -l app=foodfast-server'
echo ""

echo "🔥 Step 3: Creating Stress Test"
echo "--------------------------------"
ssh -i "$KEY" $SERVER bash << 'EOF'
SERVICE_IP=$(kubectl get svc foodfast-server -n foodfast -o jsonpath='{.spec.clusterIP}')
POD=$(kubectl get pod -n foodfast -l app=foodfast-server -o jsonpath='{.items[0].metadata.name}')

echo "Target: $SERVICE_IP"
echo "Pod: $POD"

# Create load generator
cat <<YAML | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: autoscaling-demo
  namespace: foodfast
spec:
  containers:
  - name: stress
    image: busybox:latest
    command: ["/bin/sh", "-c"]
    args:
    - |
      echo "Starting stress"
      for i in {1..30}; do
        for j in {1..1000}; do
          wget -q -O- http://$SERVICE_IP:5000/api/products &
        done
        sleep 2
      done
      wait
  restartPolicy: Never
YAML

echo "✅ Load generator created"

# Inject CPU stress
kubectl exec -n foodfast $POD -- /bin/sh -c "nohup sh -c 'while true; do echo stress | md5sum; done' >/dev/null 2>&1 &" || true
echo "✅ CPU stress injected"
EOF

echo ""
echo "⏳ Step 4: Monitoring (60 seconds)"
echo "----------------------------------"
echo ""

for i in {1..12}; do
  echo "⏱️  Check $i/12"
  ssh -i "$KEY" $SERVER bash << 'EOF'
HPA=$(kubectl get hpa foodfast-server-hpa -n foodfast --no-headers)
echo "📈 $HPA"

RUNNING=$(kubectl get pods -n foodfast -l app=foodfast-server --field-selector=status.phase==Running --no-headers | wc -l)
TOTAL=$(kubectl get pods -n foodfast -l app=foodfast-server --no-headers | wc -l)
echo "🎯 Pods: $RUNNING/$TOTAL running"

CPU=$(echo "$HPA" | awk '{print $3}' | cut -d'/' -f1 | tr -d '%')
REPLICAS=$(echo "$HPA" | awk '{print $7}')

if [ "$CPU" -gt 20 ] 2>/dev/null; then
  echo "🚀 CPU $CPU% > 20% - AUTOSCALING!"
fi
if [ "$REPLICAS" -gt 2 ] 2>/dev/null; then
  echo "✅ SCALED TO $REPLICAS REPLICAS!"
fi
EOF
  echo ""
  sleep 5
done

echo "🧹 Step 5: Cleanup"
echo "------------------"
ssh -i "$KEY" $SERVER bash << 'EOF'
POD=$(kubectl get pod -n foodfast -l app=foodfast-server -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n foodfast $POD -- pkill -f "md5sum" 2>/dev/null || true
kubectl delete pod autoscaling-demo -n foodfast --ignore-not-found=true
kubectl delete pod -n foodfast --field-selector=status.phase==Pending --ignore-not-found=true
echo "✅ Cleanup done"
EOF

echo ""
echo "================================"
echo "📊 FINAL RESULTS"
echo "================================"
ssh -i "$KEY" $SERVER 'kubectl get hpa -n foodfast && echo "" && kubectl get pods -n foodfast -l app=foodfast-server'

echo ""
echo "✅ DEMO COMPLETED!"
echo "📊 View on Grafana: http://100.25.98.10:3030"
echo ""
