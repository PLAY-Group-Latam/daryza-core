<?php

namespace App\Http\Api\v1\Controllers\Customers\WishList;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\WishList\WishListService;
use App\Http\Api\v1\Resources\WishList\WishlistResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WishListController extends Controller
{
    use ApiTrait;

    protected WishListService $WishListservice;

    public function __construct(WishListService $WishListservice)
    {
        $this->WishListservice = $WishListservice;
    }

    /**
     * Listado de favoritos del cliente
     */
    public function index(Request $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        // Limpia items que ya no existen y cuenta cuántos quitó
        $removed  = $this->WishListservice->purgeUnavailable($customer->id);
        $wishlist = $this->WishListservice->getCustomerWishlist($customer->id);

        // `data` se mantiene igual (la colección); el conteo va aparte
        return response()->json([
            'success'       => true,
            'message'       => 'Wishlist obtenida correctamente.',
            'data'          => WishlistResource::collection($wishlist),
            'removed_count' => $removed,
        ]);
    }

    /**
     * Agregar o quitar de favoritos (Toggle)
     */
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => 'required|string',
            'type'    => 'required|in:product,pack'
        ]);

        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        try {
            $result = $this->WishListservice->toggle(
                $customer->id,
                $validated['item_id'],
                $validated['type']
            );
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }

        return $this->success($result['message'], [
            'action' => $result['action'],
            'current_count' => $result['current_count'],
        ]);
    }

    public function count(Request $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        $count = $this->WishListservice->getCount($customer->id);

        return $this->success('Conteo de favoritos obtenido.', [
            'count' => $count
        ]);
    }
}