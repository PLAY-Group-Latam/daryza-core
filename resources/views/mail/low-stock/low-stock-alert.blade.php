@extends('layouts.mail')

@section('content')
<div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
    <p>Equipo Daryza,</p>

    @if($item['stock'] <= 0)
        <p>
            El {{ strtolower($item['type']) }} <strong>{{ $item['name'] }}</strong> con
            SKU DARYZA: <strong>{{ $item['sku_or_code'] }}</strong> está agotado.
        </p>
        <p>Se recomienda gestionar su reposición de forma inmediata.</p>
    @else
        <p>
            El {{ strtolower($item['type']) }} <strong>{{ $item['name'] }}</strong> 
            SKU DARYZA: <strong>{{ $item['sku_or_code'] }}</strong> tiene pocas existencias.
        </p>
        <p>Stock disponible: {{ $item['stock'] }} unidades.</p>
    @endif
</div>
@endsection