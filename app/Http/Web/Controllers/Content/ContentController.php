<?php

namespace App\Http\Web\Controllers\Content;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Content\ContentService;
use App\Http\Web\Requests\Content\ContentRequest;
use Inertia\Inertia;
use Inertia\Response;
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
   
        $this->contentService->getValidatedSection($slug, $type, $id);

       
        $content = array_replace_recursive(
            $request->input('content', []),
            $request->file('content', [])
        );

      
        $this->contentService->updateSectionContent($id, $content);

        return back()->with('success', '¡Sección actualizada correctamente!');
    }
}
