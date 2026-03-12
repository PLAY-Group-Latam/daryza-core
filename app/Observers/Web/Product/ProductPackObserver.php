<?php

namespace App\Observers\Web\Product;

use App\Http\Api\v1\Services\Notifications\NotificationService;
use App\Http\Web\Support\Products\UniqueSlugResolver;
use App\Models\Products\ProductPack;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductPackObserver
{
    public function creating(ProductPack $pack): void
    {
        if (empty($pack->code)) {
            $pack->code = 'PK-' . date('y') . '-' . strtoupper(Str::random(6));
        }

        if (empty($pack->slug)) {
            $pack->slug = app(UniqueSlugResolver::class)->resolve(
                ProductPack::class,
                Str::slug($pack->name),
                $pack->id,
                'pack'
            );
        }
    }

  public function created(ProductPack $pack): void
{
    DB::afterCommit(function () use ($pack) {
        app(NotificationService::class)->notifyNewPack($pack->fresh()); 
    });
}

    public function deleting(ProductPack $pack): void
    {
        if (!$pack->isForceDeleting()) {
            $pack->slug = app(UniqueSlugResolver::class)->resolve(
                ProductPack::class,
                $pack->slug . '-deleted-' . now()->timestamp,
                $pack->id,
                'pack'
            );
            $pack->save();
        }
    }

    public function restoring(ProductPack $pack): void
    {
        $pack->slug = app(UniqueSlugResolver::class)->resolve(
            ProductPack::class,
            Str::slug($pack->name),
            $pack->id,
            'pack'
        );
    }
}