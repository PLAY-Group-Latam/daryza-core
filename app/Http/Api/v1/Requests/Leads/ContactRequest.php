<?php

namespace App\Http\Api\v1\Requests\Leads;

use App\Models\Leads\Lead;
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
           
            'type' => ['required', Rule::in([
                Lead::TYPE_HELP_CENTER, 
                Lead::TYPE_DISTRIBUTOR, 
                Lead::TYPE_ADVISOR, 
                Lead::TYPE_CUSTOMER_SERVICE
            ])],
            'full_name'    => 'required|string|max:255',
            'email'        => 'required|email',
            'phone_number' => 'nullable|string',

            'ruc_or_dni'   => 'required|string',
        
            'contact_reason'    => 'required_if:type,' . Lead::TYPE_HELP_CENTER,
            'purchase_document' => 'required_if:type,' . Lead::TYPE_HELP_CENTER,
            'purchase_date'     => 'required_if:type,' . Lead::TYPE_HELP_CENTER . '|date',
        
            'address'           => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR,
            'department'        => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR,
            'province'          => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR . ',' . Lead::TYPE_ADVISOR,
            'district'          => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR,
            'number_of_sellers' => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR,
            'company_name'      => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR . ',' . Lead::TYPE_ADVISOR,
            'other_products'    => 'nullable|string',
            'accepted_policy'   => 'required_if:type,' . Lead::TYPE_DISTRIBUTOR . '|boolean',

            'purchase_document_number' => 'required_if:type,' . Lead::TYPE_CUSTOMER_SERVICE,

            'comments' => 'nullable|string',
            'file_attached' => 'nullable|file|mimes:pdf,jpg,png,doc,docx|max:5120',
        ];
    }
}