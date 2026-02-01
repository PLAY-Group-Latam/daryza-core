<?php

namespace App\Http\Web\Resources\Products;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductEditResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'slug' => $this->slug,
      'brief_description' => $this->brief_description,
      'description' => $this->description,
      'is_active' => $this->is_active,

      'category' => [
        'id' => $this->category?->id,
        'name' => $this->category?->name,
        'parent_id' => $this->category?->parent_id,
      ],

      'variants' => $this->variants->map(fn($variant) => [
        'id' => $variant->id,
        'sku' => $variant->sku,
        'price' => $variant->price,
        'promo_price' => $variant->promo_price,
        'is_on_promo' => $variant->is_on_promo,
        'stock' => $variant->stock,
        'is_main' => $variant->is_main,

        'attributes' => $variant->attributeValues->map(fn($av) => [
          'attribute_id' => $av->attribute->id,
          'attribute_name' => $av->attribute->name,
          'value_id' => $av->id,
          'value' => $av->value,
        ]),

        'media' => $variant->media->map(fn($media) => [
          'id' => $media->id,
          'url' => $media->file_path,
          'is_main' => $media->is_main,
        ]),
      ]),

      'specifications' => $this->specifications->map(fn($spec) => [
        'attribute_id' => $spec->attribute_id,
        'attribute_name' => $spec->attribute?->name,
        'value' => $spec->value,
      ]),

      'metadata' => [
        'meta_title' => $this->metadata?->meta_title,
        'meta_description' => $this->metadata?->meta_description,
        'meta_keywords' => $this->metadata?->meta_keywords,
        'og_type' => $this->metadata?->og_type,
        'canonical_url' => $this->metadata?->canonical_url,
        'noindex' => $this->metadata?->noindex,
        'nofollow' => $this->metadata?->nofollow,
      ],
    ];
  }
}
