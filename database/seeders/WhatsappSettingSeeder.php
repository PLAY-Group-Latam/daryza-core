<?php

namespace Database\Seeders;

use App\Models\Settings\WhatsappSetting;
use Illuminate\Database\Seeder;

class WhatsappSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WhatsappSetting::updateOrCreate(
            ['id' => 1], // Busca si ya existe el registro con ID 1 para actualizarlo o crearlo
            [
                'icon_url' => 'https://storage.googleapis.com/daryza/static/globales/wsp.png',
                'phone' => '999999999',
                'welcome_message' => '¡Hola! Tengo algunas consultas sobre los productos de Daryza. ¿Podrían ayudarme?',
                'hover_text' => '¿Necesitas ayuda? Escríbenos por WhatsApp.',
            ]
        );
    }
}