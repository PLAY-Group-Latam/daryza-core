@extends('layouts.mail')

@section('content')
<p class="content-text">Hola <strong>{{$username}}</strong>,</p>

<p class="content-text">
    Te damos la bienvenida a la tienda oficial de <strong>Daryza</strong>.
</p>

<p class="content-text">
    A partir de ahora podrás acceder a tu cuenta para realizar tus compras de forma más rápida, aprovechar nuestras promociones, hacer seguimiento de tus pedidos y gestionar tu información de manera sencilla.
</p>

<h2 class="content-subtitle" style="font-size: 16px; margin-bottom: 10px;">Beneficios de tu cuenta:</h2>
<ul style="margin: 10px 0; padding-left: 20px; list-style-type: disc; color: #333;">
    <li style="margin-bottom: 5px;">Acceso a promociones y cupones exclusivos</li>
    <li style="margin-bottom: 5px;">Seguimiento al estado de tu pedido en tiempo real</li>
    <li style="margin-bottom: 5px;">Pagos seguros por transferencia o en línea</li>
    <li style="margin-bottom: 5px;">Historial de compras y gestión de pedidos</li>
</ul>

<div style="text-align: center; margin: 25px 0;">
    <a href="{{ env('APP_URL_CLIENT').'/p' }}" class="btn-primary">Explorar Productos</a>
</div>

<p class="content-text" style="font-size: 14px;">
    Si no creaste esta cuenta, puedes ignorar este mensaje.
</p>

<p class="content-text" style="font-size: 13px; color: #666; line-height: 1.5;">
    Este es un correo automático de notificación. Si necesitas ayuda, puedes contactarnos al correo 
    <strong>atencionalcliente@daryza.com</strong> o al <strong>{{ env('MAIL_CONTACT_PHONE') }}</strong>.
</p>

<p class="content-text">
    Equipo <strong>Daryza</strong>
</p>
@endsection