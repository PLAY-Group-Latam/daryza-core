<?php

namespace App\Http\Api\v1\Services\Content;

use App\Models\Content\PageSection;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ContentService
{
   
   public function getSectionContent(string $slug, string $type, int $id): array
{
    try {
        Log::info('Buscando sección', [
            'slug' => $slug,
            'type' => $type,
            'id' => $id
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
            'content' => $section->content->content ?? null
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

        Log::error('Sección no encontrada', [
            'slug' => $slug,
            'type' => $type,
            'id' => $id
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

        return $sections->mapWithKeys(function ($section) {
            return [$section->type => $section->content->content ?? []];
        })->toArray();
    }
}