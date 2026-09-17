@extends('layouts.mail')

@section('content')

<p class="content-text">Hola <strong>{{ ($order->customer_first_name ?? '') . ' ' . ($order->customer_last_name ?? '') ?: $customer }}</strong>,</p>

<p class="content-text">
    Hemos recibido tu orden <strong>#{{ $order->code ?? $purchase_number }}</strong> y será programada tan pronto como validemos tu pago.
</p>

{{-- Texto condicional según si es transferencia o niubiz --}}
@php
$paymentMethodType = $order->payment_method_type ?? '';
$isTransfer = $paymentMethodType === 'bank_transfer' || $paymentMethodType === 'transferencia';
@endphp

@if($isTransfer)
<p class="content-text">
    Para continuar con tu compra, envíanos tu constancia de pago al correo
    <a style="color:#2563eb; font-weight:bold; text-decoration:underline;" href="mailto:{{ config('emails.orders_contact_email') }}">
        {{ config('emails.orders_contact_email') }}
    </a>
    o al WhatsApp al número
    <a style="color:#2563eb; font-weight:bold; text-decoration:none;" href="tel:{{ config('emails.orders_contact_phone') }}">
        {{ config('emails.orders_contact_phone') }}
    </a>. Si ya la enviaste, por favor omite este mensaje.
</p>
@endif

<div style="text-align: right;">
    <div style="display: inline-block; text-align: left;">
        <p class="content-text" style="margin-bottom: 5px;">
            <strong>Importante:</strong>
        </p>
        <ul class="content-text" style="margin-top: 0; padding-left: 20px;">
            <li>El tiempo de despacho es de <strong>24 a 48 horas hábiles</strong> luego de confirmado el pago.</li>
            <li>Atendemos despachos de <strong>lunes a viernes de 8:00 a.m. a 6:00 p.m. y sábados de 8:00 a.m. a 1:00 p.m.</strong></li>
            <li>No realizamos despachos domingos, feriados ni el mismo día de la compra.</li>
        </ul>
    </div>
</div>

<p class="content-text">
    Si tienes alguna duda sobre tu pedido, puedes escribirnos a
    <a style="color:#2563eb; text-decoration:underline;" href="mailto:{{ config('emails.orders_contact_email') }}">
        {{ config('emails.orders_contact_email') }}
    </a>
    o al <strong>{{ config('emails.orders_contact_phone') }}</strong>.
</p>
<p class="content-text">
    Los detalles de tu pedido se muestran a continuación para tu referencia:
</p>

{{-- Banner Superior Estilo Tabla (Verde Daryza) --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: Arial, sans-serif; margin-top: 15px;">
    <tr>
        <td style="background-color: #13a538; text-align: center; padding: 20px 16px; border: 1px solid #000000;">
            <h2 style="margin: 0; font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">
                Nuevo pedido {{ $order->code ?? $purchase_number }}
            </h2>
        </td>
    </tr>
</table>

{{-- Tabla Principal de Productos + Totales (Grilla Negra Estricta) --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; color: #000000; margin-bottom: 20px;">
    <thead>
        <tr style="background-color: #000000; color: #ffffff;">
            <th style="padding: 12px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 12%;">SKU<br>DARYZA</th>
            <th style="padding: 12px 12px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 48%;">NOMBRE</th>
            <th style="padding: 12px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 14%;">PRECIO<br>UNITARIO</th>
            <th style="padding: 12px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 10%;">CANTIDAD</th>
            <th style="padding: 12px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 14%;">PRECIO TOTAL</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($order->items as $item)
        <tr>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">
                {{ $item->variant_sku ?? '-' }}
            </td>
            <td style="padding: 12px 12px; border: 1px solid #000000; text-align: center; line-height: 1.4;">
                {{ $item->product_name ?? $item['title'] ?? '' }}
            </td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">
                {{ number_format($item->unit_price ?? $item['price'] ?? 0, 2) }}
            </td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">
                {{ $item->quantity ?? $item['quantity'] ?? 1 }}
            </td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">
                {{ number_format($item->line_total ?? ($item['total'] ?? 0), 2) }}
            </td>
        </tr>
        @endforeach

        {{-- Filas de Resumen Inferior --}}
        <tr>
            <td colspan="4" style="padding: 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">SUBTOTAL</td>
            <td style="padding: 10px 6px; border: 1px solid #000000; text-align: center;">{{ number_format($order->subtotal ?? 0, 2) }}</td>
        </tr>
        <tr>
            <td colspan="4" style="padding: 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">ENVÍO</td>
            <td style="padding: 10px 6px; border: 1px solid #000000; text-align: center;">
                {{ ($order->delivery_cost ?? 0) == 0 ? 'Envío gratuito' : number_format($order->delivery_cost, 2) }}
            </td>
        </tr>

        {{-- Cupón Dinámico --}}
        @php
        $redemption = method_exists($order, 'couponRedemptions') ? $order->couponRedemptions()->with('coupon')->first() : null;
        $couponCode = $redemption?->coupon?->code ?? null;
        @endphp
        <tr>
            <td colspan="4" style="padding: 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">
                @if($couponCode)
                CUPÓN ({{ strtoupper($couponCode) }})
                @else
                CUPÓN (-)
                @endif
            </td>
            <td style="padding: 10px 6px; border: 1px solid #000000; text-align: center;">
                @if(($order->discount_total ?? 0) > 0)
                S/ {{ number_format($order->discount_total, 2) }}
                @else
                -
                @endif
            </td>
        </tr>

        {{-- Método de Pago --}}
        @php
        $paymentLabel = match ($paymentMethodType) {
        'bank_transfer', 'transferencia' => 'Transferencia bancaria o QR',
        'niubiz' => 'Tarjeta de Crédito / Débito',
        default => 'Transferencia bancaria o QR',
        };
        @endphp
        <tr>
            <td colspan="4" style="padding: 10px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">MÉTODO DE PAGO</td>
            <td style="padding: 10px 6px; border: 1px solid #000000; text-align: center; font-size: 12px;">
                {{ $paymentLabel }}
            </td>
        </tr>

        <tr>
            <td colspan="4" style="padding: 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 13px;">TOTAL</td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center; font-weight: bold;">{{ number_format($order->total ?? 0, 2) }}</td>
        </tr>
    </tbody>
</table>

{{-- Tabla de Datos de Despacho y Cliente --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; color: #000000; margin-bottom: 20px;">
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold; width: 45%;">DNI</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center; width: 55%;">{{ $order->customer_document_number ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">NOMBRE</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center; font-weight: normal;">
            {{ Str::upper(($order->customer_first_name ?? '') . ' ' . ($order->customer_last_name ?? '')) ?: $customer }}
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">CORREO</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center; color: #2563eb; text-decoration: underline;">
            {{ $order->customer_email ?? '-' }}
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">TELÉFONO</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">{{ $order->customer_mobile_phone ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">RUC</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">{{ $order->billing_ruc ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">RAZÓN SOCIAL</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">{{ Str::upper($order->billing_social_reason ?? '-') }}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">DIRECCIÓN FISCAL</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">{{ Str::upper($order->billing_fiscal_address ?? '-') }}</td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">DIRECCIÓN DE ENTREGA</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">
            {{ Str::upper(trim(($order->shipping_address_line ?? '') . ' ' . ($order->shipping_number ?? '') . ' ' . ($order->shipping_floor_apartment ?? ''))) ?: '-' }}
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">DPTO / PROVINCIA / DISTRITO</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">
            {{ Str::upper(($order->department_name ?? '') . ' – ' . ($order->province_name ?? '') . ' – ' . ($order->district_name ?? '')) }}
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 14px; border: 1px solid #000000; font-weight: bold;">REFERENCIA</td>
        <td style="padding: 10px 14px; border: 1px solid #000000; text-align: center;">{{ Str::upper($order->shipping_reference ?? '-') }}</td>
    </tr>
 
</table>

{{-- Cuentas bancarias si aplica --}}
@if (!empty($accounts) && $accounts->isNotEmpty())
<p class="content-text">
    A continuación, le compartimos los números de cuenta. Recuerda que todas las cuentas corrientes se encuentran a nombre de DARYZA SAC:
</p>

<table class="bordered-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
        <th style="border: 1px solid #000000; padding: 10px;">
            <div class="content-text">Banco</div>
        </th>
        <th style="border: 1px solid #000000; padding: 10px;">
            <div class="content-text">Número de Cuenta</div>
        </th>
        <th style="border: 1px solid #000000; padding: 10px;">
            <div class="content-text">CCI</div>
        </th>
    </tr>
    @foreach ($accounts as $account)
    <tr>
        <td style="border: 1px solid #000000; padding: 8px;">
            <div class="content-text text-center">{{ $account['bank_name'] ?? $account->bank_name ?? '' }}</div>
        </td>
        <td style="border: 1px solid #000000; padding: 8px;">
            <div class="content-text text-center">{{ $account['account_number'] ?? $account->account_number ?? '' }}</div>
        </td>
        <td style="border: 1px solid #000000; padding: 8px;">
            <div class="content-text text-center">{{ $account['interbank_account_number'] ?? $account->interbank_account_number ?? '' }}</div>
        </td>
    </tr>
    @endforeach
</table>
@endif

@endsection