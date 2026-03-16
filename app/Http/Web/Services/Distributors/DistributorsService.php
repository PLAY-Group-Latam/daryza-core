<?php

namespace App\Http\Web\Services\Distributors;

use App\Models\Distributors\Distributor;
use App\Http\Web\Services\GcsService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DistributorsService {

    protected GcsService $gcs;
        
    public function __construct(GcsService $gcs)
    {
        $this->gcs = $gcs;
    }

    // Buscar uno solo (Para el Show o Edit)
    public function findById(int $id): Distributor
    {
        $distrubtor=Distributor::findOrFail($id);
        return $distrubtor;

    }

    public function getPaginated(array $filters): LengthAwarePaginator
{
   
    $perPage = $filters['per_page'] ?? 10;

    return Distributor::query()
        ->when($filters['search'] ?? null, function ($query, $search) {
           
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ruc', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%");
            });
        })
        ->latest()
        ->paginate($perPage)
        ->withQueryString();
}

    public function store(array $data): Distributor
    {
        return DB::transaction(function () use ($data) {
            if (isset($data['img_info']) && $data['img_info'] instanceof \Illuminate\Http\UploadedFile) {
                $data['img_info'] = $this->gcs->uploadFile($data['img_info'], 'distributors');
            }
            return Distributor::create($data);
        });
    }

 public function update(int $id, array $data): Distributor
{
    $distributor = $this->findById($id);

    return DB::transaction(function () use ($distributor, $data) {

        if (isset($data['img_info']) && $data['img_info'] instanceof \Illuminate\Http\UploadedFile) {
            
            if ($distributor->img_info) {
                $this->gcs->delete($distributor->img_info);
            }

            $data['img_info'] = $this->gcs->uploadFile($data['img_info'], 'distributors');
            
        } else {
            unset($data['img_info']);
        }

        $distributor->update($data);
        
        return $distributor;
    });
}

    public function delete(int $id): bool
    {
        $distributor = $this->findById($id);

        if ($distributor->img_info) {
            $this->gcs->delete($distributor->img_info);
        }
        return $distributor->delete();
    }
}