#!/bin/bash

echo "🔄 SCALING UP ALL APPS"
echo "======================"
echo ""

SERVER="ubuntu@3.236.196.130"
KEY="/c/Users/ADMIN/Downloads/EKS.pem"

echo "📊 Current Status:"
ssh -i "$KEY" $SERVER 'kubectl get deployments -n foodfast | grep foodfast-'
echo ""

echo "🔧 Ensuring server has only 1 pod (for resource availability)..."
ssh -i "$KEY" $SERVER 'kubectl scale deployment foodfast-server --replicas=1 -n foodfast'
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
echo "   Client:     http://3.236.196.130:30001"
echo "   Admin:      http://3.236.196.130:30002"
echo "   Restaurant: http://3.236.196.130:30003"
echo "   Server API: http://3.236.196.130:30000"
echo "   Grafana:    http://3.236.196.130:3030"
echo ""
echo "✅ All apps scaled up!"
echo ""
