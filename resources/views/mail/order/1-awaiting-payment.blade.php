@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Tu pedido ha sido recibido
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        Hemos recibido tu orden <strong>#{{ $purchase_number }}</strong> y será programada tan pronto como recibamos tu
        pago.
    </p>

    <p class="content-text">
        Recuerda que es importante enviar la constancia de pago al correo
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="mailto:{{ config('app.orders_notifications.contact_email') }}">
            {{ config('app.orders_notifications.contact_email') }}
        </a>
        o por WhatsApp al número
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="tel:{{ config('app.orders_notifications.contact_phone') }}">
            {{ config('app.orders_notifications.contact_phone') }}
        </a>.
    </p>

    <p class="content-text">
        El pedido se encontrará en espera de abono durante 5 días, posterior a este plazo se procederá a cancelar el
        pedido.
    </p>

    <p class="content-text">
        Una vez confirmado el abono, iniciaremos el proceso de preparación del pedido y te enviaremos por correo
        la notificación indicando la fecha de despacho.
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

                        <td valign="top" align="right" style="white-space: nowrap;">
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

    @if (!empty($accounts) && $accounts->isNotEmpty())
        <p class="content-text">
            A continuación, le compartimos los números de cuenta, recuerda que todas las cuentas corrientes se
            encuentran a nombre de DARYZA:
        </p>

        <table class="bordered-table">
            <tr>
                <th>
                    <div class="content-text">Banco</div>
                </th>

                <th>
                    <div class="content-text">Número de Cuenta</div>
                </th>

                <th>
                    <div class="content-text">CCI</div>
                </th>
            </tr>

            @foreach ($accounts as $account)
                <tr>
                    <td>
                        <div class="content-text text-center">{{ $account['bank_name'] }}</div>
                    </td>

                    <td>
                        <div class="content-text text-center">{{ $account['account_number'] }}</div>
                    </td>

                    <td>
                        <div class="content-text text-center">{{ $account['interbank_account_number'] }}</div>
                    </td>
                </tr>
            @endforeach
        </table>
    @endif

    @include('components.about-us')
@endsection
