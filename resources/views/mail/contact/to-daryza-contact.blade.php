@extends('layouts.mail')

@section('content')
<h1 class="content-title" style="text-align: left; margin-bottom: 30px;">
    Recibimos un Lead de Contacto
</h1>

<div style="font-family: 'Helvetica', Arial, sans-serif; color: #333; line-height: 2;">
    <p style="margin: 5px 0; font-size: 15px;">
        <strong style="color: #666;">NOMBRE:</strong> {{ strtoupper($contact->full_name) }}
    </p>
    <p style="margin: 5px 0; font-size: 15px;">
        <strong style="color: #666;">DNI/CE O RUC:</strong> {{ $contact->data['ruc_or_dni'] ?? '---' }}
    </p>

    <p style="margin: 5px 0; font-size: 15px;">
        <strong style="color: #666;">TELÉFONO:</strong> {{ $contact->phone ?? '---' }}
    </p>

    <p style="margin: 5px 0; font-size: 15px;">
        <strong style="color: #666;">EMAIL:</strong> 
        <span style="color: #0056b3; text-decoration: underline;">{{ $contact->email }}</span>
    </p>

    <p style="margin: 5px 0; font-size: 15px;">
        <strong style="color: #666;">COMENTARIO:</strong> {{ $contact->data['comments'] ?? 'Sin comentarios' }}
    </p>
</div>
@endsection