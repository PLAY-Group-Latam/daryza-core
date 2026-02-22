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
use App\Rules\Web\Content\Resolvers\BanksFieldResolver;
use App\Rules\Web\Content\Resolvers\ImageFieldResolver;
use App\Rules\Web\Content\Resolvers\TimeFieldResolver;
use App\Rules\Web\Content\Resolvers\CardsFieldResolver;
use App\Rules\Web\Content\Resolvers\BannerFieldResolver;
use App\Rules\Web\Content\Resolvers\BlogProductsItemsResolver;
use Illuminate\Support\Facades\Log;
class ContentRule implements ValidationRule
{
    private array $resolvers;

    public function __construct()
    {
        $this->resolvers = [
            new BrandsFieldResolver(),
            new MediaFieldResolver(),
            new TimeFieldResolver(),
            new DateFieldResolver(),
            new BlogProductsItemsResolver(),
            new ItemsFieldResolver(),
            new BannerFieldResolver(),
            new BanksFieldResolver(),
            new ImageFieldResolver(),
            new CardsFieldResolver(),
            new FallbackFieldResolver(),
            
           
        ];
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
         Log::info('ContentRule keys recibidas:', ['keys' => array_keys($value)]);
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