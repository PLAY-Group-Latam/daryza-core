@extends('layouts.mail')

@section('content')
    <h1 class="content-title">
        Pedido fallido #{{ $purchase_number }}
    </h1>

    <p class="content-text">Hola <strong>{{ $customer }}</strong>,</p>

    <p class="content-text">
        El pago del pedido <strong>#{{ $purchase_number }}</strong> de {{ $customer }} ha fallado.
    </p>

    <p class="content-text">
        Puedes solicitar soporte adicional al siguiente número:
        <a style="color:#ff9900; font-weight:bold; text-decoration:none;" href="tel:{{ config('app.orders_notifications.contact_phone') }}">
            {{ config('app.orders_notifications.contact_phone') }}
        </a>.
    </p>

    <p class="content-text">
        El detalle de tu pedido es el siguiente:
    </p>

    <div class="card-light" style="border-radius: 8px; padding: 24px 16px;">
        <table cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td valign="bottom" align="left">
                    <a style="color:#ff9900; font-weight:bold; text-decoration:none;"
                        href="{{ env('APP_URL_CLIENT') . '/perfil/pedidos?purchaseNumber=' . $purchase_number }}">
                        Pedido #{{ $purchase_number }}
                    </a>.
                    ({{ $purchase_date }})
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
