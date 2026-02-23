@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Pedido entregado parcialmente
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Queremos informarte que tu pedido <strong>#{{ $purchase_number }}</strong> ha sido entregado parcialmente.
    </p>

    <p class="content-text">
        Estamos coordinando la entrega de los productos pendientes y nos aseguraremos de enviarlos a la brevedad posible.
    </p>

    @include('components.about-us')
@endsection
