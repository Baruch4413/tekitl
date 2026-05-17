<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Lang;

/**
 * US4 / FR-013 / SC-005.
 *
 * Proves the translation pipeline switches to English when (a) the active
 * locale is set to `en` and (b) a value exists at the requested key. This is
 * the contract a translator depends on: filling `lang/en/<domain>.php` is
 * sufficient — no source code change required.
 */
it('resolves the English value when the locale is en and a translation exists', function (): void {
    app()->setLocale('en');

    Lang::addLines(['canary.greeting' => 'Hello, :name.'], 'en');

    expect(__('canary.greeting', ['name' => 'Ana']))->toBe('Hello, Ana.');
});

it('returns the empty string (not the Spanish fallback) when the English value is unfilled', function (): void {
    app()->setLocale('en');

    // The English skeleton ships every key with an empty value. Laravel
    // resolves the empty string verbatim — it does NOT fall back to lang/es/.
    // This proves a translator's blank entry never leaks Spanish copy.
    expect(__('canary.greeting'))->toBe('');
});

it('reverts to Spanish for keys present in lang/es/ when locale switches back', function (): void {
    app()->setLocale('es');

    expect(__('canary.greeting', ['name' => 'Ana']))->toBe('Hola, Ana.');
});
