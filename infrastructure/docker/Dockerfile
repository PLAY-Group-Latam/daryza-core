FROM php:8.4-fpm

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /var/www

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar proyecto
COPY . /var/www

# Instalar dependencias PHP
RUN composer install --no-dev --optimize-autoloader


# Instalar dependencias JS y dar permisos
RUN npm install \
    && chmod -R +x node_modules/.bin node_modules/@esbuild node_modules/esbuild

# 7️⃣ Build frontend
RUN npm run build

# Permisos
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

    
# Script de arranque
COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh
RUN chmod +x /usr/local/bin/docker.sh

CMD ["/usr/local/bin/docker.sh"]
