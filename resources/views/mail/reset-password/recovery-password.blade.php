@extends('layouts.mail')

@section('title', 'Cambio de contraseña')

@section('content')
<tr>
  <td style="padding:35px 30px 25px;">
    <h2 style="margin:0 0 20px; font-size:22px; color:#333;">Cambio de contraseña</h2>

    <p style="font-size:15px; color:#555; line-height:1.6; margin:0 0 10px;">
      Hola <strong>{{ $email }}</strong>,
    </p>

    <p style="font-size:15px; color:#555; line-height:1.6; margin:0 0 20px;">
      Por favor, haz clic en el siguiente enlace para cambiar tu contraseña:
    </p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="{{ $url }}" style="
        background-color: #ff9900;
        border-radius: 6px;
        color: #ffffff;
        display: inline-block;
        font-size: 15px;
        font-weight: bold;
        padding: 12px 24px;
        text-decoration: none;
    ">
        Cambiar contraseña
      </a>
    </p>

    <p style="font-size:15px; color:#555; line-height:1.6; margin:0;">
      Si no has solicitado este cambio, por favor ignora este correo.
    </p>
  </td>
</tr>

<tr>
  <td>
    <p style="font-size: 13px; color: #999; line-height: 1.6; text-align: center; margin:24px;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
      <a href="{{ $url }}" target="_blank" style="color: #555; word-break: break-all;">{{ $url }}</a>
    </p>
  </td>
</tr>
@endsection