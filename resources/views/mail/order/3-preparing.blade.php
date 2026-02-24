@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Tu pedido está programado
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Tu pedido <strong>#{{ $purchase_number }}</strong> Tu pedido se encuentra programado para despacho el día de mañana.
        Recuerda que nuestro horario de reparto es de lunes a viernes entre 8:00am a 6:00pm y los días sábados nuestras
        entregas se realizan de 8:00am a 1:00pm. <strong>No realizamos despachos los días domingos ni feriados.</strong>
    </p>

    <p class="content-text">
        Agradecemos estar atentos a la comunicación de nuestro personal de transporte para realizar la entrega de tu pedido.
    </p>

    <p class="content-text">
        Te recordamos que el pedido será entregado en la puerta de su hogar/empresa. No entregamos bolsas.
    </p>

    @include('components.about-us')
@endsection
