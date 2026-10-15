<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Model;

class WhatsappSetting extends Model
{
    protected $fillable = [
        'icon_url',
        'phone',
        'welcome_message',
        'hover_text',
    ];

    public static function instance(): static
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
