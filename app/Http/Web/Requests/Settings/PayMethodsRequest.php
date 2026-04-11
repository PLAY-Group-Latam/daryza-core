<?php

namespace App\Http\Web\Requests\Settings;

use App\Enums\Currency\CurrencyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayMethodsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
{
    $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
    
    $baseRules = $isUpdate ? ['sometimes', 'required'] : ['required'];

    return [
        'company_type'   => array_merge($baseRules, ['string', 'in:daryza,itp']),
        'bank_name'      => array_merge($baseRules, ['string', 'max:255']),
        'currency'       => array_merge($baseRules, [Rule::in(CurrencyType::values())]),
        'account_number' => array_merge($baseRules, ['string', 'max:255']),
        
        'interbank_account_number' => ['nullable', 'string', 'max:255'],
        'is_active'      => ['boolean'],
    ];
}
}