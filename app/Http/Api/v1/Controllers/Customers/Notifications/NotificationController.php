<?php

namespace App\Http\Api\v1\Controllers\Customers\Notifications;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\Notifications\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiTrait;

    public function __construct(protected NotificationService $service) {}

   
    public function notifications(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user) {
            return $this->error('No autorizado', 401);
        }

        $data = $this->service->getNotifications(
            customerId: $user->id,
            perPage: min((int) $request->get('per_page', 5), 5),
        );

        return $this->success('Notificaciones obtenidas correctamente', $data);
    }

   
    public function publicNotifications(Request $request): JsonResponse
    {
        $data = $this->service->getNotifications(
            customerId: null, 
            perPage: min((int) $request->get('per_page', 5), 5),
        );

        return $this->success('Notificaciones públicas obtenidas', $data);
    }

   
    public function markAsRead(string $id): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) return $this->error('No autorizado', 401);

        $this->service->markAsRead($id, $user->id);

        return $this->success('Notificación marcada como leída.');
    }

  
    public function markAllAsRead(): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) return $this->error('No autorizado', 401);

        $this->service->markAllAsRead($user->id);

        return $this->success('Todas las notificaciones marcadas como leídas.');
    }

    public function dismissNotification(string $id): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) return $this->error('No autorizado', 401);

        $this->service->dismissNotification($id, $user->id);

        return $this->success('Notificación ocultada.');
    }


    public function sync(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) return $this->error('No autorizado', 401);

        $readIds = $request->input('readIds', []);
        $dismissedIds = $request->input('dismissedIds', []);

        $this->service->syncNotifications(
            customerId: $user->id,
            readIds: $readIds,
            dismissedIds: [] 
        );

        return $this->success('Notificaciones sincronizadas correctamente.');
    }
}