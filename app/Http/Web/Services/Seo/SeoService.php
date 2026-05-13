<?php

namespace App\Http\Web\Services\Seo;

use App\Models\Metadata;
use App\Http\Web\Services\GcsService; 
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
class SeoService
{
    protected GcsService $gcsService;

    public function __construct(GcsService $gcsService)
    {
        $this->gcsService = $gcsService;
    }

public function getAllPaginated(int $perPage = 10, ?string $search = null): LengthAwarePaginator
{
    return Metadata::with('metadatable')
        ->where('metadatable_type', 'App\Models\Content\Page')
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('meta_title', 'ilike', "%{$search}%")
                  // Usamos orWhereHas con un join manual o cast si Eloquent falla
                ->orWhereExists(function ($query) use ($search) {
    $query->select(DB::raw(1))
        ->from('pages')
        // Forzamos que el ID de la página se vea como texto para comparar con metadatable_id
        ->whereRaw('metadata.metadatable_id = pages.id::text')
        ->where('title', 'ilike', "%{$search}%");
});
            });
        })
        // IMPORTANTE: Si el error persiste, forzamos el cast en el join polimórfico
        // Pero primero prueba esta versión limpia que suele resolver el 42883
        ->orderBy('created_at', 'desc')
        ->paginate($perPage)
        ->withQueryString();
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