@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Te informamos que tu pedido <strong>#{{ $purchase_number }}</strong> ha sido entregado con éxito.
    </p>

    <p class="content-text">
        Si estás pensando en un próximo pedido o necesitas apoyo para elegir productos, estaremos encantados de ayudarte. Puedes escribirnos a 
        <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="mailto:{{ config('emails.orders_contact_email') }}">
            {{ config('emails.orders_contact_email') }}
        </a> 
        o por WhatsApp al <strong>{{ config('emails.orders_contact_phone') }}</strong>.
    </p>

    <p class="content-text">
        Gracias por confiar en nosotros, esperamos volver a atenderte pronto.
    </p>

    <p class="content-text">
        Equipo Daryza
    </p>
@endsection