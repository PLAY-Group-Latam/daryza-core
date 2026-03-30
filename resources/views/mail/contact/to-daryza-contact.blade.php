@extends('layouts.mail')

@section('content')
<h1 class="content-title">Recibimos un Lead de Contacto</h1>

<p class="content-text">Hola Equipo Daryza,</p>
<p class="content-text">
    Se recibió un lead por parte de <strong>{{$complaintsBook->full_name}}</strong>. Para más detalles ir al administrador de Daryza
</p>
<p class="content-text" style="font-size: 14px; color: #6c757d;">
    Si no reconoces esta acción, puedes ignorar este correo.
</p>
@endsection
