<?php

namespace App\Http\Api\v1\Controllers\Customers\Notifications;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Customers\Notification;
use App\Models\Customers\NotificationRead;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Método privado para no repetir la lógica de identificación
    private function getIdentifier(Request $request)
    {
        $user = auth('api')->user();
        return [
            'customer_id' => $user?->id,
            'visitor_id'  => $user ? null : $request->ip(),
        ];
    }

    public function notifications(Request $request)
{
    $idfs = $this->getIdentifier($request);
    $perPage = (int) $request->get('per_page', 5);

    // 1. Obtener los IDs de notificaciones que el usuario ELIMINÓ
    $deletedIds = NotificationRead::where('is_deleted', true)
        ->where(function($q) use ($idfs) {
            if ($idfs['customer_id']) {
                $q->where('customer_id', $idfs['customer_id']);
            } else {
                $q->where('visitor_id', $idfs['visitor_id']);
            }
        })
        ->pluck('notification_id')
        ->toArray();

    // 2. Obtener el mapa de leídas (excluyendo las eliminadas)
    $readMap = NotificationRead::where('is_deleted', false)
        ->where(function($q) use ($idfs) {
            if ($idfs['customer_id']) {
                $q->where('customer_id', $idfs['customer_id']);
            } else {
                $q->where('visitor_id', $idfs['visitor_id']);
            }
        })
        ->pluck('read_at', 'notification_id');

    // 3. Consultar las notificaciones REALES que no están en la lista de eliminadas
    $paginator = Notification::whereNotIn('id', $deletedIds)
        ->orderByDesc('created_at')
        ->paginate($perPage);

    $data = $paginator->getCollection()->map(fn(Notification $n) => [
        'id'      => $n->id,
        'data'    => $n->data,
        'read_at' => $readMap[$n->id] ?? null, 
    ]);

    // 4. Contador de no leídas (no eliminadas Y no presentes en readMap)
    $unreadTotal = Notification::whereNotIn('id', array_merge($deletedIds, $readMap->keys()->toArray()))->count();

    return $this->success('Notificaciones obtenidas correctamente', [
        'data'        => $data,
        'total'       => (int) $unreadTotal,
        'currentPage' => $paginator->currentPage(),
        'lastPage'    => $paginator->lastPage(),
    ]);
}

    public function publicNotifications(Request $request)
    {
        return $this->notifications($request);
    }

    public function markAsRead(Request $request, string $id)
    {
        $idfs = $this->getIdentifier($request);

        NotificationRead::updateOrCreate(
            [
                'notification_id' => $id,
                'customer_id'     => $idfs['customer_id'],
                'visitor_id'      => $idfs['visitor_id'],
            ],
            ['read_at' => now(), 'is_deleted' => false]
        );

        return $this->success('Notificación marcada como leída.');
    }

    public function markAllAsRead(Request $request)
    {
        $idfs = $this->getIdentifier($request);
        $allIds = Notification::pluck('id');

        // Procesamos todas para que el visitante también las vea como leídas
        foreach ($allIds as $notifId) {
            NotificationRead::updateOrCreate(
                [
                    'notification_id' => $notifId,
                    'customer_id'     => $idfs['customer_id'],
                    'visitor_id'      => $idfs['visitor_id'],
                ],
                ['read_at' => now(), 'is_deleted' => false]
            );
        }

        return $this->success('Todas las notificaciones marcadas.');
    }

    public function deleteNotification(Request $request, string $id)
{
    $idfs = $this->getIdentifier($request);

    // Buscamos por la combinación única de notificación + usuario/ip
    NotificationRead::updateOrCreate(
        [
            'notification_id' => $id,
            'customer_id'     => $idfs['customer_id'],
            'visitor_id'      => $idfs['visitor_id'],
        ],
        [
            'is_deleted' => true,
            // Opcional: también podrías marcarla como leída al eliminarla
            'read_at' => now() 
        ]
    );

    return $this->success('Notificación eliminada.');
}
}