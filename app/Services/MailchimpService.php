<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class MailchimpService
{
  
    public function addOrUpdateSubscriber(string $email, string $tag = 'daryza'): array
    {
        $apiKey = (string) config('services.mailchimp.api_key');
        $audienceId = (string) config('services.mailchimp.audience_id');
        $server = (string) config('services.mailchimp.server');

        if (!$apiKey || !$audienceId || !$server) {
            throw new RuntimeException('Mailchimp no está configurado correctamente en los .env.');
        }

        $subscriberHash = md5(strtolower(trim($email)));
        $url = sprintf(
            'https://%s.api.mailchimp.com/3.0/lists/%s/members/%s',
            $server,
            $audienceId,
            $subscriberHash
        );

        $response = Http::withBasicAuth('anystring', $apiKey)
            ->put($url, [
                'email_address' => $email,
                'status_if_new' => 'subscribed',
                'status'        => 'subscribed',
            ]);

        if ($response->failed()) {
            throw new RuntimeException('No se pudo sincronizar el suscriptor con Mailchimp.');
        }

        $memberData = $response->json();

        $tagsResponse = Http::withBasicAuth('anystring', $apiKey)
            ->post($url . '/tags', [
                'tags' => [
                    [
                        'name'   => strtolower($tag),
                        'status' => 'active',
                    ],
                ],
            ]);

        return [
            'mailchimp_id' => $memberData['id'] ?? null,
            'tag_applied'  => $tagsResponse->successful(),
        ];
    }
}