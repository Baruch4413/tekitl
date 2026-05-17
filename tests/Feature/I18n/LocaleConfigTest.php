<?php

declare(strict_types=1);

it('configures Spanish as the application locale', function (): void {
    expect(config('app.locale'))->toBe('es');
});

it('configures Spanish as the fallback locale', function (): void {
    expect(config('app.fallback_locale'))->toBe('es');
});

it('configures a Spanish faker locale', function (): void {
    expect(config('app.faker_locale'))->toBe('es_MX');
});
