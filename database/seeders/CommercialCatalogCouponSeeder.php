<?php

namespace Database\Seeders;

use App\Models\Coupons\Coupon;
use App\Models\Customers\Customer;
use App\Models\Products\BusinessLine;
use App\Models\Products\DynamicCategory;
use App\Models\Products\DynamicCategoryItem;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductPackItem;
use App\Models\Products\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CommercialCatalogCouponSeeder extends Seeder
{
    public function run(): void
    {
        $businessLines = $this->seedBusinessLines();
        $categories = $this->resolveCategories();
        $products = $this->seedProductsAndVariants($businessLines, $categories);
        $packs = $this->seedPacks($products);
        $dynamics = $this->seedDynamicCategories($products);
        $customers = $this->seedCustomers();

        $this->seedCoupons(
            products: $products,
            packs: $packs,
            dynamics: $dynamics,
            categories: $categories,
            customers: $customers
        );
    }

    private function seedBusinessLines(): array
    {
        $rows = [
            ['name' => 'Hogar', 'slug' => 'hogar', 'image' => 'business-lines/hogar.webp'],
            ['name' => 'Horeca', 'slug' => 'horeca', 'image' => 'business-lines/horeca.webp'],
            ['name' => 'Industrial', 'slug' => 'industrial', 'image' => 'business-lines/industrial.webp'],
            ['name' => 'Salud', 'slug' => 'salud', 'image' => 'business-lines/salud.webp'],
        ];

        $result = [];
        foreach ($rows as $row) {
            $line = BusinessLine::query()->updateOrCreate(
                ['slug' => $row['slug']],
                ['name' => $row['name'], 'image' => $row['image'], 'is_active' => true]
            );
            $result[$row['slug']] = $line;
        }

        return $result;
    }

    private function resolveCategories(): array
    {
        $targets = [
            'desinfectantes' => ['quimicos-de-limpieza-desinfectantes', 'Desinfectantes'],
            'papel-toalla' => ['papeles-papel-toalla', 'Papel Toalla'],
            'guantes' => ['accesorios-de-limpieza-guantes', 'Guantes'],
        ];

        $categories = [];
        foreach ($targets as $key => [$slug, $fallbackName]) {
            $categories[$key] = ProductCategory::query()->firstOrCreate(
                ['slug' => $slug],
                ['name' => $fallbackName, 'is_active' => true]
            );
        }

        return $categories;
    }

    private function seedProductsAndVariants(array $businessLines, array $categories): array
    {
        $rows = [
            [
                'code' => 'COM-PRD-001',
                'name' => 'Desinfectante Multisuperficie DAC 5L',
                'sku' => 'COM-PRD-001-V1',
                'price' => 49.90,
                'promo_price' => 44.90,
                'is_on_promo' => true,
                'stock' => 280,
                'business_lines' => ['hogar', 'horeca'],
                'categories' => ['desinfectantes'],
            ],
            [
                'code' => 'COM-PRD-002',
                'name' => 'Jabon Liquido Antibacterial 1L',
                'sku' => 'COM-PRD-002-V1',
                'price' => 21.90,
                'promo_price' => null,
                'is_on_promo' => false,
                'stock' => 420,
                'business_lines' => ['hogar', 'salud'],
                'categories' => ['desinfectantes'],
            ],
            [
                'code' => 'COM-PRD-003',
                'name' => 'Papel Toalla Institucional 250m',
                'sku' => 'COM-PRD-003-V1',
                'price' => 32.00,
                'promo_price' => 29.00,
                'is_on_promo' => true,
                'stock' => 360,
                'business_lines' => ['horeca', 'industrial'],
                'categories' => ['papel-toalla'],
            ],
            [
                'code' => 'COM-PRD-004',
                'name' => 'Guantes Nitrilo Azul Caja x100',
                'sku' => 'COM-PRD-004-V1',
                'price' => 58.00,
                'promo_price' => null,
                'is_on_promo' => false,
                'stock' => 190,
                'business_lines' => ['salud', 'industrial'],
                'categories' => ['guantes'],
            ],
            [
                'code' => 'COM-PRD-005',
                'name' => 'Limpiavidrios Profesional 1L',
                'sku' => 'COM-PRD-005-V1',
                'price' => 19.90,
                'promo_price' => null,
                'is_on_promo' => false,
                'stock' => 250,
                'business_lines' => ['hogar'],
                'categories' => ['desinfectantes'],
            ],
            [
                'code' => 'COM-PRD-006',
                'name' => 'Desengrasante Industrial Concentrado 1L',
                'sku' => 'COM-PRD-006-V1',
                'price' => 64.00,
                'promo_price' => 55.00,
                'is_on_promo' => true,
                'stock' => 160,
                'business_lines' => ['industrial'],
                'categories' => ['desinfectantes'],
            ],
        ];

        $products = [];

        foreach ($rows as $row) {
            $product = Product::query()->updateOrCreate(
                ['code' => $row['code']],
                [
                    'name' => $row['name'],
                    'slug' => Str::slug($row['name']),
                    'brief_description' => 'Producto comercial para pruebas de cupones y promociones.',
                    'description' => 'Registro seed para validar descuentos por alcance comercial.',
                    'is_active' => true,
                    'is_home' => false,
                ]
            );

            $variant = ProductVariant::query()->updateOrCreate(
                ['sku' => $row['sku']],
                [
                    'product_id' => $product->id,
                    'price' => $row['price'],
                    'promo_price' => $row['promo_price'],
                    'is_on_promo' => $row['is_on_promo'],
                    'promo_start_at' => $row['is_on_promo'] ? now()->subDays(5) : null,
                    'promo_end_at' => $row['is_on_promo'] ? now()->addMonths(2) : null,
                    'is_active' => true,
                    'is_main' => true,
                    'stock' => $row['stock'],
                ]
            );

            $product->categories()->syncWithoutDetaching(
                collect($row['categories'])->map(fn(string $key) => (string) $categories[$key]->id)->all()
            );

            $product->businessLines()->syncWithoutDetaching(
                collect($row['business_lines'])->map(fn(string $key) => (string) $businessLines[$key]->id)->all()
            );

            $products[$row['code']] = ['product' => $product, 'variant' => $variant];
        }

        return $products;
    }

    private function seedPacks(array $products): array
    {
        $packRows = [
            [
                'code' => 'COM-PACK-001',
                'name' => 'Pack Higiene Base',
                'price' => 98.00,
                'promo_price' => 89.00,
                'is_on_promotion' => true,
                'items' => [
                    ['code' => 'COM-PRD-001', 'quantity' => 1],
                    ['code' => 'COM-PRD-003', 'quantity' => 1],
                    ['code' => 'COM-PRD-004', 'quantity' => 1],
                ],
            ],
            [
                'code' => 'COM-PACK-002',
                'name' => 'Pack Mantenimiento Industrial',
                'price' => 132.00,
                'promo_price' => null,
                'is_on_promotion' => false,
                'items' => [
                    ['code' => 'COM-PRD-006', 'quantity' => 1],
                    ['code' => 'COM-PRD-005', 'quantity' => 2],
                ],
            ],
        ];

        $packs = [];

        foreach ($packRows as $row) {
            $pack = ProductPack::query()->updateOrCreate(
                ['code' => $row['code']],
                [
                    'name' => $row['name'],
                    'slug' => Str::slug($row['name']),
                    'brief_description' => 'Pack comercial para pruebas de cupones por alcance pack.',
                    'description' => 'Combinacion realista de productos para validaciones QA.',
                    'stock' => 120,
                    'price' => $row['price'],
                    'promo_price' => $row['promo_price'],
                    'is_active' => true,
                    'show_on_home' => false,
                    'is_on_promotion' => $row['is_on_promotion'],
                    'promo_start_at' => $row['is_on_promotion'] ? now()->subDays(4) : null,
                    'promo_end_at' => $row['is_on_promotion'] ? now()->addMonths(2) : null,
                ]
            );

            foreach ($row['items'] as $item) {
                $product = $products[$item['code']]['product'];
                $variant = $products[$item['code']]['variant'];

                ProductPackItem::query()->updateOrCreate(
                    ['product_pack_id' => $pack->id, 'variant_id' => $variant->id],
                    ['product_id' => $product->id, 'quantity' => $item['quantity']]
                );
            }

            $packs[$row['code']] = $pack;
        }

        return $packs;
    }

    private function seedDynamicCategories(array $products): array
    {
        $rows = [
            [
                'slug' => 'campana-desinfeccion-empresas',
                'name' => 'Campana Desinfeccion Empresas',
                'items' => ['COM-PRD-001', 'COM-PRD-002', 'COM-PRD-004'],
            ],
            [
                'slug' => 'campana-mantenimiento-industrial',
                'name' => 'Campana Mantenimiento Industrial',
                'items' => ['COM-PRD-005', 'COM-PRD-006'],
            ],
        ];

        $dynamics = [];

        foreach ($rows as $row) {
            $dynamic = DynamicCategory::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'name' => $row['name'],
                    'is_active' => true,
                    'starts_at' => now()->subDays(3),
                    'ends_at' => now()->addMonths(3),
                ]
            );

            foreach ($row['items'] as $code) {
                $product = $products[$code]['product'];
                $variant = $products[$code]['variant'];

                DynamicCategoryItem::query()->updateOrCreate(
                    ['dynamic_category_id' => $dynamic->id, 'variant_id' => $variant->id],
                    ['product_id' => $product->id]
                );
            }

            $dynamics[$row['slug']] = $dynamic;
        }

        return $dynamics;
    }

    private function seedCustomers(): array
    {
        $rows = [
            ['email' => 'compras.horeca@cliente-demo.pe', 'full_name' => 'Compras Horeca SAC', 'phone' => '900310201', 'dni' => '73012001'],
            ['email' => 'logistica.salud@cliente-demo.pe', 'full_name' => 'Logistica Salud EIRL', 'phone' => '900310202', 'dni' => '73012002'],
            ['email' => 'operaciones.industrial@cliente-demo.pe', 'full_name' => 'Operaciones Industrial SRL', 'phone' => '900310203', 'dni' => '73012003'],
        ];

        $customers = [];
        foreach ($rows as $row) {
            $customer = Customer::query()->updateOrCreate(
                ['email' => $row['email']],
                [
                    'full_name' => $row['full_name'],
                    'phone' => $row['phone'],
                    'dni' => $row['dni'],
                    'password' => Hash::make('password'),
                ]
            );
            $customers[$row['email']] = $customer;
        }

        return $customers;
    }

    private function seedCoupons(
        array $products,
        array $packs,
        array $dynamics,
        array $categories,
        array $customers
    ): void {
        $validFrom = now()->subDays(2);
        $validUntil = now()->addMonths(6);

        $couponRows = [
            ['code' => 'CP-GLOBAL-FIX-20', 'scope' => 'global', 'discount_type' => 'fixed', 'discount_amount' => 20.00, 'minimum_order_amount' => 120.00, 'is_public' => true],
            ['code' => 'CP-GLOBAL-PCT-10', 'scope' => 'global', 'discount_type' => 'percentage', 'discount_amount' => 10.00, 'maximum_discount_amount' => 70.00, 'minimum_order_amount' => 150.00, 'is_public' => true],
            ['code' => 'CP-PROD-FIX-15', 'scope' => 'product', 'discount_type' => 'fixed', 'discount_amount' => 15.00, 'minimum_order_amount' => 90.00, 'is_public' => true],
            ['code' => 'CP-PROD-PCT-12', 'scope' => 'product', 'discount_type' => 'percentage', 'discount_amount' => 12.00, 'maximum_discount_amount' => 60.00, 'minimum_order_amount' => 100.00, 'is_public' => true],
            ['code' => 'CP-CAT-FIX-18', 'scope' => 'category', 'discount_type' => 'fixed', 'discount_amount' => 18.00, 'minimum_order_amount' => 110.00, 'is_public' => true],
            ['code' => 'CP-CAT-PCT-14', 'scope' => 'category', 'discount_type' => 'percentage', 'discount_amount' => 14.00, 'maximum_discount_amount' => 80.00, 'minimum_order_amount' => 140.00, 'is_public' => true],
            ['code' => 'CP-PACK-FIX-25', 'scope' => 'pack', 'discount_type' => 'fixed', 'discount_amount' => 25.00, 'minimum_order_amount' => 80.00, 'is_public' => true],
            ['code' => 'CP-PACK-PCT-15', 'scope' => 'pack', 'discount_type' => 'percentage', 'discount_amount' => 15.00, 'maximum_discount_amount' => 90.00, 'minimum_order_amount' => 120.00, 'is_public' => true],
            ['code' => 'CP-DYN-FIX-22', 'scope' => 'business_dynamic', 'discount_type' => 'fixed', 'discount_amount' => 22.00, 'minimum_order_amount' => 100.00, 'is_public' => true],
            ['code' => 'CP-DYN-PCT-11', 'scope' => 'business_dynamic', 'discount_type' => 'percentage', 'discount_amount' => 11.00, 'maximum_discount_amount' => 65.00, 'minimum_order_amount' => 130.00, 'is_public' => true],
            ['code' => 'CP-CUST-FIX-30', 'scope' => 'customer', 'discount_type' => 'fixed', 'discount_amount' => 30.00, 'minimum_order_amount' => 150.00, 'is_public' => false],
            ['code' => 'CP-CUST-PCT-20', 'scope' => 'customer', 'discount_type' => 'percentage', 'discount_amount' => 20.00, 'maximum_discount_amount' => 120.00, 'minimum_order_amount' => 180.00, 'is_public' => false],
        ];

        foreach ($couponRows as $row) {
            $coupon = Coupon::query()->updateOrCreate(
                ['code' => $row['code']],
                [
                    'description' => 'Cupon de prueba comercial ' . $row['scope'] . ' ' . $row['discount_type'],
                    'discount_type' => $row['discount_type'],
                    'discount_amount' => $row['discount_amount'],
                    'maximum_discount_amount' => $row['maximum_discount_amount'] ?? null,
                    'minimum_order_amount' => $row['minimum_order_amount'],
                    'scope' => $row['scope'],
                    'is_active' => true,
                    'is_public' => $row['is_public'],
                    'usage_limit' => 500,
                    'usage_limit_per_user' => 3,
                    'valid_from' => $validFrom,
                    'valid_until' => $validUntil,
                ]
            );

            if ($coupon->scope === 'product') {
                $coupon->products()->sync([
                    (string) $products['COM-PRD-001']['product']->id,
                    (string) $products['COM-PRD-003']['product']->id,
                    (string) $products['COM-PRD-006']['product']->id,
                ]);
            }

            if ($coupon->scope === 'category') {
                $coupon->categories()->sync([
                    (string) $categories['desinfectantes']->id,
                    (string) $categories['papel-toalla']->id,
                ]);
            }

            if ($coupon->scope === 'pack') {
                $coupon->packs()->sync([
                    (string) $packs['COM-PACK-001']->id,
                    (string) $packs['COM-PACK-002']->id,
                ]);
            }

            if ($coupon->scope === 'business_dynamic') {
                $coupon->businessDynamics()->sync([
                    (string) $dynamics['campana-desinfeccion-empresas']->id,
                    (string) $dynamics['campana-mantenimiento-industrial']->id,
                ]);
            }

            if ($coupon->scope === 'customer') {
                $coupon->customers()->sync([
                    (string) $customers['compras.horeca@cliente-demo.pe']->id,
                    (string) $customers['logistica.salud@cliente-demo.pe']->id,
                ]);
            }
        }
    }
}
