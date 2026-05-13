<?php

namespace App\Http\Web\Services;

use App\Models\Customers\Customer;

use App\Models\Orders\OrderPayment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

use Exception;

class CustomerService
{
    /**
     * Crear un cliente junto con sus perfiles de facturación y direcciones.
     */
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        $query = Customer::query();

        // Aplicar búsqueda global si existe el parámetro 'search'
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ilike', "%{$search}%")
                  ->orWhere('full_last_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('dni', 'ilike', "%{$search}%");
            });
        }

        // Ordenar por los más recientes por defecto
        return $query->latest()
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString(); // 🚀 Importante: mantiene los filtros en los links de paginación
    }
    
    public function create(array $data): Customer
    {
        // Hash de password si viene en los datos
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // Crear y retornar el cliente
        return Customer::create($data);
    }

    public function updatePassword(string $id, string $newPassword): Customer
    {
        $customer = Customer::findOrFail($id);

        $customer->update([
            'password' => Hash::make($newPassword),
        ]);

        return $customer;
    }



public function getMetrics(string $customerId): array
{
    $stats = OrderPayment::where('status', 'approved')
        ->whereHas('order', function ($query) use ($customerId) {
            $query->where('customer_id', $customerId);
        })
        ->selectRaw('COUNT(DISTINCT order_id) as total_orders, SUM(amount) as total_spent')
        ->first();

    $totalOrders = (int) ($stats->total_orders ?? 0);
    $totalSpent = (float) ($stats->total_spent ?? 0);

    return [
        'total_orders' => $totalOrders,
        'total_spent' => 'S/ ' . number_format($totalSpent, 2),
        'average_order_value' => $totalOrders > 0 
            ? 'S/ ' . number_format($totalSpent / $totalOrders, 2) 
            : 'S/ 0.00',
    ];
}
   
}
