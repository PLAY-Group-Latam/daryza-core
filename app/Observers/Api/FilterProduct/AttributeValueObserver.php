<?php

namespace App\Observers\Api\FilterProduct;

use App\Models\Products\AttributesValue;
use Illuminate\Support\Facades\Cache;

class AttributeValueObserver
{

   private function isBrand(AttributesValue $attributesValue): bool
    {
        if (!$attributesValue->attribute) {
            return false;
        }

        $name = strtolower($attributesValue->attribute->name ?? '');

        return str_contains($name, 'marca');
    }


    private function clearCache(): void
    {
        Cache::forget('sidebar_static_data');
    }

    public function created(AttributesValue $attributesValue): void
    {
        if ($this->isBrand($attributesValue)) {
            $this->clearCache();
        }
    }

    public function updated(AttributesValue $attributesValue): void
    {
        if ($this->isBrand($attributesValue)) {
            $this->clearCache();
        }
    }

    public function deleted(AttributesValue $attributesValue): void
    {
        if ($this->isBrand($attributesValue)) {
            $this->clearCache();
        }
    }

    public function restored(AttributesValue $attributesValue): void
    {
        if ($this->isBrand($attributesValue)) {
            $this->clearCache();
        }
    }

    public function forceDeleted(AttributesValue $attributesValue): void
    {
        if ($this->isBrand($attributesValue)) {
            $this->clearCache();
        }
    }
}