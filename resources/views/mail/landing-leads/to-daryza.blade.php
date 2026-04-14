@extends('layouts.mail')

@section('content')
<h1 class="content-title" style="text-align: left; margin-bottom: 30px;">
    Nuevo Lead de Landing
</h1>

<div
    style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; font-family: Arial, Helvetica, sans-serif !important; font-size: 14px; color: #333; line-height: 1.6;">
    <p style="margin: 5px 0;"><strong>LANDING:</strong> {{ $landing->title ?? 'N/A' }}</p>
    <!-- <p style="margin: 5px 0;"><strong>SLUG LANDING:</strong> {{ $landing->slug ?? 'N/A' }}</p> -->
    <!-- <p style="margin: 5px 0;"><strong>FORM KEY:</strong> {{ $lead->form_key ?? 'N/A' }}</p> -->
    <p style="margin: 5px 0;"><strong>NOMBRE:</strong> {{ strtoupper($lead->full_name ?? 'N/A') }}</p>
    <p style="margin: 5px 0;"><strong>CORREO:</strong> {{ $lead->email ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>TELÉFONO:</strong> {{ $lead->phone ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>RUC/DNI:</strong> {{ $lead->data['ruc_or_dni'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>EMPRESA:</strong> {{ $lead->data['company_name'] ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>COMENTARIOS:</strong> {{ $lead->data['comments'] ?? 'Sin comentarios' }}</p>
    <!-- <p style="margin: 5px 0;"><strong>PAGE URL:</strong> {{ $lead->page_url ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>REFERRER:</strong> {{ $lead->referrer ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>IP:</strong> {{ $lead->ip_address ?? 'N/A' }}</p>
    <p style="margin: 5px 0;"><strong>USER AGENT:</strong> {{ $lead->user_agent ?? 'N/A' }}</p> -->
    @if(!empty($adminUrl))
    <p style="margin: 10px 0 0 0;">
        <strong>VER EN ADMIN:</strong>
        <a href="{{ $adminUrl }}" target="_blank" style="color: #0056b3; text-decoration: underline;">
            {{ $adminUrl }}
        </a>
    </p>
    @endif
</div>

@endsection