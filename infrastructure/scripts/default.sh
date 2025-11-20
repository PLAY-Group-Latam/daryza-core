#!/bin/bash
set -ex

# 1️⃣ Limpiar caches de Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 2️⃣ Migrar base de datos (esperar a que Postgres esté listo)
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USERNAME; do
  echo "Waiting for database..."
  sleep 2
done

php artisan migrate --force

# 4️⃣ Arrancar PHP-FPM
php-fpm
