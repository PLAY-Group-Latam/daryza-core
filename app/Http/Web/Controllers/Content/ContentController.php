<?php

namespace App\Http\Web\Controllers\Content;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Content\ContentService;
use App\Http\Web\Requests\Content\ContentRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;

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
    Log::info('🔵 [Controller] Update request recibido', [
        'slug' => $slug,
        'type' => $type,
        'id' => $id,
        'has_file' => $request->hasFile('content.image'),
        'all_input' => $request->all(),
        'all_files' => $request->allFiles(),
    ]);

    $validated = $request->validated();
    $content = $validated['content'];

    if ($request->hasFile('content.image')) {

        Log::info('🟢 Archivo detectado en Controller', [
            'file_class' => get_class($request->file('content.image')),
        ]);

        $content['image'] = $request->file('content.image');
    }

    $this->contentService->updateSectionContent($id, $content);

    return back()->with('success', '¡Updated successfully!');
}


}