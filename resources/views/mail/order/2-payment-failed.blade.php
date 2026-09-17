@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Te informamos que no pudimos procesar el pago correspondiente a tu pedido <strong>#{{ $purchase_number }}</strong>.
    </p>

    <p class="content-text">
        Esto puede deberse a un inconveniente con el medio de pago utilizado o a una interrupción durante la transacción.
    </p>

    <p class="content-text">
        Te invitamos a intentarlo nuevamente o a utilizar un método de pago alternativo para poder completar tu compra.
    </p>

    <p class="content-text">
        Si necesitas ayuda, puedes escribirnos a 
        <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="mailto:{{ config('emails.orders_contact_email') }}">
            {{ config('emails.orders_contact_email') }}
        </a> 
        o por WhatsApp al <strong>{{ config('emails.orders_contact_phone') }}</strong>, con gusto te apoyaremos.
    </p>

    <p class="content-text">
        Equipo Daryza
    </p>
@endsection