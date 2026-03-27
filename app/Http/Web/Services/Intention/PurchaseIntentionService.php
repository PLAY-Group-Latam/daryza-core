<?php

namespace App\Http\Web\Services\Intention;

use App\Models\Events\EventLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseIntentionService
{
    public function getAllPaginated(Request $request, int $perPage = 15): LengthAwarePaginator
    {
        $search = $request->query('search');

        // Obtenemos los IDs de los últimos eventos por cada cliente
        // Cambiamos a pluck() para pasar un array limpio al whereIn
        $latestEventIds = EventLog::query()
            ->whereNotNull('customer_id')
            ->select(DB::raw('MAX(id) as last_id'))
            ->groupBy('customer_id')
            ->pluck('last_id');

        return EventLog::query()
            ->with(['customer'])
            ->whereIn('id', $latestEventIds)
            ->when($search, function ($q) use ($search) {
                $q->whereHas('customer', function ($child) use ($search) {
                    // Usamos ilike para PostgreSQL (Daryza usa Postgres)
                    $child->where('full_name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function store(EventLog $event): EventLog
    {
        $event->save();
        return $event;
    }

    public function getHistoryByCustomer(string $customerId, Request $request, int $perPage = 20): LengthAwarePaginator
    {
        return EventLog::query()
            ->with(['customer']) // <--- INDISPENSABLE para el Show.tsx
            ->where('customer_id', $customerId)
            ->when($request->type, fn($q, $type) => $q->where('event_type', $type))
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }
}
