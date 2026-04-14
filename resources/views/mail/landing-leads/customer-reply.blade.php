@extends('layouts.mail')

@section('content')
<p style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
    Estimado(a) <strong>{{ $lead->full_name }}</strong>,
</p>

<p style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
    Gracias por la información. En breve nos comunicaremos con usted.
</p>

<p style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
    <strong>Nuestro horario de atención es:</strong> {{ $attentionSchedule }}
</p>

@endsection