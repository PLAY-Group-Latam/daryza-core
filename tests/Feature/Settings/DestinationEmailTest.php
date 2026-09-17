<?php

use App\Models\Settings\DestinationEmail;
use App\Services\Mail\DestinationEmailResolver;

it('uses the fallback email when no active row exists', function () {
    config()->set('emails.destination_emails.pages.contacto_centro_ayuda.fallback_email', 'fallback@daryza.com');

    $email = app(DestinationEmailResolver::class)->resolve(DestinationEmail::PAGE_CONTACT_HELP_CENTER);

    expect($email)->toBe('fallback@daryza.com');
});

it('prefers an active destination email over the fallback', function () {
    config()->set('emails.destination_emails.pages.contacto_centro_ayuda.fallback_email', 'fallback@daryza.com');

    DestinationEmail::create([
        'name' => 'Correo admin',
        'email' => 'admin@daryza.com',
        'pages' => [DestinationEmail::PAGE_CONTACT_HELP_CENTER],
        'is_active' => true,
    ]);

    $email = app(DestinationEmailResolver::class)->resolve(DestinationEmail::PAGE_CONTACT_HELP_CENTER);

    expect($email)->toBe('admin@daryza.com');
});

it('ignores inactive destination emails and uses the fallback', function () {
    config()->set('emails.destination_emails.pages.contacto_centro_ayuda.fallback_email', 'fallback@daryza.com');

    DestinationEmail::create([
        'name' => 'Correo pausado',
        'email' => 'inactive@daryza.com',
        'pages' => [DestinationEmail::PAGE_CONTACT_HELP_CENTER],
        'is_active' => false,
    ]);

    $email = app(DestinationEmailResolver::class)->resolve(DestinationEmail::PAGE_CONTACT_HELP_CENTER);

    expect($email)->toBe('fallback@daryza.com');
});

it('throws a clear error when there is no row and no fallback', function () {
    config()->set('emails.destination_emails.pages.contacto_centro_ayuda.fallback_email', null);

    app(DestinationEmailResolver::class)->resolve(DestinationEmail::PAGE_CONTACT_HELP_CENTER);
})->throws(RuntimeException::class, 'No hay correo destino');

it('blocks duplicate active page keys through the admin request', function () {
    config()->set('emails.destination_emails.pages.contacto_centro_ayuda.fallback_email', 'fallback@daryza.com');

    DestinationEmail::create([
        'name' => 'Correo existente',
        'email' => 'existing@daryza.com',
        'pages' => [DestinationEmail::PAGE_CONTACT_HELP_CENTER],
        'is_active' => true,
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('destination-emails.store'), [
            'name' => 'Correo duplicado',
            'email' => 'duplicate@daryza.com',
            'pages' => [DestinationEmail::PAGE_CONTACT_HELP_CENTER],
            'is_active' => true,
        ]);

    $response->assertSessionHasErrors('pages');
});
