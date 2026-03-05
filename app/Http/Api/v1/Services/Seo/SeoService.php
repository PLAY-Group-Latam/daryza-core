<?php

namespace App\Http\Api\v1\Services\Seo;

use App\Models\Content\Page;
use App\Models\Content\PageSection;
use App\Models\Products\Product;
use App\Models\Blogs\Blog;
// use App\Models\Jobs\Job; 
use Illuminate\Support\Facades\Log;
use Exception;

class SeoService
{
    
    public function getMetadataBySlug(string $slug)
    {
        try {
          
            $page = Page::where('slug', $slug)->first();
            if ($page && $page->metadata) {
                return $page->metadata;
            }

            $product = Product::where('slug', $slug)->first();
            if ($product && $product->metadata) {
                return $product->metadata;
            }

            $blog = Blog::where('slug', $slug)->first();
            if ($blog && $blog->metadata) {
                return $blog->metadata;
            }
            // 4. ¿Es una vacante de trabajo (Job)?
            /* $job = Job::where('slug', $slug)->first();
            if ($job && $job->metadata) {
                return $job->metadata;
            } 
            */
            $section = PageSection::where('type', $slug)->first();
            if ($section && $section->metadata) {
                return $section->metadata;
            }

            return null;

        } catch (Exception $e) {
            Log::error("Error crítico en SeoService para el slug [{$slug}]: " . $e->getMessage());
            return null;
        }
    }
}