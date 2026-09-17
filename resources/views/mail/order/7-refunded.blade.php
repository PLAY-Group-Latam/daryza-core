@extends('layouts.mail')

@section('content')
    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Te informamos que tu pedido <strong>#{{ $purchase_number }} ha sido reembolsado.</strong>
    </p>

    <p class="content-text">
        El monto correspondiente será devuelto según los tiempos y medios establecidos por tu entidad bancaria. Si deseas más información o conocer el motivo del reembolso, puedes comunicarte con nosotros al correo 
        <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="mailto:{{ config('emails.orders_contact_email') }}">
            {{ config('emails.orders_contact_email') }}
        </a> 
        o al <strong>{{ config('emails.orders_contact_phone') }}</strong>.
    </p>

    <p class="content-text">
        Si lo deseas, puedes realizar una nueva compra en cualquier momento. A continuación, te compartimos nuestras 
   <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="{{ env('APP_URL_CLIENT') }}/productos?on_offer=true&price_max=1000">
    promociones
</a>
        vigentes para que puedas aprovecharlas.
    </p>

    <p class="content-text">
        Equipo Daryza
    </p>
@endsection