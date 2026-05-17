<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;

/**
 * US4 / FR-013.
 *
 * Exercises `php artisan i18n:scaffold-en`. The command runs against an
 * isolated tempdir bound via `Application::useLangPath()` so the suite
 * never mutates the real `lang/` tree.
 */
function makeLangFixture(): string
{
    $base = sys_get_temp_dir().'/tekitl-i18n-scaffold-'.bin2hex(random_bytes(6));
    mkdir($base.'/es', 0o755, true);
    mkdir($base.'/en', 0o755, true);

    file_put_contents($base.'/es/projects.php', "<?php\n\nreturn [\n    'show' => [\n        'title' => 'Proyecto',\n        'open_menu' => 'Abrir menú',\n    ],\n    'dashboard' => [\n        'title' => 'Dashboard',\n    ],\n];\n");

    file_put_contents($base.'/en/projects.php', "<?php\n\nreturn [\n    'show' => [\n        'title' => 'Project',\n    ],\n];\n");

    return $base;
}

function rmLangFixture(string $dir): void
{
    if (! is_dir($dir)) {
        return;
    }

    foreach (scandir($dir) as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $path = $dir.DIRECTORY_SEPARATOR.$entry;
        is_dir($path) && ! is_link($path) ? rmLangFixture($path) : unlink($path);
    }

    rmdir($dir);
}

it('mirrors missing keys into lang/en/ with empty values, preserving existing translations', function (): void {
    $temp = makeLangFixture();
    $original = $this->app->langPath();
    $this->app->useLangPath($temp);

    try {
        $exit = Artisan::call('i18n:scaffold-en');
        expect($exit)->toBe(0);

        $en = require $temp.'/en/projects.php';

        expect($en)->toHaveKey('show');
        expect($en['show'])->toMatchArray([
            'title' => 'Project',
            'open_menu' => '',
        ]);
        expect($en)->toHaveKey('dashboard');
        expect($en['dashboard'])->toBe(['title' => '']);
    } finally {
        $this->app->useLangPath($original);
        rmLangFixture($temp);
    }
});

it('with --copy seeds missing English values from the Spanish source', function (): void {
    $temp = makeLangFixture();
    $original = $this->app->langPath();
    $this->app->useLangPath($temp);

    try {
        Artisan::call('i18n:scaffold-en', ['--copy' => true]);
        $en = require $temp.'/en/projects.php';

        expect($en['show']['title'])->toBe('Project');
        expect($en['show']['open_menu'])->toBe('Abrir menú');
        expect($en['dashboard']['title'])->toBe('Dashboard');
    } finally {
        $this->app->useLangPath($original);
        rmLangFixture($temp);
    }
});

it('with --dry-run does not write to disk', function (): void {
    $temp = makeLangFixture();
    $original = $this->app->langPath();
    $this->app->useLangPath($temp);

    try {
        $beforeMtime = filemtime($temp.'/en/projects.php');
        clearstatcache();

        Artisan::call('i18n:scaffold-en', ['--dry-run' => true]);

        clearstatcache();
        $afterMtime = filemtime($temp.'/en/projects.php');

        expect($afterMtime)->toBe($beforeMtime);
    } finally {
        $this->app->useLangPath($original);
        rmLangFixture($temp);
    }
});
