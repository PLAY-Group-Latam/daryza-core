<?php

namespace App\Http\Web\Controllers\Settings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Settings\PaymenMethodsService;
use App\Http\Web\Requests\Settings\PayMethodsRequest; 
use App\Models\Settings\PaymentMethod;
use App\Enums\Currency\CurrencyType; 
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function __construct(
        protected PaymenMethodsService $service
    ) {}

    public function index(): Response
    {
        return Inertia::render('paymentmethods/Index', [
            'paymentMethods' => $this->service->getAll()
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