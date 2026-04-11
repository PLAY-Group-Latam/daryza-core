<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\BusinessLine;
use App\Http\Web\Services\GcsService;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\UploadedFile;

class BusinessLineService
{
    public function __construct(
        protected GcsService $gcsService
    ) {}

    public function create(array $data): BusinessLine
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $this->gcsService->uploadFile($data['image'], 'business-lines');
        }

        return BusinessLine::create($data);
    }

    public function update(BusinessLine $businessLine, array $data): BusinessLine
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            if ($businessLine->image) {
                $this->gcsService->deleteFromPublicUrl($businessLine->image);
            }
            $data['image'] = $this->gcsService->uploadFile($data['image'], 'business-lines');
        }

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
        if ($businessLine->image) {
            $this->gcsService->deleteFromPublicUrl($businessLine->image);
        }

        $businessLine->delete();
    }
}