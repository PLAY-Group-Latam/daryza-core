<?php

namespace App\Http\Web\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AboutService 
{
    public function getPaginatedContacts(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $type = 'about_us';
        $search = $filters['search'] ?? null;

        $query = Lead::query()->where('leads.type', '=', $type);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $searchTerm = "%" . trim($search) . "%";
                $q->where('leads.full_name', 'ilike', $searchTerm)
                  ->orWhere('leads.email', 'ilike', $searchTerm)
                  ->orWhere('leads.phone', 'ilike', $searchTerm);

                $q->orWhereRaw("(leads.data->>'ruc_dni')::text ilike ?", [$searchTerm])
                  ->orWhereRaw("(leads.data->>'company_name')::text ilike ?", [$searchTerm])
                  ->orWhereRaw("(leads.data->>'last_name')::text ilike ?", [$searchTerm]);
            });
        }

        return $query->orderBy('leads.created_at', 'desc')
                     ->paginate($perPage)
                     ->withQueryString();
    }

    public function save(array $data): Lead
    {
        return DB::transaction(function () use ($data) {
            $type = 'about_us';

            $payload = [
                'type'      => $type,
                'full_name' => $data['fullName'],
                'email'     => $data['email'],
                'phone'     => $data['phone'],
                'status'    => Lead::STATUS_NEW,
                'data'      => $this->mapJsonFields($type, $data),
            ];

            return Lead::create($payload);
        });
    }

    protected function mapJsonFields(string $type, array $data): array
    {
        $common = ['created_at_form' => now()->toDateTimeString()];

        return array_merge($common, match ($type) {
            'about_us' => [
                'last_name'    => $data['lastName'] ?? null,
                'company_name' => $data['companyName'] ?? null,
                'ruc_dni'      => $data['rucOrDni'] ?? null,
                'comments'     => $data['comments'] ?? null,
            ],
            default => [],
        });
    }
}