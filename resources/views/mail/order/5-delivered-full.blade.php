@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Tu pedido ha sido entregado con éxito
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Su pedido con referencia <strong>#{{ $purchase_number }}</strong> ha sido entregado con éxito.
    </p>

    <p class="content-text">
        Agradecemos su preferencia.
    </p>

    @if (filled(config('app.orders_notifications.survey_link')))
        <p class="content-text">
            Para nosotros es importante conocer tu experiencia.
        </p>

        <div style="text-align: center;">
            <a href="{{ config('app.orders_notifications.survey_link') }}" class="btn-primary">INICIAR ENCUESTA</a>
        </div>
    @endif

    <p class="content-text">
        ¿Deseas conocer más de nuestras promociones? Dale click
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="{{ env('APP_URL_CLIENT') . '/p' }}">
            aquí
        </a>
        , y únete a esta renovada comunidad de {{ config('app.name') }}.
    </p>

    <p class="content-text">
        Los detalles de tu pedido se muestran a continuación para tu referencia:
    </p>

    <div class="card-light" style="border-radius: 8px; padding: 24px 16px;">
        <table cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td valign="bottom" align="left">
                    <strong>Resumen</strong><br>
                </td>
            </tr>
        </table>

        <div style="border-top: 1px solid oklch(0.708 0 0); margin: 16px 0;"></div>

        <div>
            @foreach ($items as $item)
                <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td valign="top">
                            <div>
                                <strong style="color:#374151;"> {{ $item['title'] }} </strong><br>
                                =
                                <span style="color: #6B7280;">
                                    Cantidad: {{ $item['quantity'] }} x {{ $item['price'] }}
                                </span>
                            </div>
                        </td>

                        <td valign="top" align="right">
                            {{ $item['total'] }}
                        </td>
                    </tr>
                </table>
            @endforeach
        </div>

        <div style="border-top: 1px solid oklch(0.708 0 0); margin: 16px 0;"></div>

        <table cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td valign="top" align="right">
                    <span>
                        <strong>{{ $total }}</strong>
                    </span>
                </td>
            </tr>
        </table>
    </div>
@endsection
