#!/bin/sh
# =============================================================================
# Entrypoint de producción para Daryza Core.
# Se ejecuta antes del proceso principal (php-fpm, queue:work, schedule:work...).
# =============================================================================
set -e

cd /var/www

log() {
    echo "[entrypoint] $*"
}

# ---------------------------------------------------------------------------
# 1. Directorios de escritura
# ---------------------------------------------------------------------------
mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/private \
    storage/app/public \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# ---------------------------------------------------------------------------
# 2. Enlace simbólico de storage
# ---------------------------------------------------------------------------
if [ ! -e public/storage ]; then
    log "Creando enlace public/storage..."
    php artisan storage:link || true
fi

# ---------------------------------------------------------------------------
# 3. Optimización de Laravel (solo en el contenedor web)
# ---------------------------------------------------------------------------
case "${1:-}" in
    php-fpm*)
        log "Generando cachés de producción..."
        php artisan config:cache
        php artisan route:cache || true
        php artisan view:cache || true
        ;;
esac

# ---------------------------------------------------------------------------
# 4. Arranque del proceso principal
# ---------------------------------------------------------------------------
log "Iniciando: $*"
exec "$@"
