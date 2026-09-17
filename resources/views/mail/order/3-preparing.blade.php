@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Tu pedido <strong>#{{ $purchase_number }}</strong> se encuentra programado para despacho el día de mañana.
    </p>

    <p class="content-text">
        Recuerda que nuestro horario de reparto es de lunes a viernes entre 8:00am a 6:00pm y los sábados de 8:00am a 1:00pm. <strong>No realizamos despachos los domingos ni feriados.</strong>
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