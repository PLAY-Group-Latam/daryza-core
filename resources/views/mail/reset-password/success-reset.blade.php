@extends('layouts.mail')

@section('title', 'Cambio de contraseña exitoso')

@section('content')
<tr>
  <td style="padding:35px 30px 25px;">
    <h2 style="margin:0 0 20px; font-size:22px; color:#333;">¡Tu contraseña se ha cambiado!</h2>

    <p style="font-size:15px; color:#555; line-height:1.6; margin:0 0 10px;">
      Hola <strong>{{ $username }}</strong>,
    </p>

    <p style="font-size:15px; color:#555; line-height:1.6; margin:0 0 20px;">
      Tu contraseña se ha cambiado correctamente. Si no reconoces esta actividad, actualiza tu contraseña lo antes
      posible para proteger tu cuenta.
    </p>
  </td>
</tr>
@endsection