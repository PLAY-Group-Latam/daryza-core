@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Pago confirmado
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        El pago de tu pedido <strong>#{{ $purchase_number }}</strong> ha sido confirmado de manera exitosa, muy pronto
        estarás recibiendo la comunicación indicando la fecha de despacho.
    </p>

    <p class="content-text">
        Recuerda que el plazo de atención es de 24 a 48 horas desde que recibes este correo de confirmación.
    </p>

    @include('components.about-us')
@endsection
