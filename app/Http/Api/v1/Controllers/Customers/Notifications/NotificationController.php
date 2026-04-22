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
        // Obtenemos el ID del dispositivo del header
        $visitorId = $request->header('X-Device-ID');

        $data = $this->service->getNotifications(
            customerId: auth('api')->user()?->id,
            visitorId: $visitorId,
            perPage: (int) $request->get('per_page', 5),
        );

        return $this->success('Notificaciones obtenidas correctamente', $data);
    }

    public function publicNotifications(Request $request): JsonResponse
    {
        return $this->notifications($request);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->service->markAsRead(
            id: $id, 
            customerId: auth('api')->user()?->id,
            visitorId: $request->header('X-Device-ID')
        );

        return $this->success('Notificación marcada como leída.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->service->markAllAsRead(
            customerId: auth('api')->user()?->id,
            visitorId: $request->header('X-Device-ID')
        );

        return $this->success('Todas las notificaciones marcadas.');
    }

    public function deleteNotification(Request $request, string $id): JsonResponse
    {
        $this->service->deleteNotification(
            id: $id, 
            customerId: auth('api')->user()?->id,
            visitorId: $request->header('X-Device-ID')
        );

        return $this->success('Notificación eliminada.');
    }
}