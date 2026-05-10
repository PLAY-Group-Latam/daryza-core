<?php

namespace Database\Seeders;

use App\Models\Customers\Customer;
use App\Models\Orders\Order;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductVariant;
use App\Models\Settings\PaymentMethod;
use App\Models\Ubigeos\District;
use App\Models\Events\EventLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $district = District::query()->with('province.department')->first();
        if (!$district) {
            $this->command?->warn('DashboardDemoSeeder omitido: no existen ubigeos.');
            return;
        }

        $department = $district->province->department;
        $province   = $district->province;

        $paymentMethod = PaymentMethod::query()->firstOrCreate(
            ['company_type' => 'daryza', 'name' => 'Cuenta Demo BCP'],
            ['account_number' => '193-000001-0-99', 'is_active' => true]
        );

        $categoriesData = ['Limpieza del Hogar', 'Desinfectantes', 'Cuidado Personal'];
        $categories = collect($categoriesData)->map(fn($name) =>
            ProductCategory::query()->firstOrCreate(['slug' => Str::slug($name)], ['id' => (string) Str::ulid(), 'name' => $name])
        );

        $productsData = [
            ['name' => 'Limpiador Brisa', 'price' => 10.00, 'category' => 'Limpieza del Hogar', 'code' => 'DASH-P-01'],
            ['name' => 'Desinfectante 5L', 'price' => 50.00, 'category' => 'Desinfectantes', 'code' => 'DASH-P-02'],
        ];

        $variants = collect();
        foreach ($productsData as $pd) {
            $product = Product::query()->firstOrCreate(['code' => $pd['code']], ['name' => $pd['name'], 'slug' => Str::slug($pd['name']), 'is_active' => true]);
            $category = $categories->firstWhere('name', $pd['category']);
            if ($category) $product->categories()->syncWithoutDetaching([(string) $category->id]);
            
            $variant = ProductVariant::query()->firstOrCreate(['sku' => $pd['code'] . '-V1'], ['product_id' => $product->id, 'price' => $pd['price'], 'is_active' => true, 'stock' => 500]);
            $variants->push(['variant' => $variant, 'product' => $product, 'price' => (float)$pd['price']]);
        }

        $customer = Customer::query()->updateOrCreate(['email' => 'demo@dash.test'], ['full_name' => 'Cliente Demo', 'dni' => '70000000', 'password' => Hash::make('password')]);

        $this->command?->info("Generando ecosistema de eventos y órdenes para 2026...");

        // 1. GENERAR TRÁFICO "FRÍO" (Para la Tasa de Conversión)
        $this->generateColdTraffic(2026);

        // 2. GENERAR MESES ANTERIORES
        for ($m = 1; $m <= 4; $m++) {
            $this->createOrdersForPeriod($m, rand(8, 12), $variants, $customer, $paymentMethod, $department, $province, $district);
        }

        // 3. PERIODO ANTERIOR (Finales de Abril)
        for ($i = 0; $i < 6; $i++) {
            $date = Carbon::create(2026, 4, 25)->addDays($i);
            $this->createOrderWithFunnel($date, $variants->random(), $customer, $paymentMethod, $department, $province, $district, 'delivered');
        }

        // 4. PERIODO ACTUAL (Mayo)
        for ($i = 0; $i < 10; $i++) {
            $date = Carbon::create(2026, 5, 1)->addDays($i);
            $state = ($i == 0) ? 'cancelled' : 'delivered'; 
            $this->createOrderWithFunnel($date, $variants->random(), $customer, $paymentMethod, $department, $province, $district, $state);
        }

        $this->command?->info("¡Seeder completado! Middleware y Dashboard sincronizados.");
    }

    private function generateColdTraffic($year) {
    // Genera 400 visitas solo para Mayo 2026
    for ($i = 0; $i < 400; $i++) {
        EventLog::create([
            'customer_id' => null,
            'session_id'  => (string) Str::uuid(),
            'event_type'  => 'product_view',
            'event_data'  => ['url' => '/tienda', 'device' => 'desktop'],
            // Forzamos que sean de Mayo
            'created_at'  => Carbon::create(2026, 5, rand(1, 9), rand(0, 23)),
        ]);
    }
}

    private function createOrdersForPeriod($month, $count, $variants, $customer, $paymentMethod, $dep, $prov, $dist) {
        for ($i = 0; $i < $count; $i++) {
            $date = Carbon::create(2026, $month, rand(1, 28));
            $this->createOrderWithFunnel($date, $variants->random(), $customer, $paymentMethod, $dep, $prov, $dist, 'delivered');
        }
    }

    private function createOrderWithFunnel($date, $vData, $customer, $paymentMethod, $dep, $prov, $dist, $state) {
        static $index = 1;
        $sessionId = (string) Str::uuid();
        
        // --- SIMULACIÓN DEL FUNNEL ---
        
        // 1. page_view (La visita inicial)
        EventLog::create([
            'customer_id' => $customer->id,
            'session_id'  => $sessionId,
            'event_type'  => 'page_view',
            'event_data'  => ['url' => '/producto/' . $vData['product']->slug],
            'created_at'  => $date->copy()->subMinutes(20),
        ]);

        // 2. product_view (Formato exacto del Middleware)
        EventLog::create([
            'customer_id' => $customer->id,
            'session_id'  => $sessionId,
            'event_type'  => 'product_view',
            'event_data'  => [
                'product' => [
                    'name' => $vData['product']->name,
                    'sku'  => $vData['variant']->sku,
                    'price' => (float) $vData['price'],
                    'type' => 'specification'
                ]
            ],
            'created_at' => $date->copy()->subMinutes(15),
        ]);

        // 3. add_to_cart
        EventLog::create([
            'customer_id' => $customer->id,
            'session_id'  => $sessionId,
            'event_type'  => 'add_to_cart',
            'event_data'  => [
                'product' => [
                    'name' => $vData['product']->name,
                    'sku'  => $vData['variant']->sku,
                    'price' => (float) $vData['price'],
                    'quantity' => 1,
                    'type' => 'product'
                ]
            ],
            'created_at' => $date->copy()->subMinutes(10),
        ]);

        // --- CREACIÓN DE LA ORDEN ---
        $qty = rand(1, 2);
        $subtotal = round($vData['price'] * $qty, 2);
        $delivery = 10.00;
        $total = $subtotal + $delivery;

        $order = Order::create([
            'code' => 'DASH-ORD-' . str_pad($index++, 5, '0', STR_PAD_LEFT),
            'customer_id' => $customer->id,
            'customer_email' => $customer->email,
            'customer_first_name' => 'Cliente',
            'customer_last_name' => 'Demo',
            'customer_document_type' => 'dni',
            'customer_document_number' => $customer->dni,
            'customer_mobile_phone' => '999999999',
            'voucher_type' => 'boleta',
            'department_id' => $dep->id,
            'province_id' => $prov->id,
            'district_id' => $dist->id,
            'department_name' => $dep->name,
            'province_name' => $prov->name,
            'district_name' => $dist->name,
            'shipping_address_line' => 'Av. Las Gardenias ' . rand(100, 999),
            'shipping_number' => (string) rand(100, 900),
            'payment_method_id' => $paymentMethod->id,
            'payment_method_type' => 'bank_transfer',
            'currency' => 'PEN',
            'subtotal' => $subtotal,
            'delivery_cost' => $delivery,
            'total' => $total,
            'state' => $state,
            'created_at' => $date,
            'updated_at' => $date,
            'paid_at' => ($state === 'delivered') ? $date : null,
            'placed_at' => $date,
            'confirmed_at' => $date,
        ]);

        $order->items()->create([
            'product_id' => $vData['variant']->product_id,
            'variant_id' => $vData['variant']->id,
            'item_type' => 'product_variant',
            'product_name' => $vData['product']->name,
            'variant_sku' => $vData['variant']->sku,
            'quantity' => $qty,
            'unit_price' => $vData['price'],
            'line_total' => $subtotal,
        ]);

        // 4. order_placed (Sincronizado con formatOrderPlaced del Middleware)
        if ($state !== 'cancelled') {
            EventLog::create([
                'customer_id' => $customer->id,
                'session_id'  => $sessionId,
                'event_type'  => 'order_placed',
                'event_data'  => [
                    'order_id'       => $order->id,
                    'order_code'     => $order->code,
                    'total'          => (float) $total,
                    'subtotal'       => (float) $subtotal,
                    'payment_method' => 'bank_transfer',
                    'items'          => [
                        [
                            'name'     => $vData['product']->name,
                            'quantity' => $qty,
                            'price'    => (float) $vData['price'],
                        ]
                    ],
                ],
                'created_at' => $date,
            ]);
        }
    }
}