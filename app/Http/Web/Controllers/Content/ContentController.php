<?php

namespace App\Http\Web\Controllers\Content;

use App\Http\Web\Controllers\Controller;
use App\Models\Content\Page;
use Inertia\Inertia;
use App\Models\Content\PageSection;
use Inertia\Response;
use Illuminate\Http\Request;

class ContentController extends Controller
{
   
    public function index(): Response
    {
       
        $pages = Page::with(['sections' => function ($query) {
            $query->orderBy('sort_order', 'asc');
        }])->get();

        return Inertia::render('content/Index', [
            'pages' => $pages
        ]);
    }


    public function edit($slug, $id): Response
{
    
    $section = PageSection::with(['content', 'page'])->findOrFail($id);

    if ($section->page->slug !== $slug) {
        abort(404, 'Esta sección no pertenece a la página solicitada.');
    }

    return Inertia::render('content/EditSection', [
        'section' => $section
    ]);
}
}