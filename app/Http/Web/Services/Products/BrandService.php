<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\Brand;
use App\Http\Web\Services\GcsService;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\UploadedFile;

class BrandService
{
    public function __construct(
        protected GcsService $gcsService
    ) {}

    public function create(array $data): Brand
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $this->gcsService->uploadFile($data['image'], 'brands');
        }

        return Brand::create($data);
    }

    public function update(Brand $brand, array $data): Brand
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            if ($brand->image) {
                $this->gcsService->deleteFromPublicUrl($brand->image);
            }
            $data['image'] = $this->gcsService->uploadFile($data['image'], 'brands');
        }

        $brand->update($data);
        return $brand;
    }

    public function delete(Brand $brand): void
    {
        if ($brand->products()->exists()) {
            throw ValidationException::withMessages([
    'brand' => 'No se puede eliminar una marca con productos asociados.',
]);
        }
        if ($brand->image) {
            $this->gcsService->deleteFromPublicUrl($brand->image);
        }

        $brand->delete();
    }
}