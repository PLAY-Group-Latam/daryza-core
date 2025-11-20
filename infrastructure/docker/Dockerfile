FROM php:8.3-fpm

# Instalar dependencias de sistema y extensiones PHP
RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /var/www

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar solo composer.json y composer.lock para aprovechar cache
COPY composer.json composer.lock ./

# Instalar dependencias PHP sin ejecutar scripts
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copiar el resto del proyecto (incluye artisan)
COPY . /var/www

# Ejecutar scripts de Composer ahora que artisan existe
RUN php artisan package:discover --ansi

# Instalar dependencias JS
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Ajustar permisos
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Copiar script de arranque
COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh
RUN chmod +x /usr/local/bin/docker.sh

# Ejecutar script por defecto
CMD ["/usr/local/bin/docker.sh"]
