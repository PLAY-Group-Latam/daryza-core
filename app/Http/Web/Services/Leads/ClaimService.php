<?php

namespace App\Http\Web\Services\Leads;

use App\Models\Leads\Claim;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;

class ClaimService
{
    /**
     * LISTAR: Obtener lista paginada de reclamaciones.
     */
    public function getPaginatedClaims(int $perPage = 10): LengthAwarePaginator
    {
        return Claim::claims() 
            ->latest()
            ->paginate($perPage);
    }

    /**
     * CREAR: Crear una nueva reclamación.
     */
    public function save(array $data): Claim
    {
        // Preparar estructura para la tabla 'leads'
        $payload = [
            'type'      => Claim::TYPE_CLAIM,
            'full_name' => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone_number'],
            'status'    => Claim::STATUS_NEW, 
            'data'      => $this->mapJsonFields($data),
        ];

        // Manejo del archivo adjunto en PDF si es que hay
        if (isset($data['file_attached']) && $data['file_attached'] instanceof UploadedFile) {
            $payload['file_path'] = $data['file_attached']->store('leads/claims', 'public');
            $payload['file_original_name'] = $data['file_attached']->getClientOriginalName();
        }

        return Claim::create($payload);
    }

  
    /**
     * DETALLES: Obtener detalles de una reclamación específica.
     */
    public function getDetails(Claim $claim): Claim
    {
        return $claim;
    }


    /**
     * Mapea los campos específicos del formulario al formato JSON esperado.
     */
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