<?php

namespace App\Services\Mail;

use App\Models\Settings\DestinationEmail;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use RuntimeException;

class DestinationEmailResolver
{
    public function resolve(string $pageKey): string
    {
        $pageConfig = config("emails.destination_emails.pages.$pageKey");

        if (!$pageConfig) {
            throw new InvalidArgumentException("Page key de correo no configurado: {$pageKey}");
        }

        $configuredEmail = DestinationEmail::query()
            ->active()
            ->forPage($pageKey)
            ->value('email');

        if (!empty($configuredEmail)) {
            return $configuredEmail;
        }

        $fallbackEmail = $pageConfig['fallback_email'] ?? null;

        if (!empty($fallbackEmail)) {
            return $fallbackEmail;
        }

        $fallbackEnv = $pageConfig['fallback_env'] ?? 'desconocido';

        Log::error('No hay correo destino configurado ni fallback de entorno.', [
            'page_key' => $pageKey,
            'fallback_env' => $fallbackEnv,
        ]);

        throw new RuntimeException("No hay correo destino para {$pageKey}. Configure una fila activa o {$fallbackEnv}.");
    }
}
