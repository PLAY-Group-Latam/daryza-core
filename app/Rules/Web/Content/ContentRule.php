<?php

namespace App\Rules\Web\Content;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Validator;
use App\Rules\Web\Content\Resolvers\MediaFieldResolver;
use App\Rules\Web\Content\Resolvers\BrandsFieldResolver;
use App\Rules\Web\Content\Resolvers\DateFieldResolver;
use App\Rules\Web\Content\Resolvers\FallbackFieldResolver;
use App\Rules\Web\Content\Resolvers\ItemsFieldResolver;

class ContentRule implements ValidationRule
{
    private array $resolvers;

    public function __construct()
    {
        $this->resolvers = [
            new BrandsFieldResolver(),
            new MediaFieldResolver(),
            new DateFieldResolver(),
            new ItemsFieldResolver(),
            new FallbackFieldResolver(),
        ];
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_array($value)) {
            $fail('El contenido debe ser un conjunto de datos válido.');
            return;
        }

        $rules = [];

        foreach ($value as $key => $val) {
            foreach ($this->resolvers as $resolver) {
                if ($resolver->matches($key)) {
                    $rules = array_merge($rules, $resolver->resolve($key, $val));
                    break;
                }
            }
        }

        $validator = Validator::make($value, $rules);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $fail($error);
            }
        }
    }
}