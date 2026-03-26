@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Entrega fallida
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Lamentamos informarte que no pudimos completar la entrega de tu pedido <strong>#{{ $purchase_number }}</strong>.
    </p>

    <p class="content-text">
        Nuestra unidad de transporte se acercó a la dirección indicada, sin embargo, no obtuvo respuesta al momento de la
        visita.
    </p>

    <p class="content-text">
        Recuerda que la entrega es gratuita solo en el primer intento, por lo que te agradeceremos confirmarnos una nueva
        fecha o horario para coordinar la reprogramación.
    </p>

    <p class="content-text">
        A continuación, te compartimos nuestros medios de contacto para cualquier duda o consulta
        adicional:
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="mailto:{{ config('app.orders_notifications.contact_email') }}">
            {{ config('app.orders_notifications.contact_email') }}
        </a>
        o al
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="tel:{{ config('app.orders_notifications.contact_phone') }}">
            {{ config('app.orders_notifications.contact_phone') }}
        </a>.
    </p>

    <p class="content-text">
        Gracias
    </p>

    <p class="content-text">
        Equipo {{ config('app.name') }}
    </p>
@endsection
