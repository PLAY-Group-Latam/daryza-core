<?php

namespace App\Http\Api\v1\Services\Payments;

use Illuminate\Support\Facades\Http;

class NiubizService
{
    public function confirmAuthorization(string $purchaseNumber): array
    {
        if (!config('services.niubiz.enabled')) {
            throw new \RuntimeException('Niubiz no está habilitado en la configuración.');
        }

        $merchantId = (string) config('services.niubiz.merchant_id');
        $baseUrl = rtrim((string) config('services.niubiz.base_url'), '/');
        $username = (string) config('services.niubiz.username');
        $password = (string) config('services.niubiz.password');
        $timeout = (int) config('services.niubiz.timeout', 15);

        if (!$merchantId || !$baseUrl || !$username || !$password) {
            throw new \RuntimeException('Credenciales de Niubiz incompletas.');
        }

        $securityResponse = Http::withBasicAuth($username, $password)
            ->timeout($timeout)
            ->acceptJson()
            ->post($baseUrl . '/api.security/v1/security');

        if (!$securityResponse->successful()) {
            throw new \RuntimeException('Niubiz security token request falló.');
        }

        $securityToken = trim((string) $securityResponse->body());

        if ($securityToken === '') {
            throw new \RuntimeException('Niubiz no devolvió token de seguridad.');
        }

        $authResponse = Http::withToken($securityToken)
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
