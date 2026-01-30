<?php

namespace App\Enums;

enum StorageFolder: string
{
    case TECHNICAL_SHEETS = 'technical_sheets';
    case PRODUCT_IMAGES = 'product_images';
    case PRODUCT_VIDEOS = 'product_videos';

    case VARIANTS_MEDIA = 'variants_media';
    case BANNERS = 'banners';
    // Agrega más según crezca tu proyecto
}
