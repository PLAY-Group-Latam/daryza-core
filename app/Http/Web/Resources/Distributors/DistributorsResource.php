<?php

namespace App\Http\Web\Resources\Distributors;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistributorsResource extends JsonResource
{
    public static $wrap = null;
    
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'region'            => $this->region,
            'ruc'               => $this->ruc,
            'address'           => $this->address,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'note'              => $this->note,
            'logo_pin'          => $this->logo_pin,          
            'establishment_img' => $this->establishment_img,  
            'coords'            => $this->coords,
            'created_at'        => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}