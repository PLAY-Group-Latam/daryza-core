alexander@dev-pgl-2:/var/www/html/daryza-core$ docker compose ps
NAME IMAGE COMMAND SERVICE CREATED STATUS PORTS
daryza*app daryza_app:latest "docker-entrypoint.s…" app 42 seconds ago Up 35 seconds 9000/tcp
daryza_nginx daryza_nginx:latest "/docker-entrypoint.…" nginx 42 seconds ago Up 34 seconds 127.0.0.1:8082->80/tcp
daryza_postgresql postgres:15-alpine "docker-entrypoint.s…" postgresql 42 seconds ago Up 41 seconds (healthy) 5432/tcp
daryza_queue daryza_app:latest "docker-entrypoint.s…" queue 42 seconds ago Restarting (1) 2 seconds ago  
daryza_scheduler daryza_app:latest "docker-entrypoint.s…" scheduler 42 seconds ago Up 35 seconds 9000/tcp
alexander@dev-pgl-2:/var/www/html/daryza-core$ docker compose logs
daryza_postgresql | The files belonging to this database system will be owned by user "postgres".
daryza_postgresql | This user must also own the server process.
daryza_nginx | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
daryza_nginx | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
daryza_nginx | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
daryza_nginx | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
daryza_nginx | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
daryza_nginx | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
daryza_nginx | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
daryza_nginx | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
daryza_nginx | /docker-entrypoint.sh: Configuration complete; ready for start up
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: using the "epoll" event method
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: nginx/1.27.5
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: built by gcc 14.2.0 (Alpine 14.2.0)
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: OS: Linux 5.15.0-1083-gcp
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: start worker processes
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: start worker process 30
daryza_nginx | 2026/09/15 05:39:53 [notice] 1#1: start worker process 31
daryza_nginx | 172.21.0.1 - - [15/Sep/2026:05:40:15 +0000] "GET /productos/items/import HTTP/1.1" 500 6678 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36" "2001:1388:110:fe64:4892:5eba:4db1:acf3, 141.101.100.248"
daryza_queue | [entrypoint] Creando enlace public/storage...
daryza_queue |
daryza_queue | INFO The [public/storage] link has been connected to [storage/app/public].  
daryza_queue |
daryza_queue | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue |
daryza_queue | In Connection.php line 838:
daryza_queue |  
daryza_queue | SQLSTATE[42P01]: Undefined table: 7 ERROR: relation "cache" does not exist  
daryza_queue | LINE 1: select * from "cache" where "key" in ($1)  
daryza_queue | ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue | atabase: daryza, SQL: select _ from "cache" where "key" in (daryza-cache-il  
daryza_queue | luminate:queue:restart))  
daryza_queue |  
daryza_queue |
daryza_queue | In Connection.php line 425:
daryza_queue |  
daryza_queue | SQLSTATE[42P01]: Undefined table: 7 ERROR: relation "cache" does not exist  
daryza_queue | LINE 1: select _ from "cache" where "key" in ($1)  
daryza_queue | ^  
daryza_queue |  
daryza_queue |
daryza_queue | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue |
daryza_queue | In Connection.php line 838:
daryza_queue |  
daryza_queue | SQLSTATE[42P01]: Undefined table: 7 ERROR: relation "cache" does not exist  
daryza_queue | LINE 1: select _ from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | [entrypoint] Iniciando: php artisan queue:work --queue=default --tries=3 --timeout=3600 --sleep=1 --backoff=5 --max-time=3600
daryza_queue       | 
daryza_queue       | In Connection.php line 838:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^ (Connection: pgsql, Host: postgresql, Port: 5432, D  
daryza_queue       |   atabase: daryza, SQL: select * from "cache" where "key" in (daryza-cache-il  
daryza_queue       |   luminate:queue:restart))                                                     
daryza_queue       |                                                                                
daryza_queue       | 
daryza_queue       | In Connection.php line 425:
daryza_queue       |                                                                                
daryza_queue       |   SQLSTATE[42P01]: Undefined table: 7 ERROR:  relation "cache" does not exist  
daryza_queue       |   LINE 1: select * from "cache" where "key" in ($1)                            
daryza_queue       |                         ^                                                      
daryza_queue       |                                                                                
daryza_queue       | 
daryza_scheduler   | [entrypoint] Creando enlace public/storage...
daryza_scheduler   | 
daryza_scheduler   |    INFO  The [public/storage] link has been connected to [storage/app/public].  
daryza_scheduler   | 
daryza_scheduler   | [entrypoint] Iniciando: php artisan schedule:work
daryza_scheduler   |    INFO  No scheduled commands are ready to run.  
daryza_scheduler   | 
daryza_postgresql  | 
daryza_postgresql  | The database cluster will be initialized with locale "en_US.utf8".
daryza_postgresql  | The default database encoding has accordingly been set to "UTF8".
daryza_postgresql  | The default text search configuration will be set to "english".
daryza_postgresql  | 
daryza_postgresql  | Data page checksums are disabled.
daryza_postgresql  | 
daryza_postgresql  | fixing permissions on existing directory /var/lib/postgresql/data ... ok
daryza_postgresql  | creating subdirectories ... ok
daryza_postgresql  | selecting dynamic shared memory implementation ... posix
daryza_postgresql  | selecting default max_connections ... 100
daryza_postgresql  | selecting default shared_buffers ... 128MB
daryza_postgresql  | selecting default time zone ... UTC
daryza_postgresql  | creating configuration files ... ok
daryza_postgresql  | running bootstrap script ... ok
daryza_postgresql  | sh: locale: not found
daryza_postgresql  | 2026-09-15 05:39:48.207 UTC [35] WARNING:  no usable system locales were found
daryza_postgresql  | performing post-bootstrap initialization ... ok
daryza_postgresql  | syncing data to disk ... ok
daryza_postgresql  | initdb: warning: enabling "trust" authentication for local connections
daryza_postgresql  | initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
daryza_postgresql  | 
daryza_postgresql  | 
daryza_postgresql  | Success. You can now start the database server using:
daryza_postgresql  | 
daryza_postgresql  |     pg_ctl -D /var/lib/postgresql/data -l logfile start
daryza_postgresql  | 
daryza_postgresql  | waiting for server to start....2026-09-15 05:39:49.604 UTC [41] LOG:  starting PostgreSQL 15.19 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
daryza_postgresql  | 2026-09-15 05:39:49.607 UTC [41] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
daryza_postgresql  | 2026-09-15 05:39:49.616 UTC [44] LOG:  database system was shut down at 2026-09-15 05:39:49 UTC
daryza_postgresql  | 2026-09-15 05:39:49.625 UTC [41] LOG:  database system is ready to accept connections
daryza_postgresql  |  done
daryza_postgresql  | server started
daryza_postgresql  | CREATE DATABASE
daryza_postgresql  | 
daryza_postgresql  | 
daryza_postgresql  | /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
daryza_postgresql  | 
daryza_postgresql  | waiting for server to shut down....2026-09-15 05:39:49.780 UTC [41] LOG:  received fast shutdown request
daryza_postgresql  | 2026-09-15 05:39:49.783 UTC [41] LOG:  aborting any active transactions
daryza_postgresql  | 2026-09-15 05:39:49.788 UTC [41] LOG:  background worker "logical replication launcher" (PID 47) exited with exit code 1
daryza_postgresql  | 2026-09-15 05:39:49.789 UTC [42] LOG:  shutting down
daryza_postgresql  | 2026-09-15 05:39:49.791 UTC [42] LOG:  checkpoint starting: shutdown immediate
daryza_postgresql  | 2026-09-15 05:39:49.854 UTC [42] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.031 s, sync=0.024 s, total=0.065 s; sync files=301, longest=0.004 s, average=0.001 s; distance=4249 kB, estimate=4249 kB
daryza_postgresql  | 2026-09-15 05:39:49.865 UTC [41] LOG:  database system is shut down
daryza_postgresql  |  done
daryza_postgresql  | server stopped
daryza_postgresql  | 
daryza_postgresql  | PostgreSQL init process complete; ready for start up.
daryza_postgresql  | 
daryza_postgresql  | 2026-09-15 05:39:49.922 UTC [1] LOG:  starting PostgreSQL 15.19 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
daryza_postgresql  | 2026-09-15 05:39:49.922 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
daryza_postgresql  | 2026-09-15 05:39:49.922 UTC [1] LOG:  listening on IPv6 address "::", port 5432
daryza_postgresql  | 2026-09-15 05:39:49.927 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
daryza_postgresql  | 2026-09-15 05:39:49.934 UTC [57] LOG:  database system was shut down at 2026-09-15 05:39:49 UTC
daryza_postgresql  | 2026-09-15 05:39:49.944 UTC [1] LOG:  database system is ready to accept connections
daryza_postgresql  | 2026-09-15 05:39:54.191 UTC [68] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:39:54.191 UTC [68] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:39:55.138 UTC [69] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:39:55.138 UTC [69] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:39:55.960 UTC [70] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:39:55.960 UTC [70] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:39:56.977 UTC [71] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:39:56.977 UTC [71] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:39:58.748 UTC [72] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:39:58.748 UTC [72] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:40:01.001 UTC [73] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:40:01.001 UTC [73] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:40:04.786 UTC [81] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:40:04.786 UTC [81] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:40:11.822 UTC [82] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:40:11.822 UTC [82] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_postgresql  | 2026-09-15 05:40:15.699 UTC [90] ERROR:  relation "sessions" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:40:15.699 UTC [90] STATEMENT:  select * from "sessions" where "id" = $1 limit 1
daryza_postgresql  | 2026-09-15 05:40:25.239 UTC [99] ERROR:  relation "cache" does not exist at character 15
daryza_postgresql  | 2026-09-15 05:40:25.239 UTC [99] STATEMENT:  select * from "cache" where "key" in ($1)
daryza_app         | [entrypoint] Creando enlace public/storage...
daryza_app         | 
daryza_app         |    INFO  The [public/storage] link has been connected to [storage/app/public].  
daryza_app         | 
daryza_app         | [entrypoint] Generando cachés de producción...
daryza_app         | 
daryza_app         |    INFO  Configuration cached successfully.  
daryza_app         | 
daryza_app         | 
daryza_app         |    INFO  Routes cached successfully.  
daryza_app         | 
daryza_app         | 
daryza_app         | 
daryza_app         |    INFO  Blade templates cached successfully.  
daryza_app         | 
daryza_app         | [entrypoint] Iniciando: php-fpm -F
daryza_app         | [15-Sep-2026 05:39:55] NOTICE: fpm is running, pid 1
daryza_app         | [15-Sep-2026 05:39:55] NOTICE: ready to handle connections
daryza_app         | 172.21.0.6 -  15/Sep/2026:05:40:15 +0000 "GET /index.php" 500
alexander@dev-pgl-2:/var/www/html/daryza-core$
