<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPeruvianDocument implements ValidationRule
{
    
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        
        $cleaned = preg_replace('/[^0-9]/', '', $value);
        $length = strlen($cleaned);
     
        if ($length === 8) {
            return; 
        }
        
        if ($length === 9) {
            return;
        }
        
      
        if ($length === 11) {
            
            if (!preg_match('/^(10|15|17|20)/', $cleaned)) {
                $fail('El RUC debe comenzar con 10, 15, 17 o 20.');
                return;
            }
            return;
        }
    
        $fail('El documento debe ser DNI (8 dígitos), CE (9 dígitos) o RUC (11 dígitos).');
    }
}