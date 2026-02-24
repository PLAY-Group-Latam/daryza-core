<?php

namespace App\Http\Web\Controllers\Content;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Content\ContentService;
use App\Http\Web\Requests\Content\ContentRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
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

    public function edit(Request $request, string $slug, string $type, int $id): Response
{
    $section = $this->contentService->getValidatedSection($slug, $type, $id);

    $searchResults = $this->contentService->searchProductsByName($request->input('q', ''));

    return Inertia::render('content/EditSection', [
        'section' => $section,
        ...$searchResults
    ]);
}

    public function update(ContentRequest $request, string $slug, string $type, int $id): RedirectResponse
    {
        $this->contentService->getValidatedSection($slug, $type, $id);

        $content = $this->mergeFilesIntoContent(
            $request->input('content', []),
            $request->file('content', []),
        );

        

        $this->contentService->updateSectionContent($id, $content);

        return back()->with('success', '¡Sección actualizada correctamente!');
    }

    private function mergeFilesIntoContent(array $content, array $files): array
    {
        foreach ($files as $key => $file) {
            if (is_array($file)) {
                foreach ($file as $index => $nestedFiles) {
                    if (is_array($nestedFiles)) {
                        foreach ($nestedFiles as $field => $uploadedFile) {
                            $content[$key][$index][$field] = $uploadedFile;
                        }
                    } else {
                        $content[$key][$index] = $nestedFiles;
                    }
                }
            } else {
                $content[$key] = $file;
            }
        }

        return $content;
    }
}