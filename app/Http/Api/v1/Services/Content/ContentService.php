<?php

namespace App\Http\Api\v1\Services\Content;

use App\Models\Content\PageSection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ContentService
{
   
    public function getSectionContent(string $slug, string $type, int $id): array
{
    try {

        Log::info('Consultando sección', [
            'slug' => $slug,
            'type' => $type,
            'id'   => $id,
        ]);

        $section = PageSection::with(['content', 'page'])
            ->where('id', $id)
            ->where('type', $type)
            ->whereHas('page', function ($query) use ($slug) {
                $query->where('slug', $slug);
            })
            ->firstOrFail();

        Log::info('Sección encontrada', [
            'section_id' => $section->id,
            'section_type' => $section->type,
            'page_slug' => $section->page->slug,
        ]);

        return [
            'success' => true,
            'data' => $section->content->content ?? [],
            'metadata' => [
                'section_name' => $section->name,
                'updated_at' => $section->content->updated_at ?? null
            ]
        ];

    } catch (ModelNotFoundException $e) {

        Log::error('Sección NO encontrada', [
            'slug' => $slug,
            'type' => $type,
            'id'   => $id,
        ]);

        abort(404, 'La sección solicitada no existe o la ruta es inválida.');
    }
}


    public function getPageFullContent(string $slug): array
    {
        $sections = PageSection::with('content')
            ->whereHas('page', function ($query) use ($slug) {
                $query->where('slug', $slug);
            })
            ->orderBy('sort_order', 'asc')
            ->get();

        $hoy = Carbon::today();

        // En App\Http\Api\v1\Services\Content\ContentService.php

return $sections->mapWithKeys(function ($section) use ($hoy) {
    $content = $section->content->content ?? [];

    // Si no hay contenido, devolvemos objeto vacío pero con la llave del tipo
    if (empty($content)) {
        return [$section->type => new \stdClass()]; 
    }

    // Lógica de visibilidad...
    if (isset($content['is_visible'])) {
        $isVisible = filter_var($content['is_visible'], FILTER_VALIDATE_BOOLEAN);
        if (!$isVisible) return [$section->type => new \stdClass()];
    }

    // ... resto de validaciones de fecha ...

    return [$section->type => $content];
})->toArray();
    }
}
