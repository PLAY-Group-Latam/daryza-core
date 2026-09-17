<?php

namespace App\Http\Web\Services\Settings;

use App\Models\Settings\DestinationEmail;
use Illuminate\Pagination\LengthAwarePaginator;

class DestinationEmailService
{
    public function paginate(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $page = (int) request()->query('page', 1);

        $query = DestinationEmail::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->orderByDesc('created_at');

        $total = $query->count();
        $items = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    public function store(array $data): DestinationEmail
    {
        return DestinationEmail::create($data);
    }

    public function update(DestinationEmail $destinationEmail, array $data): DestinationEmail
    {
        $destinationEmail->update($data);

        return $destinationEmail;
    }

    public function destroy(DestinationEmail $destinationEmail): void
    {
        $destinationEmail->delete();
    }

    public function toggle(DestinationEmail $destinationEmail): DestinationEmail
    {
        $destinationEmail->update([
            'is_active' => !$destinationEmail->is_active,
        ]);

        return $destinationEmail;
    }
}