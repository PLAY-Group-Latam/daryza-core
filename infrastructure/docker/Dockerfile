FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /var/www

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
   && apt-get install -y nodejs

WORKDIR /var/www

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . /var/www
RUN composer install --no-dev --optimize-autoloader

# Copiar el resto del proyecto
COPY . /var/www

# Copiar .env antes de usar Artisan
COPY .env /var/www/.env

RUN npm install --legacy-peer-deps && npm run build 

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh

RUN chmod +x /usr/local/bin/docker.sh

CMD ["/usr/local/bin/docker.sh"]

