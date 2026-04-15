<?php

namespace App\Http\Web\Services\Blog;

use App\Enums\OgType;
use App\Http\Web\Services\GcsService;
use App\Models\Blogs\Blog;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class BlogService
{
  private const MAX_INLINE_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB por imagen embebida

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

    // OgType es NOT NULL en metadata. Para blog debe ser article.
    if (empty($metadata['og_type'])) {
      $metadata['og_type'] = OgType::ARTICLE->value;
    }

    // Respetar flags recibidos; si no llegan, usar defaults seguros.
    $metadata['noindex'] = (bool) ($metadata['noindex'] ?? false);
    $metadata['nofollow'] = (bool) ($metadata['nofollow'] ?? false);

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
    if ($html === '') {
      return '';
    }

    // Capturamos únicamente el valor del src en <img ... src="..."> o src='...'
    // para evitar backtracking pesado con contenido base64 grande.
    if (!preg_match_all('/<img[^>]*\s+src=(["\'])([^"\']+)\1[^>]*>/i', $html, $matches, PREG_SET_ORDER)) {
      return $html;
    }

    foreach ($matches as $match) {
      $originalSrc = $match[2] ?? '';
      if (!str_starts_with($originalSrc, 'data:image/')) {
        continue;
      }

      $uploadedUrl = $this->uploadInlineBase64Image($originalSrc, $blogId);

      // Reemplazamos solo el src específico para no perder otros atributos del img.
      $html = str_replace($originalSrc, $uploadedUrl, $html);
    }

    return $html;
  }

  private function uploadInlineBase64Image(string $dataUri, string $blogId): string
  {
    $normalizedDataUri = trim($dataUri);
    if (!str_starts_with(strtolower($normalizedDataUri), 'data:image/')) {
      throw ValidationException::withMessages([
        'content' => 'El contenido incluye una imagen inline inválida.',
      ]);
    }

    $segments = explode(',', $normalizedDataUri, 2);
    if (count($segments) !== 2) {
      throw ValidationException::withMessages([
        'content' => 'El contenido incluye una imagen inline malformada.',
      ]);
    }

    [$metadataPart, $payloadPart] = $segments;
    if (!str_contains(strtolower($metadataPart), ';base64')) {
      throw ValidationException::withMessages([
        'content' => 'Solo se admiten imágenes inline en formato base64.',
      ]);
    }

    // data:image/png;param=...;base64
    $mimePart = substr($metadataPart, 5); // quita "data:"
    $mimePart = explode(';', $mimePart, 2)[0] ?? '';
    $rawExtension = strtolower((string) (explode('/', $mimePart, 2)[1] ?? ''));
    if ($rawExtension === '') {
      throw ValidationException::withMessages([
        'content' => 'No se pudo identificar el tipo de imagen embebida.',
      ]);
    }

    // Defensivo: algunos clientes pueden codificar el payload o reemplazar '+' por espacios.
    $base64Payload = rawurldecode($payloadPart);
    $base64Payload = preg_replace('/\s+/', '', str_replace(' ', '+', $base64Payload));
    if (!is_string($base64Payload) || $base64Payload === '') {
      throw ValidationException::withMessages([
        'content' => 'La imagen embebida no contiene datos válidos.',
      ]);
    }

    $binary = base64_decode($base64Payload, true);
    if ($binary === false || $binary === '') { // fallback para base64 url-safe
      $urlSafePayload = strtr($base64Payload, '-_', '+/');
      $padding = strlen($urlSafePayload) % 4;
      if ($padding > 0) {
        $urlSafePayload .= str_repeat('=', 4 - $padding);
      }
      $binary = base64_decode($urlSafePayload, true);
      if ($binary === false || $binary === '') {
        throw ValidationException::withMessages([
          'content' => 'No se pudo procesar una imagen embebida del contenido.',
        ]);
      }
    }

    if (strlen($binary) > self::MAX_INLINE_IMAGE_BYTES) {
      $maxMb = (int) (self::MAX_INLINE_IMAGE_BYTES / (1024 * 1024));
      throw ValidationException::withMessages([
        'content' => "Una imagen del contenido es muy grande. Máximo permitido: {$maxMb}MB por imagen.",
      ]);
    }

    $extensionMap = [
      'jpeg' => 'jpg',
      'jpg' => 'jpg',
      'png' => 'png',
      'gif' => 'gif',
      'webp' => 'webp',
      'svg+xml' => 'svg',
      'bmp' => 'bmp',
      'x-icon' => 'ico',
    ];

    $extension = $extensionMap[$rawExtension] ?? preg_replace('/[^a-z0-9]/', '', $rawExtension);
    if (!is_string($extension) || $extension === '') {
      $extension = 'png';
    }

    $tmpPath = tempnam(sys_get_temp_dir(), 'blog_img_');
    if ($tmpPath === false) {
      throw ValidationException::withMessages([
        'content' => 'No se pudo crear un archivo temporal para procesar la imagen.',
      ]);
    }

    try {
      file_put_contents($tmpPath, $binary);

      $directory = "blogs/{$blogId}/content";
      $uploaded = $this->gcs->uploadFromPath(
        $tmpPath,
        $directory . '/' . uniqid('cnt_', true) . '.' . $extension
      );
      if (!is_string($uploaded) || $uploaded === '') {
        throw ValidationException::withMessages([
          'content' => 'No se pudo subir una imagen del contenido a almacenamiento.',
        ]);
      }
      return $uploaded;
    } finally {
      if (is_file($tmpPath)) {
        unlink($tmpPath);
      }
    }
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
