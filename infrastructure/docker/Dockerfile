# syntax=docker/dockerfile:1

# =============================================================================
# Imagen de producción para Daryza Core (Laravel 12 + Inertia/React)
#
#   target "app"   -> PHP-FPM con el código y dependencias listos
#   target "nginx" -> Nginx con los assets estáticos ya compilados
#
# El multi-stage se justifica por dos motivos:
#   1) Node.js solo se necesita para compilar assets; no debe quedar en la
#      imagen final.
#   2) Nginx necesita el directorio public/ compilado, que se produce en la
#      etapa de assets.
# =============================================================================

ARG PHP_VERSION=8.4

# =============================================================================
# 1) Base: PHP-FPM + extensiones necesarias + Composer
#    Extensiones según el uso real: PostgreSQL (pdo_pgsql), cadenas (mbstring),
#    Excel/zip (zip), imágenes (gd, exif), colas (pcntl), matemática (bcmath).
# =============================================================================
FROM php:${PHP_VERSION}-fpm AS php-base

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
        libpq-dev; \
    docker-php-ext-configure gd --with-freetype --with-jpeg; \
    docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        mbstring \
        zip \
        exif \
        pcntl \
        bcmath \
        gd \
        opcache; \
    printf '%s\n' \
        'opcache.enable=1' \
        'opcache.validate_timestamps=0' \
        'opcache.memory_consumption=128' \
        'opcache.max_accelerated_files=10000' \
        > /usr/local/etc/php/conf.d/zz-opcache.ini; \
    rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configuración PHP de producción
COPY infrastructure/php/uploads.ini /usr/local/etc/php/conf.d/zz-uploads.ini

WORKDIR /var/www

# =============================================================================
# 2) Dependencias PHP (Composer, solo producción)
# =============================================================================
FROM php-base AS vendor

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

COPY composer.json composer.lock ./

RUN composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --no-scripts \
        --no-autoloader

# El código se copia para poder generar el autoload optimizado
COPY . .

RUN composer dump-autoload \
        --no-dev \
        --optimize \
        --classmap-authoritative \
        --no-interaction

# =============================================================================
# 3) Assets frontend (Vite + Wayfinder; requiere PHP y Node)
# =============================================================================
FROM php-base AS assets

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg; \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -; \
    apt-get install -y --no-install-recommends nodejs; \
    corepack enable; \
    corepack prepare pnpm@10 --activate; \
    rm -rf /var/lib/apt/lists/*

COPY --from=vendor /var/www/vendor ./vendor
COPY . .

# Wayfinder resuelve controladores/middleware durante el build, lo que instancia
# GcsService y exige un keyfile. Se usa una clave ficticia SOLO durante el build
# (sin secretos reales) y se elimina en la misma capa, por lo que no queda en la
# imagen. En runtime la clave real llega por bind-mount / variables de entorno.
RUN set -eux; \
    mkdir -p storage/app; \
    printf '%s' '{"type":"service_account","project_id":"build","client_email":"build@build.iam.gserviceaccount.com"}' > storage/app/gcs-key.json; \
    cp .env.example .env; \
    php artisan key:generate; \
    sed -i 's#^GCS_KEY_FILE=.*#GCS_KEY_FILE=storage/app/gcs-key.json#' .env; \
    sed -i 's#^GCS_PROJECT_ID=.*#GCS_PROJECT_ID=build#' .env; \
    sed -i 's#^GCS_BUCKET=.*#GCS_BUCKET=build#' .env; \
    pnpm install --frozen-lockfile; \
    pnpm run build; \
    rm -f .env storage/app/gcs-key.json public/hot

# =============================================================================
# 4) Imagen final de la aplicación (PHP-FPM)
# =============================================================================
FROM php-base AS app

# Dependencias de Composer y assets compilados
COPY --from=vendor --chown=www-data:www-data /var/www/vendor ./vendor
COPY --from=assets --chown=www-data:www-data /var/www/public/build ./public/build

# Código de la aplicación
COPY --chown=www-data:www-data . .

RUN set -eux; \
    mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        storage/app/private \
        storage/app/public \
        bootstrap/cache; \
    rm -f public/hot; \
    chown -R www-data:www-data storage bootstrap/cache public/build; \
    chmod -R ug+rwX storage bootstrap/cache

COPY --chmod=755 infrastructure/scripts/default.sh /usr/local/bin/docker-entrypoint.sh

STOPSIGNAL SIGQUIT

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm", "-F"]

# =============================================================================
# 5) Nginx: sirve assets estáticos y hace proxy a PHP-FPM
# =============================================================================
FROM nginx:1.27-alpine AS nginx

RUN rm -f /etc/nginx/conf.d/default.conf

COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=assets /var/www/public /var/www/public

# Directorio compartido para el disco "public" (uploads) y su enlace simbólico
RUN mkdir -p /var/www/storage/app/public \
 && ln -sfn /var/www/storage/app/public /var/www/public/storage \
 && chown -R nginx:nginx /var/www

EXPOSE 80
