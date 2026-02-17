<?php

namespace App\Http\Web\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class JobsService 
{
  
    public function getPaginatedJobs(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $type = 'work_with_us'; 
        $search = $filters['search'] ?? null;

        $query = Lead::query()->where('leads.type', '=', $type);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $searchTerm = "%" . trim($search) . "%";
                $q->where('leads.full_name', 'ilike', $searchTerm)
                  ->orWhere('leads.email', 'ilike', $searchTerm)
                  ->orWhere('leads.phone', 'ilike', $searchTerm);

                $q->orWhereRaw("(leads.data->>'area')::text ilike ?", [$searchTerm])
                  ->orWhereRaw("(leads.data->>'position')::text ilike ?", [$searchTerm])
                  ->orWhereRaw("(leads.data->>'location')::text ilike ?", [$searchTerm])
                  ->orWhereRaw("(leads.data->>'employmentStatus')::text ilike ?", [$searchTerm]);
            });
        }

        return $query->orderBy('leads.created_at', 'desc')
                     ->paginate($perPage)
                     ->withQueryString();
    }

  
    public function save(array $data): Lead
    {
        return DB::transaction(function () use ($data) {
            $type = 'work_with_us';
            
           
            $filePath = null;
            $fileName = null;

            if (isset($data['cv']) && $data['cv']->isValid()) {
                $file = $data['cv'];
                $fileName = $file->getClientOriginalName();
               
                $filePath = $file->store('cvs', 'public'); 
            }

            $payload = [
                'type'                => $type,
                'full_name'           => $data['firstName'] . ' ' . $data['lastName'],
                'email'               => $data['email'],
                'phone'               => $data['phone'],
                'status'              => Lead::STATUS_NEW,
                'file_path'           => $filePath ? Storage::url($filePath) : null,
                'file_original_name'  => $fileName,
                'data'                => $this->mapJsonFields($type, $data),
            ];

            return Lead::create($payload);
        });
    }

    
    protected function mapJsonFields(string $type, array $data): array
    {
        $common = ['created_at_form' => now()->toDateTimeString()];

        return array_merge($common, match ($type) {
            'work_with_us' => [
                'firstName'        => $data['firstName'] ?? null,
                'lastName'         => $data['lastName'] ?? null,
                'area'             => $data['area'] ?? null,
                'position'         => $data['position'] ?? null,
                'location'         => $data['location'] ?? null,
                'employmentStatus' => $data['employmentStatus'] ?? null,
            ],
            default => [],
        });
    }

  
    public function delete(Lead $lead): bool
    {
        return DB::transaction(function () use ($lead) {
            if ($lead->file_path) {
          
                $relativePaths = str_replace('/storage/', '', $lead->file_path);
                Storage::disk('public')->delete($relativePaths);
            }
            return $lead->delete();
        });
    }
}