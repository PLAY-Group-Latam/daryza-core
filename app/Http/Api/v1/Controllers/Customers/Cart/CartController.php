<?php

namespace App\Http\Api\v1\Controllers\Customers\Cart;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Cart\AddCartItemRequest;
use App\Http\Api\v1\Requests\Cart\UpdateCartItemQuantityRequest;
use App\Http\Api\v1\Resources\Cart\CartResource;
use App\Http\Api\v1\Services\Cart\CartService;
use App\Models\Customers\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiTrait;

    public function __construct(protected CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        $cart = $this->cartService->getCustomerCart($customer->id);

        return $this->success('Carrito obtenido correctamente.', new CartResource($cart));
    }

    public function add(AddCartItemRequest $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        $validated = $request->validated();

        try {
            $cart = $this->cartService->addItem(
                $customer->id,
                $validated['item_id'],
                $validated['type'],
                (int) ($validated['quantity'] ?? 1)
            );

            return $this->success('Producto agregado al carrito correctamente.', new CartResource($cart));
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    public function updateQuantity(UpdateCartItemQuantityRequest $request, CartItem $cartItem): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        try {
            $cart = $this->cartService->updateItemQuantity(
                $customer->id,
                $cartItem->load('item'),
                (int) $request->validated('quantity')
            );

            return $this->success('Cantidad actualizada correctamente.', new CartResource($cart));
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    public function remove(Request $request, CartItem $cartItem): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        try {
            $cart = $this->cartService->removeItem($customer->id, $cartItem);

            return $this->success('Item eliminado del carrito correctamente.', new CartResource($cart));
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    public function clear(Request $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        $cart = $this->cartService->clear($customer->id);

        return $this->success('Carrito vaciado correctamente.', new CartResource($cart));
    }

    public function count(Request $request): JsonResponse
    {
        $customer = $request->user();

        if (!$customer) {
            return $this->error('Usuario no autenticado', null, 401);
        }

        return $this->success('Conteo del carrito obtenido.', $this->cartService->count($customer->id));
    }
}

