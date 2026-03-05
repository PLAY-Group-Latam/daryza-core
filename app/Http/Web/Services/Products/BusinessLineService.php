<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\BusinessLine;
use Illuminate\Validation\ValidationException;

class BusinessLineService
{
    public function create(array $data): BusinessLine
    {
        return BusinessLine::create($data);
    }

    public function update(BusinessLine $businessLine, array $data): BusinessLine
    {
        $businessLine->update($data);
        return $businessLine;
    }

    public function delete(BusinessLine $businessLine): void
    {
        if ($businessLine->products()->exists()) {
            throw ValidationException::withMessages([
                'business_line' => 'No se puede eliminar una línea con productos asociados.',
            ]);
        }

        $businessLine->delete();
    }
}
