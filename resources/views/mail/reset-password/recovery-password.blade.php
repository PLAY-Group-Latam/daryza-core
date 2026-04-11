@extends('layouts.mail')

@section('content')
<div style="padding: 20px; font-family: Arial, sans-serif; color: #333;">
    <p style="font-size: 15px; margin-bottom: 20px;">
        Hola <strong>{{ $username ?? $email }}</strong>,
    </p>

    <p style="font-size: 15px; margin-bottom: 20px;">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Tienda Daryza Perú</strong>.
    </p>

    <p style="font-size: 15px; margin-bottom: 20px;">
        Para continuar con el proceso, haz clic en el siguiente enlace:
    </p>

    <p style="text-align: center; margin: 30px 0;">
        <a href="{{ $url }}" style="font-weight: bold; color: #000; text-decoration: underline; font-size: 16px;">
            Restablecer contraseña
        </a>
    </p>

    <p style="font-size: 15px; margin-bottom: 20px; line-height: 1.5;">
        Este enlace estará disponible por tiempo limitado por motivos de seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña permanecerá sin modificaciones.
    </p>

    <p style="font-size: 15px; margin-bottom: 20px;">
        Si tienes alguna duda o necesitas ayuda, puedes contactarnos a 
        <a href="atencionalcliente@daryza.com" style="color: #007bff; text-decoration: underline;">atencionalcliente@daryza.com</a> o al <strong>{{ env('MAIL_CONTACT_PHONE') }}</strong>.
    </p>

    <p style="font-size: 15px; margin-top: 30px;">
        Equipo <strong>Daryza</strong>
    </p>
</div>
@endsection