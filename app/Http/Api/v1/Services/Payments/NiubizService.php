<?php

namespace App\Http\Api\v1\Services\Payments;

use App\Models\Orders\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NiubizService
{
    public function createSession(Order $order, string $purchaseNumber, string $clientIp): array
    {
        $this->ensureEnabled();
        $merchantId = $this->merchantId();
        $timeout = $this->timeout();
        $securityToken = $this->requestSecurityToken();
        $endpoint = $this->sessionUrl() . '/' . $merchantId;

        $this->debugLog('create_session_request', [
            'method' => 'POST',
            'endpoint' => $endpoint,
            'merchant_id' => $merchantId,
            'has_access_token' => $securityToken !== '',
            'purchase_number' => $purchaseNumber,
            'timeout' => $timeout,
        ]);

        $email = (string) ($order->customer_email ?: '');
        $identifier = (string) ($order->customer_document_number ?: ($email ?: $order->id));
        $registrationReference = $order->customer?->created_at ?? $order->created_at;
        $registrationDays = $registrationReference
            ? max(0, (int) $registrationReference->diffInDays(now()))
            : 0;

        $sessionPayload = [
            'channel' => 'web',
            'amount' => round((float) $order->total, 2),
            'antifraud' => [
                'clientIp' => $clientIp,
                'merchantDefineData' => [
                    'MDD4' => $email,
                    'MDD32' => $identifier,
                    'MDD75' => 'Registrado',
                    'MDD77' => $registrationDays,
                ],
            ],
            'dataMap' => [
                // La doc pide info del cliente; en su defecto, la del comercio.
                'cardholderCity' => (string) ($order->province_name ?: $order->department_name ?: config('niubiz.cardholder.city')),
                'cardholderCountry' => (string) config('niubiz.cardholder.country'),
                'cardholderAddress' => (string) ($order->shipping_address_line ?: config('niubiz.cardholder.address')),
                'cardholderPostalCode' => (string) config('niubiz.cardholder.postal_code'),
                'cardholderState' => (string) config('niubiz.cardholder.state'),
                'cardholderPhoneNumber' => (string) ($order->customer_mobile_phone ?: config('niubiz.cardholder.phone')),
            ],
        ];

        $response = $this->niubizHttp()->withHeaders([
                'Authorization' => $securityToken,
            ])
            ->timeout($timeout)
            ->acceptJson()
            ->post($endpoint, $sessionPayload);

        if (!$response->successful()) {
            $this->warningLog('create_session_failed', $endpoint, $response);
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
        Order $order,
        string $purchaseNumber,
        string $transactionToken
    ): array {
        $this->ensureEnabled();
        $merchantId = $this->merchantId();
        $timeout = $this->timeout();
        $securityToken = $this->requestSecurityToken();
        $endpoint = $this->authorizationUrl() . '/' . $merchantId;

        $this->debugLog('confirm_transaction_request', [
            'method' => 'POST',
            'endpoint' => $endpoint,
            'merchant_id' => $merchantId,
            'has_access_token' => $securityToken !== '',
            'purchase_number' => $purchaseNumber,
            'timeout' => $timeout,
        ]);

        $authorizationPayload = [
            'channel' => 'web',
            'captureType' => 'manual',
            'countable' => true,
            'order' => [
                'tokenId' => $transactionToken,
                'purchaseNumber' => $purchaseNumber,
                'amount' => round((float) $order->total, 2),
                'currency' => strtoupper((string) ($order->currency ?: config('niubiz.currency', 'PEN'))),
            ],
            'dataMap' => [
                'urlAddress' => (string) config('niubiz.url_address'),
                'serviceLocationCityName' => (string) config('niubiz.cardholder.city'),
                'serviceLocationCountrySubdivisionCode' => (string) config('niubiz.cardholder.state'),
                'serviceLocationCountryCode' => (string) config('niubiz.service_location_country'),
                'serviceLocationPostalCode' => (string) config('niubiz.cardholder.postal_code'),
            ],
        ];

        $response = $this->niubizHttp(false)->withHeaders([
                'Authorization' => $securityToken,
            ])
            ->timeout($timeout)
            ->acceptJson()
            ->post($endpoint, $authorizationPayload);

        $payload = $response->json() ?? [];
        $responseCode = $this->extractResponseCode($payload);
        $responseMessage = $this->extractResponseMessage($payload);
        $isApproved = $this->isApproved($payload);

        if (!$response->successful()) {
            $this->warningLog('confirm_transaction_failed', $endpoint, $response);

            // Algunos rechazos de tarjeta llegan con HTTP 400 pero con ACTION_CODE/ACTION_DESCRIPTION.
            if ($responseCode !== '' || $responseMessage !== '' || $this->hasBusinessStatus($payload)) {
                Log::info('niubiz.confirm_with_transaction_token_declined_http_error', [
                    'order_id' => $order->id,
                    'purchase_number' => $purchaseNumber,
                    'http_status' => $response->status(),
                    'response_code' => $responseCode,
                    'response_message' => $responseMessage,
                    'is_approved' => false,
                ]);

                return [
                    'raw' => $payload,
                    'is_approved' => false,
                    'authorization_code' => $this->extractAuthorizationCode($payload),
                    'transaction_id' => $this->extractTransactionId($payload, $purchaseNumber),
                    'brand' => $this->extractBrand($payload),
                    'masked_card' => $this->extractMaskedCard($payload),
                    'response_code' => $responseCode !== '' ? $responseCode : (string) $response->status(),
                    'response_message' => $responseMessage !== '' ? $responseMessage : 'Transacción rechazada por Niubiz.',
                ];
            }

            throw new \RuntimeException('No se pudo confirmar la transacción en Niubiz.');
        }

        Log::info('niubiz.confirm_with_transaction_token_result', [
            'order_id' => $order->id,
            'purchase_number' => $purchaseNumber,
            'response_code' => $responseCode,
            'response_message' => $responseMessage,
            'is_approved' => $isApproved,
        ]);

        return [
            'raw' => $payload,
            'is_approved' => $isApproved,
            'authorization_code' => $this->extractAuthorizationCode($payload),
            'transaction_id' => $this->extractTransactionId($payload, $purchaseNumber),
            'brand' => $this->extractBrand($payload),
            'masked_card' => $this->extractMaskedCard($payload),
            'response_code' => $responseCode,
            'response_message' => $responseMessage,
        ];
    }

    // TODO: Legacy method kept only to prevent accidental usage. Boton de Pago Web must use confirmWithTransactionToken().
    public function confirmAuthorization(string $purchaseNumber): array
    {
        throw new \RuntimeException('confirmAuthorization está deshabilitado. Usa confirmWithTransactionToken.');
    }

    private function ensureEnabled(): void
    {
        if (!config('niubiz.enabled')) {
            throw new \RuntimeException('Niubiz no está habilitado en la configuración.');
        }
    }

    private function merchantId(): string
    {
        $merchantId = (string) config('niubiz.merchant_id');

        if ($merchantId === '') {
            throw new \RuntimeException('Configuración de Niubiz incompleta.');
        }

        return $merchantId;
    }

    private function timeout(): int
    {
        return (int) config('niubiz.timeout', 15);
    }

    private function securityUrl(): string
    {
        return rtrim((string) config('niubiz.security_url'), '/');
    }

    private function sessionUrl(): string
    {
        return rtrim((string) config('niubiz.session_url'), '/');
    }

    private function authorizationUrl(): string
    {
        return rtrim((string) config('niubiz.authorization_url'), '/');
    }

    private function requestSecurityToken(): string
    {
        $username = (string) config('niubiz.user');
        $password = (string) config('niubiz.password');
        $endpoint = $this->securityUrl();

        if ($username === '' || $password === '' || $endpoint === '') {
            throw new \RuntimeException('Credenciales de Niubiz incompletas.');
        }

        $this->debugLog('security_token_request', [
            'method' => 'POST',
            'endpoint' => $endpoint,
            'has_username' => $username !== '',
            'has_password' => $password !== '',
        ]);

        $response = $this->niubizHttp()->withBasicAuth($username, $password)
            ->timeout($this->timeout())
            ->accept('text/plain')
            ->post($endpoint);

        if (!$response->successful()) {
            $this->warningLog('security_token_failed', $endpoint, $response);
            throw new \RuntimeException('Niubiz security token request falló.');
        }

        $token = trim((string) $response->body());

        if ($token === '') {
            throw new \RuntimeException('Niubiz no devolvió token de seguridad.');
        }

        $this->debugLog('security_token_ok', [
            'has_access_token' => true,
        ]);

        return $token;
    }

    private function niubizHttp(bool $enableRetries = true)
    {
        $pending = $enableRetries
            ? Http::retry(2, 300)
            : Http::retry(0, 300);
        $resolveIp = (string) config('niubiz.resolve_ip', '');

        if ($resolveIp === '') {
            $this->debugLog('http_client_mode', [
                'mode' => 'dns_default',
                'retries' => $enableRetries ? 2 : 0,
            ]);
            return $pending;
        }

        $host = parse_url($this->sessionUrl(), PHP_URL_HOST);
        if (!is_string($host) || $host === '' || !filter_var($resolveIp, FILTER_VALIDATE_IP)) {
            $this->warningLogSimple('invalid_resolve_ip_config', [
                'host' => $host,
                'resolve_ip' => $resolveIp,
            ]);
            return $pending;
        }

        $resolvedIps = gethostbynamel($host) ?: [];

        // Evita forzar una IP que no corresponde al host actual (causa típica de cURL error 7).
        if ($resolvedIps !== [] && !in_array($resolveIp, $resolvedIps, true)) {
            $this->warningLogSimple('resolve_ip_mismatch', [
                'host' => $host,
                'resolve_ip' => $resolveIp,
                'dns_ips' => $resolvedIps,
            ]);

            return $pending;
        }

        $this->debugLog('http_client_mode', [
            'mode' => 'curl_resolve',
            'host' => $host,
            'resolve_ip' => $resolveIp,
            'retries' => $enableRetries ? 2 : 0,
        ]);

        // Allows environments where PHP/cURL DNS resolution fails but direct IP works.
        return $pending->withOptions([
            'curl' => [
                CURLOPT_RESOLVE => [sprintf('%s:443:%s', Str::lower($host), $resolveIp)],
            ],
        ]);
    }

    private function isApproved(array $payload): bool
    {
        $actionCode = trim($this->extractResponseCode($payload));
        $transactionStatus = strtoupper(trim((string) data_get($payload, 'transactionStatus', data_get($payload, 'dataMap.TRANSACTION_STATUS', data_get($payload, 'data.TRANSACTION_STATUS', '')))));
        $status = strtoupper(trim((string) data_get($payload, 'dataMap.STATUS', data_get($payload, 'status', data_get($payload, 'data.STATUS', '')))));

        if ($actionCode !== '' && str_starts_with($actionCode, '000')) {
            return true;
        }

        return in_array($transactionStatus, ['AUTHORIZED', 'AUTHORISED', 'APPROVED', 'COMPLETED', 'SUCCESS'], true)
            || in_array($status, ['AUTHORIZED', 'AUTHORISED', 'APPROVED', 'COMPLETED', 'SUCCESS'], true);
    }

    private function extractAuthorizationCode(array $payload): ?string
    {
        $code = (string) data_get($payload, 'dataMap.AUTHORIZATION_CODE', data_get($payload, 'authorizationCode', data_get($payload, 'data.AUTHORIZATION_CODE', '')));

        return $code !== '' ? $code : null;
    }

    private function extractTransactionId(array $payload, string $fallback): string
    {
        $transactionId = (string) data_get($payload, 'dataMap.TRANSACTION_ID', data_get($payload, 'transactionId', data_get($payload, 'data.TRANSACTION_ID', '')));

        return $transactionId !== '' ? $transactionId : $fallback;
    }

    private function extractBrand(array $payload): ?string
    {
        $brand = (string) data_get($payload, 'dataMap.BRAND', data_get($payload, 'card.brand', data_get($payload, 'data.BRAND', '')));

        return $brand !== '' ? $brand : null;
    }

    private function extractMaskedCard(array $payload): ?string
    {
        $maskedCard = (string) data_get($payload, 'dataMap.CARD', data_get($payload, 'card.cardNumber', data_get($payload, 'data.CARD', '')));

        return $maskedCard !== '' ? $maskedCard : null;
    }

    private function extractResponseCode(array $payload): string
    {
        return trim((string) data_get($payload, 'dataMap.ACTION_CODE', data_get($payload, 'actionCode', data_get($payload, 'data.ACTION_CODE', data_get($payload, 'errorCode', '')))));
    }

    private function extractResponseMessage(array $payload): string
    {
        return trim((string) data_get($payload, 'dataMap.ACTION_DESCRIPTION', data_get($payload, 'actionDescription', data_get($payload, 'data.ACTION_DESCRIPTION', data_get($payload, 'errorMessage', '')))));
    }

    private function hasBusinessStatus(array $payload): bool
    {
        $status = strtoupper(trim((string) data_get($payload, 'dataMap.STATUS', data_get($payload, 'status', data_get($payload, 'data.STATUS', '')))));
        return $status !== '';
    }

    private function debugLog(string $event, array $context): void
    {
        if (!(bool) config('niubiz.debug', false)) {
            return;
        }

        Log::debug('niubiz.' . $event, $context);
    }

    private function warningLog(string $event, string $endpoint, $response): void
    {
        Log::warning('niubiz.' . $event, [
            'endpoint' => $endpoint,
            'status' => $response->status(),
            'body' => $this->truncateResponseBody((string) $response->body()),
        ]);
    }

    private function warningLogSimple(string $event, array $context): void
    {
        Log::warning('niubiz.' . $event, $context);
    }

    private function truncateResponseBody(string $body): string
    {
        if (mb_strlen($body) <= 2000) {
            return $body;
        }

        return mb_substr($body, 0, 2000) . '...';
    }
}
