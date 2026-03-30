<?php

namespace App\Jobs\Events;

use App\Http\Web\Services\Intention\PurchaseIntentionService;
use App\Models\Events\EventLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TrackEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Pasamos los datos necesarios para crear el EventLog
     */
    public function __construct(
        protected array $eventData
    ) {}

    /**
     * El Service procesa el guardado dentro del worker de la cola
     */
    public function handle(PurchaseIntentionService $service): void
    {
        $event = new EventLog($this->eventData);
        $service->store($event);
    }
}