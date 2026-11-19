<?php

namespace App\Console\Commands;

use App\Http\Web\Services\GcsService;
use App\Models\Blogs\Blog;
use App\Models\Blogs\BlogCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ImportWpPosts extends Command
{
    protected $signature = 'wp:import-posts
        {--base=https://daryza.com : Origen de WordPress}
        {--bucket-url=https://storage.googleapis.com/daryza : URL pública del bucket (para saber qué ya existe)}
        {--dry : No escribe en BD ni sube al bucket, solo informa}
        {--skip-media : Importa posts sin subir imágenes}';
    protected $description = 'Importa posts de WordPress (contenido + SEO de Yoast) a blogs y metadata, y sube sus imágenes al bucket';

    private array $stats = ['uploaded' => 0, 'existing' => 0, 'failed' => []];
    private array $seen = [];

    public function handle(): int
    {
        $base  = rtrim($this->option('base'), '/');
        $dry   = (bool) $this->option('dry');
        $page  = 1;
        $pages = 1;
        $count = 0;

        do {
            $res = Http::timeout(60)->retry(3, 1000)->get("$base/wp-json/wp/v2/posts", [
                'per_page' => 50,
                'page'     => $page,
                'orderby'  => 'date',
                'order'    => 'asc',
                '_embed'   => 'wp:term,wp:featuredmedia',
            ])->throw();

            $pages = (int) $res->header('X-WP-TotalPages');

            foreach ($res->json() as $p) {
                if (! $dry) {
                    DB::transaction(fn () => $this->importPost($p));
                }
                if (! $this->option('skip-media')) {
                    $this->syncMedia($p, $base, $dry);
                }
                $count++;
            }

            $this->info("Página $page/$pages");
            $page++;
        } while ($page <= $pages);

        $this->info(($dry ? '[DRY] ' : '') . "Listo: $count posts " . ($dry ? 'revisados.' : 'importados/actualizados.'));
        $this->info("Imágenes: {$this->stats['uploaded']} " . ($dry ? 'por subir' : 'subidas') . ", {$this->stats['existing']} ya existían, " . count($this->stats['failed']) . ' fallidas.');
        foreach ($this->stats['failed'] as $f) {
            $this->warn("FALLÓ: $f");
        }

        return empty($this->stats['failed']) ? self::SUCCESS : self::FAILURE;
    }

    private function importPost(array $p): void
    {
        $y     = $p['yoast_head_json'] ?? [];
        $terms = $p['_embedded']['wp:term'] ?? [];
        $media = $p['_embedded']['wp:featuredmedia'][0] ?? null;

        $image = $media['source_url'] ?? null;
        $thumb = $media['media_details']['sizes']['medium']['source_url'] ?? $image;

        $blog = Blog::updateOrCreate(
            ['slug' => $p['slug']],
            [
                'title'            => html_entity_decode($p['title']['rendered'], ENT_QUOTES | ENT_HTML5),
                'description'      => html_entity_decode(trim(strip_tags($p['excerpt']['rendered'] ?? '')), ENT_QUOTES | ENT_HTML5),
                'content'          => $p['content']['rendered'],
                'image'            => $image,
                'miniature'        => $thumb,
                'visibility'       => true,
                'author'           => $y['author'] ?? 'Daryza',
                'publication_date' => $p['date'], // hora local de WP, NO convertir
            ]
        );

        $tags = collect($terms[1] ?? [])->pluck('name')->map(fn ($n) => html_entity_decode($n))->all();

        // meta_keywords es varchar(255): metemos tags completos hasta donde quepan
        $keywords = '';
        foreach ($tags as $tag) {
            $next = $keywords === '' ? $tag : "$keywords, $tag";
            if (mb_strlen($next) > 255) {
                break;
            }
            $keywords = $next;
        }

        $robots = $y['robots'] ?? [];

        $meta = $blog->metadata ?? $blog->metadata()->make();
        $meta->forceFill([
            'meta_title'       => $y['title'] ?? null,
            'meta_description' => $y['description'] ?? null,
            'meta_keywords'    => $keywords !== '' ? $keywords : null,
            'og_title'         => $y['og_title'] ?? null,
            'og_description'   => $y['og_description'] ?? null,
            'og_image'         => $y['og_image'][0]['url'] ?? null,
            'og_type'          => $y['og_type'] ?? 'article',
            'canonical_url'    => $y['canonical'] ?? null,
            'noindex'          => ($robots['index'] ?? 'index') === 'noindex',
            'nofollow'         => ($robots['follow'] ?? 'follow') === 'nofollow',
            'schema'           => $y['schema'] ?? null,
        ])->save();

        $categoryIds = collect($terms[0] ?? [])->map(
            fn ($c) => BlogCategory::firstOrCreate(['name' => html_entity_decode($c['name'])])->id
        )->all();

        $blog->categories()->sync($categoryIds);

        // Fechas reales de WP (vienen en UTC); se guardan en la zona de la app (America/Lima)
        $tz  = config('app.timezone');
        $fmt = fn (string $utc) => \Illuminate\Support\Carbon::parse($utc, 'UTC')
            ->setTimezone($tz)->format('Y-m-d H:i:s');

        $blog->newQuery()->whereKey($blog->getKey())->toBase()->update([
            'created_at' => $fmt($p['date_gmt']),
            'updated_at' => $fmt($p['modified_gmt'] ?? $p['date_gmt']),
        ]);
    }

    /**
     * Rutas /wp-content/uploads/... que usa el post: imagen destacada, miniatura,
     * og:image y todo lo que aparezca en el HTML del contenido (incluye srcset).
     * NO sube los demás tamaños de media_details que nadie referencia.
     */
    private function syncMedia(array $p, string $base, bool $dry): void
    {
        $media = $p['_embedded']['wp:featuredmedia'][0] ?? null;

        $sources = [
            $p['content']['rendered'] ?? '',
            $p['excerpt']['rendered'] ?? '',
            $media['source_url'] ?? '',                                      // image
            $media['media_details']['sizes']['medium']['source_url'] ?? '',  // miniature
            $p['yoast_head_json']['og_image'][0]['url'] ?? '',               // og:image
        ];

        // Elementor y JSON escapan las barras: https:\/\/daryza.com\/...
        $blob = str_replace('\/', '/', implode("\n", $sources));

        preg_match_all('#/wp-content/uploads/[^\s"\'<>()\\\\,?\#]+#i', $blob, $m);

        foreach (array_unique($m[0]) as $path) {
            if (isset($this->seen[$path])) {
                continue;
            }
            $this->seen[$path] = true;
            $this->uploadOne($path, $base, $dry);
        }
    }

    private function uploadOne(string $path, string $base, bool $dry): void
    {
        $object = ltrim(rawurldecode($path), '/'); // wp-content/uploads/2026/10/foto.jpg

        // Reanudable: si ya está en el bucket, se omite
        $head = Http::timeout(20)->head(
            rtrim($this->option('bucket-url'), '/') . '/' . implode('/', array_map('rawurlencode', explode('/', $object)))
        );
        if ($head->successful()) {
            $this->stats['existing']++;
            return;
        }

        if ($dry) {
            $this->line("[DRY] subiría: $object");
            $this->stats['uploaded']++;
            return;
        }

        $tmp = null;
        try {
            $res = Http::timeout(60)->retry(3, 1000)->get($base . $path)->throw();

            $tmp = tempnam(sys_get_temp_dir(), 'wpm_');
            file_put_contents($tmp, $res->body());

            $this->uploadToBucket($tmp, $object);
            $this->stats['uploaded']++;
            $this->line("OK: $object");
        } catch (\Throwable $e) {
            $this->stats['failed'][] = "$object ({$e->getMessage()})";
        } finally {
            if ($tmp && file_exists($tmp)) {
                @unlink($tmp);
            }
        }
    }

    private function uploadToBucket(string $tmpPath, string $objectPath): void
    {
        app(GcsService::class)->uploadFromPath($tmpPath, $objectPath);
    }
}