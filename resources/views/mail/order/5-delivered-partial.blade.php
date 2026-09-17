@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Te informamos que tu pedido <strong>#{{ $purchase_number }}</strong> ha sido entregado parcialmente.
    </p>

    <p class="content-text">
        El resto de los productos pendientes será despachado en una segunda entrega, la cual te estaremos confirmando a la brevedad.
    </p>

    <p class="content-text">
        Agradecemos tu comprensión. Si tienes alguna duda o consulta, puedes escribirnos a 
        <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="mailto:{{ config('emails.orders_contact_email') }}">
            {{ config('emails.orders_contact_email') }}
        </a> 
        o al <strong>{{ config('emails.orders_contact_phone') }}</strong>.
    </p>

    <p class="content-text">
        Equipo Daryza
    </p>
@endsection