<?php

declare(strict_types=1);

it('shares the active-locale translation dictionary with Inertia', function (): void {
    $response = $this->get('/');

    $response->assertOk();

    $props = $response->viewData('page')['props'];

    expect($props)->toHaveKey('translations');
    expect($props)->toHaveKey('locale');
    expect($props['translations'])->toBeArray();
    expect($props['locale'])->toBe('es');
});

it('includes the canary domain in the shared payload', function (): void {
    $response = $this->get('/');

    $props = $response->viewData('page')['props'];

    expect($props['translations'])->toHaveKey('canary');
    expect($props['translations']['canary'])->toHaveKey('greeting');
    expect($props['translations']['canary']['greeting'])->toBe('Hola, :name.');
});
