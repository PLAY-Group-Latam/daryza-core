@extends('layouts.mail')

@section('content')
<h1 class="content-title">Recibimos tu Reclamo</h1>

<div style="background-color: #f8f9fa; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #44ac34; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 13px; color: #6c757d; font-weight: bold;">CÓDIGO DE RECLAMO:</p>
    <p style="margin: 3px 0 0 0; font-size: 18px; color: #212529; font-weight: bold;">
        {{ $complaintsBook->data['claim_code'] ?? 'N/A' }}
    </p>
</div>

<p class="content-text">Hola <strong>{{$complaintsBook->full_name}}</strong>,</p>

<p class="content-text">
    Lamentamos los inconvenientes que hayas podido experimentar. Hemos recibido tu reclamo y nuestro equipo ya se encuentra revisando la situación para brindarte una solución lo antes posible.
</p>

<div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #495057; font-weight: bold; text-decoration: underline;">
        Detalles de tu solicitud:
    </p>
    <p style="margin: 4px 0; font-size: 13px; color: #495057;">
        <strong>Documento:</strong> {{ $complaintsBook->data['document_number'] ?? 'N/A' }}
    </p>
    <p style="margin: 4px 0; font-size: 13px; color: #495057;">
        <strong>Tipo de Solicitud:</strong> {{ ucfirst($complaintsBook->data['type_of_claim_id'] ?? 'N/A') }}
    </p>
    <p style="margin: 4px 0; font-size: 13px; color: #495057;">
        <strong>Descripción:</strong> {{ $complaintsBook->data['description'] ?? 'N/A' }}
    </p>
</div>

<p class="content-text">
    Agradecemos tu paciencia y confianza en la tienda oficial de Rubbermaid.
    Estamos comprometidos con ofrecer productos de calidad comercial y la mejor experiencia de compra.
</p>

<p class="content-text" style="font-size: 14px; color: #6c757d;">
    Si no reconoces esta acción, puedes ignorar este correo.
</p>
@endsection