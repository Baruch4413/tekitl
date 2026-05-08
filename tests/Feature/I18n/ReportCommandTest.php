<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;

/**
 * US4 / FR-014 / SC-005.
 *
 * Exercises `php artisan i18n:report`. Operates on an isolated tempdir via
 * `Application::useLangPath()`.
 */
function makeReportFixture(): string
{
    $base = sys_get_temp_dir().'/tekitl-i18n-report-'.bin2hex(random_bytes(6));
    mkdir($base.'/es', 0o755, true);
    mkdir($base.'/en', 0o755, true);

    file_put_contents($base.'/es/canary.php', "<?php\n\nreturn [\n    'greeting' => 'Hola',\n    'farewell' => 'Adiós',\n];\n");
    file_put_contents($base.'/en/canary.php', "<?php\n\nreturn [\n    'greeting' => 'Hello',\n    'farewell' => '',\n];\n");

    return $base;
}

function rmReportFixture(string $dir): void
{
    if (! is_dir($dir)) {
        return;
    }
    foreach (scandir($dir) as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $path = $dir.DIRECTORY_SEPARATOR.$entry;
        is_dir($path) && ! is_link($path) ? rmReportFixture($path) : unlink($path);
    }
    rmdir($dir);
}

it('emits a JSON report with locale, untranslated map, and total', function (): void {
    $temp = makeReportFixture();
    $original = $this->app->langPath();
    $this->app->useLangPath($temp);

    try {
        $exit = Artisan::call('i18n:report', ['--locale' => 'en', '--format' => 'json']);
        expect($exit)->toBe(0);

        $payload = json_decode(Artisan::output(), true);

        expect($payload)->toBeArray();
        expect($payload)->toHaveKeys(['locale', 'untranslated', 'total']);
        expect($payload['locale'])->toBe('en');
        expect($payload['total'])->toBe(1);
        expect($payload['untranslated'])->toBe(['canary.farewell']);
    } finally {
        $this->app->useLangPath($original);
        rmReportFixture($temp);
    }
});

it('exits non-zero when --strict is set and any key is empty', function (): void {
    $temp = makeReportFixture();
    $original = $this->app->langPath();
    $this->app->useLangPath($temp);

    try {
        $exit = Artisan::call('i18n:report', [
            '--locale' => 'en',
            '--format' => 'json',
            '--strict' => true,
        ]);

        expect($exit)->not->toBe(0);
    } finally {
        $this->app->useLangPath($original);
        rmReportFixture($temp);
    }
});

it('exits zero in --strict when every key is translated', function (): void {
    $base = sys_get_temp_dir().'/tekitl-i18n-report-'.bin2hex(random_bytes(6));
    mkdir($base.'/es', 0o755, true);
    mkdir($base.'/en', 0o755, true);

    file_put_contents($base.'/es/canary.php', "<?php\n\nreturn [\n    'greeting' => 'Hola',\n];\n");
    file_put_contents($base.'/en/canary.php', "<?php\n\nreturn [\n    'greeting' => 'Hello',\n];\n");

    $original = $this->app->langPath();
    $this->app->useLangPath($base);

    try {
        $exit = Artisan::call('i18n:report', [
            '--locale' => 'en',
            '--strict' => true,
        ]);

        expect($exit)->toBe(0);
    } finally {
        $this->app->useLangPath($original);
        rmReportFixture($base);
    }
});
