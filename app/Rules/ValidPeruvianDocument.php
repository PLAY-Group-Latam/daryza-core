<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPeruvianDocument implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) && !is_numeric($value)) {
            $fail('El documento no tiene un formato válido.');
            return;
        }

        $value = trim($value);
        
        $onlyNumbers = preg_replace('/[^0-9]/', '', $value);
        $lengthNumbers = strlen($onlyNumbers);

        if ($lengthNumbers === 8 && strlen($value) === 8) {
            return; 
        }
        
        if ($lengthNumbers === 11 && strlen($value) === 11) {
            if (!preg_match('/^(10|15|17|20)/', $onlyNumbers)) {
                $fail('El RUC debe comenzar con 10, 15, 17 o 20.');
            }
            return;
        }
        
        $lengthOriginal = strlen($value);
        if ($lengthOriginal >= 9 && $lengthOriginal <= 12) {
            if (!preg_match('/^[a-zA-Z0-9]+$/', $value)) {
                $fail('El Carné de Extranjería solo puede contener letras y números.');
                return;
            }
            return;
        }
    
        $fail('El documento debe ser DNI (8 dígitos), RUC (11 dígitos) o Carné de Extranjería (9 a 12 caracteres).');
    }
}