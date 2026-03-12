<?php

namespace App\Http\Api\v1\Services\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class NiubizService
{
    public function createSession(string $purchaseNumber, float $amount, string $currency = 'PEN'): array
    {
        [$merchantId, $baseUrl, $timeout] = $this->baseConfig();
        $securityToken = $this->requestSecurityToken();

        $response = $this->niubizHttp()->withHeaders([
                'Authorization' => $securityToken,
            ])
            ->timeout($timeout)
            ->acceptJson()
            ->post(
                $baseUrl . '/api.ecommerce/v2/ecommerce/token/session/' . $merchantId,
                [
                    'channel' => 'web',
                    'amount' => round($amount, 2),
                    'recurrenceMaxAmount' => round($amount, 2),
                    'recurrenceAmount' => round($amount, 2),
                    'order' => [
                        'purchaseNumber' => $purchaseNumber,
                        'amount' => round($amount, 2),
                        'currency' => strtoupper($currency),
                    ],
                ]
            );

        if (!$response->successful()) {
            throw new \RuntimeException('No se pudo crear la sesión de pago en Niubiz.');
        }

        $payload = $response->json();
        $sessionKey = (string) data_get($payload, 'sessionKey', '');

        if ($sessionKey === '') {
            throw new \RuntimeException('Niubiz no devolvió sessionKey.');
        }

        return [
            'session_key' => $sessionKey,
            'raw' => $payload,
        ];
    }

    public function confirmWithTransactionToken(
        string $transactionToken,
        string $purchaseNumber,
        float $amount,
        string $currency = 'PEN'
    ): array {
        [$merchantId, $baseUrl, $timeout] = $this->baseConfig();
        $securityToken = $this->requestSecurityToken();

        $response = $this->niubizHttp()->withHeaders([
                'Authorization' => $securityToken,
            ])
            ->timeout($timeout)
            ->acceptJson()
            ->post(
                $baseUrl . '/api.authorization/v3/authorization/ecommerce/' . $merchantId,
                [
                    'channel' => 'web',
                    'captureType' => 'manual',
                    'countable' => true,
                    'order' => [
                        'tokenId' => $transactionToken,
                        'purchaseNumber' => $purchaseNumber,
                        'amount' => round($amount, 2),
                        'currency' => strtoupper($currency),
                    ],
                ]
            );

        if (!$response->successful()) {
            throw new \RuntimeException('No se pudo confirmar la transacción en Niubiz.');
        }

        $payload = $response->json();

        return [
            'raw' => $payload,
            'is_approved' => $this->isApproved($payload),
            'authorization_code' => $this->extractAuthorizationCode($payload),
            'transaction_id' => $this->extractTransactionId($payload, $purchaseNumber),
            'brand' => $this->extractBrand($payload),
            'masked_card' => $this->extractMaskedCard($payload),
            'response_code' => (string) data_get($payload, 'dataMap.ACTION_CODE', data_get($payload, 'actionCode', '')),
            'response_message' => (string) data_get($payload, 'dataMap.ACTION_DESCRIPTION', data_get($payload, 'actionDescription', '')),
        ];
    }

    public function confirmAuthorization(string $purchaseNumber): array
    {
        [$merchantId, $baseUrl, $timeout] = $this->baseConfig();
        $securityToken = $this->requestSecurityToken();

        $authResponse = $this->niubizHttp()->withHeaders([
                'Authorization' => $securityToken,
            ])
            ->timeout($timeout)
            ->acceptJson()
            ->get($baseUrl . '/api.authorization/v3/authorization/ecommerce/' . $merchantId . '/' . $purchaseNumber);

        if (!$authResponse->successful()) {
            throw new \RuntimeException('No se pudo confirmar la autorización en Niubiz.');
        }

        $payload = $authResponse->json();

        return [
            'raw' => $payload,
            'is_approved' => $this->isApproved($payload),
            'authorization_code' => $this->extractAuthorizationCode($payload),
            'transaction_id' => $this->extractTransactionId($payload, $purchaseNumber),
            'brand' => $this->extractBrand($payload),
            'masked_card' => $this->extractMaskedCard($payload),
            'response_code' => (string) data_get($payload, 'dataMap.ACTION_CODE', data_get($payload, 'actionCode', '')),
            'response_message' => (string) data_get($payload, 'dataMap.ACTION_DESCRIPTION', data_get($payload, 'actionDescription', '')),
        ];
    }

    private function baseConfig(): array
    {
        if (!config('services.niubiz.enabled')) {
            throw new \RuntimeException('Niubiz no está habilitado en la configuración.');
        }

        $merchantId = (string) config('services.niubiz.merchant_id');
        $baseUrl = rtrim((string) config('services.niubiz.api_url', config('services.niubiz.base_url')), '/');
        $timeout = (int) config('services.niubiz.timeout', 15);

        if (!$merchantId || !$baseUrl) {
            throw new \RuntimeException('Configuración de Niubiz incompleta.');
        }

        return [$merchantId, $baseUrl, $timeout];
    }

    private function requestSecurityToken(): string
    {
        [$merchantId, $baseUrl, $timeout] = $this->baseConfig();
        $username = (string) config('services.niubiz.user', config('services.niubiz.username'));
        $password = (string) config('services.niubiz.password');

        if (!$merchantId || !$baseUrl || !$username || !$password) {
            throw new \RuntimeException('Credenciales de Niubiz incompletas.');
        }

        $response = $this->niubizHttp()->withBasicAuth($username, $password)
            ->timeout($timeout)
            ->accept('text/plain')
            ->post($baseUrl . '/api.security/v1/security');

        if (!$response->successful()) {
            throw new \RuntimeException('Niubiz security token request falló.');
        }

        $token = trim((string) $response->body());

        if ($token === '') {
            throw new \RuntimeException('Niubiz no devolvió token de seguridad.');
        }

        return $token;
    }

    private function niubizHttp()
    {
        $pending = Http::retry(2, 300);
        $resolveIp = (string) config('services.niubiz.resolve_ip', '');

        if ($resolveIp === '') {
            return $pending;
        }

        $host = parse_url((string) config('services.niubiz.api_url', ''), PHP_URL_HOST);
        if (!is_string($host) || $host === '' || !filter_var($resolveIp, FILTER_VALIDATE_IP)) {
            return $pending;
        }

        // Allows environments where PHP/cURL DNS resolution fails but direct IP works.
        return $pending->withOptions([
            'curl' => [
                CURLOPT_RESOLVE => [sprintf('%s:443:%s', Str::lower($host), $resolveIp)],
            ],
        ]);
    }

    private function isApproved(array $payload): bool
    {
        $actionCode = (string) data_get($payload, 'dataMap.ACTION_CODE', data_get($payload, 'actionCode', ''));
        $transactionStatus = strtoupper((string) data_get($payload, 'transactionStatus', ''));

        return $actionCode === '000' || in_array($transactionStatus, ['AUTHORIZED', 'AUTHORISED'], true);
    }

    private function extractAuthorizationCode(array $payload): ?string
    {
        $code = (string) data_get($payload, 'dataMap.AUTHORIZATION_CODE', data_get($payload, 'authorizationCode', ''));

        return $code !== '' ? $code : null;
    }

    private function extractTransactionId(array $payload, string $fallback): string
    {
        $transactionId = (string) data_get($payload, 'dataMap.TRANSACTION_ID', data_get($payload, 'transactionId', ''));

        return $transactionId !== '' ? $transactionId : $fallback;
    }

    private function extractBrand(array $payload): ?string
    {
        $brand = (string) data_get($payload, 'dataMap.BRAND', data_get($payload, 'card.brand', ''));

        return $brand !== '' ? $brand : null;
    }

    private function extractMaskedCard(array $payload): ?string
    {
        $maskedCard = (string) data_get($payload, 'dataMap.CARD', data_get($payload, 'card.cardNumber', ''));

        return $maskedCard !== '' ? $maskedCard : null;
    }
}
