<?php

namespace App\Http\Web\Controllers\PaymentMethods;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\PaymentMethods\PaymenMethodsService;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        return Inertia::render('paymentmethods/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        // Validamos usando los nombres del Frontend (React useForm)
        $validated = $request->validate([
            'company_type'             => 'required|string|in:daryza,itp',
            'bank_name'                => 'required|string|max:255',
            'account_number'           => 'required|string|max:255',
            'interbank_account_number' => 'nullable|string|max:255',
            'is_active'                => 'boolean',
        ]);

        $this->service->store($validated);

        return redirect()->route('paymentMethods.index')
            ->with('success', 'Método de pago creado correctamente.');
    }

    public function edit(PaymentMethod $paymentMethod): Response
    {
        return Inertia::render('paymentmethods/Edit', [
            'paymentMethod' => $paymentMethod
        ]);
    }

    public function update(Request $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        // Validamos igual que en el store pero permitiendo que sean opcionales (sometimes)
        $validated = $request->validate([
            'company_type'             => 'sometimes|required|string|in:daryza,itp',
            'bank_name'                => 'sometimes|required|string|max:255',
            'account_number'           => 'sometimes|required|string|max:255',
            'interbank_account_number' => 'nullable|string|max:255',
            'is_active'                => 'boolean',
        ]);

        $this->service->update($paymentMethod, $validated);

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