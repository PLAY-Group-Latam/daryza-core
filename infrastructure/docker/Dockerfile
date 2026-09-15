FROM php:8.4-fpm

# Dependencias del sistema y Node.js
RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar el proyecto
COPY . /var/www

# Crear un .env temporal para que Artisan no falle en npm run build
RUN cp .env.example .env && php artisan key:generate

# Instalar dependencias PHP y Node + Compilar assets
RUN composer install --no-dev --optimize-autoloader \
    && npm ci \
    && npm run build

# Limpiar el .env temporal para no sobreescribir el de producción
RUN rm .env

# Permisos
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Script de arranque
COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh
RUN chmod +x /usr/local/bin/docker.sh

CMD ["/usr/local/bin/docker.sh"]