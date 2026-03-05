# Products Module Runbook

Este runbook define operación, despliegue y mantenimiento del módulo de productos.

## 1) Alcance

Incluye:

- Productos y variantes
- Categorías, atributos y líneas de negocio
- Packs y categorías dinámicas
- Importación/Exportación Excel
- API catálogo (`/api/products`)

## 2) Estado actual de fases

- Fase 0: completada
- Fase 1: pendiente de ejecución en DB (entorno actual sin conexión a PostgreSQL)
- Fase 2: completada
- Fase 3: completada
- Fase 4: completada
- Fase 5: completada
- Fase 6: completada
- Fase 8: completada (este documento)

## 3) Tareas obligatorias post-refactor (producción)

1. Ejecutar migraciones nuevas:
- `php artisan migrate`

2. Migraciones esperadas:
- `2026_03_04_123028_add_unique_constraints_to_product_item_tables.php`
- `2026_03_04_130500_add_performance_indexes_to_products_module.php`

3. Verificar que no existan duplicados antes de constraints `unique`:
- `dynamic_category_items`: (`dynamic_category_id`, `variant_id`)
- `product_pack_items`: (`product_pack_id`, `variant_id`)

4. Validar smoke de admin:
- Crear/editar/eliminar/restaurar producto
- Crear/editar/eliminar pack
- Crear/editar/eliminar categoría dinámica
- Importar y exportar Excel

## 4) Checklist de despliegue

1. Confirmar backup de base de datos.
2. Poner app en modo mantenimiento (si aplica).
3. Ejecutar `php artisan migrate --force`.
4. Limpiar caches:
- `php artisan optimize:clear`
5. Validar rutas críticas:
- `/productos/items`
- `/productos/packs`
- `/productos/categorias-dinamicas`
- `/api/products`
- `/api/products/home`
- `/api/products/{slug}`
6. Sacar mantenimiento.

## 5) Operación de importación

Entrada:
- Admin: `/productos/items/import`
- Archivo permitido: `.xlsx`, `.xls`, `.csv`

Comportamiento:
- Procesa por chunks (300 filas)
- Soporta actualizar/restaurar producto/variante existentes
- Sincroniza recomendaciones al final de import (`AfterImport`)

Monitoreo recomendado:
- Revisar `storage/logs/laravel.log` buscando:
  - `Producto creado:`
  - `Variante creada:`
  - `Fila X: variante no creada`

## 6) Operación de exportación

Entrada:
- Admin: botón Exportar o ruta `products.items.export`

Resultado:
- Archivo `productos_daryza_YYYY-mm-dd_HH-ii-ss.xlsx`
- Incluye columna `Volumen CM` (alineada con import)

## 7) Incidencias frecuentes y respuesta

1. Error de slug único al restaurar:
- Resuelto por `UniqueSlugResolver` en observers de product/pack.

2. Variante sin principal:
- Resuelto por `ProductMainVariantNormalizer` (servicio + observer).

3. Promo inválida (precio/fechas):
- Resuelto por `PromotionPayloadValidator` en store/update.

4. Duplicados en packs/categorías dinámicas:
- Bloqueados por validación de request/service y constraints DB.

5. Búsqueda SKU no funciona en MySQL:
- Resuelto con query por driver en `ProductSearchService`.

## 8) Mapa de archivos operativos clave

- Orquestación CRUD producto:
  - `app/Http/Web/Controllers/Products/ProductController.php`
  - `app/Http/Web/Services/Products/ProductService.php`

- Validación y reglas:
  - `app/Http/Web/Support/Products/VariantPayloadValidator.php`
  - `app/Http/Web/Support/Products/PromotionPayloadValidator.php`
  - `app/Http/Web/Support/Products/ProductMainVariantNormalizer.php`
  - `app/Http/Web/Support/Products/UniqueSlugResolver.php`

- Import/Export:
  - `app/Http/Web/Imports/ProductsImport.php`
  - `app/Http/Web/Services/Products/ProductImportRowMapper.php`
  - `app/Http/Web/Services/Products/ProductImportService.php`
  - `app/Http/Web/Exports/ProductsExport.php`

- API catálogo:
  - `app/Http/Api/v1/Controllers/Products/ProductController.php`
  - `app/Domain/Products/VariantSelectionEngine.php`

## 9) Decisiones de operación

1. No cambiar estructura de columnas de tablas existentes.
2. Endurecer reglas vía FormRequests/Services/Support en vez de lógica dispersa.
3. Normalizar payload de API para catálogo/home/recomendados con `mapProductCard`.
4. Mantener import idempotente y trazable por logs.

## 10) Pendiente explícito

Para cerrar totalmente el ciclo en ambiente real:

1. Levantar PostgreSQL accesible para la app.
2. Ejecutar migraciones pendientes de fase 1 y fase 5.
3. Confirmar que no existan datos legacy que violen `unique`.
