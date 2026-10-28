<?php

namespace App\Console\Commands;

use App\Models\Blogs\Blog;
use App\Models\Blogs\BlogCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ImportWpPosts extends Command
{
    protected $signature = 'wp:import-posts {--base=https://daryza.com}';
    protected $description = 'Importa posts de WordPress (contenido + SEO de Yoast) a blogs y metadata';

    public function handle(): int
    {
        $base  = rtrim($this->option('base'), '/');
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
                DB::transaction(fn () => $this->importPost($p));
                $count++;
            }

            $this->info("Página $page/$pages");
            $page++;
        } while ($page <= $pages);

        $this->info("Listo: $count posts importados/actualizados.");
        return self::SUCCESS;
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
        $tz = config('app.timezone');
        $fmt = fn (string $utc) => \Illuminate\Support\Carbon::parse($utc, 'UTC')
            ->setTimezone($tz)->format('Y-m-d H:i:s');

        $blog->newQuery()->whereKey($blog->getKey())->toBase()->update([
            'created_at' => $fmt($p['date_gmt']),
            'updated_at' => $fmt($p['modified_gmt'] ?? $p['date_gmt']),
        ]);
    }
}