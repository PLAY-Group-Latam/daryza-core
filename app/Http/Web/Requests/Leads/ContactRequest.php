<?php

namespace App\Http\Web\Requests\Leads;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

   public function rules(): array
{
    return [
        'type'      => ['required', Rule::in(['help_center', 'distributor_network', 'customer_service', 'sales_advisor'])],
        'full_name' => ['required', 'string', 'max:255'],
        'email'     => ['required', 'email', 'max:255'],
        'phone'     => ['required', 'string', 'max:20'],
        'ruc_or_dni'=> ['required', 'string', 'min:8', 'max:11'],
        'comments'  => ['nullable', 'string'],
        
       
        'contact_reason'    => ['required_if:type,help_center', 'string'],
        'purchase_document' => ['required_if:type,help_center', 'string'],
        'purchase_date'     => ['required_if:type,help_center', 'date'],

       
        'company_name'      => ['required_if:type,distributor_network,sales_advisor', 'string'],
        'province'          => ['required_if:type,distributor_network,sales_advisor', 'string'],
        
       
        'address'           => ['required_if:type,distributor_network', 'string'],
        'district'          => ['required_if:type,distributor_network', 'string'],
        'number_of_sellers' => ['required_if:type,distributor_network', 'numeric'],
        'other_products'    => ['nullable', 'string'],

        'purchase_document_number' => ['required_if:type,customer_service', 'string'], 
        
        'file_attached'     => ['nullable', 'file', 'mimes:pdf,jpg,png,doc,docx', 'max:5120'],
    ];
}
}