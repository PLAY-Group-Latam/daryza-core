<?php

namespace Database\Seeders;

use App\Models\Customers\Customer;
use App\Models\Orders\Order;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductVariant;
use App\Models\Settings\PaymentMethod;
use App\Models\Ubigeos\District;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $district = District::query()->with('province.department')->first();

        if (!$district || !$district->province || !$district->province->department) {
            $this->command?->warn('DashboardDemoSeeder omitido: no existen ubigeos.');
            return;
        }

        $department = $district->province->department;
        $province   = $district->province;

        // 1. PAYMENT METHOD
        $paymentMethod = PaymentMethod::query()->firstOrCreate(
            ['company_type' => 'daryza', 'name' => 'Cuenta Demo BCP'],
            [
                'account_number' => '193-000001-0-99',
                'extra_info'     => 'CCI 00219300000109999999',
                'is_active'      => true,
            ]
        );

        // 2. CATEGORÍAS
        $categoriesData = [
            'Limpieza del Hogar',
            'Desinfectantes',
            'Cuidado Personal',
            'Aromatizantes',
            'Limpieza Industrial',
        ];

        $categories = collect($categoriesData)->map(fn($name) =>
            ProductCategory::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                ['id' => Str::ulid(), 'name' => $name, 'parent_id' => null]
            )
        );

        // 3. PRODUCTOS CON VARIANTES
        $productsData = [
            ['name' => 'Limpiador Multiusos Brisa',    'price' => 12.90, 'category' => 'Limpieza del Hogar',   'code' => 'DASH-P-01'],
            ['name' => 'Desinfectante DAC5 5L',         'price' => 39.90, 'category' => 'Desinfectantes',       'code' => 'DASH-P-02'],
            ['name' => 'Jabón Líquido Antibacterial',   'price' => 18.50, 'category' => 'Cuidado Personal',     'code' => 'DASH-P-03'],
            ['name' => 'Aromatizante Lavanda 500ml',    'price' => 9.90,  'category' => 'Aromatizantes',        'code' => 'DASH-P-04'],
            ['name' => 'Desengrasante Industrial 1L',   'price' => 54.90, 'category' => 'Limpieza Industrial',  'code' => 'DASH-P-05'],
        ];

        $variants = collect();

        foreach ($productsData as $pd) {
            $product = Product::query()->firstOrCreate(
                ['code' => $pd['code']],
                [
                    'name'              => $pd['name'],
                    'slug'              => Str::slug($pd['name']),
                    'brief_description' => 'Producto demo para dashboard',
                    'description'       => 'Generado por DashboardDemoSeeder',
                    'is_active'         => true,
                    'is_home'           => false,
                ]
            );

            $category = $categories->firstWhere('name', $pd['category']);
            if ($category) {
                $product->categories()->syncWithoutDetaching([(string) $category->id]);
            }

            $variant = ProductVariant::query()->firstOrCreate(
                ['sku' => $pd['code'] . '-V1'],
                [
                    'product_id' => $product->id,
                    'price'      => $pd['price'],
                    'is_on_promo'=> false,
                    'is_active'  => true,
                    'is_main'    => true,
                    'stock'      => 500,
                ]
            );

            $variants->push(['variant' => $variant, 'product' => $product, 'price' => $pd['price']]);
        }

        // 4. CUSTOMERS
        $customers = collect([
            ['email' => 'dash.demo1@daryza.test', 'full_name' => 'Ana Torres',    'phone' => '900000201', 'dni' => '71000001'],
            ['email' => 'dash.demo2@daryza.test', 'full_name' => 'Luis Quispe',   'phone' => '900000202', 'dni' => '71000002'],
            ['email' => 'dash.demo3@daryza.test', 'full_name' => 'María Flores',  'phone' => '900000203', 'dni' => '71000003'],
            ['email' => 'dash.demo4@daryza.test', 'full_name' => 'Carlos Huanca', 'phone' => '900000204', 'dni' => '71000004'],
        ])->map(fn($d) => Customer::query()->updateOrCreate(
            ['email' => $d['email']],
            [
                'full_name' => $d['full_name'],
                'phone'     => $d['phone'],
                'dni'       => $d['dni'],
                'password'  => Hash::make('password'),
            ]
        ))->values();

        // 5. ÓRDENES DISTRIBUIDAS EN EL AÑO
        $ordersPerMonth = [
            1  => 3, 2  => 5, 3  => 8, 4  => 4, 5  => 6, 6  => 7,
            7  => 5, 8  => 9, 9  => 6, 10 => 11, 11 => 8, 12 => 14,
        ];

        $orderIndex = 1;

        foreach ($ordersPerMonth as $month => $count) {
            for ($i = 0; $i < $count; $i++) {
                $variantData = $variants->random();
                $customer    = $customers->random();
                $quantity    = rand(1, 4);
                $unitPrice   = (float) $variantData['price'];
                $subtotal    = round($unitPrice * $quantity, 2);
                $deliveryCost = 8.90;
                $total        = round($subtotal + $deliveryCost, 2);

                $paidAt = now()
                    ->setMonth($month)
                    ->setDay(rand(1, 28))
                    ->setHour(rand(8, 20))
                    ->setMinute(rand(0, 59));

                $code = sprintf('DASH-ORD-%04d', $orderIndex);

                $order = Order::query()->updateOrCreate(
                    ['code' => $code],
                    [
                        'customer_id'              => $customer->id,
                        'customer_email'           => $customer->email,
                        'customer_first_name'      => explode(' ', $customer->full_name)[0] ?? 'Cliente',
                        'customer_last_name'       => explode(' ', $customer->full_name)[1] ?? 'Demo',
                        'customer_document_type'   => 'dni',
                        'customer_document_number' => (string) $customer->dni,
                        'customer_mobile_phone'    => (string) $customer->phone,
                        'voucher_type'             => 'boleta',
                        'department_id'            => $department->id,
                        'province_id'              => $province->id,
                        'district_id'              => $district->id,
                        'department_name'          => $department->name,
                        'province_name'            => $province->name,
                        'district_name'            => $district->name,
                        'shipping_address_line'    => 'Av. Demo ' . rand(100, 999),
                        'shipping_number'          => (string) rand(100, 999),
                        'shipping_reference'       => 'Ref demo',
                        'currency'                 => 'PEN',
                        'subtotal'                 => $subtotal,
                        'delivery_cost'            => $deliveryCost,
                        'discount_total'           => 0,
                        'total'                    => $total,
                        'payment_method_id'        => $paymentMethod->id,
                        'payment_method_type'      => 'bank_transfer',
                        
                        // SE CORRIGIÓ AQUÍ: 'status' cambió a 'state'
                        'state'                    => 'delivered', 
                        
                        'placed_at'                => $paidAt->copy()->subDays(2),
                        'confirmed_at'             => $paidAt->copy()->subDay(),
                        'paid_at'                  => $paidAt,
                        'shipped_at'               => $paidAt->copy()->addDay(),
                        'delivered_at'             => $paidAt->copy()->addDays(2),
                        'notes'                    => 'Orden dashboard demo',
                    ]
                );

                $order->items()->delete();
                $order->payments()->delete();

                $order->items()->create([
                    'product_id'   => $variantData['variant']->product_id,
                    'variant_id'   => $variantData['variant']->id,
                    'item_type'    => 'product_variant',
                    'product_name' => $variantData['product']->name,
                    'variant_sku'  => $variantData['variant']->sku,
                    'quantity'     => $quantity,
                    'unit_price'   => $unitPrice,
                    'line_total'   => $subtotal,
                    'metadata'     => ['seed' => true],
                ]);

                $order->payments()->create([
                    'payment_method_id' => $paymentMethod->id,
                    'method'            => 'bank_transfer',
                    'status'            => 'approved',
                    'amount'            => $total,
                    'paid_at'           => $paidAt,
                ]);

                $orderIndex++;
            }
        }

        $this->command?->info("DashboardDemoSeeder ejecutado: {$orderIndex} órdenes demo creadas.");
    }
}