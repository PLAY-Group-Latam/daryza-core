<?php

namespace App\Http\Api\v1\Services\Seo;

use App\Models\Blogs\Blog;
use App\Models\Content\Page;
use App\Models\Content\PageSection;
use App\Models\JobsPortal\Job;
use App\Models\Landings\Landing;
use App\Models\Products\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Exception;

class SeoService
{
    private array $resolvers = [
        Page::class       => 'slug',
        Product::class    => 'slug',
        Blog::class       => 'slug',
        Job::class        => 'slug',
        Landing::class    => 'slug',
        PageSection::class => 'type',
    ];

    public function getMetadataBySlug(string $slug)
    {
        try {
            foreach ($this->resolvers as $modelClass => $column) {
                /** @var Model $model */
                $model = $modelClass::where($column, $slug)->first();
                if ($model && $model->metadata) {
                    return $model->metadata;
                }
            }

            return null;

        } catch (Exception $e) {
            Log::error("Error crítico en SeoService para el slug [{$slug}]: " . $e->getMessage());
            return null;
        }
    }
}