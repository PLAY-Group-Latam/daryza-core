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
     * Número de veces que se intentará el trabajo.
     */
    public int $tries = 3;

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
            ]);

            // Re-lanzamos la excepción para que Laravel registre el Job como fallido
            // y permita reintentos o el registro en la tabla `failed_jobs`.
            throw $e;
        }
    }
}