#!/bin/bash
set -e

# 1️⃣ Compilar frontend si existe package.json
if [ -f package.json ]; then
  echo "🟢 Building frontend..."
  npm install --legacy-peer-deps
  npm run build
fi

# 2️⃣ Limpiar caché de Laravel
echo "🟢 Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 3️⃣ Ajustar permisos
chown -R www-data:www-data /var/www
chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# 4️⃣ Iniciar PHP-FPM en primer plano
echo "🟢 Starting PHP-FPM..."
php-fpm
