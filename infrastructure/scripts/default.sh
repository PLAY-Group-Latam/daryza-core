#!/bin/bash
set -e 
# starting php-fpm in the background
php-fpm & 

# waiting for app is completly booted
sleep 5

echo "building the frontend..."
npm run build

echo "starting workers..."
while true; do
  php artisan queue:work --verbose --tries=3 --timeout=90 >> storage/logs/queue.log 2>&1 || true
  echo "queue crashed, restarting in 5 seconds..."
  sleep 5
done