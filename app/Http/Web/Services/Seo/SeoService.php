<?php

namespace App\Http\Web\Services\Seo;

use App\Models\Metadata;
use App\Http\Web\Services\GcsService; 
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class SeoService
{
    protected GcsService $gcsService;

    public function __construct(GcsService $gcsService)
    {
        $this->gcsService = $gcsService;
    }

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return Metadata::with('metadatable')
            ->where('metadatable_type', 'App\Models\Content\Page')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getById(string $id): Metadata
    {
        return Metadata::with('metadatable')->findOrFail($id);
    }

   public function update(Metadata $seo, array $data, ?UploadedFile $ogImageFile = null): Metadata
{
    if ($ogImageFile) {

        if (!empty($seo->og_image)) {
            $this->gcsService->deleteFromPublicUrl($seo->og_image);
        }

        $filename = 'og-image-' . Str::ulid();
        $publicUrl = $this->gcsService->uploadFile($ogImageFile, 'img/seo', $filename);

        $data['og_image'] = $publicUrl;
    } else {

        unset($data['og_image']);
    }

    $seo->update($data);
    
    return $seo;
}
}