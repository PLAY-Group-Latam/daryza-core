<?php

namespace App\Http\Web\Controllers\Coupons;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Coupons\StoreCouponRequest;
use App\Http\Web\Requests\Coupons\UpdateCouponRequest;
use App\Http\Web\Services\Coupons\CouponService;
use App\Models\Coupons\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function __construct(
        protected CouponService $couponService,
    ) {}

    // ─── Index ────────────────────────────────────────────────

public function index(Request $request): Response
{
    $perPage = $request->integer('per_page', 10);
    $search = $request->string('search')->trim()->value();

    $coupons = $this->couponService->getPaginatedCoupons($perPage, $search);

    return Inertia::render('coupons/Index', [
        'coupons' => $coupons,
        'filters' => [
            'search' => $search,
        ],
    ]);
}

    // ─── Create ───────────────────────────────────────────────

    public function create(): Response
    {
        return Inertia::render('coupons/Create');
    }

    public function store(StoreCouponRequest $request)
    {
        try {
            $this->couponService->createCoupon($request->validated());

            return redirect()
                ->route('coupons.index')
                ->with('success', 'Cupón creado correctamente.');
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Error al crear el cupón.');
        }
    }

    // ─── Edit ─────────────────────────────────────────────────

    public function edit(string $id): Response
    {
        $coupon = $this->couponService->getCouponById($id);

        return Inertia::render('coupons/Edit', [
            'coupon' => $coupon,
        ]);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon)
    {
        try {
            $this->couponService->updateCoupon($coupon->id, $request->validated());

            return redirect()
                ->route('coupons.index')
                ->with('success', 'Cupón actualizado correctamente.');
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Error al actualizar el cupón.');
        }
    }

    // ─── Destroy ──────────────────────────────────────────────

    public function destroy(Coupon $coupon)
    {
        try {
            $this->couponService->deleteCoupon($coupon->id);

            return redirect()
                ->route('coupons.index')
                ->with('success', 'Cupón eliminado correctamente.');
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Error al eliminar el cupón.');
        }
    }

    public function searchProducts(Request $request): JsonResponse
    {
        return response()->json($this->couponService->searchProducts($request->get('q')));
    }

    public function searchPacks(Request $request): JsonResponse
    {
        return response()->json($this->couponService->searchPacks($request->get('q')));
    }

    public function searchBusinessDynamics(Request $request): JsonResponse
    {
        return response()->json($this->couponService->searchBusinessDynamics($request->get('q')));
    }

    public function searchCustomers(Request $request): JsonResponse
    {
        return response()->json($this->couponService->searchCustomers($request->get('q')));
    }

    public function searchCategories(Request $request): JsonResponse
    {
        return response()->json($this->couponService->searchCategories($request->get('q')));
    }
}
