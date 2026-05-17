<?php

declare(strict_types=1);

use App\Support\I18n\TranslationLoader;
use Illuminate\Support\Facades\Lang;

/**
 * US2 / FR-001 / FR-003 / SC-002.
 *
 * Proves that editing a translation value (no source code change) propagates
 * to rendered output. The PHP path uses Lang::addLines (server-side __()),
 * matching how controllers, Blade, mailers, and notifications resolve copy.
 * The Inertia shared-prop path swaps a stub TranslationLoader to mirror the
 * effect of editing lang/es/<domain>.php on disk.
 */
it('reflects an edited translation value without any code change', function (): void {
    $key = 'canary.greeting';

    expect(__($key, ['name' => 'Ana']))->toBe('Hola, Ana.');

    Lang::addLines([$key => 'Buen día, :name.'], 'es');

    expect(__($key, ['name' => 'Ana']))->toBe('Buen día, Ana.');
});

it('exposes the edited value on the shared Inertia translations payload', function (): void {
    $stub = new class extends TranslationLoader
    {
        public function load(string $locale): array
        {
            return ['canary' => ['greeting' => 'Saludos, :name.']];
        }
    };

    $this->app->instance(TranslationLoader::class, $stub);

    $response = $this->get('/');
    $response->assertOk();

    $props = $response->viewData('page')['props'];

    expect($props['translations']['canary']['greeting'])->toBe('Saludos, :name.');
});
