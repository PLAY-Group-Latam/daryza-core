#!/bin/bash
set -e

echo "==> [1/3] Creando enlace simbólico de Storage..."
php artisan storage:link --force || true

echo "==> [2/3] Generando cachés de producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache || true

echo "==> [3/3] Iniciando PHP-FPM..."
exec php-fpm -F