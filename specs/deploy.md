Quiero que analices y dockerices correctamente esta aplicación Laravel para un entorno de PRODUCCIÓN, pero con un principio muy importante:

**NO quiero sobreingeniería.**

Quiero una solución simple, mantenible, segura y apropiada para el tamaño real de la aplicación. No agregues tecnologías, servicios o capas que no sean necesarias.

## Contexto de la aplicación

La aplicación es:

- Laravel
- PHP 8.4
- PostgreSQL 15
- Frontend compilado con Vite
- Node.js 20 para el build de frontend
- Laravel Vite Plugin / Wayfinder
- Laravel Queue
- Laravel Scheduler
- Nginx
- Docker Compose
- Deploy en un servidor Linux
- La aplicación utiliza almacenamiento persistente para archivos subidos.
- Algunas integraciones externas pueden requerir variables de entorno/secretos.
- El código fuente NO debería montarse desde el host en producción.

La aplicación debe poder desplegarse mediante algo sencillo como:

```bash
docker compose up -d --build
```

y quedar funcionando.

---

# OBJETIVO

Quiero que diseñes una arquitectura Docker de producción **simple y suficiente**, evitando sobreingeniería.

La arquitectura base esperada es:

```text
Internet
   |
   v
 Nginx
   |
   v
 Laravel / PHP-FPM
   |
   +---- PostgreSQL
   |
   +---- Queue Worker
   |
   +---- Scheduler
```

No agregues Redis, Kubernetes, Traefik, Supervisor, múltiples servidores, servicios cloud adicionales u otras tecnologías si la aplicación realmente no las necesita.

Si Laravel actualmente utiliza otro servicio, primero identifícalo y justifica si debe mantenerse.

---

# PRINCIPIOS IMPORTANTES

## 1. Imagen inmutable

En producción quiero que el código de Laravel esté dentro de la imagen Docker.

NO quiero:

```yaml
volumes:
    - .:/var/www
```

porque eso hace que el contenedor dependa del código existente en el servidor.

El código debe entrar mediante:

```dockerfile
COPY . /var/www
```

durante el build.

---

## 2. Frontend

La aplicación utiliza Vite.

Necesito que determines correctamente cómo manejar:

```bash
npm ci
npm run build
```

durante el Docker build.

El resultado debería quedar dentro de:

```text
public/build
```

o la ubicación que corresponda según la configuración real de Vite.

IMPORTANTE:

La aplicación utiliza:

```text
@laravel/vite-plugin-wayfinder
```

por lo que `npm run build` puede ejecutar comandos Artisan como:

```bash
php artisan wayfinder:generate --with-form
```

No quiero que simplemente elimines Wayfinder ni desactives funcionalidades para conseguir que el Docker build pase.

Primero analiza por qué Wayfinder necesita Laravel durante el build y determina la forma correcta de manejarlo en producción.

Si necesita variables de entorno durante el build, explica cuáles son realmente necesarias y evita introducir secretos reales dentro de la imagen.

---

# 3. Variables de entorno

La configuración de producción debe utilizar un `.env` externo.

Por ejemplo:

```yaml
env_file:
    - .env
```

No quiero copiar el `.env` real dentro de la imagen.

El `.env` de producción debe permanecer únicamente en el servidor.

El Dockerfile tampoco debe generar ni conservar un `.env` permanente dentro de la imagen.

Si para ejecutar alguna tarea de BUILD, como Wayfinder, se necesita temporalmente un `.env`, analiza una solución segura para ello y asegúrate de que:

- no contenga secretos reales;
- no quede dentro de la imagen final;
- no se utilicen credenciales de producción durante el build.

---

# 4. Composer

Usar:

```bash
composer install --no-dev --optimize-autoloader
```

para producción.

No instalar dependencias de desarrollo si no son necesarias para ejecutar la aplicación.

Analiza si alguna dependencia aparentemente de desarrollo es realmente requerida durante el build de frontend o por Wayfinder.

No elimines dependencias sin verificar primero.

---

# 5. Node.js

Node.js debe utilizarse únicamente si realmente es necesario para compilar los assets.

Si solamente se necesita para:

```bash
npm ci
npm run build
```

quiero que evalúes si debe permanecer instalado en la imagen final.

Prioriza una solución simple, pero si un multi-stage build realmente reduce el tamaño de la imagen sin agregar complejidad innecesaria, puedes utilizarlo.

No hagas multi-stage simplemente porque "es una buena práctica".

Justifica su necesidad.

---

# 6. Nginx

Nginx debe ser el servidor HTTP.

Debe apuntar a:

```text
/var/www/public
```

y enviar PHP a:

```text
app:9000
```

La configuración debe incluir como mínimo:

- `try_files`
- FastCGI
- `fastcgi_param`
- límite razonable de subida
- timeout razonable
- protección para archivos sensibles

No necesito una configuración extremadamente compleja.

---

# 7. PHP-FPM

Utilizar:

```text
php:8.4-fpm
```

Instalar solamente las extensiones PHP que realmente necesita la aplicación.

Analiza `composer.json` y el código para determinar las extensiones necesarias.

No instalar extensiones innecesarias.

---

# 8. Laravel storage

El código debe ser inmutable, pero el almacenamiento que realmente necesita persistencia debe utilizar volúmenes Docker.

Analiza qué directorios necesitan persistencia.

Por ejemplo:

```text
storage/app/public
```

Si solamente ese directorio necesita persistencia, no montes todo:

```text
/var/www
```

ni todo:

```text
/var/www/storage
```

sin justificarlo.

Si Laravel necesita:

```text
storage/logs
```

evalúa si es mejor mantenerlos dentro del contenedor y enviarlos a stdout/stderr o persistirlos.

No agregues volúmenes innecesarios.

---

# 9. Queue

La aplicación utiliza Laravel Queue.

Quiero un contenedor separado para:

```bash
php artisan queue:work
```

pero reutilizando la misma imagen de la aplicación.

No quiero construir una segunda imagen solamente para queue.

Ejemplo conceptual:

```yaml
app:
    image: daryza-app

queue:
    image: daryza-app
    command: php artisan queue:work ...
```

Configura correctamente:

- restart
- timeout
- tries
- backoff
- dependencia de PostgreSQL

No agregues Supervisor si Docker Compose puede manejar correctamente el proceso.

---

# 10. Scheduler

La aplicación utiliza Laravel Scheduler.

Utilizar:

```bash
php artisan schedule:work
```

en un contenedor separado reutilizando la misma imagen.

No crear otra imagen.

---

# 11. PostgreSQL

Utilizar PostgreSQL mediante Docker Compose si es parte del entorno actual.

Utilizar volumen persistente:

```text
postgres_data
```

No publicar PostgreSQL hacia Internet.

Idealmente:

```yaml
ports:
    - '127.0.0.1:5432:5432'
```

o incluso no publicar el puerto si no es necesario para administración externa.

Los servicios Docker deben comunicarse utilizando:

```text
postgresql:5432
```

No:

```text
localhost
```

dentro del contenedor.

Agregar un healthcheck sencillo con `pg_isready`.

---

# 12. Seguridad

Quiero una configuración razonablemente segura, sin sobreingeniería.

Revisar:

- `.dockerignore`
- secretos
- `.env`
- permisos
- exposición de PostgreSQL
- exposición de Nginx
- archivos sensibles
- `APP_DEBUG=false`
- `APP_ENV=production`
- permisos de `storage`
- permisos de `bootstrap/cache`

No incluir en la imagen:

```text
.env
*.key
*.pem
*.crt
gcs-key.json
```

ni otros secretos.

---

# 13. Docker Compose

Quiero un único:

```text
docker-compose.yml
```

para producción, salvo que exista una razón concreta para separar archivos.

Servicios esperados:

```text
app
queue
scheduler
nginx
postgresql
```

No agregar más servicios sin justificarlo.

`queue` y `scheduler` deben reutilizar:

```text
daryza-app:latest
```

o el nombre de imagen que consideres apropiado.

---

# 14. Startup

Analiza mi `default.sh`.

Determina qué debería ejecutarse:

### Durante BUILD

Por ejemplo:

```text
composer install
npm ci
npm run build
```

### Durante RUNTIME

Por ejemplo:

```text
php artisan config:cache
php artisan route:cache
php artisan view:cache
php-fpm
```

No ejecutes automáticamente migraciones destructivas.

Si consideras apropiado ejecutar:

```bash
php artisan migrate --force
```

durante el deploy, déjalo como un paso manual/documentado:

```bash
docker compose run --rm app php artisan migrate --force
```

No lo ejecutes automáticamente en cada reinicio del contenedor.

---

# 15. Laravel caches

Determina si conviene ejecutar durante el deploy:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Si alguno no es compatible con la aplicación actual, no lo fuerces.

---

# 16. Build reproducible

Quiero evitar problemas como:

```text
npm install
```

utilizando versiones diferentes.

Si existe:

```text
package-lock.json
```

utilizar:

```bash
npm ci
```

Si existe:

```text
composer.lock
```

utilizarlo correctamente.

No actualizar dependencias automáticamente durante el Docker build.

---

# 17. Problema actual

Actualmente `npm run build` falla con:

```text
[@laravel/vite-plugin-wayfinder]
Error generating types:

Command failed:
php artisan wayfinder:generate --with-form
```

Quiero que investigues este problema antes de modificar la arquitectura.

NO quiero una solución como:

```text
desactivar Wayfinder
```

o:

```text
eliminar el plugin
```

simplemente para hacer pasar el build.

Determina primero la causa real.

---

# 18. Archivos que debes revisar

Antes de proponer cambios, analiza:

```text
composer.json
composer.lock
package.json
package-lock.json
vite.config.*
.env.example
.dockerignore
Dockerfile actual
docker-compose.yml actual
infrastructure/nginx/default.conf
infrastructure/scripts/default.sh
```

y cualquier configuración de Wayfinder.

También revisa:

```text
config/
routes/
```

si son necesarios para entender el error de Wayfinder.

---

# 19. Forma de trabajo

NO quiero que simplemente generes archivos nuevos sin analizar los existentes.

Primero:

1. Analiza la arquitectura actual.
2. Identifica qué está bien.
3. Identifica qué está mal.
4. Explica por qué falla actualmente.
5. Propón la arquitectura mínima necesaria.
6. Indica qué archivos deben modificarse.
7. Recién después genera los archivos finales.

No cambies tecnologías sin necesidad.

---

# 20. Resultado esperado

Quiero terminar con una estructura aproximadamente así:

```text
Servidor
│
├── .env                    # configuración/secretos de producción
│
├── docker-compose.yml
│
└── aplicación
    │
    ├── Dockerfile
    ├── infrastructure/
    │   ├── nginx/
    │   ├── docker/
    │   └── scripts/
    │
    └── código Laravel
```

Y ejecutar:

```bash
docker compose build
docker compose up -d
```

Después, si corresponde:

```bash
docker compose run --rm app php artisan migrate --force
```

La arquitectura final debe ser:

```text
                    INTERNET
                       │
                       ▼
                  ┌─────────┐
                  │  NGINX  │
                  └────┬────┘
                       │
                       ▼
                  ┌─────────┐
                  │   APP   │
                  │ PHP-FPM │
                  └────┬────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
         PostgreSQL          Storage

                  ┌─────────────┐
                  │    Queue    │
                  └─────────────┘

                  ┌─────────────┐
                  │  Scheduler  │
                  └─────────────┘
```

La prioridad es:

**funcionalidad > simplicidad > seguridad razonable > optimización.**

No quiero una arquitectura "enterprise" para una aplicación que no la necesita.

Si una decisión tiene varias alternativas, elige la más sencilla que sea correcta para producción y explícame brevemente por qué.
