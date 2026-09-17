@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Te informamos que tu pedido <strong>#{{ $purchase_number }}</strong> ya se encuentra en ruta.
    </p>

    <p class="content-text">
        Nuestro equipo de transporte se está dirigiendo a la dirección registrada para realizar la entrega el día de hoy y se identificará como personal de Daryza, debidamente uniformado y con fotocheck.
    </p>

    <p class="content-text">
        Te agradecemos estar pendiente de la comunicación de nuestro equipo de transporte para coordinar la entrega de tu pedido.
    </p>

    <p class="content-text">
        Si tienes alguna duda sobre tu pedido, puedes escribirnos a 
        <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="mailto:{{ config('emails.orders_contact_email') }}">
            {{ config('emails.orders_contact_email') }}
        </a> 
        o al <strong>{{ config('emails.orders_contact_phone') }}</strong>.
    </p>

    <p class="content-text">
        Equipo Daryza
    </p>
@endsection