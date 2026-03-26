<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Rubbermaid Perú</title>
    <style>
        * {
            font-size: 14px;
        }

        /* Reset styles for email clients */
        body,
        table,
        td,
        p,
        a,
        li,
        blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Base styles - Inline for better email support */
        .email-body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
        }

        .email-wrapper {
            background-color: #f4f4f4;
            padding: 16px 0;
            width: 100%;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        /* Header styles */
        .header-cell {
            background-color: #44ac34;
            padding: 16px 30px;
            text-align: center;
        }

        .logo-link {
            font-family: Arial, sans-serif;
            font-size: 24px;
            font-weight: bold;
            color: #000000;
            text-decoration: none;
            display: inline-block;
        }

        .logo-subtitle {
            font-size: 14px;
            font-weight: normal;
            color: #000000;
        }

        /* Content styles */
        .content-cell {
            padding: 40px 30px;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
        }

        .content-title {
            color: #333333;
            font-size: 28px;
            margin: 0 0 16px 0;
            font-weight: bold;
        }

        .content-subtitle {
            color: #333333;
            font-size: 22px;
            margin: 15px 0 15px 0;
            font-weight: bold;
        }

        .content-text {
            /* margin: 0 0 16px 0; */
            font-size: 14px;
            color: #555;
            line-height: 1.6;
        }

        /* Button styles */
        .btn-primary {
            display: inline-block;
            padding: 15px 30px;
            background-color: #dc3545;
            color: #ffffff;
            text-decoration: none;
            border-radius: 16px;
            font-weight: bold;
            font-size: 16px;
            margin: 16px 10px;
            text-align: center;
        }

        .btn-secondary {
            display: inline-block;
            padding: 15px 30px;
            background-color: #6c757d;
            color: #ffffff;
            text-decoration: none;
            border-radius: 24px;
            font-weight: bold;
            font-size: 16px;
            margin: 16px 10px;
            text-align: center;
        }

        /* Status badge styles */
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 16px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0;
        }

        .status-confirmed {
            background-color: #d4edda;
            color: #155724;
        }

        .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
        }

        .status-scheduled {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-cancelled {
            background-color: #f8d7da;
            color: #721c24;
        }

        .status-delivered {
            background-color: #d4edda;
            color: #155724;
        }

        .status-partial {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-failed {
            background-color: #f8d7da;
            color: #721c24;
        }

        /* Card styles */
        .card-primary {
            background-color: #fff;
            border: 2px solid #FFD700;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }

        .card-light {
            background-color: #f8f9fa;
            padding: 16px;
            border-radius: 16px;
            margin: 24px 0;
        }

        .card-success {
            background-color: #d4edda;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }

        .card-warning {
            background-color: #fff3cd;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }

        .card-danger {
            background-color: #f8d7da;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
            border-left: 4px solid #dc3545;
        }

        /* Footer styles */
        .footer-cell {
            background-color: #333333;
            padding: 30px;
            color: #ffffff;
        }

        .footer-text {
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
            color: #ffffff;
        }

        .footer-brand {
            color: #44ac34;
            font-weight: bold;
        }

        .footer-logo {
            display: block;
            width: 100px;
            height: auto;
            margin: 0;
        }

        .footer-link {
            color: #FFD700;
            text-decoration: none;
        }

        .footer-domain {
            color: #ffffff;
            text-decoration: none;
        }

        .social-container {
            margin: 18px 0 16px 0;
            text-align: center;
        }

        .social-link {
            display: inline-block;
            margin: 0 6px;
            text-decoration: none;
        }

        .social-icon {
            width: 22px;
            height: 22px;
            display: block;
        }

        .footer-inline-icon {
            width: 14px;
            height: 14px;
            vertical-align: -2px;
            margin-right: 6px;
        }

        .footer-contact-row {
            margin: 16px 0 0 0;
            text-align: center;
        }

        .footer-contact-item {
            display: inline-block;
            margin: 0 10px 6px 10px;
            color: #ffffff;
            text-decoration: none;
            font-size: 12px;
            line-height: 1.4;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            /* border: 1px solid #ccc; */
            padding: 8px;
        }

        .text-center {
            text-align: center;
        }

        .bordered-table>tbody>tr>td,
        .bordered-table>tbody>tr>th {
            border: 1px solid #ccc;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }

            .content-cell,
            .header-cell,
            .footer-cell {
                padding: 16px !important;
            }

            .content-title {
                font-size: 24px !important;
            }

            .btn-primary,
            .btn-secondary {
                display: block !important;
                margin: 10px 0 !important;
                text-align: center !important;
            }

            .footer-contact-item {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                margin: 0 0 8px 0 !important;
                line-height: 1.5 !important;
            }

            .footer-contact-item:last-child {
                margin-bottom: 0 !important;
            }

            .footer-inline-icon {
                margin-right: 8px !important;
            }
        }
    </style>
</head>

<body class="email-body">
    @php
    $socialLinks = array_filter((array) config('emails.social_links', []), fn($url) => filled($url));
    $frontendUrl = rtrim((string) config('app.frontend_url', 'https://www.daryza.com'), '/');
    $phone = (string) config('emails.contact_phone', '+51 1 234 5678');
    $mailAssets = (array) config('emails.assets', []);
    $logoUrl = (string) ($mailAssets['logo'] ?? 'https://storage.googleapis.com/daryza_dev/logo-email-daryza.png');
    $websiteIcon = (string) ($mailAssets['website_icon'] ??
    'https://img.icons8.com/material-rounded/48/ffffff/globe--v1.png');
    $phoneIcon = (string) ($mailAssets['phone_icon'] ?? 'https://img.icons8.com/ios-filled/50/ffffff/phone.png');
    $locationIcon = (string) ($mailAssets['location_icon'] ?? 'https://img.icons8.com/ios-filled/50/ffffff/marker.png');
    $socialIcons = [
    'facebook' => (string) data_get($mailAssets, 'social.facebook',
    'https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png'),
    'instagram' => (string) data_get($mailAssets, 'social.instagram', 'https://cdn.simpleicons.org/instagram/FFFFFF'),
    'youtube' => (string) data_get($mailAssets, 'social.youtube',
    'https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png'),
    'linkedin' => (string) data_get($mailAssets, 'social.linkedin',
    'https://img.icons8.com/ios-filled/50/ffffff/linkedin.png'),
    ];
    $socialLabels = [
    'facebook' => 'Facebook',
    'instagram' => 'Instagram',
    'youtube' => 'YouTube',
    'linkedin' => 'LinkedIn',
    ];
    @endphp
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
            <td>
                <table align="center" cellpadding="0" cellspacing="0" border="0" width="600px" class="email-wrapper">
                    <tr>
                        <td align="center">
                            <table class="email-container" cellpadding="0" cellspacing="0" border="0" width="600">

                                {{-- HEADER ESTÁTICO --}}
                                <tr>

                                    <td align="center" class="header-cell">

                                        <img src="{{ $logoUrl }}" alt="Daryza Logo"
                                            style="display:block; width:160px; height:auto; margin:auto" />
                                    </td>
                                </tr>

                                {{-- CONTENIDO DINÁMICO --}}
                                <tr>
                                    <td class="content-cell">
                                        @yield('content')
                                    </td>
                                </tr>

                                <tr>
                                    <td class="content-cell" style="padding-top: 0;">
                                        @include('components.email-disclaimer')
                                    </td>
                                </tr>

                                {{-- FOOTER ESTÁTICO --}}
                                <tr>
                                    <td class="footer-cell">
                                        <img class="footer-logo" src="{{ $logoUrl }}" alt="Daryza Logo"
                                            style="margin: 0 auto 2px auto;" />

                                        @if (!empty($socialLinks))
                                        <div class="social-container">
                                            @foreach ($socialLinks as $network => $url)
                                            @if (isset($socialIcons[$network], $socialLabels[$network]))
                                            <a href="{{ $url }}" class="social-link" target="_blank"
                                                rel="noopener noreferrer" aria-label="{{ $socialLabels[$network] }}">
                                                <img class="social-icon" src="{{ $socialIcons[$network] }}"
                                                    alt="{{ $socialLabels[$network] }}" />
                                            </a>
                                            @endif
                                            @endforeach
                                        </div>
                                        @endif

                                        <div class="footer-contact-row">
                                            <a href="{{ $frontendUrl }}" class="footer-contact-item" target="_blank"
                                                rel="noopener noreferrer"
                                                style="color:#ffffff !important; text-decoration:none !important;">
                                                <img class="footer-inline-icon" src="{{ $websiteIcon }}"
                                                    alt="Sitio web" />
                                                {{ $frontendUrl }}
                                            </a>
                                            <a href="tel:{{ preg_replace('/\s+/', '', $phone) }}"
                                                class="footer-contact-item" target="_blank" rel="noopener noreferrer"
                                                style="color:#ffffff !important; text-decoration:none !important;">
                                                <img class="footer-inline-icon" src="{{ $phoneIcon }}" alt="Telefono" />
                                                {{ $phone }}
                                            </a>
                                            <span class="footer-contact-item">
                                                <img class="footer-inline-icon" src="{{ $locationIcon }}"
                                                    alt="Ubicacion" />
                                                Lima, Perú
                                            </span>
                                        </div>

                                        <p class="footer-text" style="text-align: center; margin-top: 8px;">© 2026
                                            Daryza Sac. Todos los derechos reservados.</p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
