<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline style to set a stable light background before hydration --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico?v={{ @filemtime(public_path('favicon.ico')) }}" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v={{ @filemtime(public_path('apple-touch-icon.png')) }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
        <meta name="description" content="Daryza - Expertos en soluciones de limpieza y desinfección en el Perú.">

        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="Daryza | Soluciones de Limpieza">
        <meta property="og:description" content="Encuentra los mejores productos y suministros de limpieza. Calidad profesional para tu hogar o empresa.">
        <meta property="og:image" content="{{ asset('images/logo.png') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:type" content="image/png">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Daryza | Soluciones de Limpieza">
        <meta name="twitter:description" content="Calidad profesional en productos de limpieza.">
        <meta name="twitter:image" content="{{ asset('images/logo.png') }}">
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
