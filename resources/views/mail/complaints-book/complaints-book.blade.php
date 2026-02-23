
@extends('layouts.mail')

@section('content')
<h1 class="content-title">Recibimos tu Reclamo</h1>

<p class="content-text">Hola <strong>{{$complaintsBook->full_name}}</strong>,</p>

<p class="content-text">
    Lamentamos los inconvenientes que hayas podido experimentar. Hemos recibido tu reclamo y nuestro equipo ya se encuentra revisando la situación para brindarte una solución lo antes posible.
</p>
<p class="content-text">
    Agradecemos tu paciencia y confianza en la tienda oficial de Rubbermaid.
    Estamos comprometidos con ofrecer productos de calidad comercial y la mejor experiencia de compra.
</p>

<p class="content-text" style="font-size: 14px; color: #6c757d;">
    Si no reconoces esta acción, puedes ignorar este correo.
</p>
@endsection
