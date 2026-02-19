<?php

namespace App\Http\Web\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MetadataResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
            'canonical_url'    => $this->canonical_url,
            'og_title'         => $this->og_title,
            'og_description'   => $this->og_description,
            'noindex'          => (bool) $this->noindex,
            'nofollow'         => (bool) $this->nofollow,
        ];
    }
}