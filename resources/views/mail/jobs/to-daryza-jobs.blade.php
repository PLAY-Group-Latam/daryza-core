@extends('layouts.mail')

@section('content')
<h1 class="content-title">Recibimos una postulación</h1>

<p class="content-text">Hola Equipo Daryza,</p>
<p class="content-text">
    Se recibió una postulación por parte de 
    <strong>{{ $JobsRequest->first_name }} {{ $JobsRequest->last_name }}</strong>
    para el puesto de <strong>{{ $JobsRequest->job['title'] }}</strong>.
    Para más detalles ir al administrador de Daryza.
</p>
<p class="content-text" style="font-size: 14px; color: #6c757d;">
    Si no reconoces esta acción, puedes ignorar este correo.
</p>
@endsection