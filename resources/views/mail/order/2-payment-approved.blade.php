@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        El pago de tu pedido <strong>#{{ $purchase_number }}</strong> ha sido confirmado de manera exitosa, te enviaremos la confirmación de despacho al correo electrónico registrado una vez que tu pedido esté listo para ser enviado.
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