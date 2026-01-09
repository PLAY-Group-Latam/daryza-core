<?php

namespace App\Http\Web\Controllers;

use App\Actions\Web\Customers\UpdateCustomerPassword;
use App\Http\Web\Requests\Customers\StoreCustomerRequest;
use App\Http\Web\Requests\Customers\UpdateCustomerRequest;
use App\Http\Web\Services\CustomerService;
use App\Models\Customers\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function __construct(protected CustomerService $customerService) {}

    public function index()
    {
        $perPage = request()->input('per_page', 10);
        $paginatedCustomers = Customer::with(['billingProfile', 'addresses'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->through(function ($customer) {
                // Ocultamos los IDs de las direcciones solo para el frontend
                $customer->addresses->each(function ($address) {
                    $address->makeHidden(['department_id', 'province_id', 'district_id']);
                });

                return $customer;
            });


        return Inertia::render('customers/Index', [
            'paginatedCustomers' => $paginatedCustomers,
        ]);
    }

    // public function create()
    // {
    //     return Inertia::render('customers/Create');
    // }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $this->customerService->create($request->validated());

        return back()->with('flash', [
            'type' => 'success',
            'message' => 'Cliente creado correctamente.',
        ]);
    }

    public function updatePassword(
        Request $request,
        string $customer,
        UpdateCustomerPassword $action
    ) {
        $action->execute($customer, $request);

        return back()->with(
            'success',
            'La contraseña del cliente se actualizó correctamente.'
        );
    }

    // public function edit(Customer $customer)
    // {
    //     $customer->load(['billingProfiles', 'addresses']);

    //     return Inertia::render('customers/Edit', [
    //         'customer' => $customer,
    //     ]);
    // }

    // public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    // {
    //     $this->customerService->update($customer, $request->validated());

    //     return back()->with('flash', [
    //         'type' => 'success',
    //         'message' => 'Cliente actualizado correctamente.',
    //     ]);
    // }

    // public function destroy(Customer $customer): RedirectResponse
    // {
    //     try {
    //         $this->customerService->delete($customer);

    //         return back()->with('flash', [
    //             'type' => 'success',
    //             'message' => 'Cliente eliminado correctamente.',
    //         ]);
    //     } catch (\Exception $e) {
    //         return back()->with('flash', [
    //             'type' => 'error',
    //             'message' => $e->getMessage(),
    //         ]);
    //     }
    // }
}
