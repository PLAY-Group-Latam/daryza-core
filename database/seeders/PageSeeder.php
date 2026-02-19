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
            /*
            |--------------------------------------------------------------------------
            | 1. HOME
            |--------------------------------------------------------------------------
            | home_modal          → ModalEditor
            | home_banner         → BannerDinamicoEditor
            | home_brands         → BrandsEditor
            | home_promo_image    → ImagenPromocionalEditor
            | home_promo_dynamic  → ImagenesPromocionalesEditor
            | home_attributes     → AtributosEditor
            |--------------------------------------------------------------------------
            */
            $home = Page::create([
                'title'  => 'Home',
                'slug'   => 'home',
                'type'   => 'system',
                'status' => 'published',
            ]);

            $this->createSections($home, [
                ['home_modal',         'Modal',                  ['max_images' => 1, 'has_dates' => true, 'has_visibility' => true]],
                ['home_banner',        'Banner Dinámico',        []],
                ['home_brands',        'Marcas',                 []],
                ['home_promo_image',   'Imagen Promocional',     []],
                ['home_promo_dynamic', 'Imágenes Promocionales', ['dynamic' => true]],
                ['home_attributes',    'Items de Atributos',     ['max_items' => 4]],
                ['home_section_title',      'Titulo de Sección',[]],
            ]);

        /*
        |--------------------------------------------------------------------------
        | 2. FOOTER
        |--------------------------------------------------------------------------
        | Antes: 8 cards separadas
        | Ahora: 5 cards agrupadas lógicamente
        |
        | footer_logo_header   → LogoHeaderEditor
        | footer_logo_footer   → LogoFooterEditor
        | footer_contact_info  → ContactInfoEditor  ← teléfono + correo + oficina + horarios (UNIFICADO)
        | footer_socials       → SocialsEditor
        | footer_banks         → BanksEditor
        |--------------------------------------------------------------------------
        */
        $footer = Page::create([
            'title'  => 'Footer',
            'slug'   => 'footer',
            'type'   => 'system',
            'status' => 'published',
        ]);

        $this->createSections($footer, [
            ['footer_logo_header',  'Logo Header',             []],
            ['footer_logo_footer',  'Logo Footer',             []],
            ['footer_contact_info', 'Información de Contacto', []], 
            ['footer_banks',        'Bancos',                  ['dynamic' => true]],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. LEGALES
        |--------------------------------------------------------------------------
        | tyc_editor            → TermsConditionsEditor
        | anticorrupcion_editor → PrivacyPoliticEditor
        | libro_editor          → ComplaintsBookEditor
        |--------------------------------------------------------------------------
        */
        $legales = Page::create([
            'title'  => 'Legales',
            'slug'   => 'legales',
            'type'   => 'group',
            'status' => 'published',
        ]);

        $this->createSections($legales, [
            ['tyc_editor',            'Términos y Condiciones',   []],
            ['anticorrupcion_editor', 'Políticas Anticorrupción', []],
            ['libro_editor',          'Libro de Reclamaciones',   []],
        ], withText: true);

        /*
        |--------------------------------------------------------------------------
        | 4. CONTACTOS
        |--------------------------------------------------------------------------
        | Antes: 16 secciones individuales
        | Ahora: 6 cards, una por bloque lógico
        |
        | contact_general      → ContactGeneralEditor      ← banner + oficina + horario + correos + redes
        | contact_service      → ContactServiceEditor      ← banner + imagen formulario
        | contact_distributors → ContactDistributorsEditor ← banner + imagen formulario + atributos (máx 4)
        | contact_advisor      → ContactAdvisorEditor      ← banner + imagen formulario
        | contact_help         → ContactHelpEditor         ← banner + imagen formulario
        | contact_work         → ContactWorkEditor         ← banner + imagen formulario
        |--------------------------------------------------------------------------
        */
        $contactos = Page::create([
            'title'  => 'Contactos',
            'slug'   => 'contactos',
            'type'   => 'group',
            'status' => 'published',
        ]);

        $this->createSections($contactos, [
            ['contact_general',      'Información General',   []],
            ['contact_service',      'Servicio al Cliente',   []],
            ['contact_distributors', 'Red de Distribuidores', ['max_attributes' => 4]],
            ['contact_advisor',      'Asesor Comercial',      []],
            ['contact_help',         'Centro de Ayuda',       []],
            ['contact_work',         'Trabaja con Nosotros',  []],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 5. NOSOTROS
        |--------------------------------------------------------------------------
        | nosotros_banner        → NosotrosBannerEditor       ← banner estático (desktop + mobile)
        | nosotros_intro         → NosotrosIntroEditor        ← video + texto "Sobre Nosotros"
        | nosotros_historia      → NosotrosHistoriaEditor     ← años ilimitados, cada año con imagen + texto
        |                                                         content: { items: [{ year, image, text }] }
        | nosotros_proposito     → NosotrosPropositoEditor    ← texto enriquecido
        | nosotros_sostenibilidad→ NosotrosSostenibilidadEditor ← texto enriquecido
        | nosotros_formulario    → NosotrosFormularioEditor   ← imagen del formulario de contacto
        |--------------------------------------------------------------------------
        */
        $nosotros = Page::create([
            'title'  => 'Nosotros',
            'slug'   => 'nosotros',
            'type'   => 'page',
            'status' => 'published',
        ]);

        $this->createSections($nosotros, [
            ['nosotros_banner',         'Banner',            []],
            ['nosotros_intro',          'Intro',             []],
            ['nosotros_historia',       'Nuestra Historia',  ['items' => []]],
            ['nosotros_proposito',      'Nuestro Propósito', []],
            ['nosotros_sostenibilidad', 'Sostenibilidad',    []],
            ['nosotros_formulario',     'Imagen Formulario', []],
        ], withText: true);

        /*
        |--------------------------------------------------------------------------
        | 6. BLOG
        |--------------------------------------------------------------------------
        | blog_banner      → BlogBannerEditor
        | blog_promos      → BlogPromosEditor     (máx 3)
        | blog_products    → BlogProductsEditor
        | blog_post_promos → BlogPostPromosEditor (máx 2)
        |--------------------------------------------------------------------------
        */
        $blog = Page::create([
            'title'  => 'Blog',
            'slug'   => 'blog',
            'type'   => 'page',
            'status' => 'published',
        ]);

        $this->createSections($blog, [
            ['blog_banner',      'Banner',                       []],
            ['blog_promos',      'Imágenes Promocionales',       ['max_items' => 3]],
            ['blog_products',    'Seleccionar Productos',        []],
            ['blog_post_promos', 'Imágenes Promo Publicaciones', ['max_items' => 2]],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 7. SISTEMA
        |--------------------------------------------------------------------------
        | Antes: 7 secciones con prefijos [X] en el nombre
        | Ahora: 6 cards, una por página funcional, cada editor maneja sus campos
        |
        | sistema_filtrado       → SistemaFiltradoEditor      ← banner + promo
        | sistema_carrito        → SistemaCarritoEditor       ← promo
        | sistema_checkout       → SistemaCheckoutEditor      ← promo
        | sistema_perfil         → SistemaPerfilEditor        ← promo
        | sistema_producto       → SistemaProductoEditor      ← promo
        | sistema_distribuidores → SistemaDistribuidoresEditor ← banner
        |--------------------------------------------------------------------------
        */
        $sistema = Page::create([
            'title'  => 'Sistema',
            'slug'   => 'sistema',
            'type'   => 'group',
            'status' => 'published',
        ]);

        $this->createSections($sistema, [
            ['sistema_filtrado',       'Filtrado',             []],
            ['sistema_carrito',        'Carrito',              []],
            ['sistema_checkout',       'Checkout',             []],
            ['sistema_perfil',         'Perfil',               []],
            ['sistema_producto',       'Información Producto', []],
            ['sistema_distribuidores', 'Distribuidores',       []],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER
    |--------------------------------------------------------------------------
    */
    private function createSections(Page $page, array $sections, bool $withText = false): void
    {
        foreach ($sections as $index => [$type, $name, $settings]) {

            $section = PageSection::create([
                'page_id'    => $page->id,
                'name'       => $name,
                'type'       => $type,
                'sort_order' => $index + 1,
                'is_active'  => true,
                'settings'   => empty($settings) ? null : $settings,
            ]);

            SectionContent::create([
                'page_section_id' => $section->id,
                'content'         => ($withText && in_array($type, ['tyc_editor', 'anticorrupcion_editor', 'libro_editor', 'nosotros_intro', 'nosotros_content']))
                    ? ['text' => '']
                    : [],
            ]);
        }
    }
}