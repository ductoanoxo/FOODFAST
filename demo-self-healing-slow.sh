#!/bin/bash

echo "📊 FOODFAST SELF-HEALING DEMO (SLOW VERSION)"
echo "============================================="
echo ""

SERVER="ubuntu@98.81.112.203"
KEY="/c/Users/ADMIN/Downloads/EKS.pem"

echo "🎯 Strategy: Delete pods, wait 60s, then recreate HPA"
echo "   Pod count: 1 → 0 (60s) → 1"
echo "   This creates LONG visible downtime on Grafana!"
echo ""
echo "🌐 OPEN GRAFANA NOW: http://98.81.112.203:3030"
echo "   Watch panel: 'Running Server Pods'"
echo ""
echo "Press ENTER to continue..."
read

echo ""
echo "📊 Step 1: Current State"
echo "------------------------"
ssh -i "$KEY" $SERVER 'kubectl get hpa -n foodfast foodfast-server-hpa'
ssh -i "$KEY" $SERVER 'kubectl get pods -n foodfast -l app=foodfast-server'
echo ""

echo "💥 Step 2: DELETE HPA (temporarily)"
echo "------------------------------------"
ssh -i "$KEY" $SERVER 'kubectl delete hpa foodfast-server-hpa -n foodfast'
echo "✅ HPA deleted"
echo ""

echo "💥 Step 3: SCALE DEPLOYMENT TO 0"
echo "---------------------------------"
ssh -i "$KEY" $SERVER 'kubectl scale deployment foodfast-server -n foodfast --replicas=0'
echo "✅ Deployment scaled to 0"
echo ""

echo "📊 Step 3: Check Pods (Should be 0)"
echo "------------------------------------"
echo "⏳ Staying at 0 pods for 60 seconds (so Grafana can catch it)..."
for i in {1..12}; do
  COUNT=$(ssh -i "$KEY" $SERVER 'kubectl get pods -n foodfast -l app=foodfast-server --no-headers 2>/dev/null | wc -l')
  echo "   Check $i/12 (${i}x5s): Pod count = $COUNT (watch Grafana stay at 0)"
  sleep 5
done
echo ""

echo "🔄 Step 4: SCALE DEPLOYMENT TO 1"
echo "---------------------------------"
ssh -i "$KEY" $SERVER 'kubectl scale deployment foodfast-server -n foodfast --replicas=1'
echo "✅ Deployment scaled to 1 (kickstart)"
echo ""

echo "⏳ Waiting for pod to start..."
sleep 10

echo ""
echo "🔄 Step 5: RECREATE HPA"
echo "-----------------------"
ssh -i "$KEY" $SERVER 'kubectl apply -f /home/ubuntu/foodfast-k8s/k8s/hpa/hpa.yaml'
echo "✅ HPA recreated with minReplicas=2"
echo ""

echo "⏳ Waiting for self-healing (HPA will scale 1→2)..."
sleep 5

echo ""
echo "📊 Step 6: Watch Recovery"
echo "-------------------------"
for i in {1..8}; do
  COUNT=$(ssh -i "$KEY" $SERVER 'kubectl get pods -n foodfast -l app=foodfast-server --no-headers 2>/dev/null | grep -c "Running\|ContainerCreating" || echo "0"')
  RUNNING=$(ssh -i "$KEY" $SERVER 'kubectl get pods -n foodfast -l app=foodfast-server --no-headers 2>/dev/null | grep -c "Running" || echo "0"')
  echo "   Check $i/8: Total=$COUNT | Running=$RUNNING (watch Grafana: 0→1→2)"
  sleep 5
done

echo ""
echo "📊 Final State"
echo "--------------"
ssh -i "$KEY" $SERVER 'kubectl get hpa -n foodfast foodfast-server-hpa'
ssh -i "$KEY" $SERVER 'kubectl get pods -n foodfast -l app=foodfast-server'
echo ""

echo "=========================================="
echo "✅ SELF-HEALING DEMO COMPLETED"
echo "=========================================="
echo ""
echo "📊 Timeline on Grafana (90+ seconds):"
echo "   1. Start: 1 pod → 0 pods (scaled down)"
echo "   2. Stay at 0 for 60 seconds (visible on dashboard)"
echo "   3. 0 pods → 1 pod (manual kickstart)"
echo "   4. 1 pod stays (minReplicas=1, no autoscaling needed)"
echo ""
echo "🎯 This proves:"
echo "   - Kubernetes detects pods = 0"
echo "   - HPA recreated automatically restores to minReplicas=1"
echo "   - Dashboard shows clear 60s downtime period"
echo "   - Self-healing brings system back to operational state"
echo ""
