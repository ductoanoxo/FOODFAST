#!/bin/bash

echo "💥 CPU STRESS TEST - Force Autoscaling"
echo "======================================="

ssh -i "C:\Users\ADMIN\Downloads\EKS.pem" -o StrictHostKeyChecking=no ubuntu@100.25.98.10 << 'ENDSSH'

echo "📊 Before Stress:"
kubectl get hpa foodfast-server-hpa -n foodfast
kubectl get pods -n foodfast -l app=foodfast-server
echo ""

POD=$(kubectl get pod -n foodfast -l app=foodfast-server -o jsonpath='{.items[0].metadata.name}')
echo "🎯 Target Pod: $POD"
echo ""

echo "🔥 Injecting CPU Stress (30 seconds)..."
kubectl exec -n foodfast $POD -- /bin/sh -c "while true; do echo 'stress' | md5sum; done" &
STRESS_PID=$!

echo "⏳ Monitoring for 60 seconds..."
for i in {1..12}; do
  echo ""
  echo "⏱️  Check $i/12 at $(date +%H:%M:%S)"
  
  HPA=$(kubectl get hpa foodfast-server-hpa -n foodfast --no-headers)
  echo "📈 $HPA"
  
  PODS=$(kubectl get pods -n foodfast -l app=foodfast-server --no-headers | wc -l)
  RUNNING=$(kubectl get pods -n foodfast -l app=foodfast-server --field-selector=status.phase==Running --no-headers | wc -l)
  echo "🎯 Pods: $RUNNING/$PODS running"
  
  CPU=$(echo "$HPA" | awk '{print $3}' | cut -d'/' -f1 | tr -d '%')
  if [ ! -z "$CPU" ] && [ "$CPU" -gt 20 ] 2>/dev/null; then
    echo "🚀🚀🚀 CPU ${CPU}% > 20% - SCALING! 🚀🚀🚀"
  fi
  
  sleep 5
done

echo ""
echo "🛑 Stopping stress..."
kill $STRESS_PID 2>/dev/null || true
kubectl exec -n foodfast $POD -- pkill -f "md5sum" 2>/dev/null || true

echo ""
echo "================================"
echo "📊 FINAL STATUS:"
kubectl get hpa -n foodfast
echo ""
kubectl get pods -n foodfast -l app=foodfast-server

ENDSSH

echo ""
echo "✅ Check Grafana: http://100.25.98.10:3030"
