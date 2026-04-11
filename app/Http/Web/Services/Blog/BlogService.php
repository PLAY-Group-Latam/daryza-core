<?php

namespace App\Http\Web\Services\Blog;

use App\Http\Web\Services\GcsService;
use App\Models\Blogs\Blog;
use Illuminate\Http\UploadedFile;

class BlogService
{
  protected GcsService $gcs;

  public function __construct(GcsService $gcs)
  {
    $this->gcs = $gcs;
  }

  /**
   * Crear o actualizar un blog
   */
  public function save(array $data, ?Blog $blog = null): Blog
  {
    // ====== CREAR BLOG SI NO EXISTE ======
    if (!$blog) {
      // Creamos el blog inicialmente con datos básicos (sin imágenes ni contenido)
      $blog = Blog::create([
        'title' => $data['title'],
        'slug' => $data['slug'],
        'description' => $data['description'],
        'content' => '', // lo procesaremos después
        'author' => $data['author'],
        'visibility' => $data['visibility'] ?? false,
        'publication_date' => $data['publication_date'],
      ]);
    }

    $blogId = $blog->id;

    // ====== IMAGEN PRINCIPAL ======
    if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
      // eliminar imagen anterior si existe
      if ($blog->image) {
        $this->gcs->deleteFromPublicUrl($blog->image);
      }

      $directory = "blogs/{$blogId}/images";
      $data['image'] = $this->gcs->uploadFile($data['image'], $directory);
    }

    // ====== MINIATURA ======
    if (isset($data['miniature']) && $data['miniature'] instanceof UploadedFile) {
      // eliminar miniatura anterior si existe
      if ($blog->miniature) {
        $this->gcs->deleteFromPublicUrl($blog->miniature);
      }

      $directory = "blogs/{$blogId}/miniatures";
      $data['miniature'] = $this->gcs->uploadFile($data['miniature'], $directory);
    }

    // ====== CONTENIDO ======
    if (isset($data['content'])) {
      $data['content'] = $this->processContentImages($data['content'], $blogId);
    }

    // ====== ACTUALIZAR BLOG ======
    $blog->update($data);

    // ====== CATEGORÍAS ======
    if (isset($data['categories'])) {
      $blog->categories()->sync($data['categories']);
    }

    $baseUrl = config('app.frontend_url');

    // ====== METADATA ======
    $metadata = $data['metadata'] ?? [];

    // Si estamos creando o no viene meta_title/meta_description, usamos title y description
    if (!isset($metadata['meta_title'])) {
      $metadata['meta_title'] = $data['title'] ?? $blog->title;
    }
    if (!isset($metadata['meta_description'])) {
      $metadata['meta_description'] = $data['description'] ?? $blog->description;
    }
    $metadata['og_title'] = $metadata['meta_title'];
    $metadata['og_description'] = $metadata['meta_description'];

    // Canonical automático si no viene
    if (!isset($metadata['canonical_url'])) {
      $metadata['canonical_url'] = $baseUrl . '/blogs/' . ($data['slug'] ?? $blog->slug);
    }

    $metadata = $this->normalizeSeoMetadataPayload($metadata);

    if ($blog->metadata) {
      $blog->metadata->update($metadata);
    } else {
      $blog->metadata()->create($metadata);
    }


    return $blog;
  }

  /**
   * Procesar imágenes dentro del contenido HTML
   */
  protected function processContentImages(string $html, string $blogId): string
  {
    return preg_replace_callback(
      '/<img.*?src="data:image\/(.*?);base64,(.*?)".*?>/i',
      function ($matches) use ($blogId) {
        $extension = $matches[1];
        $data = base64_decode($matches[2]);

        // Creamos un archivo temporal en el servidor
        $tmpPath = tempnam(sys_get_temp_dir(), 'blog_img');
        file_put_contents($tmpPath, $data);

        // Carpeta final en GCS
        $directory = "blogs/{$blogId}/content";
        $url = $this->gcs->uploadFromPath(
          $tmpPath,
          $directory . '/' . uniqid() . '.' . $extension
        );

        // Borramos el temporal
        unlink($tmpPath);

        return '<img src="' . $url . '">';
      },
      $html
    );
  }

  protected function normalizeSeoMetadataPayload(array $metadata): array
  {
    if (array_key_exists('meta_title', $metadata)) {
      $metadata['meta_title'] = $this->truncateNullableString($metadata['meta_title'], 255);
    }
    if (array_key_exists('meta_description', $metadata)) {
      $metadata['meta_description'] = $this->truncateNullableString($metadata['meta_description'], 500);
    }
    if (array_key_exists('meta_keywords', $metadata)) {
      $metadata['meta_keywords'] = $this->truncateNullableString($metadata['meta_keywords'], 255);
    }
    if (array_key_exists('canonical_url', $metadata)) {
      $metadata['canonical_url'] = $this->truncateNullableString($metadata['canonical_url'], 255);
    }
    if (array_key_exists('og_title', $metadata)) {
      $metadata['og_title'] = $this->truncateNullableString($metadata['og_title'], 255);
    }
    if (array_key_exists('og_description', $metadata)) {
      $metadata['og_description'] = $this->truncateNullableString($metadata['og_description'], 500);
    }
    if (array_key_exists('og_image', $metadata)) {
      $metadata['og_image'] = $this->truncateNullableString($metadata['og_image'], 255);
    }
    if (array_key_exists('og_type', $metadata)) {
      $metadata['og_type'] = $this->truncateNullableString($metadata['og_type'], 50);
    }
    $metadata['noindex'] = false;
    $metadata['nofollow'] = false;

    return $metadata;
  }

  protected function truncateNullableString(mixed $value, int $max): ?string
  {
    if ($value === null) {
      return null;
    }

    $text = trim((string) $value);
    if ($text === '') {
      return null;
    }

    return function_exists('mb_substr')
      ? mb_substr($text, 0, $max)
      : substr($text, 0, $max);
  }
}
