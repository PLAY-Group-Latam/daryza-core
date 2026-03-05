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
        // Obtenemos el ID del usuario autenticado desde el Request
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        $wishlist = $this->WishListservice->getCustomerWishlist($customer->id);

        return $this->success(
            'Wishlist obtenida correctamente.',
            WishlistResource::collection($wishlist)
        );
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

        $result = $this->WishListservice->toggle(
            $customer->id,
            $validated['item_id'],
            $validated['type']
        );

        return $this->success($result['message'], [
            'action' => $result['action']
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