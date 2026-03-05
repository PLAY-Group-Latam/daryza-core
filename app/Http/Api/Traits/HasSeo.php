<?php

namespace App\Http\Api\Traits;

use App\Models\Metadata;
use Illuminate\Support\Str;

trait HasSeo
{
    protected static function bootHasSeo()
    {
        static::created(function ($model) {
            // Evitamos duplicados si el Service manual se adelantó
            if ($model->metadata()->exists()) return;

            // Mapeo inteligente de datos del Excel / Modelo
            $title = $model->name ?? $model->title ?? 'Daryza';
            
            // Priorizamos brief_description (que viene del Excel) sobre description (que es HTML largo)
            $rawDescription = $model->brief_description ?? $model->description ?? $model->content ?? '';
            $description = Str::limit(strip_tags($rawDescription), 160);

            $model->metadata()->create([
                // SEO Básico
                'meta_title'       => $title,
                'meta_description' => $description,
                'meta_keywords'    => null,
                
                // Open Graph (Redes Sociales)
                'og_title'         => $title,
                'og_description'   => $description,
                // Si el modelo tiene imagen (por ejemplo en Blog) o dejamos null para productos (se sube después)
                'og_image'         => $model->image ?? null, 
                'og_type'          => (get_class($model) === 'App\Models\Products\Product') ? 'product' : 'website',
                
                // SEO Técnico - Usamos el slug que generaste en el Excel
                'canonical_url'    => $model->slug ? config('app.frontend_url') . "/productos/{$model->slug}" : null,
                'noindex'          => false,
                'nofollow'         => false,
            ]);
        });

        static::deleting(function ($model) {
            // Si el producto se va a la papelera (SoftDelete), el SEO también.
            // Si es ForceDelete, se borra de la DB.
            if (method_exists($model, 'isForceDeleting') && $model->isForceDeleting()) {
                $model->metadata()->forceDelete();
            } else {
                $model->metadata()->delete();
            }
        });
    }

    public function metadata()
    {
        return $this->morphOne(Metadata::class, 'metadatable');
    }
}