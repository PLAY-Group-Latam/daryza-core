<?php

namespace App\Observers\Api;

use App\Models\Blogs\Blog;
use Illuminate\Support\Facades\Cache;

class BlogObserver
{
    /**
     * Handle the Blog "saved" event (created or updated).
     */
    public function saved(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }

    /**
     * Handle the Blog "deleted" event.
     */
    public function deleted(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }

    /**
     * Handle the Blog "restored" event (por si usas SoftDeletes).
     */
    public function restored(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }
}