<?php

namespace App\Jobs;

use App\Http\Api\v1\Services\Mail\MailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;

class SendEmailJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Mailable $mailable, public string $to) {}

    /**
     * Execute the job.
     */
    public function handle(): void
{
    Log::info('Iniciando SendEmailJob', [
        'destinatario' => $this->to,
        'mailable_class' => get_class($this->mailable)
    ]);

    if (empty($this->to)) {
        Log::error('El destinatario está vacío en SendEmailJob');
        return;
    }

    try {
        // Ejecutamos el envío
        MailService::to($this->to)->send($this->mailable);
        
        Log::info('MailService ejecutado con éxito para: ' . $this->to);
    } catch (\Throwable $e) {
        Log::error('Error crítico en SendEmailJob', [
            'to' => $this->to,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
    }
}
}
