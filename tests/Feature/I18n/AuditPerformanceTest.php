<?php

declare(strict_types=1);

use Symfony\Component\Process\Process;

/**
 * Full-repository audit performance budget per spec SC-003.
 *
 * Marked `ci-perf` so local Pest runs skip it (the runner machine and the
 * CI runner have different baselines). CI invokes it explicitly via
 * `php artisan test --group=ci-perf` after the regular suite.
 */
it('completes a full-repository audit within the 30-second budget', function (): void {
    $process = new Process(['node', 'tools/i18n/audit.mjs'], base_path());
    $process->setTimeout(60);

    $start = microtime(true);
    $process->run();
    $elapsed = microtime(true) - $start;

    expect($process->getExitCode())->toBe(0);
    expect($elapsed)
        ->toBeLessThan(30.0, sprintf('Audit took %.2fs (budget: 30s).', $elapsed));
})->group('ci-perf');
