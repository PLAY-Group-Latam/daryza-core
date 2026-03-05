# Mapa Completo del Módulo Products

Ruta base analizada: `app/Http/Web/Controllers/Products`, `app/Http/Web/Services/Products`, `app/Http/Web/Requests/Products`, `app/Http/Api/v1/Controllers/Products`, `app/Http/Api/v1/Services/Products`, `app/Http/Web/Imports`, `app/Http/Web/Exports`, `app/Models/Products`, `resources/js/components/custom-ui/products`, `resources/js/pages/products`.

## 1) Vista general de arquitectura

El módulo está separado en 2 superficies:

- **Web/Admin (Inertia + React)**
  - CRUD de productos, categorías, atributos, líneas de negocio, packs, categorías dinámicas.
  - Importación/Exportación Excel.
- **API pública (v1)**
  - Catálogo (`/api/products`), home (`/api/products/home`), detalle (`/api/products/{slug}`), categorías.

Capas existentes:

- **Controllers**: orquestación de requests/responses.
- **FormRequests**: validaciones de producto/categoría/atributo/import.
- **Services**:
  - `ProductService`: dominio principal de create/update/delete de producto.
  - `ProductMediaService`: subida/sincronización de media y fichas técnicas.
  - `ProductImportService`: reglas de creación/actualización masiva desde Excel.
  - `ProductCategoryService`, `ProductSearchService`, `ProductCodeGenerator`.
- **Observers**:
  - `ProductObserver`, `ProductPackObserver`, `ProductCategoryObserver` (registrados en `AppServiceProvider`).
- **Domain**:
  - `VariantSelectionEngine` (resolución de variante activa + matriz de disponibilidad).

## 2) Modelo de datos (núcleo)

Entidades principales:

- `products`
- `product_variants`
- `attributes`
- `attributes_values`
- `product_variant_attribute_values` (selección de atributos de variante)
- `product_specification_values` (especificaciones técnicas por variante)
- `product_media` (polimórfica)
- `product_categories` + pivot `product_category`
- `business_lines` + pivot `product_business_line`
- `product_recommendations`
- `product_packs` + `product_pack_items`
- `dynamic_categories` + `dynamic_category_items`

Relaciones clave:

- `Product` -> hasMany `variants`
- `Product` -> belongsToMany `categories`
- `Product` -> belongsToMany `businessLines`
- `Product` -> belongsToMany `recommendedProducts` (self-reference)
- `ProductVariant` -> belongsToMany `attributes` (via `product_variant_attribute_values`)
- `ProductVariant` -> hasMany `specifications`
- `Product`/`ProductVariant`/`Category` -> morphMany `ProductMedia`

## 3) Flujo Web/Admin de Producto

### 3.1 Crear/Editar producto

Entrada principal:

- `ProductController@create|edit|store|update|destroy`

Validación:

- `StoreProductRequest`
- `UpdateProductRequest`
- Validador de coherencia: `VariantPayloadValidator`

Aplicación de reglas de negocio:

- `ProductService`
  - `create()`
  - `update()`
  - `delete()`
  - subprocesos: `createVariants`, `updateVariants`, `syncAttributes`, `syncSpecifications`, `syncRecommendedProducts`, metadata.

Media:

- `ProductMediaService`
  - `createMany` / `sync` para media de variantes.
  - `createTechnicalSheets` / `syncTechnicalSheets` para fichas técnicas.

Observers que intervienen:

- `ProductObserver`
  - genera `code` si falta
  - genera `slug` fallback
  - soft delete de variantes
  - renombrado de slug en delete y resolución de slug en restore

### 3.2 Frontend del form

- `resources/js/components/custom-ui/products/product/FormProduct.tsx`
- Schema: `schema.ts` (Zod)
- Mapper edit->form: `mappers.ts`
- Serialización a multipart: `variants/utils/buildFormData.ts`

Bloques funcionales:

- General data
- Variants + variant attributes + specifications
- Technical sheets
- Sidebar: categorías, líneas, recomendados, switches

## 4) Categorías, atributos, líneas

### 4.1 Categorías

- Controller: `ProductCategoryController`
- Service: `ProductCategoryService`
- Observer: `ProductCategoryObserver`

Comportamiento:

- Árbol de 2 niveles (padre/hijo)
- Orden con Spatie Sortable (`order`)
- Desactivar padre desactiva hijos

### 4.2 Atributos

- Controller: `AttributeController`
- Requests: `StoreAttributeRequest`, `UpdateAttributeRequest`
- Tipos actualmente activos: `select`, `text`

Uso:

- `is_variant=true`: participa en combinaciones de variantes
- `is_variant=false`: se usa como especificación técnica

### 4.3 Líneas de negocio

- Controller: `BusinessLineController`
- Relación M:N con producto vía `product_business_line`

## 5) Packs y categorías dinámicas

### 5.1 Packs

- Controller: `ProductPackController`
- Modelo: `ProductPack`, `ProductPackItem`
- Búsqueda de variantes por SKU con `ProductSearchService`
- Store/Update validan y recrean items (estrategia replace-all)

### 5.2 Categorías dinámicas

- Controller: `DynamicCategoryController`
- Modelo: `DynamicCategory`, `DynamicCategoryItem`
- También usan `ProductSearchService`
- Store/Update reemplazan items completos

## 6) Import / Export (Excel)

## 6.1 Import

Entrada:

- `ProductExcelController@import`
- Request: `StoreProductImportRequest`
- Importer: `ProductsImport` (Maatwebsite)

Proceso:

1. Lee por chunks (300 filas), `headingRow=1`.
2. Para cada fila:
   - crea/actualiza producto por `code` (`ProductImportService::createProduct`)
   - asocia categorías/subcategorías
   - asocia líneas de negocio
   - crea/actualiza variante por `sku_daryza`
   - asocia atributos de variante (presentación, aroma, color, talla)
   - asocia especificaciones técnicas (marca, peso, alto, largo, ancho, volumen)
   - acumula códigos recomendados para sincronizar al final
3. `AfterImport`: sincroniza recomendaciones por códigos.

Notas funcionales:

- Soporta restaurar productos/variantes soft-deleted.
- `color` se normaliza a HEX.
- Mapea disponibilidad catálogo `D/ND` a `is_active`.

## 6.2 Export

Entrada:

- `ProductExcelController@export`
- Exporter: `ProductsExport`

Proceso:

- Exporta por variantes con join a products.
- Repite datos de producto solo en la primera fila de cada producto.
- Incluye categorías, subcategorías, líneas, recomendaciones.

## 7) API pública (catálogo)

Rutas:

- `GET /api/products/home`
- `GET /api/products/categories`
- `GET /api/products`
- `GET /api/products/{slug}`

Componentes:

- `Api\ProductController`
- `Api\ProductCategoryController`
- `ProductVariantResolver` + `VariantSelectionEngine`

Flujo de detalle (`show`):

1. Carga producto activo por slug + technical sheets + recomendados.
2. Carga variantes activas con selecciones de atributos.
3. Resuelve variante activa según query attrs/focus.
4. Devuelve:
   - `product`
   - `active_variant`
   - `selection_state`
   - `variant_availability_matrix`

## 8) Riesgos o deuda técnica identificada (estado actual)

- Existe mezcla de estilos (algunos recursos con FormRequest+Service y otros con validación inline en controller).
- `ProductSearchService` usa `ilike` (dependiente de PostgreSQL).
- Hay varios `console.log` de depuración en páginas React.
- Import/export concentra mucha lógica de mapeo hardcoded de columnas y nombres de atributos.
- `ProductCodeGenerator` incrementa por último `created_at` (puede no ser estrictamente secuencial si concurren procesos).

## 9) Archivos “fuente de verdad” por tema

- Producto CRUD: `app/Http/Web/Controllers/Products/ProductController.php`, `app/Http/Web/Services/Products/ProductService.php`
- Validación de variantes: `app/Http/Web/Support/Products/VariantPayloadValidator.php`
- Media: `app/Http/Web/Services/Products/ProductMediaService.php`
- Import: `app/Http/Web/Imports/ProductsImport.php`, `app/Http/Web/Services/Products/ProductImportService.php`
- Export: `app/Http/Web/Exports/ProductsExport.php`
- API catálogo: `app/Http/Api/v1/Controllers/Products/ProductController.php`, `app/Domain/Products/VariantSelectionEngine.php`
- Form frontend: `resources/js/components/custom-ui/products/product/FormProduct.tsx`, `schema.ts`, `buildFormData.ts`

## 10) Estado del mapeo

Este documento representa el comportamiento real del módulo en el código actual, incluyendo capa web, API, import/export y frontend.

## 11) Estado de implementación por fases

- Fase 0: completada
- Fase 1: implementada en código, pendiente ejecución de migraciones en DB por conectividad del entorno
- Fase 2: completada
- Fase 3: completada
- Fase 4: completada
- Fase 5: completada
- Fase 6: completada
- Fase 8: completada

Documento operativo complementario:

- `docs/products-operations-runbook.md`
