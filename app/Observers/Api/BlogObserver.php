<?php

namespace App\Observers\Api;

use App\Models\Blogs\Blog;
use Illuminate\Support\Facades\Cache;

class BlogObserver
{
    public function created(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }

    public function saved(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }

    public function deleted(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }

    public function restored(Blog $blog): void
    {
        Cache::forget('blogs:latest_public');
    }
}