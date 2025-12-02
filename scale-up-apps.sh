#!/bin/bash

echo "🔄 SCALING UP ALL APPS"
echo "======================"
echo ""

SERVER="ubuntu@98.81.112.203"
KEY="/c/Users/ADMIN/Downloads/EKS.pem"

echo "📊 Current Status:"
ssh -i "$KEY" $SERVER 'kubectl get deployments -n foodfast | grep foodfast-'
echo ""

echo "🔧 Scaling server to 2 pods..."
ssh -i "$KEY" $SERVER 'kubectl scale deployment foodfast-server --replicas=2 -n foodfast'
echo ""

echo "⬆️  Scaling up all apps to 1 replica..."
ssh -i "$KEY" $SERVER 'kubectl scale deployment foodfast-admin foodfast-client foodfast-restaurant foodfast-drone --replicas=1 -n foodfast'
echo ""

echo "⏳ Cleaning up pending pods..."
ssh -i "$KEY" $SERVER 'sleep 5 && kubectl delete pods -n foodfast --field-selector=status.phase==Pending --ignore-not-found=true'
echo ""

echo "⏳ Waiting for pods to start..."
sleep 15

echo ""
echo "✅ Final Status:"
ssh -i "$KEY" $SERVER 'kubectl get pods -n foodfast | grep foodfast-'
echo ""

echo "🌐 Access URLs:"
echo "   Client:     http://98.81.112.203:30001"
echo "   Admin:      http://98.81.112.203:30002"
echo "   Restaurant: http://98.81.112.203:30003"
echo "   Server API: http://98.81.112.203:30000"
echo "   Grafana:    http://98.81.112.203:3030"
echo ""
echo "✅ All apps scaled up!"
echo ""
