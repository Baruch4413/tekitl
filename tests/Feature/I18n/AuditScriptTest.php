<?php

declare(strict_types=1);

use Symfony\Component\Process\Process;

function runAudit(array $paths = [], array $extraArgs = []): array
{
    $command = array_merge(['node', 'tools/i18n/audit.mjs'], $extraArgs, $paths);
    $process = new Process($command, base_path());
    $process->setTimeout(30);
    $process->run();

    return [
        'exitCode' => $process->getExitCode(),
        'stdout' => $process->getOutput(),
        'stderr' => $process->getErrorOutput(),
    ];
}

it('flags hard-coded user-facing literals in JSX fixtures', function (): void {
    $result = runAudit(['tools/i18n/fixtures/violation.tsx']);

    expect($result['exitCode'])->toBe(1);
    expect($result['stdout'])->toContain('tools/i18n/fixtures/violation.tsx');
    expect($result['stdout'])->toContain('Iniciar proyecto');
});

it('does not flag developer-facing strings in PHP fixtures', function (): void {
    $result = runAudit(['tools/i18n/fixtures/developer-strings.php']);

    expect($result['exitCode'])->toBe(0);
    expect($result['stdout'])->not->toContain('Job dispatched');
    expect($result['stdout'])->not->toContain('Unable to resolve');
});

it('emits a deterministic JSON shape with --format=json', function (): void {
    $result = runAudit(['tools/i18n/fixtures/violation.tsx'], ['--format=json']);

    expect($result['exitCode'])->toBe(1);

    $payload = json_decode($result['stdout'], true);
    expect($payload)->toBeArray();
    expect($payload)->toHaveKeys(['findings', 'total', 'config']);
    expect($payload['total'])->toBeGreaterThan(0);
});
