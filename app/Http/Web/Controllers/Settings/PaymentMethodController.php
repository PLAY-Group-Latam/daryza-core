<?php

namespace App\Http\Web\Controllers\Settings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Settings\PaymenMethodsService;
use App\Http\Web\Requests\Settings\PayMethodsRequest; 
use App\Models\Settings\PaymentMethod;
use App\Enums\Currency\CurrencyType; 
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function __construct(
        protected PaymenMethodsService $service
    ) {}

public function index(Request $request): Response
{
    $perPage = (int) $request->input('per_page', 10);
    $search = $request->input('search');

    $paginatedPaymentMethods = PaymentMethod::query()
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('account_number', 'ilike', "%{$search}%");
            });
        })
        ->latest()
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('paymentmethods/Index', [
        'paginatedPaymentMethods' => $paginatedPaymentMethods,
        'filters' => ['search' => $search],
    ]);
}

    public function create(): Response
    {
        return Inertia::render('paymentmethods/Create', [
            'currencies' => CurrencyType::values()
        ]);
    }

    public function store(PayMethodsRequest $request): RedirectResponse
    {
        $this->service->store($request->validated());

        return redirect()->route('paymentMethods.index')
            ->with('success', 'Método de pago creado correctamente.');
    }

    public function edit(PaymentMethod $paymentMethod): Response
    {
        return Inertia::render('paymentmethods/Edit', [
            'paymentMethod' => $paymentMethod,
            'currencies'    => CurrencyType::values() // <--- También aquí para el select de edición
        ]);
    }

    public function update(PayMethodsRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $this->service->update($paymentMethod, $request->validated());

        return redirect()->route('paymentMethods.index')
            ->with('success', 'Método de pago actualizado con éxito.');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $this->service->delete($paymentMethod);

        return redirect()->back()
            ->with('success', 'Método de pago eliminado.');
    }
}