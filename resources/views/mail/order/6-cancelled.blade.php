@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Pedido cancelado
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        El pedido <strong>#{{ $purchase_number }}</strong> fue cancelado.
    </p>

    <p class="content-text">
        Si deseas mayor información o conocer el motivo puedes comunicarte con nosotros por correo a
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="mailto:{{ config('app.contact.email') }}">
            {{ config('app.contact.email') }}
        </a>
        o al
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="tel:{{ config('app.contact.phone') }}">
            {{ config('app.contact.phone') }}
        </a>.
    </p>

    <p class="content-text">
        No te preocupes, puedes realizar una nueva compra, a continuación te compartimos todas las
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="{{ env('APP_URL_CLIENT') . '/p' }}">
            promociones
        </a>
        que tenemos disponibles para ti.
    </p>

    <p class="content-text">
        Gracias
    </p>

    <p class="content-text">
        Equipo {{ config('app.name') }}
    </p>
@endsection
