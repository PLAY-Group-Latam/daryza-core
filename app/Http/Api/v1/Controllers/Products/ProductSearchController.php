<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\Products\ProductSearchService;
use Illuminate\Http\Request;

class ProductSearchController extends Controller
{
    use ApiTrait;

 
    public function __construct(
        protected ProductSearchService $searchService
    ) {}

  
    public function suggest(Request $request)
    {
        try {
            $query = $request->query('q', '');

        
            if (mb_strlen($query) < 2) {
                return $this->success(
                    message: 'Query muy corta para sugerencias.',
                    data: [
                        'products'    => [],
                        'categories'  => [],
                        'suggestions' => []
                    ]
                );
            }

           
            $results = $this->searchService->getSuggestions($query);

            return $this->success(
                message: 'Sugerencias encontradas.',
                data: $results
            );

        } catch (\Exception $e) {
        
            return $this->error(
                message: 'Error al procesar la búsqueda.',
                errors: $e->getMessage()
            );
        }
    }
}