@extends('layouts.mail')

@section('content')
<h1 class="content-title">¡Bienvenido a Rubbermaid! 🎉</h1>

<p class="content-text">Hola <strong>{{$username}}</strong>,</p>

<p class="content-text">
    Te damos la bienvenida a la tienda oficial de Rubbermaid.
    Ahora podrás acceder a todos nuestros productos de calidad comercial con las mejores ofertas.
</p>

<div style="text-align: center;">
    <a href="{{ env('APP_URL_CLIENT').'/p' }}" class="btn-primary">Explorar Productos</a>
</div>

<div class="card-light">
    <h2 class="content-subtitle">🎁 Beneficios de tu cuenta:</h2>
    <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Cupones de descuento</li>
        <li>Seguimiento de pedidos</li>
        <li>Pago por transferencia y/o en línea</li>
    </ul>
</div>

<p class="content-text" style="font-size: 14px; color: #6c757d;">
    Si no creaste esta cuenta, puedes ignorar este correo.
</p>
@endsection