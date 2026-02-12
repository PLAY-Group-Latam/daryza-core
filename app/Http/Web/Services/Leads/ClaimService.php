<?php

namespace App\Http\Web\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ClaimService
{
    public function getPaginatedClaims(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        
        $query = Lead::query()->where('type', Lead::TYPE_CLAIM);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $searchTerm = "%" . trim($search) . "%";
                $q->where('full_name', 'ilike', $searchTerm)
                  ->orWhere('email', 'ilike', $searchTerm)
                  ->orWhereRaw("data->>'document_number' ilike ?", [$searchTerm]);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function save(array $data): Lead
    {
        $payload = [
            'type'      => Lead::TYPE_CLAIM,
            'full_name' => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone_number'],
            'status'    => Lead::STATUS_NEW, 
            'data'      => $this->mapJsonFields($data),
        ];

        if (isset($data['file_attached']) && $data['file_attached'] instanceof UploadedFile) {
            $payload['file_path'] = $data['file_attached']->store('leads/claims', 'public');
            $payload['file_original_name'] = $data['file_attached']->getClientOriginalName();
        }

        return Lead::create($payload);
    }

    public function update(Lead $claim, array $data): bool
    {
        return $claim->update([
            'full_name' => $data['name'] ?? $claim->full_name,
            'email'     => $data['email'] ?? $claim->email,
            'phone'     => $data['phone_number'] ?? $claim->phone,
            'status'    => $data['status'] ?? $claim->status,
           
        ]);
    }

    public function delete(Lead $claim): ?bool
    {
        if ($claim->file_path) {
            Storage::disk('public')->delete($claim->file_path);
        }
        return $claim->delete();
    }

    protected function mapJsonFields(array $data): array
    {
        return [
            'document_type_id'   => $data['document_type_id'],
            'document_number'    => $data['document_number'],
            'address'            => $data['address'],
            'district'           => $data['district'],
            'well_hired_id'      => $data['well_hired_id'],
            'type_of_service_id' => $data['type_of_service_id'],
            'type_of_claim_id'   => $data['type_of_claim_id'],
            'description'        => $data['description'],
            'terms_conditions'   => $data['terms_conditions'],
            'created_at_form'    => now()->toDateTimeString(),
        ];
    }
}