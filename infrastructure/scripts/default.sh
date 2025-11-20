#!/bin/bash
set -ex

npm run build 


# 4️⃣ Arrancar PHP-FPM
php-fpm &
