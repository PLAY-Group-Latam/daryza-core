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

    // ====== METADATA ======
    if (isset($data['metadata'])) {
      if ($blog->metadata) {
        $blog->metadata->update($data['metadata']);
      } else {
        $blog->metadata()->create($data['metadata']);
      }
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
}
