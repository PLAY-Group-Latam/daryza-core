<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class DestinationEmail extends Model
{
    use HasUlids;

    public const PAGE_CONTACT_HELP_CENTER = 'contacto_centro_ayuda';
    public const PAGE_CONTACT_DISTRIBUTOR = 'contacto_red_comercial';
    public const PAGE_CONTACT_ADVISOR = 'contacto_asesoria';
    public const PAGE_CONTACT_CUSTOMER_SERVICE = 'contacto_servicio_cliente';
    public const PAGE_ABOUT_US = 'nosotros';
    public const PAGE_WORK_WITH_US = 'trabajos';
    public const PAGE_CLAIMS = 'libro_reclamaciones';
    public const PAGE_LANDING_LEADS = 'landing_leads';
    public const PAGE_LOW_STOCK = 'stock_bajo';
    public const PAGE_OUT_OF_STOCK = 'stock_agotado';
    
    // NUEVA CONSTANTE PARA EL ADMINISTRADOR DE ÓRDENES
    public const PAGE_CHECKOUT_ADMIN = 'checkout_admin';

    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $casts = [
        'page_keys' => 'array',
        'is_active' => 'boolean',
    ];

    protected $fillable = [
        'name',
        'email',
        'page_keys',
        'is_active',
    ];

    // Comenta esto temporalmente para probar si el paginador deja pasar los items:
    /*
    protected $appends = [
        'page_labels',
    ];
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForPage(Builder $query, string $pageKey): Builder
    {
        return $query->whereJsonContains('page_keys', $pageKey);
    }

    public function getPageLabelsAttribute(): array
    {
        $labels = self::pageLabels();

        return collect($this->page_keys ?? [])
            ->map(fn(string $page) => $labels[$page] ?? $page)
            ->values()
            ->all();
    }

    public static function pageLabels(): array
    {
        return collect(config('emails.destination_emails.pages', []))
            ->mapWithKeys(fn(array $page, string $key) => [$key => $page['label'] ?? $key])
            ->all();
    }

    public static function pageKeys(): array
    {
        return array_keys(config('emails.destination_emails.pages', []));
    }
}