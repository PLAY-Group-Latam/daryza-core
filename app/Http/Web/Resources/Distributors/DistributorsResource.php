<?php

namespace App\Http\Web\Resources\Distributors;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistributorsResource extends JsonResource
{
    /**
     * Transformar el recurso en un array.
     */

    public static $wrap = null;
    
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'region'   => $this->region,
            'ruc'      => $this->ruc,
            'address'  => $this->address,
            'email'    => $this->email,
            'phone'    => $this->phone,
            'note'     => $this->note,
            'img_info' => $this->img_info,
            'coords'   => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}