<?php

namespace App\Console\Commands;

use App\Models\Blogs\Blog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class VerifyWpPosts extends Command
{
    protected $signature = 'wp:verify-posts
        {--base=https://daryza.com}
        {--live : Compara también el HTML público de cada URL (1 request por post, lento)}';

    protected $description = 'Verifica que los blogs importados coincidan con WordPress (API, sitemap y HTML público)';

    /** @var array<int, array<int, string>> */
    private array $issues = [];

    public function handle(): int
    {
        $base  = rtrim($this->option('base'), '/');
        $page  = 1;
        $pages = 1;
        $total = 0;
        $slugs = [];

        do {
            $res = Http::timeout(60)->retry(3, 1000)->get("$base/wp-json/wp/v2/posts", [
                'per_page' => 50,
                'page'     => $page,
                'orderby'  => 'date',
                'order'    => 'asc',
                '_embed'   => 'wp:term,wp:featuredmedia',
            ])->throw();

            $pages = (int) $res->header('X-WP-TotalPages');
            $total = (int) $res->header('X-WP-Total');

            foreach ($res->json() as $p) {
                $slugs[] = $p['slug'];
                $this->checkApi($p);

                if ($this->option('live')) {
                    $this->checkLive($p);
                    usleep(300_000); // no saturar producción
                }
            }

            $this->line("Página $page/$pages verificada");
            $page++;
        } while ($page <= $pages);

        $this->checkTotals($total, $slugs);
        $this->checkSitemap($base, $slugs);

        return $this->report();
    }

    private function checkApi(array $p): void
    {
        $slug = $p['slug'];
        $blog = Blog::with(['metadata', 'categories'])->where('slug', $slug)->first();

        if (!$blog) {
            $this->issue($slug, 'blog', 'existe en WP', 'FALTA en local');
            return;
        }

        $y     = $p['yoast_head_json'] ?? [];
        $terms = $p['_embedded']['wp:term'] ?? [];
        $media = $p['_embedded']['wp:featuredmedia'][0] ?? null;
        $dec   = fn ($s) => html_entity_decode((string) $s, ENT_QUOTES | ENT_HTML5);

       $localPubDate = $blog->publication_date instanceof \DateTimeInterface
    ? $blog->publication_date->format('Y-m-d H:i:s')
    : str_replace('T', ' ', (string) $blog->publication_date);

        $this->cmp($slug, 'title', $p['title']['rendered'], $blog->title);
        $this->cmp($slug, 'description', trim(strip_tags($p['excerpt']['rendered'] ?? '')), $blog->description);
        $this->cmp($slug, 'content (md5)', md5($p['content']['rendered']), md5((string) $blog->content));
        $this->cmp($slug, 'publication_date', str_replace('T', ' ', $p['date']), $localPubDate);
        $this->cmp($slug, 'legacy_path', parse_url($p['link'], PHP_URL_PATH), $blog->legacy_path);
        $this->cmp($slug, 'image', $media['source_url'] ?? null, $blog->image);
        $this->cmp($slug, 'visibility', '1', $blog->visibility ? '1' : '0');
        $utc = fn ($d) => $d?->copy()->utc()->format('Y-m-d H:i:s');
$this->cmp($slug, 'created_at', str_replace('T', ' ', $p['date_gmt']), $utc($blog->created_at));
$this->cmp($slug, 'updated_at', str_replace('T', ' ', $p['modified_gmt'] ?? $p['date_gmt']), $utc($blog->updated_at));

        $wpCats    = collect($terms[0] ?? [])->pluck('name')->map($dec)->sort()->values()->implode(' | ');
        $localCats = $blog->categories->pluck('name')->sort()->values()->implode(' | ');
        $this->cmp($slug, 'categorías', $wpCats, $localCats);

        $m = $blog->metadata;
        if (!$m) {
            $this->issue($slug, 'metadata', 'esperada', 'FALTA');
            return;
        }

        $r = $y['robots'] ?? [];
        $this->cmp($slug, 'meta_title', $y['title'] ?? null, $m->meta_title);
        $this->cmp($slug, 'meta_description', $y['description'] ?? null, $m->meta_description);
        $this->cmp($slug, 'canonical', $y['canonical'] ?? null, $m->canonical_url);
        $this->cmp($slug, 'og_title', $y['og_title'] ?? null, $m->og_title);
        $this->cmp($slug, 'og_description', $y['og_description'] ?? null, $m->og_description);
        $this->cmp($slug, 'og_image', $y['og_image'][0]['url'] ?? null, $m->og_image);
        $this->cmp($slug, 'og_type', $y['og_type'] ?? 'article', $m->og_type);
        $this->cmp($slug, 'noindex', ($r['index'] ?? 'index') === 'noindex' ? '1' : '0', $m->noindex ? '1' : '0');
        $this->cmp($slug, 'nofollow', ($r['follow'] ?? 'follow') === 'nofollow' ? '1' : '0', $m->nofollow ? '1' : '0');
        $this->cmp($slug, 'schema', $this->norm($y['schema'] ?? null), $this->norm($m->schema));

        // meta_keywords se guardó cortado a 255: debe ser prefijo de los tags
        $tags = collect($terms[1] ?? [])->pluck('name')->map($dec)->implode(', ');
        $kw   = (string) $m->meta_keywords;
        if (!str_starts_with($tags, $kw)) {
            $this->issue($slug, 'meta_keywords', $tags, $kw);
        }
    }

    private function checkLive(array $p): void
    {
        $slug = $p['slug'];
        $m    = Blog::with('metadata')->where('slug', $slug)->first()?->metadata;
        if (!$m) {
            return;
        }

        $res = Http::timeout(60)->withOptions(['allow_redirects' => false])->get($p['link']);
        $this->cmp($slug, 'HTML: status', '200', (string) $res->status());
        if (!$res->ok()) {
            return;
        }

        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $res->body());
        $xp   = new \DOMXPath($dom);
        $attr = fn (string $q, string $a) => ($n = $xp->query($q)->item(0)) ? $n->getAttribute($a) : '';

        $this->cmp($slug, 'HTML: <title>', $m->meta_title, trim($xp->query('//title')->item(0)?->textContent ?? ''));
        $this->cmp($slug, 'HTML: description', $m->meta_description, $attr('//meta[@name="description"]', 'content'));
        $this->cmp($slug, 'HTML: canonical', $m->canonical_url, $attr('//link[@rel="canonical"]', 'href'));
        $this->cmp($slug, 'HTML: og:image', $m->og_image, $attr('//meta[@property="og:image"]', 'content'));

        $robots = $attr('//meta[@name="robots"]', 'content');
        $this->cmp($slug, 'HTML: noindex', $m->noindex ? '1' : '0', str_contains($robots, 'noindex') ? '1' : '0');
    }

    private function checkTotals(int $total, array $slugs): void
    {
        $local = Blog::whereIn('slug', $slugs)->count();
        $this->cmp('(total)', 'posts WP vs local', (string) $total, (string) $local);

        $sinMeta = Blog::doesntHave('metadata')->count();
        if ($sinMeta > 0) {
            $this->issue('(total)', 'blogs sin metadata', '0', (string) $sinMeta);
        }

        $extras = Blog::whereNotIn('slug', $slugs)->pluck('slug');
        if ($extras->isNotEmpty()) {
            $this->warn("Blogs locales que NO vienen de WP ({$extras->count()}): "
                . $extras->take(10)->implode(', ') . ($extras->count() > 10 ? ' …' : ''));
        }
    }

    private function checkSitemap(string $base, array $slugs): void
    {
        try {
            $index = Http::timeout(30)->get("$base/sitemap_index.xml")->throw()->body();
            preg_match_all('#<loc>([^<]+)</loc>#', $index, $m);

            $urls = [];
            foreach (array_filter($m[1], fn ($u) => str_contains($u, 'post-sitemap')) as $child) {
                $xml = Http::timeout(30)->get(html_entity_decode($child))->throw()->body();
                preg_match_all('#<loc>([^<]+)</loc>#', $xml, $mm);
                foreach ($mm[1] as $u) {
                    $urls[] = rtrim((string) parse_url(html_entity_decode($u), PHP_URL_PATH), '/') . '/';
                }
            }
        } catch (\Throwable $e) {
            $this->warn('No pude leer el sitemap de Yoast: ' . $e->getMessage());
            return;
        }

        $local = Blog::whereIn('slug', $slugs)->get()->map->legacy_path->all();

        foreach (array_diff($urls, $local) as $u) {
            $this->issue('(sitemap)', 'en sitemap, no en local', $u, '—');
        }
        foreach (array_diff($local, $urls) as $u) {
            $this->issue('(sitemap)', 'en local, no en sitemap', '—', $u);
        }

        $this->line(count($urls) . ' URLs de posts en el sitemap de Yoast.');
    }

    private function report(): int
    {
        $this->newLine();

        if (!$this->issues) {
            $this->info('✔ Todo coincide: WordPress (API, sitemap' . ($this->option('live') ? ' y HTML público' : '') . ') = BD local.');
            return self::SUCCESS;
        }

        $byField = collect($this->issues)->countBy(fn ($i) => $i[1])
            ->map(fn ($n, $f) => [$f, $n])->values()->all();

        $this->table(['Campo', 'Diferencias'], $byField);
        $this->table(['Slug', 'Campo', 'WordPress', 'Local'], $this->issues);
        $this->error(count($this->issues) . ' diferencias.');

        return self::FAILURE;
    }

   private function cmp(string $slug, string $field, mixed $wp, mixed $local): void
{
    $str = fn (mixed $v): string => $v instanceof \BackedEnum
        ? (string) $v->value
        : ($v instanceof \UnitEnum ? $v->name : (string) $v);

    $a = html_entity_decode(trim($str($wp)), ENT_QUOTES | ENT_HTML5);
    $b = html_entity_decode(trim($str($local)), ENT_QUOTES | ENT_HTML5);

    if ($a !== $b) {
        $this->issue($slug, $field, $a, $b);
    }
}

    private function issue(string $slug, string $field, mixed $wp, mixed $local): void
{
    $this->issues[] = [
        $slug,
        $field,
        mb_strimwidth((string) $wp, 0, 60, '…'),
        mb_strimwidth((string) $local, 0, 60, '…'),
    ];
}

    private function norm(mixed $v): string
    {
        $sort = function (mixed $x) use (&$sort) {
            if (!is_array($x)) {
                return $x;
            }
            $x = array_map($sort, $x);
            if ($x !== [] && array_keys($x) !== range(0, count($x) - 1)) {
                ksort($x);
            }
            return $x;
        };

        return (string) json_encode($sort($v), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}