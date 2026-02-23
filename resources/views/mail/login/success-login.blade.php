@extends('layouts.mail')

@section('content')
<h1 class="content-title">¡Bienvenido de vuelta a Daryza!</h1>

<p class="content-text">Hola <strong>{{ $username }}</strong>,</p>

<p class="content-text">
  Tu inicio de sesión se realizó correctamente. Si no reconoces esta actividad, actualiza tu contraseña lo antes
  posible para proteger tu cuenta.
</p>

{{-- @include('components.about-us') --}}
@endsection