<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;
use App\Models\Content\PageSection;
use App\Models\Content\SectionContent;

class PageSeeder extends Seeder
{
    
    public function run(): void
    {
       
        $home = Page::create([
            'title' => 'Home',
            'slug' => 'home',
            'type' => 'system',
            'status' => 'published'
        ]);

        $homeSections = [
            ['name' => 'Modal de Inicio', 'type' => 'home_modal'],
            ['name' => 'Banner Dinámico', 'type' => 'home_banner'],
            ['name' => 'Banner Promocional', 'type' => 'home_promo'],
            ['name' => 'Beneficios', 'type' => 'home_benefits'],
            ['name' => 'Galería', 'type' => 'home_gallery'],
        ];

        foreach ($homeSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $home->id,
                'name' => $sec['name'],
                'type' => $sec['type'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            SectionContent::create([
                'page_section_id' => $section->id,
                'content' => [],
            ]);
        }

        $footer = Page::create([
            'title' => 'Footer',
            'slug' => 'footer',
            'type' => 'system',
            'status' => 'published'
        ]);

        $footerSections = [
            ['name' => 'Logo Header', 'type' => 'footer_logo_header'],
            ['name' => 'Logo Footer', 'type' => 'footer_logo_footer'],
            ['name' => 'Número', 'type' => 'footer_phone'],
            ['name' => 'Correo', 'type' => 'footer_email'],
            ['name' => 'Oficina Central', 'type' => 'footer_office'],
            ['name' => 'Horario de Atención', 'type' => 'footer_hours'],
            ['name' => 'Redes Sociales', 'type' => 'footer_socials'],
            ['name' => 'Bancos', 'type' => 'footer_banks'],
        ];

        foreach ($footerSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $footer->id,
                'name' => $sec['name'],
                'type' => $sec['type'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            SectionContent::create([
                'page_section_id' => $section->id,
                'content' => [],
            ]);
        }

      
        $tyc = Page::create([
            'title' => 'Términos y Condiciones',
            'slug' => 'terminos-condiciones',
            'type' => 'legal',
            'status' => 'published'
        ]);

        $tycSection = PageSection::create([
            'page_id' => $tyc->id,
            'name' => 'Contenido Términos',
            'type' => 'editor_text',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $tycSection->id,
            'content' => ['text' => 'Aquí va el contenido inicial editable'],
        ]);
    }
}
