<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPeruvianPhone implements ValidationRule
{
    
  public function validate(string $attribute, mixed $value, Closure $fail): void
{
    if (!preg_match('/^[0-9]+$/', $value)) {
        $fail('El teléfono solo debe contener números.');
        return;
    }

    $length = strlen($value);
    
    if ($length < 7 || $length > 9) {
        $fail('El teléfono debe tener entre 7 y 9 dígitos.');
        return;
    }
    
    if ($length === 9 && !str_starts_with($value, '9')) {
        $fail('Los números celulares deben comenzar con 9.');
    }
}
}