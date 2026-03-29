<?php

namespace App\Http\Web\Services\Distributors;

use App\Models\Distributors\Distributor;
use App\Models\Distributors\MapPinSetting;
use App\Http\Web\Services\GcsService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

class DistributorsService
{
    protected GcsService $gcs;

    public function __construct(GcsService $gcs)
    {
        $this->gcs = $gcs;
    }

    public function findById(int $id): Distributor
    {
        return Distributor::findOrFail($id);
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

            if (isset($data['establishment_img']) && $data['establishment_img'] instanceof UploadedFile) {
                $data['establishment_img'] = $this->gcs->uploadFile($data['establishment_img'], 'distributors/establishments');
            }

            return Distributor::create($data);
        });
    }

    public function update(int $id, array $data): Distributor
    {
        $distributor = $this->findById($id);

        return DB::transaction(function () use ($distributor, $data) {

            if (isset($data['establishment_img']) && $data['establishment_img'] instanceof UploadedFile) {
                if ($distributor->establishment_img) {
                    $this->gcs->delete($distributor->establishment_img);
                }
                $data['establishment_img'] = $this->gcs->uploadFile($data['establishment_img'], 'distributors/establishments');
            } else {
                unset($data['establishment_img']);
            }

            $distributor->update($data);
            return $distributor;
        });
    }

    public function delete(int $id): bool
    {
        $distributor = $this->findById($id);

        if ($distributor->establishment_img) {
            $this->gcs->delete($distributor->establishment_img);
        }

        return $distributor->delete();
    }

    // ── Pin global del mapa ────────────────────────────────────────────────

    public function getMapPin(): MapPinSetting
    {
        return MapPinSetting::instance();
    }

    public function updateMapPin(UploadedFile $file): MapPinSetting
    {
        $setting = MapPinSetting::instance();

        if ($setting->logo_pin) {
            $this->gcs->delete($setting->logo_pin);
        }

        $setting->update([
            'logo_pin' => $this->gcs->uploadFile($file, 'distributors/map-pin'),
        ]);

        return $setting;
    }
}