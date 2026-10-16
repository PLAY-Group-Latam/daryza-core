# Hallazgos de la revisión integral (store ↔ core)

Revisión end-to-end módulo por módulo de `darysa-store` (Next.js) y `daryza-core` (Laravel API + Inertia admin), siguiendo `docs/revision.md`.

Fecha: 2026-10-15

---

## Resumen general

- **Endpoints**: ~60 endpoints consumidos por el store existen en core con método y path correctos. **No hay endpoints faltantes ni renombrados.**
- **Payloads** de create/update/validate (checkout, cart, auth, leads, wishlist): snake_case consistente entre store y core.
- **Store**: `pnpm build` compila correctamente, `tsc --noEmit` sin errores.
- **Core**: sintaxis PHP sin errores, `php artisan` bootea (Laravel 12.52).
- **Tests core**: 6 fallan (detallados abajo).
- Se detectan inconsistencias funcionales, de tipos y de seguridad listadas a continuación.

---

## 1. Seguridad (alta)

### S1. Rutas admin sin middleware `auth`
- **Ubicación**: `routes/web/coupon.php`, `routes/web/distributors.php`, `routes/web/intention.php`, `routes/web/seo.php`, `routes/web/leads.php` (grupos aboutus/contacts/jobs).
- **Descripción**: Grupos de rutas admin registrados solo con middleware `web`, sin `auth`/`verified`. Permiten acceso anónimo a listado/creación/edición/borrado del panel.
- **Evidencia**: `php artisan route:list` muestra `coupon.*`, `distributors.*`, `purchase-intent.*`, `admin.seo.*` con middleware `['web']` únicamente. En contraste `claims.items.*`, `blogs.items.*` sí tienen `['web','auth']`.
- **Impacto**: Acceso no autenticado a CRUD de administración.
- **Prioridad**: alta
- **Estado**: resuelto
- **Recomendación aplicada**: añadido `->middleware('auth')` a `coupon.php`, `distributors.php`, `intention.php`, `seo.php` y a los grupos `contacts`, `aboutus`, `jobs` de `leads.php`. Los formularios públicos del storefront no se ven afectados porque usan las rutas API (`routes/api/leads.php`), no las rutas web.

---

## 2. Funcionalidad rota (alta)

### F1. Datos de facturación no se muestran ni se aplican (`billingProfile` vs `billing_profile`)
- **Ubicación**: core `app/Http/Api/v1/Controllers/Customers/CustomerAuthController.php:253`; store `src/common/interfaces/user.ts`, `src/modules/dashboard/components/forms/SettignsForm.tsx`, `src/modules/checkout/mappers/checkoutDefaults.mapper.ts`.
- **Descripción**: ~~Laravel serializa la relación como `billingProfile` (camelCase). El store declara y lee `billing_profile` (snake_case), por lo que siempre queda `undefined`.~~ **Descartado como falso positivo**: Laravel convierte los nombres de relación a snake_case por defecto (`Model::$snakeAttributes = true`, ver `HasAttributes::relationsToArray()`), así que `billingProfile()` se serializa como `billing_profile`. El store lee exactamente `billing_profile`, por lo que la clave coincide y funciona.
- **Impacto**: ninguno (funciona correctamente).
- **Prioridad**: descartada
- **Estado**: falso positivo (verificado por el usuario y confirmado en el source de Laravel).

### F2. `checkoutProvinces` hardcodea Lima e ignora el departamento
- **Ubicación**: `app/Http/Api/v1/Controllers/UbigeoController.php:63-70`.
- **Descripción**: `checkoutProvinces(string $departmentId)` filtra `Province::where('ubigeo_id', '3927')` (Lima) y nunca usa `$departmentId`.
- **Evidencia**: código confirmado: `->where('ubigeo_id', '3927')`.
- **Impacto**: el dropdown de provincias del checkout siempre devuelve Lima; "funciona" solo porque la cobertura actual es solo Lima. Rompería al ampliar cobertura.
- **Prioridad**: alta
- **Estado**: confirmado
- **Recomendación**: filtrar por `department_id = $departmentId` respetando las zonas de cobertura (`zoneIdsByType()`).

### F3. "Reemplazar mi carrito" (`replace`) ignorado
- **Ubicación**: store `src/modules/orders/components/RepeatOrderButton.tsx`, `src/modules/orders/services/orders.client.service.ts:83-89`; core `app/Http/Api/v1/Services/Orders/OrderService.php::repeat()`.
- **Descripción**: el store envía `{ replace }` a `POST v1/orders/{id}/repeat`, pero el controlador/servicio no reciben ni usan `replace`; siempre hace `addItem`, sin limpiar el carrito.
- **Impacto**: ambos botones ("Reemplazar" y "Sumar") se comportan igual (siempre suman).
- **Prioridad**: alta
- **Estado**: confirmado
- **Recomendación**: aceptar `replace` y, cuando sea `true`, limpiar el carrito antes de agregar.

### F4. `stock` ausente en listado/home (productos agotados parecen disponibles)
- **Ubicación**: core `app/Http/Api/v1/Controllers/Products/ProductController.php:26-28` (index), `:64-66` (home); store `src/modules/products/mappers/product.mapper.ts`, `src/modules/products/components/ProductCard.tsx:44`.
- **Descripción**: el `SELECT` de `mainVariant` no incluye `stock`, pero `mapProductCard()` sí lo emite → Eloquent devuelve `null`. El store calcula `isOutOfStock = stock <= 0` (siempre `false`).
- **Impacto**: las tarjetas del home/listado permiten "Agregar" productos agotados (sin estado "Agotado").
- **Prioridad**: alta
- **Estado**: confirmado
- **Recomendación**: añadir `stock` al `SELECT` de `mainVariant` en `index()` y `home()`.

---

## 3. Tests fallando en core

### T1. `RegistrationTest` — Fortify no habilita registro
- **Ubicación**: `config/fortify.php` (features), `tests/Feature/Auth/RegistrationTest.php`.
- **Descripción**: el test llama `route('register')`/`route('register.store')`, pero esas rutas no existen porque `Features::registration()` no está en `features`.
- **Evidencia**: `php artisan route:list` no tiene `register`/`register.store`.
- **Impacto**: test rojo / feature ausente.
- **Prioridad**: media
- **Estado**: confirmado
- **Recomendación**: habilitar `Features::registration()` (o eliminar/ajustar el test si el registro está deshabilitado por diseño).

### T2. `DestinationEmailTest` — `pages` vs `page_keys`
- **Ubicación**: `app/Models/Settings/DestinationEmail.php`, `database/migrations/...create_destination_emails_table.php`, `tests/Feature/Settings/DestinationEmailTest.php`.
- **Descripción**: la columna es `page_keys` (JSON NOT NULL) y el modelo llena `page_keys`; el test usa `pages` (no está en `$fillable`), se descarta y `page_keys` queda NULL → violación NOT NULL.
- **Evidencia**: migración `page_keys` NOT NULL; test `DestinationEmail::create(['pages' => ...])`.
- **Impacto**: 3 tests rojos.
- **Prioridad**: media
- **Estado**: confirmado
- **Recomendación**: usar `page_keys` en el test, o añadir alias `pages` (mutator) en el modelo.

### T3. `DashboardTest` — SQL Postgres-only contra SQLite
- **Ubicación**: `app/Http/Web/Services/Dashboard/DashboardService.php:74`.
- **Descripción**: `getSalesData()` usa `EXTRACT(MONTH FROM created_at)` (Postgres). El entorno de test usa SQLite (`:memory:`), donde falla.
- **Evidencia**: `phpunit.xml` SQLite; `DashboardService.php` usa `EXTRACT(...)`.
- **Impacto**: test rojo (y no-portabilidad a SQLite).
- **Prioridad**: media
- **Estado**: confirmado
- **Recomendación**: usar una expresión portable o agregar en PHP; auditar `ILIKE`, `||`, `EXTRACT` en el admin.

---

## 4. Errores de tipos en admin (`resources/js`)

### TS1. `OrderStateDialog` — clave `schedule_shipping` obsoleta
- **Ubicación**: `resources/js/components/custom-ui/orders/OrderStateDialog.tsx:58`; `resources/js/.../status.tsx` (`AdminOrderAction`).
- **Descripción**: `ACTION_HELP` incluía `schedule_shipping` (no existe en `AdminOrderAction`; el correcto es `start_transit`) y le faltaba `mark_refunded` (por eso el reembolso no mostraba texto de ayuda, aunque la acción sí funcionaba).
- **Prioridad**: media
- **Estado**: resuelto
- **Recomendación aplicada**: eliminado `schedule_shipping` de `ACTION_HELP` y de todo el backend (validación `in:` en `OrderController.php` y `match` en `OrderService.php`, que lo trataba como alias legado de `start_transit`); añadido `mark_refunded` a `ACTION_HELP`.

### TS2. `IntroAboutusEditor` — campo `video_url` no declarado en el tipo
- **Ubicación**: `resources/js/components/custom-ui/content/editors/aboutus/IntroAboutusEditor.tsx`; `resources/js/types/content/content-types.ts`.
- **Descripción**: el editor (y el store `AboutView.tsx`) lee/escribe `video_url`, pero `IntroAboutusContent` no lo declaraba. Funcionaba en runtime (el backend guarda el objeto `content` completo, incluido `video_url`), pero `tsc` marcaba error y el campo era "fantasma" a nivel de tipos.
- **Prioridad**: media
- **Estado**: resuelto
- **Recomendación aplicada**: añadido `video_url: string | null` a `IntroAboutusContent` y simplificado el editor para usar ese tipo (quitado el workaround `& { video_url?: string }`).

### TS3. `products` media — enum `'other'` + `.passthrough()` incompatible
- **Ubicación**: `resources/js/components/custom-ui/products/product/schema.ts`, `mappers.ts`, `VariantRow.tsx:386`; `resources/js/types/products/media.ts`.
- **Descripción**: `ExistingMediaSchema` permitía `type: 'other'` y usaba `.passthrough()` (que añade index signature), mientras que la interfaz `Media` no incluía `'other'` ni tenía index signature → tipos no asignables. `'other'` **sí se usa** en el backend (`ProductMediaService::resolveTypeAndFolder` lo usa como fallback cuando el mimetype no es image/video), así que no se quitó; el error era solo de tipos.
- **Prioridad**: media
- **Estado**: resuelto
- **Recomendación aplicada**: añadido `'other'` a `Media.type` y quitado el `.passthrough()` redundante (el schema ya declara todos los campos), alineando ambos tipos.

### TS4. `TableList` — `product.media` no existe
- **Ubicación**: `resources/js/components/custom-ui/products/product/TableList.tsx:88-90`; `resources/js/types/products/product.shared.ts`.
- **Descripción**: el fallback de video buscaba `product?.media`, pero `Product`/`ProductBase` no tiene `media` (solo las variantes). Era código muerto: a nivel runtime siempre evaluaba `undefined` (gracias al optional chaining), por lo que no rompía nada, pero generaba error de tipos.
- **Prioridad**: media
- **Estado**: resuelto
- **Recomendación aplicada**: se quitó el fallback `product?.media?.find(...)`; el video se obtiene solo de `mainVariant?.media`.

### TS5. `Image-extension` — `@tiptap/core` duplicado
- **Ubicación**: `resources/js/components/custom-ui/rich-text-tiptap/extension/Image-extension.tsx:315`.
- **Descripción**: dos copias físicas de `@tiptap/core` (una en `node_modules/@tiptap/core`, otra en `.pnpm/...`), por lo que TS ve dos `Editor` distintos.
- **Prioridad**: media
- **Recomendación**: declarar `@tiptap/core` como dependencia directa y reinstalar, o importar el tipo desde la misma instancia (`@tiptap/react`).

---

## 5. Gaps funcionales (medios)

### M1. `validateCoupon` no retorna `eligible_units` ni `coupon`
- **Ubicación**: core `app/Http/Api/v1/Controllers/Coupons/CouponController.php:80`; store `src/modules/cart/components/cart-view/Couponinput.tsx:62-70`.
- **Descripción**: el store lee `result.data.eligible_units` y `result.data.coupon`; el backend no los retorna (strippea `coupon`).
- **Impacto**: el detalle "Aplicado a N unidades × S/…" nunca se muestra; `coupon` siempre `null`.
- **Recomendación**: incluir `eligible_units` y el objeto `coupon` en la respuesta.

### M2. Cupón inválido retorna `errors: null`
- **Ubicación**: core `OrderController.php:25`, `CouponController.php:82`; store `useCheckoutQuote.ts:89`, `useCartQuote.ts:97`.
- **Descripción**: los controllers devuelven `error($message, null, 422)`, así que `errors` es `null`; el store solo limpia el cupón si `result.errors?.coupon_code`.
- **Impacto**: el cupón no se auto-limpia al fallar la cotización.
- **Recomendación**: devolver `['coupon_code' => [...]]` en `errors`, o que el store limpie en base a otro criterio.

### M3. `fiscal_address` requerido por backend, no por el store
- **Ubicación**: core `StoreOrderRequest.php:30`; store `src/modules/checkout/types.ts:425-432`.
- **Descripción**: el backend exige `billing_info.fiscal_address` cuando `voucher_type=factura`; el schema Zod solo valida longitud máxima.
- **Impacto**: factura con dirección fiscal vacía pasa el form pero falla 422.
- **Recomendación**: añadir `required` a `fiscal_address` en el schema cuando `voucher_type === 'factura'`.

### M4. `pack_final_price` ausente en detalle de pack
- **Ubicación**: core `ProductController.php:170-175`; store `src/modules/products/interfaces/product.api.ts:130`.
- **Descripción**: el objeto `pricing` del pack no incluye `pack_final_price` (declarado en el store y leído por el mapper).
- **Recomendación**: añadir `pack_final_price` al payload de `pricing`.

### M5. `storeCustomerAddress` lee el shape incorrecto
- **Ubicación**: store `src/modules/dashboard/services/customer.client.ts:12-22`.
- **Descripción**: lee `response.data?.data`, pero el backend devuelve el objeto `Address` directamente en `data`.
- **Impacto**: funciona solo por un fallback (`syncAddress`), con request redundante.
- **Recomendación**: leer `response.data` directamente.

### M6. Validación DNI/CE inconsistente
- **Ubicación**: store `SettignsForm.tsx:24` (regex `^\d{8}$`); core `UpdateCustomerRequest.php:29-34` (`max:15`).
- **Descripción**: el store exige 8 dígitos siempre; el backend permite CE (max 15). El mensaje del backend dice "8 dígitos" aunque la regla es `max:15`.
- **Impacto**: bloquea actualización válida de CE.
- **Recomendación**: alinear validación según `document_type` y corregir el mensaje.

### M7. `seos/Show.tsx` crashea con `canonical_url` vacío
- **Ubicación**: `resources/js/pages/seos/Show.tsx:175`.
- **Descripción**: `new URL(displayUrl)` con `displayUrl = seo.canonical_url || ''` lanza `TypeError` si está vacío.
- **Recomendación**: guard/fallback antes de `new URL(...)`.

---

## 6. Baja / limpieza

- **L1** `RegisterUserPayload` omite `full_last_name` (y `phone`/`dni`/`document_type`) — `src/modules/auth/interfaces/index.ts`.
- **L2** `/mi-cuenta` ausente de `PRIVATE_PATHS` en `src/proxy.ts` (y `/configuracion` es ruta muerta).
- **L3** Fallback del nombre de cookie diverge: store `access_token` vs core `jwt` (latente; hoy `.env` lo fija).
- **L4** Dominio de cookie de producción hardcodeado `playgrouplatam.com` en `JwtCookie.php:21,42`.
- **L5** `/filter` usa `is_on_promo` crudo (no validado por fechas) — `ProductFilterService.php:495-508`.
- **L6** `/filter` omite `variant_attrs` (se pierden atributos al agregar desde listado) — `ProductFilterService.php`.
- **L7** `categories` devuelve objeto "mega menú", el store lo tipa como `Category[]` — `category.server.ts`.
- **L8** Pack detail: `items[].product` sin `is_active`; `pack` sin `items_count` (declarados en el store).
- **L9** `BusinessLineApi.id` tipado `number` pero es ULID string.
- **L10** N+1 por lazy-load de `brand` en listado/home — `ProductController.php:255,306`.
- **L11** Specs con `attribute_value_id` se renderizan vacíos (el store solo lee `spec.value`).
- **L12** `ValidateOrderQuoteResponse.coupon` (`CouponData`) usa campos que no devuelve el backend.
- **L13** `ValidateCouponRequest` no valida `pack_id` (solo fallback `item_id`).
- **L14** `paymethods.currency` serializa "Soles"/"Dólares" en vez de código de moneda.
- **L15** `GET v1/recommendations/complementary` usa envelope no estándar (`complementary_products` directo).
- **L16** `OrderResponse.status_history` requerido en tipo, pero `GET /orders` (lista) no lo carga.
- **L17** Estado `cancelado` es código muerto: `cancelled` mapea a `fallido` — `orderState.constants.ts:20`.
- **L18** Envelope de error de `niubiz/confirm` anida `order` dentro de `errors` (type mismatch, funciona por cast).
- **L19** `coupons.ts:184` usa `apiServer` con `auth: true` para un endpoint público.
- **L20** Notificaciones: `perPage`/`nextCursor`/`created_at` declarados pero no devueltos; `type` union divergente.
- **L21** Contact `document_type`: store `razon-social` vs core `razon_social`.
- **L22** Distributor envía `accepted_policy`, core lo ignora.
- **L23** Jobs-portal application: campos extra (`area/place/position/employment_status`) no usados por core.
- **L24** `IComplaint` omite `customer_request`.
- **L25** `PurchaseIntentionController::show` omite `perPage` en `meta`.
- **L26** Página `auth/register.tsx` huérfana.
- **L27** SQL Postgres-only extendido en admin (`ILIKE`, `||`, `EXTRACT`).
- **L28** Prop `paginatedClaims` mal nombrada en `AboutUsController`.
- **L29** Uncheck "Datos de facturación" no limpia el billing profile guardado.
- **L30** `v1/auth/me` excluido del auto-refresh en `src/lib/api.ts`.

---

## Riesgos y pendientes de confirmación

- **F2 (ubigeos)**: la cobertura es actualmente solo Lima; conviene confirmar si está previsto ampliar zonas de delivery (afecta `checkoutDepartments/Provinces/Districts`).
- **T1 (registro)**: confirmar si el registro por el panel admin está deshabilitado por diseño o es una omisión.
- **S1 (rutas sin auth)**: confirmar que ninguna de esas rutas debe ser pública (ej. `leads` de formularios del storefront).
- **L4 (cookie domain)**: el dominio de producción depende del despliegue; validar configuración real.

---

## Checklist de validaciones

- [x] Build del store (`pnpm build`) OK.
- [x] Typecheck store (`tsc --noEmit`) OK.
- [x] Sintaxis PHP de core OK (`php -l` en app/routes/config/database).
- [x] `php artisan` bootea.
- [x] Endpoints store ↔ core (método + path) verificados.
- [x] Payloads snake_case verificados.
- [x] Módulos revisados end-to-end: auth/cuenta, productos/catálogo, carrito/checkout/órdenes/pagos, admin (Inertia), contenido/SEO/blogs/auxiliares.
- [ ] No revisado en profundidad: colas/jobs (`orders:expire-pending-transfers`), webhooks de pasarela, performance a nivel DB (índices), y cobertura de tests unitarios de servicios.
