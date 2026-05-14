<?php

namespace App\Http\Web\Controllers\Seo;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Seo\UpdateSeoRequest;
use App\Http\Web\Services\Seo\SeoService;
use App\Http\Api\Traits\ApiTrait; 
use App\Models\Metadata;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeoController extends Controller
{
    use ApiTrait;

    protected SeoService $seoService;

    public function __construct(SeoService $seoService)
    {
        $this->seoService = $seoService;
    }

    /**
     * Listar SEO de páginas
     */
  public function index(Request $request)
{
    $perPage = (int) $request->query('per_page', 10);
    $search = $request->query('search');

    // Pasamos el search al servicio
    $paginatedSeo = $this->seoService->getAllPaginated($perPage, $search);

    return Inertia::render('seos/Index', [
        'paginatedSeo' => $paginatedSeo,
        'filters' => ['search' => $search],
    ]);
}

    /**
     * Ver un SEO específico (lectura)
     */
    public function show(string $id)
    {
        return Inertia::render('seos/Show', [
            'seo' => $this->seoService->getById($id)
        ]);
    }

    /**
     * Formulario de edición
     */
    public function edit(string $id)
    {
        return Inertia::render('seos/Edit', [
            'seo' => $this->seoService->getById($id)
        ]);
    }

    /**
     * Procesar la actualización usando ApiTrait
     */
   public function update(UpdateSeoRequest $request, string $id) // Recibimos ID
{
    try {
        // Obtenemos el modelo manualmente si no usas Route Model Binding exacto
        $seo = Metadata::findOrFail($id); 

        $this->seoService->update(
            $seo, 
            $request->validated(), 
            $request->file('og_image')
        );

        // EN WEB/INERTIA NO SE USA ->success(). Se usa redirección:
        return redirect()->route('admin.seo.index')
            ->with('message', 'SEO actualizado correctamente');

    } catch (\Exception $e) {
        // En Inertia los errores se mandan por la sesión de errores
        return redirect()->back()->withErrors(['error' => $e->getMessage()]);
    }
}
}