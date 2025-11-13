#!/bin/bash
# Traffic Generator Script for FoodFast Monitoring

echo "Starting traffic generation..."

count=0
while [ $count -lt 200 ]; do
  curl -s http://localhost:5000/api/health > /dev/null &
  curl -s http://localhost:5000/api/products > /dev/null &
  curl -s http://localhost:5000/api/categories > /dev/null &
  curl -s http://localhost:5000/api/restaurants > /dev/null &
  
  count=$((count+1))
  
  if [ $((count % 20)) -eq 0 ]; then
    echo "Generated $((count*4)) requests..."
  fi
  
  sleep 0.5
done

wait
echo "Completed! Generated 800 requests total."
