<?php

namespace Database\Seeders;

use App\Models\Customers\Customer;
use App\Models\Orders\Order;
use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use App\Models\Settings\PaymentMethod;
use App\Models\Ubigeos\District;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrderDemoSeeder extends Seeder
{
    public function run(): void
    {
        $district = District::query()->with('province.department')->first();

        if (!$district || !$district->province || !$district->province->department) {
            $this->command?->warn('OrderDemoSeeder omitido: no existen ubigeos (district/province/department).');
            return;
        }

        $department = $district->province->department;
        $province = $district->province;

        $paymentMethod = PaymentMethod::query()->firstOrCreate(
            ['company_type' => 'daryza', 'name' => 'Cuenta Demo BCP'],
            [
                'account_number' => '193-000001-0-99',
                'extra_info' => 'CCI 00219300000109999999',
                'is_active' => true,
            ]
        );

        $customers = collect([
            [
                'email' => 'cliente.demo1@daryza.test',
                'full_name' => 'Cliente Demo Uno',
                'phone' => '900000101',
                'dni' => '70000001',
            ],
            [
                'email' => 'cliente.demo2@daryza.test',
                'full_name' => 'Cliente Demo Dos',
                'phone' => '900000102',
                'dni' => '70000002',
            ],
            [
                'email' => 'cliente.demo3@daryza.test',
                'full_name' => 'Cliente Demo Tres',
                'phone' => '900000103',
                'dni' => '70000003',
            ],
        ])->map(function (array $data) {
            return Customer::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'full_name' => $data['full_name'],
                    'phone' => $data['phone'],
                    'dni' => $data['dni'],
                    'password' => Hash::make('password'),
                ]
            );
        })->values();

        $variants = ProductVariant::query()->where('is_active', true)->with('product:id,name')->take(3)->get()->values();

        if ($variants->isEmpty()) {
            $product = Product::query()->create([
                'code' => 'DEMO-ORD-01',
                'name' => 'Producto Demo Ordenes',
                'slug' => 'producto-demo-ordenes',
                'brief_description' => 'Producto demo para seed de ordenes',
                'description' => 'Generado automaticamente por OrderDemoSeeder',
                'is_active' => true,
                'is_home' => false,
            ]);

            $variants = collect([
                ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'sku' => 'DEMO-ORD-SKU-01',
                    'price' => 39.90,
                    'promo_price' => 34.90,
                    'is_on_promo' => true,
                    'is_active' => true,
                    'is_main' => true,
                    'stock' => 200,
                ]),
                ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'sku' => 'DEMO-ORD-SKU-02',
                    'price' => 59.90,
                    'promo_price' => null,
                    'is_on_promo' => false,
                    'is_active' => true,
                    'is_main' => false,
                    'stock' => 200,
                ]),
                ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'sku' => 'DEMO-ORD-SKU-03',
                    'price' => 89.90,
                    'promo_price' => null,
                    'is_on_promo' => false,
                    'is_active' => true,
                    'is_main' => false,
                    'stock' => 200,
                ]),
            ])->values();
        }

        $scenarios = [
            ['state' => 'pending_payment', 'payment_record_status' => 'pending', 'method' => 'bank_transfer', 'voucher_type' => 'boleta'],
            ['state' => 'payment_received', 'payment_record_status' => 'approved', 'method' => 'bank_transfer', 'voucher_type' => 'factura'],
            ['state' => 'preparing', 'payment_record_status' => 'approved', 'method' => 'niubiz', 'voucher_type' => 'boleta'],
            ['state' => 'in_delivery', 'payment_record_status' => 'approved', 'method' => 'niubiz', 'voucher_type' => 'boleta'],
            ['state' => 'delivered', 'payment_record_status' => 'approved', 'method' => 'bank_transfer', 'voucher_type' => 'factura'],
            ['state' => 'cancelled', 'payment_record_status' => 'failed', 'method' => 'bank_transfer', 'voucher_type' => 'boleta'],
        ];

        foreach ($scenarios as $index => $scenario) {
            $customer = $customers[$index % $customers->count()];
            $variant = $variants[$index % $variants->count()];
            $quantity = ($index % 3) + 1;
            $unitPrice = (float) $variant->active_price;

            $subtotal = round($unitPrice * $quantity, 2);
            $deliveryCost = $scenario['state'] === 'delivered' ? 0 : 8.90;
            $total = round($subtotal + $deliveryCost, 2);

            $code = sprintf('ORD-DEMO-%03d', $index + 1);
            $isPaid = $scenario['payment_record_status'] === 'approved';
            $isConfirmed = in_array($scenario['state'], ['payment_received', 'preparing', 'in_delivery', 'delivered'], true);
            $isShipped = in_array($scenario['state'], ['in_delivery', 'delivered'], true);

            $order = Order::query()->updateOrCreate(
                ['code' => $code],
                [
                    'customer_id' => $customer->id,
                    'customer_email' => $customer->email,
                    'customer_first_name' => explode(' ', $customer->full_name)[0] ?? 'Cliente',
                    'customer_last_name' => trim(str_replace(explode(' ', $customer->full_name)[0] ?? '', '', $customer->full_name)) ?: 'Demo',
                    'customer_document_type' => 'dni',
                    'customer_document_number' => (string) ($customer->dni ?? ('7000001' . $index)),
                    'customer_mobile_phone' => (string) ($customer->phone ?? ('90000010' . $index)),
                    'voucher_type' => $scenario['voucher_type'],
                    'billing_ruc' => $scenario['voucher_type'] === 'factura' ? '20100070970' : null,
                    'billing_social_reason' => $scenario['voucher_type'] === 'factura' ? 'Daryza Demo SAC' : null,
                    'billing_fiscal_address' => $scenario['voucher_type'] === 'factura' ? 'Av Demo 123, Lima' : null,
                    'department_id' => $department->id,
                    'province_id' => $province->id,
                    'district_id' => $district->id,
                    'department_name' => $department->name,
                    'province_name' => $province->name,
                    'district_name' => $district->name,
                    'shipping_address_line' => 'Av. Demo ' . (100 + $index),
                    'shipping_number' => (string) (100 + $index),
                    'shipping_floor_apartment' => $index % 2 === 0 ? 'Piso 2' : null,
                    'shipping_reference' => 'Referencia demo ' . ($index + 1),
                    'currency' => 'PEN',
                    'subtotal' => $subtotal,
                    'delivery_cost' => $deliveryCost,
                    'discount_total' => 0,
                    'total' => $total,
                    'payment_method_id' => $scenario['method'] === 'bank_transfer' ? $paymentMethod->id : null,
                    'payment_method_type' => $scenario['method'],
                    'state' => $scenario['state'],
                    'placed_at' => now()->subDays(8 - $index),
                    'confirmed_at' => $isConfirmed ? now()->subDays(7 - $index) : null,
                    'paid_at' => $isPaid ? now()->subDays(7 - $index) : null,
                    'shipped_at' => $isShipped ? now()->subDays(6 - $index) : null,
                    'delivered_at' => $scenario['state'] === 'delivered' ? now()->subDays(5 - $index) : null,
                    'cancelled_at' => $scenario['state'] === 'cancelled' ? now()->subDays(4 - $index) : null,
                    'notes' => 'Orden demo generada por seeder',
                    'admin_notes' => 'Escenario: ' . $scenario['state'],
                ]
            );

            $order->items()->delete();
            $order->payments()->delete();
            $order->statusHistory()->delete();

            $order->items()->create([
                'product_id' => $variant->product_id,
                'variant_id' => $variant->id,
                'item_type' => 'product_variant',
                'product_name' => $variant->product?->name ?? 'Producto demo',
                'variant_sku' => $variant->sku,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'line_total' => $subtotal,
                'metadata' => [
                    'seed' => true,
                ],
            ]);

            $order->payments()->create([
                'payment_method_id' => $scenario['method'] === 'bank_transfer' ? $paymentMethod->id : null,
                'method' => $scenario['method'],
                'status' => $scenario['payment_record_status'],
                'amount' => $total,
                'voucher_url' => $scenario['method'] === 'bank_transfer' ? 'https://example.com/voucher-demo-' . ($index + 1) . '.pdf' : null,
                'voucher_uploaded_at' => $scenario['method'] === 'bank_transfer' ? now()->subDays(7 - $index) : null,
                'gateway_transaction_id' => $scenario['method'] === 'niubiz' ? 'NUBIZ-DEMO-' . ($index + 1) : null,
                'gateway_authorization_code' => $scenario['method'] === 'niubiz' ? 'AUTH' . ($index + 1) : null,
                'gateway_brand' => $scenario['method'] === 'niubiz' ? 'VISA' : null,
                'gateway_masked_card' => $scenario['method'] === 'niubiz' ? '411111******1111' : null,
                'gateway_payload' => $scenario['method'] === 'niubiz' ? ['seed' => true] : null,
                'paid_at' => $isPaid ? now()->subDays(7 - $index) : null,
                'rejected_at' => in_array($scenario['payment_record_status'], ['rejected', 'failed'], true) ? now()->subDays(6 - $index) : null,
            ]);

            $order->statusHistory()->create([
                'from_status' => null,
                'to_status' => 'pending',
                'changed_by_type' => 'system',
                'changed_by_id' => null,
                'note' => 'Orden demo creada',
            ]);

            if ($scenario['state'] !== 'pending_payment') {
                $order->statusHistory()->create([
                    'from_status' => 'pending_payment',
                    'to_status' => $scenario['state'],
                    'changed_by_type' => 'admin',
                    'changed_by_id' => null,
                    'note' => 'Transicion demo de estado',
                ]);
            }
        }

        $this->command?->info('OrderDemoSeeder ejecutado: ordenes demo creadas/actualizadas.');
    }
}
