@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Tu pedido está en camino hoy
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        ¡Buenas noticias! Tu pedido <strong>#{{ $purchase_number }}</strong> ha sido programado para despacho el día de
        <strong>hoy</strong>. Nuestro horario de reparto es de lunes a viernes entre 8:00am a 6:00pm y los sábados de 8:00am
        a 1:00pm.
    </p>

    <p class="content-text">
        Agradecemos estar atentos a la comunicación de nuestro personal de transporte para coordinar la entrega de tu
        pedido.
    </p>

    <p class="content-text">
        Te recordamos que el pedido será entregado en la puerta de su hogar/empresa. No entregamos bolsas.
    </p>

    @include('components.about-us')
@endsection
