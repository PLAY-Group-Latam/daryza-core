@extends('layouts.mail')

@section('content')
<h1 class="content-title"> Nuevo Reclamo Registrado</h1>

<p class="content-text">Hola Equipo Daryza,</p>

<p class="content-text">
    Se ha registrado un nuevo reclamo/queja en el Libro de Reclamaciones virtual.
</p>

<div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 14px; color: #495057;">
        <strong>Número de Reclamo:</strong> 
        <span style="font-family: monospace; font-size: 15px; font-weight: bold; color: #dc3545;">
            {{ $complaintsBook->data['claim_code'] ?? 'N/A' }}
        </span>
    </p>
    <p style="margin: 4px 0; font-size: 14px; color: #495057;">
        <strong>Cliente:</strong> {{ $complaintsBook->full_name }}
    </p>
    <p style="margin: 4px 0; font-size: 14px; color: #495057;">
        <strong>Tipo:</strong> {{ ucfirst($complaintsBook->data['type_of_claim_id'] ?? 'N/A') }}
    </p>
</div>

<p class="content-text">
    Por favor, ingresa al panel administrador de Daryza para revisar los detalles completos y emitir una respuesta dentro del plazo legal.
</p>

<div style="text-align: center; margin: 25px 0;">
    <a href="{{ url('/claims/items') }}" 
       style="background-color: #44ac34; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block;">
       Ver Reclamo en el Panel
    </a>
</div>

<p class="content-text" style="font-size: 12px; color: #6c757d;">
    Aviso automático del sistema de Leads de Daryza.
</p>
@endsection