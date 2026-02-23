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
        // return;
        try {
            MailService::to($this->to)->send($this->mailable);
        } catch (\Throwable $e) {
            Log::error('Email job failed', [
                'to' => $this->to,
                'error' => $e->getMessage(),
            ]);
            return;
        }
    }
}
