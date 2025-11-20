FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /var/www

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 1️⃣ Solo composer.json + lock para cache
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# 2️⃣ Copiar todo el proyecto (artisan ahora existe)
COPY . /var/www

# 3️⃣ Ejecutar scripts de Composer que requieren artisan
RUN composer run-script post-autoload-dump

# 4️⃣ Instalar dependencias JS y build frontend
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm run build

# 5️⃣ Permisos
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# 6️⃣ Script de arranque
COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh
RUN chmod +x /usr/local/bin/docker.sh

CMD ["/usr/local/bin/docker.sh"]
