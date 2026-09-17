@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Lamentamos informarte que no pudimos completar la entrega de tu pedido <strong>#{{ $purchase_number }}</strong>.
    </p>

    <p class="content-text">
        Nuestro equipo de transporte se acercó a la dirección registrada, pero no logró completar la entrega, ya que no se obtuvo respuesta en el domicilio ni fue posible establecer contacto al número registrado.
    </p>

    <p class="content-text">
        Para coordinar una nueva entrega, te agradeceremos que nos confirmes una nueva fecha u horario conveniente. Puedes escribirnos a 
        <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="mailto:{{ config('emails.orders_contact_email') }}">
            {{ config('emails.orders_contact_email') }}
        </a> 
        o por WhatsApp al <strong>{{ config('emails.orders_contact_phone') }}</strong>.
    </p>

    <p class="content-text">
        Equipo Daryza
    </p>
@endsection