# SPEC — Re-auditoría Core & Store (post-pull)

Documento de trabajo derivado de `specs/auditoria.md`. Re-auditoría posterior al pull
(`daryza-core@74b74b5`, `darysa-store@ca322e9`).

Regla fundamental: **Entender → Detectar → Evidenciar → Corregir → Probar.**

> Nota: el pull intentó aplicar la regla de SKU repetible pero quedó **a medias y
> contradictoria**. Además introdujo regresiones (transiciones de estado deshabilitadas,
> generación de `code` con race, cache de notificaciones roto con driver `database`).

---

## 1. Mapa de arquitectura

- **Core**: Laravel 11/12 + Inertia/React (admin) + PostgreSQL + Redis + JWT.
  - API v1: catálogo, carrito, checkout, órdenes, pagos Niubiz, cupones, wishlist,
    notificaciones, auth clientes.
  - Import/Export Excel; feed Meta.
- **Store**: Next.js 16 + React 19 + Zustand; `src/lib/api.ts` contra `/api/v1`.
- **Identidad de ítems**: `cart_items.item_id`+`item_type`, `order_items.variant_id`/`pack_id`.
  El SKU **no** debe ser identificador.
- **Caché**: `CACHE_STORE=database` (no soporta `Cache::tags()`).

Reglas vigentes: SKU repetible; una variante principal activa; `active_price` = promo vigente;
stock se reserva/restaura; cupones con scope; transiciones de estado de orden controladas.

---

## 2. Índice de hallazgos

| ID | Sistema | Severidad | Clasificación |
|----|---------|-----------|---------------|
| CORE-PROD-01 | Core | — | Resuelto (UNIQUE de `sku_supplier` es correcto) |
| CORE-PROD-02 | Core | — | Resuelto (sin unicidad de `sku`; `sku_supplier` validado) |
| CORE-PROD-03 | Core | Baja | Inconsistencia (mensaje huérfano) |
| CORE-PROD-04 | Core | Crítica | Error confirmado (import bloquea SKU) |
| CORE-PROD-05 | Core | Crítica | Error confirmado (import conflicto global) |
| CORE-PROD-06 | Core | Alta | Error confirmado (helpers unicidad) |
| CORE-PROD-07 | Core | Baja | Pendiente (código muerto) |
| CORE-PROD-08 | Core | Baja | Riesgo (rollback migración) |
| CORE-PROD-09 | Core | Alta | Error confirmado (feed Meta dedup por SKU) |
| CORE-PROD-10 | Core | Media | Inconsistencia (export/import no idempotente) |
| CORE-PROD-11 | Core | Media | Riesgo (duplicados intra-producto) |
| CORE-PROD-12 | Core | Baja | Inconsistencia (normalización SKU) |
| CORE-ORDER-01 | Core | Crítica | Error confirmado (transiciones deshabilitadas) |
| CORE-ORDER-02 | Core | Alta | Error confirmado (race en `code`) |
| CORE-ORDER-03 | Core | Alta | Error confirmado (uploadVoucher) |
| CORE-ORDER-04 | Core | Media | Inconsistencia (payment_failed/stock) |
| CORE-ORDER-05 | Core | Media | Error confirmado (mark_refunded sin backend) |
| CORE-PAY-01 | Core | Crítica | Error confirmado (Niubiz no idempotente) |
| CORE-PAY-02 | Core | Alta | Error confirmado (reintento sobre pagada) |
| CORE-PAY-03 | Core | Media | Inconsistencia (sin historial de pago) |
| CORE-PAY-04 | Core | Media | Riesgo (purchase_number reutilizado) |
| CORE-COUPON-01 | Core | Alta | Error confirmado (TypeError con packs) |
| CORE-COUPON-02 | Core | Media | Inconsistencia (redención no liberada) |
| CORE-CART-01 | Core | Media | Error confirmado (promo sin fechas) |
| CORE-CART-02 | Core | Media | Riesgo (N+1 en carrito) |
| CORE-CART-03 | Core | Media | Inconsistencia (count sin limpieza) |
| CORE-AUTH-01 | Core | Alta | Error confirmado (IDOR direcciones) |
| CORE-AUTH-02 | Core | Alta | Error confirmado (Google email_verified) |
| CORE-AUTH-03 | Core | Alta | Error confirmado (Google borra password) |
| CORE-AUTH-04 | Core | Media | Error confirmado (claves indefinidas) |
| CORE-AUTH-05 | Core | Alta | Error confirmado (handler filtra/500) |
| CORE-AUTH-06 | Core | Media | Riesgo (cookie hardcodeada) |
| CORE-AUTH-07 | Core | Media | Riesgo (sin throttle) |
| CORE-AUTH-08 | Core | Media | Inconsistencia (dirección única) |
| CORE-NOTIF-01 | Core | Crítica | Error confirmado (Cache::tags con database) |
| CORE-NOTIF-02 | Core | Media | Error confirmado (invalidación no borra) |
| CORE-NOTIF-03 | Core | Media | Error confirmado (clave sin per_page) |
| CORE-NOTIF-04 | Core | Media | Error confirmado (page ignorado) |
| CORE-NOTIF-05 | Core | Crítica | Error confirmado (markAll sin identidad) |
| CORE-NOTIF-06 | Core | Media | Riesgo (X-Device-ID / OR) |
| CORE-NOTIF-07 | Core | Media | Pendiente (sync no invocado) |
| CORE-NOTIF-08 | Core | Baja | Error confirmado (FK no controlada) |
| CORE-NOTIF-09 | Core | Baja | Inconsistencia (per_page sin acotar) |
| CORE-NOTIF-10 | Core | Media | Inconsistencia (observer pack) |
| CORE-NOTIF-11 | Core | Media | Inconsistencia (isPromoActive pack) |
| CORE-NOTIF-12 | Core | Baja | Inconsistencia (límites de fecha) |
| STORE-01 | Store | Crítica | Error confirmado (carrito entre usuarios) |
| STORE-02 | Store | Alta | Error confirmado (no carga carrito auth) |
| STORE-03 | Store | Media | Error confirmado (cart_warnings ignorados) |
| STORE-04 | Store | Media | Error confirmado (merge pierde ítems) |
| STORE-05 | Store | Baja | Inconsistencia (regex stock) |
| STORE-06 | Store | Alta | Error confirmado (packs como productos) |
| STORE-07 | Store | Media | Error confirmado (wishlist_id) |
| STORE-08 | Store | Media | Error confirmado (rollback wishlist) |
| STORE-09 | Store | Baja | Inconsistencia (current_count) |
| STORE-10 | Store | Media | Inconsistencia (paginación notif) |
| STORE-11 | Store | Baja | Inconsistencia (tipos notif) |
| STORE-12 | Store | Baja | Inconsistencia (item_type pack) |
| STORE-13 | Store | Baja | Inconsistencia (pack_image) |
| STORE-14 | Store | Media | Riesgo (bucle refresh 401) |
| STORE-15 | Store | Baja | Inconsistencia (CartCountResponse) |
| STORE-16 | Store | Baja | Inconsistencia (coupon) |
| STORE-17 | Store | Baja | Error confirmado (productId invitado) |

---

## 3. Hallazgos detallados (resumen con evidencia)

### 3.1 SKU / Productos

- **CORE-PROD-01** resuelto: la migración original deja `sku` sin UNIQUE (con índice) y
  `sku_supplier` con UNIQUE (regla: proveedor no repetible).
- **CORE-PROD-02** resuelto: `VariantPayloadValidator` ya no valida unicidad de `sku`;
  valida `sku_supplier` único (`validateSkuSupplier`).
- **CORE-PROD-03** mensaje huérfano `variants.*.sku.unique` (`StoreProductRequest.php:134`).
- **CORE-PROD-04/05** `ProductsImport` rechaza SKU repetido de otro producto
  (`seenSkus` + `findGlobalSkuConflict`/`findSku` en `:420-441` y `:996-1015`).
- **CORE-PROD-06** `ProductImportService::findGlobalSkuConflict/findSku` codifican unicidad global.
- **CORE-PROD-07** `resolveUniqueSkuForImport` código muerto.
- **CORE-PROD-09** `MetaFeedService::resolveFeedId` usa SKU como `g:id` y deduplica →
  productos con SKU repetido se pierden en el feed.
- **CORE-PROD-11** `createVariant` puede crear variantes con SKU duplicado dentro del mismo producto.
- **CORE-PROD-12** normalización inconsistente (`strtoupper` vs `trim`).

### 3.2 Órdenes / Pagos / Cupones / Carrito

- **CORE-ORDER-01** `assertStateTransition()` es `return;` → no se valida ninguna transición.
- **CORE-ORDER-02** `generateOrderCode()` = último+1 sin lock → race y colisión (`orders.code` unique).
- **CORE-ORDER-03** `uploadVoucher()` no valida estado, no reserva stock, no registra historial.
- **CORE-ORDER-04** `payment_failed` no restaura stock ni expira.
- **CORE-ORDER-05** frontend ofrece `mark_refunded`; backend no lo soporta (422).
- **CORE-PAY-01** guardia "ya pagado" incompleta; `syncOrderAfterNiubizConfirmation` puede
  degradar una orden pagada a `payment_failed`.
- **CORE-PAY-02** `assertOrderCanStartNiubiz` no bloquea `preparing`/`in_delivery`/`refunded`.
- **CORE-PAY-03** Niubiz no registra `order_status_histories`.
- **CORE-COUPON-01** `subtotalMatching` pasa `null` a closure tipada `ProductVariant` con packs → TypeError.
- **CORE-COUPON-02** redención de cupón no se libera al cancelar/expirar.
- **CORE-CART-01** `RecommendProductResource` ignora ventana de fechas de promo.
- **CORE-CART-02** `CartItemResource` hace `exists()` por ítem (N+1).
- **CORE-CART-03** `CartService::count()` no aplica limpieza/clampeo.

### 3.3 Auth / Notificaciones

- **CORE-AUTH-01** IDOR direcciones por `{customer}` sin ownership.
- **CORE-AUTH-02** Google no valida `email_verified`.
- **CORE-AUTH-03** `findOrCreateFromGoogle` escribe `password => null`.
- **CORE-AUTH-04** `CustomerController::update` accede a claves `nullable` sin `??` → 500.
- **CORE-AUTH-05** handler `Throwable` usa `getCode()` y filtra `getMessage()`; 404/403 → 500.
- **CORE-AUTH-07** sin throttle en auth.
- **CORE-AUTH-08** `updateOrCreate` de dirección colapsa direcciones.
- **CORE-NOTIF-01** `Cache::tags(['notifications'])` con `CACHE_STORE=database` →
  `BadMethodCallException` (500 en notificaciones y al guardar productos/packs).
- **CORE-NOTIF-02** `invalidateCache()` usa `Cache::forget` sobre claves taggeadas (no borra).
- **CORE-NOTIF-03** `cacheKey()` omite `perPage`.
- **CORE-NOTIF-04** controlador ignora `page`.
- **CORE-NOTIF-05** `markAllAsRead` sin identidad → `where('visitor_id', null)` = `IS NULL`
  afecta a todos los clientes. Crítico.
- **CORE-NOTIF-06** `X-Device-ID` y `orWhere` mezclan identidades.
- **CORE-NOTIF-07** `syncVisitorToCustomer` no se invoca.
- **CORE-NOTIF-08/09** FK no controlada / `per_page` sin acotar.
- **CORE-NOTIF-10/11/12** observers de promoción de packs incompletos/inconsistentes.

### 3.4 Store

- **STORE-01** merge/logout reenvía el carrito del usuario anterior (persist sin limpiar).
- **STORE-02** con sesión válida no se carga `GET /cart` (early return en `useCartInitializer`).
- **STORE-03** se ignoran `cart_warnings` en mutaciones normales.
- **STORE-04** el merge pierde ítems si `addItem` falla (no revisa `success`).
- **STORE-05** `stockErrorRegex` no reconoce "agotado".
- **STORE-06** filtro cliente mapea packs como productos.
- **STORE-07** favoritos sobrescribe `wishlist_id` con `id`.
- **STORE-08** rollback de wishlist solo en `catch` (el service no lanza).
- **STORE-09** backend no envía `current_count` en toggle.
- **STORE-10** paginación de notificaciones no consumida.
- **STORE-11..17** desajustes de tipos/contrato (notif, item_type, pack_image, refresh, etc.).

---

## 4. Priorización

1. **Críticos**: CORE-PROD-02/04/05, CORE-ORDER-01/02, CORE-PAY-01, CORE-NOTIF-01/05,
   STORE-01, STORE-02.
2. **Altos**: CORE-PROD-01/06/09, CORE-ORDER-03, CORE-PAY-02, CORE-COUPON-01,
   CORE-AUTH-01/02/03/05, STORE-06.
3. **Medios/Bajos**: resto.

---

## 5. Plan de corrección

### 5.1 SKU (regla corregida)
- Migración original: `sku` sin UNIQUE (con índice); `sku_supplier` con UNIQUE.
- `VariantPayloadValidator`: sin validación de unicidad de `sku`; validar `sku_supplier` único.
- `ProductsImport`: permitir `sku` repetido entre productos; validar `sku_supplier` único con
  mensaje claro.
- `ProductImportService`: eliminar helpers de conflicto global de `sku`; agregar
  `findSkuSupplierConflict`.
- `MetaFeedService`: usar `variant->id` como `g:id` (no SKU).

### 5.2 Regresiones críticas
- `OrderService::assertStateTransition`: restaurar validación con el mapa existente.
- `OrderService::generateOrderCode`: restaurar generación segura (random + verificación).
- `PaymentController`: idempotencia Niubiz y bloqueo de estados pagados.
- `NotificationService`: quitar `Cache::tags` (driver database); invalidación por versión;
  incluir `perPage`; identidad única; no operar sin identidad.
- `NotificationController`: pasar `page`, acotar `per_page`.

### 5.3 Auth / cupones / carrito
- Ownership de direcciones; Google `email_verified` y no borrar password;
  null-safety en `CustomerController`; handler de excepciones; throttle auth.
- `CouponService`: null-safe con packs; tope de descuento fijo; liberar redención al cancelar/expirar.
- `CartItemResource`: promo por fechas; `count()` consistente.

### 5.4 Store
- Limpiar carrito en logout; no reenviar carrito del servidor; cargar carrito al autenticar;
  consumir `cart_warnings`; discriminar packs; `wishlist_id`; rollback wishlist;
  guarda de refresh 401; `current_count`.

---

## 6. Estado

### 6.1 Correcciones aplicadas

**SKU (regla corregida)**
- Regla final: **`sku` (Daryza) puede repetirse** (sin UNIQUE); **`sku_supplier`
  (proveedor) NO puede repetirse** (UNIQUE global).
- `database/migrations/2026_01_20_175617_create_product_variants_table.php`: `sku`
  sin `unique` (con índice no único) y `sku_supplier` con `unique()->nullable()`.
- Se eliminaron las migraciones de parche `2026_08_18_..._drop_unique_..._sku` y
  `2026_09_15_..._drop_unique_sku_supplier...` (se edita la migración original; el
  entorno es de desarrollo y se recrean las migraciones).
- `VariantPayloadValidator`: sin validación de unicidad para `sku`; se agregó
  `validateSkuSupplier` (único, ignorando la propia variante en update).
- `ProductsImport`/`ProductImportService`: sin guards globales de `sku`; se agregó
  `findSkuSupplierConflict` y un mensaje claro cuando el SKU de proveedor se repite.
- `MetaFeedService`: el `g:id` del feed usa el `id` de la variante (no el SKU).

**Regresiones críticas**
- `OrderService::assertStateTransition`: restaurada la validación de transiciones.
- `OrderService::generateOrderCode`: restaurada la generación aleatoria con verificación
  de unicidad (evita la race del "último + 1").
- `PaymentController`: idempotencia Niubiz (estados pagados) y bloqueo de reintentos.
- `NotificationService`: se eliminó `Cache::tags` (incompatible con `CACHE_STORE=database`);
  invalidación por versión; clave incluye `perPage`; identidad única; guardas sin identidad.
- `NotificationController`: se pasa `page` y se acota `per_page`.
- `OrderController`/`OrderService`: soporte de `mark_refunded` (backend alineado al frontend).
- Admin `status.tsx`: `isAdminActionAvailable` respeta `allowed_actions`.

**Auth / cupones / carrito**
- Direcciones: ownership por cliente autenticado.
- Google: valida `email_verified` y ya no borra la contraseña existente.
- `CustomerController`: null-safety en campos `nullable`.
- `bootstrap/app.php`: mapeo de 404/403 y mensaje genérico en 500.
- `routes/api/auth.php`: throttle y `logout` fuera de `auth:api`.
- `CustomerAuthController`: `syncVisitorToCustomer` en login/Google.
- `CouponService`: packs ignorados en scopes de variante; tope de descuento fijo.
- `OrderService`: libera redención de cupón al cancelar/expirar; `uploadVoucher` valida estado
  y registra historial.
- `RecommendProductResource`: promo por ventana de fechas.
- `WishListService`/`WishListController`: valida ítem, cuenta válidos y devuelve `current_count`.

**Store**
- Carrito: tracking de ítems de invitado (`guestItemIds`), no se reenvía el carrito del
  servidor, se limpia en logout (`resetForLogout`), se carga al autenticar.
- `useCartInitializer`: carga el carrito cuando hay sesión.
- `cart_warnings`: se consumen en add/update/remove.
- Filtro cliente: packs discriminados (`isProductCardApi`).
- Favoritos: `wishlist_id` correcto; rollback de wishlist ante `success=false`.
- `api.ts`: un solo reintento de refresh ante 401.
- `item_type` de packs (`product_pack`) y fallback `pack_image`.

### 6.2 Pendientes (no corregidos)

- CORE-ORDER-04 (payment_failed no expira/restaura stock).
- CORE-PAY-03 (Niubiz no registra historial), CORE-PAY-04 (purchase_number reutilizado).
- CORE-CART-02 (N+1 en `CartItemResource`), CORE-CART-03 (`count()` sin limpieza).
- CORE-AUTH-08 (una sola dirección por `updateOrCreate`).
- CORE-NOTIF-06 (confianza en `X-Device-ID`), CORE-NOTIF-10/11/12 (observers de packs).
- STORE-10 (paginación de notificaciones), STORE-11/15/16/17 (tipos/contratos).

### 6.3 Verificación

- `php -l` en todos los PHP modificados: OK.
- `php artisan test`: mismos 3 fallos previos (registro admin `RouteNotFoundException` y
  `EXTRACT` de dashboard en SQLite); no relacionados.
- Store: `tsc --noEmit` OK; `eslint` solo con un warning previo de `exhaustive-deps`.

### 6.4 Operación requerida

- Ejecutar `php artisan migrate` (nueva migración de `sku_supplier`).
- Rebuild/despliegue de contenedores (el código va empaquetado en la imagen).
