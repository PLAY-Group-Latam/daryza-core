<?php

namespace App\Http\Web\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NewsLetterService
{
    public function getPaginated(array $filters = [], int $defaultPerPage = 15): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        
        $perPage = (int) ($filters['per_page'] ?? $defaultPerPage);

        return Lead::query()
            ->byType(Lead::TYPE_NEWSLETTER)
            ->when($search, function ($query, $search) {
                $query->where('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function save(array $data): Lead
    {
        return Lead::create([
            'type'      => Lead::TYPE_NEWSLETTER,
            'email'     => $data['email'],
            'full_name' => $data['full_name'] ?? 'Suscriptor Newsletter',
            'phone'     => $data['phone'] ?? '-',
            'data'      => $data['data'] ?? [],
        ]);
    }

    public function delete(Lead $subscription): bool
    {
        return $subscription->delete();
    }
}