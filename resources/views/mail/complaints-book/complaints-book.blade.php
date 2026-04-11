@extends('layouts.mail')

@section('content')
<p style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
    Estimado <strong>{{ $complaintsBook->full_name }}</strong>,
</p>

<p style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
    Le confirmamos que su reclamo <strong>#{{ $complaintsBook->data['claim_code'] ?? 'N/A' }}</strong> ha sido registrado correctamente con el siguiente detalle:
</p>

<div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; font-family: Arial, Helvetica, sans-serif !important; font-size: 14px; color: #333; line-height: 1.6;">
    <p style="margin: 5px 0;"><strong>NOMBRE Y APELLIDO:</strong> {{ strtoupper($complaintsBook->full_name) }}</p>
    <p style="margin: 5px 0;"><strong>CORREO:</strong> {{ $complaintsBook->email }}</p>
    <p style="margin: 5px 0;"><strong>TIPO DE DOCUMENTO:</strong> {{ $complaintsBook->data['document_type_id'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>NÚMERO DE DOCUMENTO:</strong> {{ $complaintsBook->data['document_number'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>FECHA:</strong> {{ \Carbon\Carbon::parse($complaintsBook->data['created_at_form'])->format('d/m/Y H:i') }}</p>
    <p style="margin: 5px 0;"><strong>DIRECCIÓN:</strong> {{ $complaintsBook->data['address'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>DISTRITO:</strong> {{ $complaintsBook->data['district'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>TELÉFONO:</strong> {{ $complaintsBook->phone }}</p>
    <p style="margin: 5px 0;"><strong>PRODUCTO O SERVICIO:</strong> {{ strtoupper($complaintsBook->data['type_of_service_id'] ?? 'N/A') }}</p>
    <p style="margin: 5px 0;"><strong>NOMBRE DEL PRODUCTO O SERVICIO:</strong> {{ $complaintsBook->data['well_hired_id'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>QUEJA/RECLAMO:</strong> {{ strtoupper($complaintsBook->data['type_of_claim_id'] ?? 'N/A') }}</p>
    
    <p style="margin: 10px 0 5px 0;"><strong>DETALLE DEL RECLAMO:</strong></p>
    <div style="padding-left: 10px; color: #555;">{{ $complaintsBook->data['description'] ?? 'N/A' }}</div>
    
    <p style="margin: 10px 0 5px 0;"><strong>PEDIDO DEL CLIENTE:</strong></p>
    <div style="padding-left: 10px; color: #555;">{{ $complaintsBook->data['customer_request'] ?? 'N/A' }}</div>

   <p style="margin: 10px 0 0 0;"><strong>DOCUMENTOS ADJUNTOS:</strong> 
    @if(isset($complaintsBook->file_path) && $complaintsBook->file_path)
        <a href="{{ $complaintsBook->file_path }}" target="_blank" style="color: #0056b3; text-decoration: underline;">
            {{ $complaintsBook->file_original_name ?? 'Ver adjunto' }}
        </a>
    @else
        Ninguno
    @endif
    </p>
</div>

<div style="font-family: Arial, sans-serif; font-size: 12px; color: #666; line-height: 1.5; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
    <p><strong>Nota:</strong> La empresa queda facultada a brindar respuesta a la queja o reclamo a través del correo electrónico consignado por el consumidor, la cual será emitida en un plazo no mayor a quince (15) días hábiles, conforme a la normativa vigente.</p>
    <p>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni constituye un requisito previo para interponer una denuncia ante INDECOPI.</p>
</div>
@endsection