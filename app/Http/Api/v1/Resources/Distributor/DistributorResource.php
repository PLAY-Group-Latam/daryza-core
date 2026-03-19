<?php

namespace App\Http\Api\v1\Resources\Distributor;

use App\Http\Web\Services\GcsService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistributorResource extends JsonResource
{
    
    const DEFAULT_IMAGE = '/images/daryza-default.png';

    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'region'     => $this->region,
            'name'       => $this->name,
            'ruc'        => $this->ruc,
            'address'    => $this->address,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'note'       => $this->note,
            'img_info'   => $this->img_info ?? self::DEFAULT_IMAGE,
            'coords'     => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}