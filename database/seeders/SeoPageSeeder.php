<?php

namespace Database\Seeders;

use App\Models\Content\Page;
use App\Models\Metadata;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SeoPageSeeder extends Seeder
{
    public function run(): void
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $brand = "Daryza";

        $pages = [
            // --- HOME & GLOBALES ---
            [
                'slug' => 'home',
                'title' => 'Inicio',
                'path' => '/',
                'meta_title' => "Expertos en Limpieza y Desinfección | $brand",
                'meta_description' => 'Soluciones integrales de higiene industrial y del hogar en el Perú con más de 30 años de experiencia.',
                'is_static' => false 
            ],

            // --- NOSOTROS ---
            [
                'slug' => 'nosotros',
                'title' => 'Nosotros',
                'path' => '/nosotros',
                'meta_title' => "Nuestra Historia y Propósito | $brand",
                'meta_description' => 'Conoce el compromiso de Daryza con la calidad, sostenibilidad y la higiene de las familias peruanas.',
                'is_static' => false
            ],

            // --- LEGALES (Mapeo exacto de FRONTEND_ROUTE_MAP) ---
            [
                'slug' => 'terminos-y-condiciones',
                'title' => 'Términos y Condiciones',
                'path' => '/terminos-y-condiciones',
                'meta_title' => "Términos y Condiciones de Uso | $brand",
                'meta_description' => 'Información legal, condiciones de compra y políticas de servicio de nuestra tienda virtual.',
                'is_static' => true
            ],
            [
                'slug' => 'politica-de-privacidad',
                'title' => 'Política de Privacidad',
                'path' => '/politica-de-privacidad',
                'meta_title' => "Protección de Datos Personales | $brand",
                'meta_description' => 'Conoce cómo tratamos y protegemos tu información bajo la Ley de Protección de Datos.',
                'is_static' => true
            ],
            [
                'slug' => 'libro-de-reclamaciones',
                'title' => 'Libro de Reclamaciones',
                'path' => '/libro-de-reclamaciones',
                'meta_title' => "Libro de Reclamaciones Virtual | $brand",
                'meta_description' => 'Conforme a lo establecido por INDECOPI, ponemos a tu disposición nuestro libro virtual.',
                'is_static' => true
            ],

            // --- CONTACTO Y SUS SUB-RUTAS ---
            [
                'slug' => 'contacto',
                'title' => 'Contacto',
                'path' => '/contacto',
                'meta_title' => "Comunícate con Nosotros | $brand",
                'meta_description' => '¿Tienes dudas? Contáctanos para ventas, soporte o consultas generales.',
                'is_static' => true
            ],
            [
                'slug' => 'centro-de-ayuda',
                'title' => 'Centro de Ayuda',
                'path' => '/contacto/centro-de-ayuda',
                'meta_title' => "Preguntas Frecuentes y Ayuda | $brand",
                'meta_description' => 'Todo lo que necesitas saber sobre tus pedidos, envíos y medios de pago.',
                'is_static' => true
            ],
            [
                'slug' => 'servicio-cliente',
                'title' => 'Servicio al Cliente',
                'path' => '/contacto/servicio-cliente',
                'meta_title' => "Atención al Cliente Especializada | $brand",
                'meta_description' => 'Canales de soporte directo para nuestros clientes y usuarios.',
                'is_static' => true
            ],
            [
                'slug' => 'red-comercial',
                'title' => 'Red Comercial',
                'path' => '/contacto/red-comercial',
                'meta_title' => "Distribuidores y Red Comercial | $brand",
                'meta_description' => 'Encuentra nuestros puntos de venta y red de distribuidores autorizados.',
                'is_static' => true
            ],
            [
                'slug' => 'asesoria',
                'title' => 'Asesoría Comercial',
                'path' => '/contacto/asesoria',
                'meta_title' => "Asesoría Técnica y Comercial | $brand",
                'meta_description' => 'Solicita asesoría especializada para implementar soluciones de limpieza en tu empresa.',
                'is_static' => true
            ],
            [
                'slug' => 'trabajos',
                'title' => 'Trabaja con Nosotros',
                'path' => '/trabajos',
                'meta_title' => "Únete a nuestro Equipo de Trabajo | $brand",
                'meta_description' => 'Desarrolla tu talento con nosotros. Revisa nuestras vacantes actuales.',
                'is_static' => true
            ],
            [
                'slug' => 'distribuidores',
                'title' => 'Distribuidores Autorizados',
                'path' => '/distribuidores',
                'meta_title' => "Locales y Puntos de Distribuidores Autorizados | $brand",
                'meta_description' => 'Encuentra el distribuidor autorizado de productos Daryza más cercano a tu ubicación en todo el Perú.',
                'is_static' => true
            ],

            // --- BLOG ---
            [
                'slug' => 'blog',
                'title' => 'Blog Daryza',
                'path' => '/blog',
                'meta_title' => "Tips de Limpieza y Novedades | $brand",
                'meta_description' => 'Guías prácticas, noticias del sector y consejos para mantener tus espacios impecables.',
                'is_static' => false
            ],

            // --- PRODUCTOS Y TIENDA (SISTEMA) ---
            [
                'slug' => 'productos',
                'title' => 'Catálogo de Productos',
                'path' => '/productos',
                'meta_title' => "Línea Completa de Productos de Limpieza | $brand",
                'meta_description' => 'Compra online: desinfectantes, jabones, detergentes y más soluciones de alta eficacia.',
                'is_static' => true
            ],
            [
                'slug' => 'carrito',
                'title' => 'Mi Carrito de Compras',
                'path' => '/carrito',
                'meta_title' => "Tu Carrito | $brand",
                'meta_description' => 'Revisa y gestiona los productos seleccionados antes de finalizar tu compra.',
                'noindex' => true,
                'is_static' => true
            ],
            [
                'slug' => 'checkout',
                'title' => 'Finalizar mi Compra',
                'path' => '/checkout',
                'meta_title' => "Pago Seguro | $brand",
                'meta_description' => 'Completa tu pedido de forma rápida y segura a través de nuestra pasarela.',
                'noindex' => true,
                'is_static' => true
            ],
            [
                'slug' => 'pedidos',
                'title' => 'Mis Pedidos e Historial',
                'path' => '/pedidos',
                'meta_title' => "Estado de mis Pedidos | $brand",
                'meta_description' => 'Accede a tu cuenta para ver el seguimiento de tus pedidos y compras anteriores.',
                'noindex' => true,
                'is_static' => true
            ],
        ];

        foreach ($pages as $p) {
            $page = Page::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'title'  => $p['title'],
                    'status' => 'published',
                    'type'   => $p['is_static'] ? 'system' : 'page', 
                ]
            );

            $page->metadata()->updateOrCreate(
                [
                    'metadatable_id'   => $page->id,
                    'metadatable_type' => Page::class,
                ],
                [
                    'id'               => (string) Str::ulid(),
                    'meta_title'       => $p['meta_title'],
                    'meta_description' => Str::limit($p['meta_description'], 160),
                    'og_title'         => $p['meta_title'],
                    'og_description'   => Str::limit($p['meta_description'], 160),
                    'og_type'          => 'website',
                    'canonical_url'    => $frontendUrl . $p['path'],
                    'noindex'          => $p['noindex'] ?? false,
                    'nofollow'         => $p['noindex'] ?? false,
                ]
            );
        }
    }
}