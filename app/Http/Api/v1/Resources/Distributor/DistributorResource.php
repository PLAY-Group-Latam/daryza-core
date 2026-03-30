<?php

namespace App\Http\Api\v1\Resources\Distributor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistributorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'ruc'               => $this->ruc,
            'region'            => $this->region,
            'address'           => $this->address,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'note'              => $this->note,
            'establishment_img' => $this->establishment_img, 
            'coords' => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
            
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}