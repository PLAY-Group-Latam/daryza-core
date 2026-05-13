<?php

namespace App\Http\Web\Services\Settings;

use App\Models\Settings\PaymentMethod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PaymenMethodsService 
{
    /**
     * Traer todos los métodos de pago (para el Index)
     */
public function getPaginated(int $perPage = 10, array $filters = [])
{
    $query = PaymentMethod::query();

    if (!empty($filters['search'])) {
        $search = "%" . trim($filters['search']) . "%";
        $query->where(function ($q) use ($search) {
            $q->where('name', 'ilike', $search)
              ->orWhere('account_number', 'ilike', $search);
        });
    }

    return $query->latest()
        ->paginate($perPage)
        ->withQueryString();
}

    /**
     * Crear un nuevo registro
     */
    public function store(array $data): PaymentMethod
    {
        return DB::transaction(function () use ($data) {
            return PaymentMethod::create([
                'company_type'   => $data['company_type'],
                // MAPEADO: bank_name (del form) -> name (en DB)
                'name'           => $data['bank_name'], 
                'currency'       => $data['currency'], // <--- Agregado
                'account_number' => $data['account_number'],
                // MAPEADO: interbank_account_number (del form) -> extra_info (en DB)
                'extra_info'     => $data['interbank_account_number'] ?? null,
                'is_active'      => $data['is_active'] ?? true,
            ]);
        });
    }

    /**
     * Actualizar un registro existente
     */
    public function update(PaymentMethod $paymentMethod, array $data): bool
    {
        return DB::transaction(function () use ($paymentMethod, $data) {
            return $paymentMethod->update([
                'company_type'   => $data['company_type'] ?? $paymentMethod->company_type,
                // MAPEADO: bank_name -> name
                'name'           => $data['bank_name'] ?? $paymentMethod->name,
                'currency'       => $data['currency'] ?? $paymentMethod->currency,
                'account_number' => $data['account_number'] ?? $paymentMethod->account_number,
                // MAPEADO: interbank_account_number -> extra_info
                'extra_info'     => $data['interbank_account_number'] ?? $paymentMethod->extra_info,
                'is_active'      => isset($data['is_active']) ? $data['is_active'] : $paymentMethod->is_active,
            ]);
        });
    }

    /**
     * Eliminar un registro
     */
    public function delete(PaymentMethod $paymentMethod): bool
    {
        return $paymentMethod->delete();
    }
}
