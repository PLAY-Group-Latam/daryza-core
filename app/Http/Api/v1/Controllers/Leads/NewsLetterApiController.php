<?php

namespace App\Http\Api\v1\Controllers\Leads;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Leads\SubscribeRequest;
use App\Http\Api\Traits\ApiTrait;
use App\Models\Leads\Lead;
use App\Services\MailchimpService;

class NewsLetterApiController extends Controller
{
    use ApiTrait;

    public function __construct(
        private MailchimpService $mailchimpService
    ) {}

    public function subscribe(SubscribeRequest $request)
    {
        try {
            $email = $request->validated()['email'];

            $subscription = Lead::create([
                'type'      => Lead::TYPE_NEWSLETTER,
                'full_name' => 'N/D',
                'email'     => $email,
                'phone'     => 'N/D',
                'data'      => [],
                'status'    => Lead::STATUS_NEW,
            ]);

            $mailchimpSynced = false;
            $mailchimpDetails = null;

            try {
                $mailchimpDetails = $this->mailchimpService->addOrUpdateSubscriber($subscription->email);
                $mailchimpSynced = true;
            } catch (\Throwable $e) {
                
            }

            return $this->created(
                '¡Suscripción completada con éxito! Gracias por unirte a la comunidad de Daryza.',
                [
                    'subscription'     => $subscription,
                    'mailchimp_synced' => $mailchimpSynced,
                    'mailchimp_data'   => $mailchimpDetails,
                ]
            );
        } catch (\Throwable $e) {
            return $this->error(
                'No se pudo completar la suscripción',
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}