@extends('layouts.mail')

@section('content')
<div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
    <p>Equipo Daryza,</p>

    @if(strtolower($item['type']) === 'pack')

        @if($item['stock'] <= 0)
            <p>
                El pack <strong>{{ $item['name'] }}</strong> con 
                SLUG: <strong>{{ $item['slug'] }}</strong> está agotado.
            </p>
            <p>Se recomienda gestionar su reposición de forma inmediata.</p>
        @else
            <p>
                El pack <strong>{{ $item['name'] }}</strong> con 
                SLUG: <strong>{{ $item['slug'] }}</strong> tiene pocas existencias.
            </p>
            <p>Stock disponible: {{ $item['stock'] }} unidades.</p>
        @endif

    @else

        @if($item['stock'] <= 0)
            <p>
                El {{ strtolower($item['type']) }} <strong>{{ $item['name'] }}</strong> con
                SKU DARYZA: <strong>{{ $item['sku_or_code'] }}</strong> está agotado.
            </p>
            <p>Se recomienda gestionar su reposición de forma inmediata.</p>
        @else
            <p>
                El {{ strtolower($item['type']) }} <strong>{{ $item['name'] }}</strong> 
                con SKU DARYZA: <strong>{{ $item['sku_or_code'] }}</strong> tiene pocas existencias.
            </p>
            <p>Stock disponible: {{ $item['stock'] }} unidades.</p>
        @endif

    @endif

</div>
@endsection