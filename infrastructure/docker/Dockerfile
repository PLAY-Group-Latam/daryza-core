FROM php:8.3-fpm

# 1️⃣ Instalar dependencias de sistema y extensiones PHP
RUN apt-get update && apt-get install -y \
    zip unzip curl git libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd

# 2️⃣ Instalar Node.js para Vite / frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 3️⃣ Directorio de trabajo
WORKDIR /var/www

# 4️⃣ Instalar Composer (usa cache de Docker)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5️⃣ Copiar archivos de dependencias y cachear
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

COPY package*.json ./
RUN npm install --legacy-peer-deps

# 6️⃣ Copiar el resto del código de la aplicación
COPY . /var/www

# 7️⃣ Ajustar permisos
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# 8️⃣ Copiar script de arranque
COPY infrastructure/scripts/default.sh /usr/local/bin/docker.sh
RUN chmod +x /usr/local/bin/docker.sh

# 9️⃣ Comando por defecto: ejecuta el script
#    El script ahora puede:
#      - arrancar PHP-FPM
#      - compilar frontend con Vite
CMD ["/usr/local/bin/docker.sh"]
