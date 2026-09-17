@extends('layouts.mail')

@section('content')

{{-- Banner Superior de Nuevo Pedido --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
    <tr>
        <td style="background-color: #ffffff; text-align: center; padding: 24px 16px; border-bottom: none;">
            <h1 style="margin: 0; font-size: 26px; font-weight: bold; color: #000000; letter-spacing: -0.5px;">
                Nuevo pedido {{ $order->code }}
            </h1>
        </td>
    </tr>
</table>

{{-- Tabla Principal de Productos + Totales (Grilla Negra Estricta) --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; color: #000000;">
    <thead>
        <tr style="background-color: #000000; color: #ffffff;">
            <th style="padding: 14px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 12%;">SKU<br>DARYZA</th>
            <th style="padding: 14px 12px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 48%;">NOMBRE</th>
            <th style="padding: 14px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 14%;">PRECIO<br>UNITARIO</th>
            <th style="padding: 14px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 10%;">CANTIDAD</th>
            <th style="padding: 14px 6px; border: 1px solid #000000; font-size: 11px; font-weight: bold; text-align: center; width: 14%;">PRECIO TOTAL</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($order->items as $item)
        <tr>
            <td style="padding: 14px 6px; border: 1px solid #000000; text-align: center;">
                {{ $item->variant_sku ?? '-' }}
            </td>
            <td style="padding: 14px 12px; border: 1px solid #000000; text-align: center; line-height: 1.4;">
                {{ $item->product_name }}
            </td>
            <td style="padding: 14px 6px; border: 1px solid #000000; text-align: center;">
                {{ number_format($item->unit_price, 2) }}
            </td>
            <td style="padding: 14px 6px; border: 1px solid #000000; text-align: center;">
                {{ $item->quantity }}
            </td>
            <td style="padding: 14px 6px; border: 1px solid #000000; text-align: center;">
                {{ number_format($item->line_total, 2) }}
            </td>
        </tr>
        @endforeach

        {{-- Filas de Resumen Inferior --}}
        <tr>
            <td colspan="4" style="padding: 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">SUBTOTAL</td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">{{ number_format($order->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td colspan="4" style="padding: 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">ENVÍO</td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">
                {{ $order->delivery_cost == 0 ? 'Envío gratuito' : number_format($order->delivery_cost, 2) }}
            </td>
        </tr>
        
        {{-- Lógica dinámica del Cupón --}}
        @php
            $couponRedemption = $order->relationLoaded('couponRedemptions') 
                ? $order->couponRedemptions->first() 
                : $order->couponRedemptions()->with('coupon')->first();
            $couponCode = $couponRedemption?->coupon?->code ?? null;
        @endphp
        {{-- Fila de Cupón Dinámica --}}
        @php
            $redemption = $order->relationLoaded('couponRedemptions') ? $order->couponRedemptions->first() : null;
            $couponCode = $redemption?->coupon?->code ?? null;
        @endphp
        <tr>
            <td colspan="4" style="padding: 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">
                @if($couponCode)
                    CUPÓN ({{ strtoupper($couponCode) }})
                @else
                    CUPÓN (-)
                @endif
            </td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center;">
                @if($order->discount_total > 0)
                    S/ {{ number_format($order->discount_total, 2) }}
                @else
                    -
                @endif
            </td>
        </tr>

        @php
            $paymentMethodType = $order->payment_method_type ?? $order->paymentMethod?->type ?? '';
            $paymentMethodLabel = match ($paymentMethodType) {
                'bank_transfer' => 'Transferencia bancaria o QR',
                'niubiz' => 'Tarjeta de Crédito / Débito',
                default => $order->paymentMethod?->name ?? 'Transferencia bancaria o QR',
            };
        @endphp
        <tr>
            <td colspan="4" style="padding: 12px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 12px;">MÉTODO DE PAGO</td>
            <td style="padding: 12px 6px; border: 1px solid #000000; text-align: center; font-size: 12px;">
                {{ $paymentMethodLabel }}
            </td>
        </tr>

        <tr>
            <td colspan="4" style="padding: 14px; border: 1px solid #000000; text-align: center; font-weight: bold; font-size: 13px;">TOTAL</td>
            <td style="padding: 14px 6px; border: 1px solid #000000; text-align: center; font-weight: bold;">{{ number_format($order->total, 2) }}</td>
        </tr>
    </tbody>
</table>

<br><br>

{{-- Tabla de Datos de Despacho y Cliente --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; color: #000000;">
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold; width: 45%;">DNI / DOCUMENTO</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center; width: 55%;">{{ $order->customer_document_number ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">NOMBRE</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center; font-weight: normal;">
            {{ Str::upper(($order->customer_first_name ?? '') . ' ' . ($order->customer_last_name ?? '')) }}
        </td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">CORREO</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center; color: #2563eb; text-decoration: underline;">
            {{ $order->customer_email ?? '-' }}
        </td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">TELÉFONO</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">{{ $order->customer_mobile_phone ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">RUC</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">{{ $order->billing_ruc ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">RAZÓN SOCIAL</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">{{ Str::upper($order->billing_social_reason ?? '-') }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">DIRECCIÓN FISCAL</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">{{ Str::upper($order->billing_fiscal_address ?? '-') }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">DIRECCIÓN DE ENTREGA</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">
            {{ Str::upper(trim(($order->shipping_address_line ?? '') . ' ' . ($order->shipping_number ?? '') . ' ' . ($order->shipping_floor_apartment ?? ''))) ?: '-' }}
        </td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">DPTO / PROVINCIA / DISTRITO</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">
            {{ Str::upper(($order->department_name ?? '') . ' – ' . ($order->province_name ?? '') . ' – ' . ($order->district_name ?? '')) }}
        </td>
    </tr>
    <tr>
        <td style="padding: 12px 14px; border: 1px solid #000000; font-weight: bold;">REFERENCIA</td>
        <td style="padding: 12px 14px; border: 1px solid #000000; text-align: center;">{{ Str::upper($order->shipping_reference ?? '-') }}</td>
    </tr>
   
</table>

@endsection