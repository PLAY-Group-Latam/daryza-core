<?php

namespace App\Console\Commands;

use App\Http\Web\Services\GcsService;
use App\Models\Content\Page;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportWpPagesSeo extends Command
{
    protected $signature = 'wp:import-pages-seo {--base=https://daryza.com} {--dry : Solo muestra, no guarda ni sube}';
    protected $description = 'Llena la metadata de las páginas con el SEO real de WordPress, sube sus og:image al bucket y asigna el logo como og:image por defecto a las páginas sin uno';

    /** og:image por defecto (ya está en el bucket, misma ruta que en WP) */
    private const DEFAULT_OG = 'https://daryza.com/wp-content/uploads/2021/04/logo-daryza-02.png';

    /** ruta vieja en WP => slug de Page */
    private const PAGES = [
        '/'                        => 'home',
        '/nosotros/'               => 'nosotros',
        '/contacto/'               => 'contacto',
        '/servicio-al-cliente/'    => 'servicio-cliente',
        '/asesoria-comercial/'     => 'asesoria',
        '/red-de-distribuidor/'    => 'red-comercial',
        '/trabaje-con-nosotros/'   => 'trabajos',
        '/terminos-y-condiciones/' => 'terminos-y-condiciones',
        '/libro-de-reclamaciones/' => 'libro-de-reclamaciones',
        '/blog/'                   => 'blog',
    ];

    private ?GcsService $gcs = null;

    public function handle(): int
    {
        $base   = rtrim($this->option('base'), '/');
        $dry    = (bool) $this->option('dry');
        $rows   = [];
        $withOg = []; // slugs que ya recibieron og:image de WP en esta corrida

        foreach (self::PAGES as $path => $slug) {
            $url = $base . $path;

            $res = Http::timeout(60)->retry(3, 1000)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (SEO-migration)'])
                ->withOptions(['allow_redirects' => false])
                ->get($url);

            if (!$res->ok()) {
                $rows[] = [$path, $slug, $res->status(), '—', 'ERROR: WP no respondió 200'];
                continue;
            }

            $seo  = $this->parse($res->body());
            $page = Page::where('slug', $slug)->first();

            if (!$page) {
                $rows[] = [$path, $slug, 200, '—', 'ERROR: no existe Page (corre SeoPageSeeder)'];
                continue;
            }

            $meta  = $page->metadata ?? $page->metadata()->make();
            $notes = [];

            $description = $seo['description'] ?: $meta->meta_description;
            if (!$seo['description']) {
                $notes[] = 'sin description en WP (se conserva la del seeder)';
            }

            // og:image: la URL no cambia (daryza.com/wp-content/uploads/...),
            // solo se sube el archivo al bucket con esa misma ruta
            $ogImage = $seo['og_image'];
            if (!$ogImage) {
                $notes[] = 'sin og:image';
            } elseif (!$dry && !$this->moveToBucket($ogImage)) {
                $notes[] = 'no pude subir og:image';
            }

            if ($ogImage) {
                $withOg[$slug] = true;
            }

            $robots = (string) $seo['robots'];

            $meta->forceFill([
                'meta_title'       => $seo['title'] ?: $meta->meta_title,
                'meta_description' => $description,
                'og_title'         => $seo['og_title'] ?: ($seo['title'] ?: $meta->og_title),
                'og_description'   => $seo['og_description'] ?: $description,
                'og_image'         => $ogImage,
                'og_type'          => $seo['og_type'] ?: 'website',
                'noindex'          => str_contains($robots, 'noindex'),
                'nofollow'         => str_contains($robots, 'nofollow'),
            ]);

            if (!$dry) {
                $meta->save();
            }

            $rows[] = [$path, $slug, 200, $ogImage ?: '—', $notes ? implode('; ', $notes) : 'ok'];
            usleep(300_000);
        }

        $this->table(['URL vieja', 'Page slug', 'HTTP', 'og_image', 'Resultado'], $rows);

        // Fase 2: páginas del seeder sin og:image (no vienen de WP) usan el logo por defecto
        $fallbackRows = [];
        foreach (Page::orderBy('slug')->get() as $page) {
            if (isset($withOg[$page->slug])) {
                continue;
            }

            $meta = $page->metadata;
            if (!$meta) {
                $fallbackRows[] = [$page->slug, 'sin metadata (corre SeoPageSeeder)'];
                continue;
            }
            if ($meta->og_image) {
                continue;
            }

            $meta->forceFill(['og_image' => self::DEFAULT_OG]);
            if (!$dry) {
                $meta->save();
            }
            $fallbackRows[] = [$page->slug, 'og_image por defecto: ' . self::DEFAULT_OG];
        }

        if ($fallbackRows) {
            $this->table(['Page slug', 'Resultado'], $fallbackRows);
        }

        $this->info($dry ? 'Dry run: no se guardó ni se subió nada.' : 'Metadata actualizada.');

        return self::SUCCESS;
    }

    /** Descarga la imagen de WP y la sube al bucket con la misma ruta (wp-content/uploads/...). */
    private function moveToBucket(string $url): bool
    {
        $this->gcs ??= app(GcsService::class);

        $wpPath = (string) parse_url($url, PHP_URL_PATH);
        if (!str_starts_with($wpPath, '/wp-content/uploads/')) {
            $this->warn("og:image fuera de /wp-content/uploads/: $url");
            return false;
        }

        try {
            $res = Http::timeout(60)->retry(3, 1000)->get($url)->throw();

            $tmp = tempnam(sys_get_temp_dir(), 'og_');
            file_put_contents($tmp, $res->body());

            $this->gcs->uploadFromPath($tmp, ltrim($wpPath, '/'));
            @unlink($tmp);

            return true;
        } catch (\Throwable $e) {
            $this->warn("og:image $url → " . $e->getMessage());
            return false;
        }
    }

       private function parse(string $html): array
    {
        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
        $xp = new \DOMXPath($dom);

        $attr = function (string $q, string $a = 'content') use ($xp): ?string {
            $n = $xp->query($q)->item(0);
            return $n instanceof \DOMElement ? trim($n->getAttribute($a)) : null;
        };
        $text = fn(string $q) => ($n = $xp->query($q)->item(0)) ? trim(preg_replace('/\s+/', ' ', $n->textContent)) : null;

        // WP repite og:* (tema + Yoast): se toma el último, el específico de la página
        $last = fn(string $property) => $attr('(//meta[@property="' . $property . '"])[last()]');

        return [
            'title'          => $text('//title'),
            'description'    => $attr('//meta[@name="description"]'),
            'robots'         => $attr('//meta[@name="robots"]'),
            'og_title'       => $last('og:title'),
            'og_description' => $last('og:description'),
            'og_type'        => $last('og:type'),
            'og_image'       => $last('og:image'),
        ];
    }
}