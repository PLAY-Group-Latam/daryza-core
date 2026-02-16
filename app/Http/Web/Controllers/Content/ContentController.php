<?php

namespace App\Http\Web\Controllers\Content;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Content\ContentService;
use App\Http\Web\Requests\Content\ContentRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class ContentController extends Controller
{
    public function __construct(protected ContentService $contentService) {}

    public function index(): Response
    {
        return Inertia::render('content/Index', [
            'pages' => $this->contentService->getAllPagesWithSections()
        ]);
    }

    public function edit(string $slug, string $type, int $id): Response
    {
        $section = $this->contentService->getValidatedSection($slug, $type, $id);
        return Inertia::render('content/EditSection', ['section' => $section]);
    }

   public function update(ContentRequest $request, string $slug, string $type, int $id): RedirectResponse
{
    $this->contentService->getValidatedSection($slug, $type, $id);

    // 1. Obtenemos los datos de texto (start_date, end_date, etc.)
    $content = $request->input('content', []);
    
    // 2. Obtenemos los archivos (image, media, etc.)
    $files = $request->file('content', []);

    // 3. Fusionamos los archivos dentro del array $content
    // Esto asegura que $content['image'] contenga el objeto UploadedFile
    foreach ($files as $key => $file) {
        if ($key === 'media' && is_array($file)) {
            foreach ($file as $index => $mediaFile) {
                if (isset($mediaFile['src'])) {
                    $content['media'][$index]['src'] = $mediaFile['src'];
                }
            }
        } else {
            $content[$key] = $file;
        }
    }

    // ✅ Ahora $content tiene TODO: strings y objetos UploadedFile
    Log::info('📦 Content procesado con archivos:', [
        'keys' => array_keys($content),
        'has_image' => isset($content['image']) && $content['image'] instanceof \Illuminate\Http\UploadedFile
    ]);

    $this->contentService->updateSectionContent($id, $content);

    return back()->with('success', '¡Sección actualizada correctamente!');
}
}