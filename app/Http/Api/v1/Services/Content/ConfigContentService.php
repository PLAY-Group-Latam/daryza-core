<?php

namespace App\Http\Api\v1\Services\Content;

use App\Models\Content\PageSection;
use Illuminate\Support\Facades\Cache;

class ConfigContentService 
{
    
    public function getSectionsMap(): array
    {
       
        return Cache::remember('frontend_sections_map', 3600, function () {
          
            $sections = PageSection::with('page')->get();

            $map = [];

            foreach ($sections as $section) {
                $pageSlug = $section->page->slug;
                $sectionType = $section->type;

              
                if (!isset($map[$pageSlug])) {
                    $map[$pageSlug] = [];
                }

                $map[$pageSlug][$sectionType] = [
                    'id'    => $section->id,
                    'slug'  => $pageSlug,
                    'type'  => $sectionType,
                    'name'  => $section->name,
                ];
            }

            return $map;
        });
    }
}