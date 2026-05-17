<?php

declare(strict_types=1);

use Symfony\Component\Process\Process;

/**
 * US2 / FR-001 / FR-003 / FR-010 / SC-002.
 *
 * Asserts the centralization invariant: running the audit against the entire
 * repository (no positional paths) reports zero findings. Tagged `slow` so
 * local Pest runs skip it; CI invokes it explicitly via the slow group.
 */
it('reports zero findings when run against the full repository', function (): void {
    $process = new Process(['node', 'tools/i18n/audit.mjs', '--format=json'], base_path());
    $process->setTimeout(60);
    $process->run();

    expect($process->getExitCode())->toBe(0, sprintf(
        "Audit exited %d.\nstdout:\n%s\nstderr:\n%s",
        $process->getExitCode() ?? -1,
        $process->getOutput(),
        $process->getErrorOutput(),
    ));

    $payload = json_decode($process->getOutput(), true);

    expect($payload)->toBeArray();
    expect($payload)->toHaveKeys(['findings', 'total', 'config']);
    expect($payload['findings'])->toBe([]);
    expect($payload['total'])->toBe(0);
})->group('slow');
