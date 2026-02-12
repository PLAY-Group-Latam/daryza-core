<?php

namespace App\Http\Web\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ContactService
{
    
   public function getPaginatedContacts(array $filters, int $perPage = 10): LengthAwarePaginator
{
    $type = $filters['type'] ?? 'help_center';
    $search = $filters['search'] ?? null;

    $query = Lead::query()->where('leads.type', '=', $type);

    if ($search) {
        $query->where(function ($q) use ($search) {
            $searchTerm = "%" . trim($search) . "%";
            $q->where('leads.full_name', 'ilike', $searchTerm)
              ->orWhere('leads.email', 'ilike', $searchTerm)
              ->orWhere('leads.phone', 'ilike', $searchTerm);

            $q->orWhereRaw("(leads.data->>'ruc_or_dni')::text ilike ?", [$searchTerm])
              ->orWhereRaw("(leads.data->>'rucOrDni')::text ilike ?", [$searchTerm])
              ->orWhereRaw("(leads.data->>'companyOrFullName')::text ilike ?", [$searchTerm]);
        });
    }

    $paginator = $query->orderBy('leads.created_at', 'desc')->paginate($perPage);

    $paginator->getCollection()->transform(function ($claim) {
        $jsonData = is_string($claim->data) ? json_decode($claim->data, true) : $claim->data;
        
       
        $flattened = array_merge($claim->toArray(), $jsonData ?? []);
        unset($flattened['data']);
        
        return (object) $flattened;
    });

    return $paginator->withQueryString();
}

    /**
     * CREAR: Guarda cualquier tipo de lead mapeando su JSON específico.
     */
    public function save(array $data): Lead
    {
        return DB::transaction(function () use ($data) {
            $type = $data['type'];

            $payload = [
                'type'      => $type,
                'full_name' => $data['full_name'],
                'email'     => $data['email'],
                'phone'     => $data['phone'] ?? ($data['phone_number'] ?? null),
                'status'    => Lead::STATUS_NEW,
                'data'      => $this->mapJsonFields($type, $data),
            ];

            if (isset($data['file_attached']) && $data['file_attached'] instanceof UploadedFile) {
                $payload['file_path'] = $data['file_attached']->store("leads/{$type}", 'public');
                $payload['file_original_name'] = $data['file_attached']->getClientOriginalName();
            }

            return Lead::create($payload);
        });
    }

    /**
     * DETALLES: Para el modal del administrador.
     */
    public function getDetails(string $id): Lead
    {
        return Lead::findOrFail($id);
    }

    /**
     * Mapea los campos específicos del formulario al formato JSON esperado.
     */

protected function mapJsonFields(string $type, array $data): array
{
    $common = ['created_at_form' => now()->toDateTimeString()];

    return array_merge($common, match ($type) {
        'help_center' => [
            'contact_reason'    => $data['contact_reason'] ?? null,
            'purchase_document' => $data['purchase_document'] ?? null,
            'purchase_date'     => $data['purchase_date'] ?? null,
            'ruc_or_dni'        => $data['ruc_or_dni'] ?? null,
            'comments'          => $data['comments'] ?? null,
        ],
        'distributor_network' => [
            'company_name'      => $data['company_name'] ?? null,
            'ruc_or_dni'        => $data['ruc_or_dni'] ?? null,
            'number_of_sellers' => $data['number_of_sellers'] ?? null,
            'address'           => $data['address'] ?? null,
            'department'        => $data['department'] ?? null,
            'district'          => $data['district'] ?? null,
            'province'          => $data['province'] ?? null,
            'other_products'    => $data['other_products'] ?? null,
            'comments'          => $data['comments'] ?? null,
        ],
        'customer_service' => [
            'ruc_or_dni'               => $data['ruc_or_dni'] ?? null,
            'purchase_document_number' => $data['purchase_document_number'] ?? null,
            'comments'                 => $data['comments'] ?? null,
        ],
        'sales_advisor' => [
            'ruc_or_dni'   => $data['ruc_or_dni'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'province'     => $data['province'] ?? null,
            'comments'     => $data['comments'] ?? null,
        ],
        default => [],
    });
}
}