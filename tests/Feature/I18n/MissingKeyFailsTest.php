<?php

declare(strict_types=1);

it('returns the literal key when the translation is missing', function () {
    $key = 'this.key.does.not.exist';

    expect(__($key))->toBe($key);
    expect(trans($key))->toBe($key);
});

it('returns the resolved value when the key exists', function () {
    expect(__('canary.greeting', ['name' => 'Ana']))->toBe('Hola, Ana.');
});
