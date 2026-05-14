<?php

namespace App\Http\Web\Services\Intention;

use App\Models\Events\EventLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseIntentionService
{
    /**
     * Obtiene los últimos eventos de cada cliente para la vista Index.
     */
   public function getAllPaginated(Request $request): LengthAwarePaginator
{
    $perPage = $request->integer('per_page', 10); // Captura dinámica
    $search = $request->query('search');

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
                $child->where('full_name', 'ilike', "%{$search}%")
                    ->orWhere('full_last_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        })
        ->orderBy('id', 'desc')
        ->paginate($perPage)
        ->withQueryString();
}

    /**
     * Guarda un nuevo log de evento.
     */
    public function store(EventLog $event): EventLog
    {
        $event->save();
        return $event;
    }

    /**
     * Obtiene el historial completo de un cliente específico para la vista Show.
     */
    public function getHistoryByCustomer(string $customerId, Request $request, int $perPage = 20): LengthAwarePaginator
    {
        return EventLog::query()
            ->with(['customer'])
            ->where('customer_id', $customerId)
            // Filtro por tipo de evento si se requiere en el futuro
            ->when($request->type, function($q, $type) {
                $q->where('event_type', 'ilike', "%{$type}%");
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }
}