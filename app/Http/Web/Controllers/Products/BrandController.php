<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreBrandRequest;
use App\Http\Web\Requests\Products\UpdateBrandRequest;
use App\Http\Web\Services\Products\BrandService;
use App\Models\Products\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService,
    ) {}

    public function index(): Response
    {
        $perPage = request()->integer('per_page', 10);

        $brands = Brand::latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('products/brands/Index', [
            'paginatedBrands' => $brands,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/brands/Create');
    }

    public function store(StoreBrandRequest $request): RedirectResponse
    {
        $this->brandService->create($request->validated());

        return redirect()
            ->route('products.brands.index')
            ->with('success', 'Marca creada con éxito');
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('products/brands/Edit', [
            'brand' => $brand,
        ]);
    }

    public function update(UpdateBrandRequest $request, Brand $brand): RedirectResponse
    {
        $this->brandService->update($brand, $request->validated());

        return redirect()
            ->route('products.brands.index')
            ->with('success', 'Marca actualizada con éxito');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        try {
            $this->brandService->delete($brand);

            return redirect()
                ->route('products.brands.index')
                ->with('success', 'Marca eliminada correctamente');

        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }
}