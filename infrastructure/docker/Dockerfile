FROM php:8.4-fpm

# Dependencias del sistema, Node.js y extensiones PHP en un solo paso
RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar el código del proyecto
COPY . /var/www

# Instalar dependencias de PHP y Frontend (compilando assets)
RUN composer install --no-dev --optimize-autoloader \
    && npm ci \
    && npm run build

# Permisos y estructura básica de almacenamiento
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Script de arranque
COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh
RUN chmod +x /usr/local/bin/docker.sh

CMD ["/usr/local/bin/docker.sh"]