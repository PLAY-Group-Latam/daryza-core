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
        // ==================== HOME ====================
        $home = Page::create([
            'title' => 'Home',
            'slug' => 'home',
            'type' => 'system',
            'status' => 'published'
        ]);

        $homeSections = [
            ['name' => 'Banner Dinámico', 'type' => 'home_banner'],
            ['name' => 'Marcas', 'type' => 'home_brands'],
            ['name' => 'Imagen Promocional', 'type' => 'home_promo_image'],
            ['name' => 'Imágenes Promocionales Dinámico', 'type' => 'home_promo_dynamic'],
            ['name' => 'Items de Atributos', 'type' => 'home_attributes'],
            ['name' => 'Modal', 'type' => 'home_modal'],
            ['name' => 'Titulos de Secciones ', 'type' => 'home_section_titles'],
        ];

        

       foreach ($homeSections as $index => $sec) {
    $section = PageSection::create([
        'page_id' => $home->id,
        'name' => $sec['name'],
        'type' => $sec['type'],
        'sort_order' => $index + 1,
        'is_active' => true,
    ]);

    $defaultContent = match($sec['type']) {
        'home_section_titles' => [
            'titles' => [
                ['key' => 'brands',       'label' => 'Marcas Aliadas'],
                ['key' => 'best_sellers', 'label' => 'Los más vendidos'],
                ['key' => 'pack',         'label' => 'Pack de Productos'],
                ['key' => 'blog',         'label' => 'Nuestro Blog'],
            ]
        ],
        default => [],
    };

    SectionContent::create([
        'page_section_id' => $section->id,
        'content' => $defaultContent,
    ]);
}


        // ==================== FOOTER ====================
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
            ['name' => 'Item Imágenes Bancos Dinámico', 'type' => 'footer_banks'],
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

        // ==================== TÉRMINOS Y CONDICIONES ====================
        $tyc = Page::create([
            'title' => 'Términos y Condiciones',
            'slug' => 'terminos-condiciones',
            'type' => 'legal',
            'status' => 'published'
        ]);

        $tycSection = PageSection::create([
            'page_id' => $tyc->id,
            'name' => 'Editor de Texto',
            'type' => 'tyc_editor',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $tycSection->id,
            'content' => ['text' => ''],
        ]);

        // ==================== POLÍTICAS ANTICORRUPCIÓN ====================
        $anticorrupcion = Page::create([
            'title' => 'Políticas Anticorrupción',
            'slug' => 'politicas-anticorrupcion',
            'type' => 'legal',
            'status' => 'published'
        ]);

        $anticorrupcionSection = PageSection::create([
            'page_id' => $anticorrupcion->id,
            'name' => 'Editor de Texto',
            'type' => 'anticorrupcion_editor',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $anticorrupcionSection->id,
            'content' => ['text' => ''],
        ]);

        // ==================== LIBRO DE RECLAMACIONES ====================
        $libro = Page::create([
            'title' => 'Libro de Reclamaciones',
            'slug' => 'libro-reclamaciones',
            'type' => 'legal',
            'status' => 'published'
        ]);

        $libroSection = PageSection::create([
            'page_id' => $libro->id,
            'name' => 'Editor de Texto',
            'type' => 'libro_editor',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $libroSection->id,
            'content' => ['text' => ''],
        ]);

        // ==================== TRABAJA CON NOSOTROS ====================
        $trabaja = Page::create([
            'title' => 'Trabaja con Nosotros',
            'slug' => 'trabaja-con-nosotros',
            'type' => 'page',
            'status' => 'published'
        ]);

        $trabajaSections = [
            ['name' => 'Banner Estático', 'type' => 'trabaja_banner'],
            ['name' => 'Imagen Formulario', 'type' => 'trabaja_form_image'],
        ];

        foreach ($trabajaSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $trabaja->id,
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

        // ==================== PÁGINA CONTACTO ====================
        $contacto = Page::create([
            'title' => 'Contacto',
            'slug' => 'contacto',
            'type' => 'page',
            'status' => 'published'
        ]);

        $contactoSections = [
            ['name' => 'Banner Estático', 'type' => 'contacto_banner'],
            ['name' => 'Oficina Central', 'type' => 'contacto_office'],
            ['name' => 'Horario de Atención', 'type' => 'contacto_hours'],
            ['name' => 'Correos', 'type' => 'contacto_emails'],
            ['name' => 'Redes Sociales', 'type' => 'contacto_socials'],
            ['name' => 'Centro Ayuda', 'type' => 'contacto_help'],
            ['name' => 'Red Comercial (Distribuidores)', 'type' => 'contacto_distributors'],
            ['name' => 'Asesor Comercial', 'type' => 'contacto_advisor'],
            ['name' => 'Servicio al Cliente', 'type' => 'contacto_service'],
        ];

        foreach ($contactoSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $contacto->id,
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

        // ==================== SERVICIO AL CLIENTE ====================
        $servicio = Page::create([
            'title' => 'Servicio al Cliente',
            'slug' => 'servicio-cliente',
            'type' => 'page',
            'status' => 'published'
        ]);

        $servicioSections = [
            ['name' => 'Banner Estático', 'type' => 'servicio_banner'],
            ['name' => 'Imagen Formulario', 'type' => 'servicio_form_image'],
        ];

        foreach ($servicioSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $servicio->id,
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

        // ==================== RED DE DISTRIBUIDORES ====================
        $distribuidores = Page::create([
            'title' => 'Red de Distribuidores',
            'slug' => 'red-distribuidores',
            'type' => 'page',
            'status' => 'published'
        ]);

        $distribuidoresSections = [
            ['name' => 'Banner Estático', 'type' => 'distribuidores_banner'],
            ['name' => 'Imagen Formulario', 'type' => 'distribuidores_form_image'],
            ['name' => 'Items Atributos', 'type' => 'distribuidores_attributes'],
        ];

        foreach ($distribuidoresSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $distribuidores->id,
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

        // ==================== CONTACTA CON UN ASESOR ====================
        $asesor = Page::create([
            'title' => 'Contacta con un Asesor',
            'slug' => 'contacta-asesor',
            'type' => 'page',
            'status' => 'published'
        ]);

        $asesorSections = [
            ['name' => 'Banner Estático', 'type' => 'asesor_banner'],
            ['name' => 'Imagen Formulario', 'type' => 'asesor_form_image'],
        ];

        foreach ($asesorSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $asesor->id,
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

        // ==================== CENTRO DE AYUDA ====================
        $ayuda = Page::create([
            'title' => 'Centro de Ayuda',
            'slug' => 'centro-ayuda',
            'type' => 'page',
            'status' => 'published'
        ]);

        $ayudaSections = [
            ['name' => 'Banner Estático', 'type' => 'ayuda_banner'],
            ['name' => 'Imagen Formulario', 'type' => 'ayuda_form_image'],
        ];

        foreach ($ayudaSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $ayuda->id,
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

        // ==================== PÁGINA DISTRIBUIDORES ====================
        $distribuidoresPage = Page::create([
            'title' => 'Distribuidores',
            'slug' => 'distribuidores',
            'type' => 'page',
            'status' => 'published'
        ]);

        $distribuidoresPageSection = PageSection::create([
            'page_id' => $distribuidoresPage->id,
            'name' => 'Banner Estático',
            'type' => 'distribuidores_page_banner',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $distribuidoresPageSection->id,
            'content' => [],
        ]);

        // ==================== PÁGINA BLOG ====================
        $blog = Page::create([
            'title' => 'Blog',
            'slug' => 'blog',
            'type' => 'page',
            'status' => 'published'
        ]);

        $blogSections = [
            ['name' => 'Banner Estático', 'type' => 'blog_banner'],
            ['name' => 'Imágenes Promocionales', 'type' => 'blog_promo_images'],
            ['name' => 'Seleccionar Productos', 'type' => 'blog_products'],
            ['name' => 'Imágenes Promocionales para Publicaciones', 'type' => 'blog_post_promo'],
        ];

        foreach ($blogSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $blog->id,
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

        // ==================== PÁGINA NOSOTROS ====================
        $nosotros = Page::create([
            'title' => 'Nosotros',
            'slug' => 'nosotros',
            'type' => 'page',
            'status' => 'published'
        ]);

        $nosotrosSections = [
            ['name' => 'Banner Estático', 'type' => 'nosotros_banner'],
            ['name' => 'Video', 'type' => 'nosotros_video'],
            ['name' => 'Sobre Nosotros', 'type' => 'nosotros_about'],
            ['name' => 'Nuestra Historia', 'type' => 'nosotros_history'],
            ['name' => 'Nuestro Propósito', 'type' => 'nosotros_purpose'],
            ['name' => 'Sostenibilidad', 'type' => 'nosotros_sustainability'],
            ['name' => 'Imagen Formulario', 'type' => 'nosotros_form_image'],
        ];

        foreach ($nosotrosSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $nosotros->id,
                'name' => $sec['name'],
                'type' => $sec['type'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            SectionContent::create([
                'page_section_id' => $section->id,
                'content' => in_array($sec['type'], ['nosotros_about', 'nosotros_history', 'nosotros_purpose', 'nosotros_sustainability']) 
                    ? ['text' => ''] 
                    : [],
            ]);
        }

        // ==================== PÁGINA FILTRADO ====================
        $filtrado = Page::create([
            'title' => 'Filtrado',
            'slug' => 'filtrado',
            'type' => 'page',
            'status' => 'published'
        ]);

        $filtradoSections = [
            ['name' => 'Banner Estático', 'type' => 'filtrado_banner'],
            ['name' => 'Imagen Promocional', 'type' => 'filtrado_promo'],
        ];

        foreach ($filtradoSections as $index => $sec) {
            $section = PageSection::create([
                'page_id' => $filtrado->id,
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

        // ==================== PÁGINA CARRITO ====================
        $carrito = Page::create([
            'title' => 'Carrito',
            'slug' => 'carrito',
            'type' => 'page',
            'status' => 'published'
        ]);

        $carritoSection = PageSection::create([
            'page_id' => $carrito->id,
            'name' => 'Imagen Promocional',
            'type' => 'carrito_promo',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $carritoSection->id,
            'content' => [],
        ]);

        // ==================== PÁGINA CHECKOUT ====================
        $checkout = Page::create([
            'title' => 'Checkout',
            'slug' => 'checkout',
            'type' => 'page',
            'status' => 'published'
        ]);

        $checkoutSection = PageSection::create([
            'page_id' => $checkout->id,
            'name' => 'Imagen Promocional',
            'type' => 'checkout_promo',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $checkoutSection->id,
            'content' => [],
        ]);

        // ==================== PÁGINA PERFIL ====================
        $perfil = Page::create([
            'title' => 'Perfil',
            'slug' => 'perfil',
            'type' => 'page',
            'status' => 'published'
        ]);

        $perfilSection = PageSection::create([
            'page_id' => $perfil->id,
            'name' => 'Imagen Promocional',
            'type' => 'perfil_promo',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $perfilSection->id,
            'content' => [],
        ]);

        // ==================== PÁGINA INFORMATIVA PRODUCTO ====================
        $productoInfo = Page::create([
            'title' => 'Información Producto',
            'slug' => 'producto-info',
            'type' => 'page',
            'status' => 'published'
        ]);

        $productoSection = PageSection::create([
            'page_id' => $productoInfo->id,
            'name' => 'Imagen Promocional',
            'type' => 'producto_promo',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SectionContent::create([
            'page_section_id' => $productoSection->id,
            'content' => [],
        ]);
    }
}