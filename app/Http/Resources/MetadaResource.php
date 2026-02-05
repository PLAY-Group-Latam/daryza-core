<?php

namespace App\Http\Resources\Blogs;

use Illuminate\Http\Resources\Json\JsonResource;

class MetadataResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   */
  public function toArray($request): array
  {
    return [
      'id' => $this->id,
      'meta_title' => $this->meta_title,
      'meta_description' => $this->meta_description,
      'meta_keywords' => $this->meta_keywords,
      'og_title' => $this->og_title,
      'og_description' => $this->og_description,
      'og_image' => $this->og_image,
      'og_type' => $this->og_type,
      'canonical_url' => $this->canonical_url,
      'noindex' => $this->noindex,
      'nofollow' => $this->nofollow,
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }
}
