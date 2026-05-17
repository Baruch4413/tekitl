<?php

declare(strict_types=1);

use Symfony\Component\Process\Process;

/**
 * Build an ephemeral git workspace with the project's pre-commit hook,
 * audit binary, audit config, and a minimal package.json. Returns the
 * tempdir path. Caller is responsible for cleanup.
 */
function buildHookWorkspace(): string
{
    $repo = base_path();
    $tmp = sys_get_temp_dir().'/tekitl-precommit-'.bin2hex(random_bytes(6));

    mkdir($tmp, 0o755, true);
    mkdir($tmp.'/.githooks', 0o755, true);
    mkdir($tmp.'/tools/i18n', 0o755, true);

    copy($repo.'/.githooks/pre-commit', $tmp.'/.githooks/pre-commit');
    chmod($tmp.'/.githooks/pre-commit', 0o755);

    copy($repo.'/tools/i18n/audit.mjs', $tmp.'/tools/i18n/audit.mjs');
    copy($repo.'/tools/i18n/audit.config.json', $tmp.'/tools/i18n/audit.config.json');

    file_put_contents(
        $tmp.'/package.json',
        json_encode([
            'name' => 'tekitl-precommit-test',
            'private' => true,
            'scripts' => ['i18n:audit' => 'node tools/i18n/audit.mjs'],
        ], JSON_PRETTY_PRINT)."\n",
    );

    runIn($tmp, ['git', 'init', '-q']);
    runIn($tmp, ['git', 'config', 'user.email', 'precommit@test.local']);
    runIn($tmp, ['git', 'config', 'user.name', 'Pre-commit Test']);
    runIn($tmp, ['git', 'config', 'commit.gpgsign', 'false']);

    return $tmp;
}

function runIn(string $cwd, array $command, int $timeout = 30): array
{
    $process = new Process($command, $cwd);
    $process->setTimeout($timeout);
    $process->run();

    return [
        'exitCode' => $process->getExitCode(),
        'stdout' => $process->getOutput(),
        'stderr' => $process->getErrorOutput(),
    ];
}

function rrmdir(string $dir): void
{
    if (! is_dir($dir)) {
        return;
    }
    foreach (scandir($dir) as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $path = $dir.DIRECTORY_SEPARATOR.$entry;
        is_dir($path) && ! is_link($path) ? rrmdir($path) : unlink($path);
    }
    rmdir($dir);
}

it('blocks commits whose staged PHP files contain hard-coded user-facing literals', function (): void {
    $repo = base_path();
    $tmp = buildHookWorkspace();

    try {
        // The fixture path itself sits under `tools/i18n/fixtures/**` which is
        // audit-excluded; copy its content into a non-excluded surface path so
        // the hook's filter still passes it to the audit binary.
        mkdir($tmp.'/app/Mail', 0o755, true);
        copy(
            $repo.'/tools/i18n/fixtures/violation.php',
            $tmp.'/app/Mail/WelcomeMail.php',
        );

        runIn($tmp, ['git', 'add', 'app/Mail/WelcomeMail.php']);

        $result = runIn($tmp, ['bash', '.githooks/pre-commit']);

        expect($result['exitCode'])->not->toBe(0);
        expect($result['stdout'].$result['stderr'])
            ->toContain('app/Mail/WelcomeMail.php');
    } finally {
        rrmdir($tmp);
    }
});

it('allows commits whose staged PHP files contain only developer-facing strings', function (): void {
    $repo = base_path();
    $tmp = buildHookWorkspace();

    try {
        mkdir($tmp.'/app/Support', 0o755, true);
        copy(
            $repo.'/tools/i18n/fixtures/developer-strings.php',
            $tmp.'/app/Support/Logger.php',
        );

        runIn($tmp, ['git', 'add', 'app/Support/Logger.php']);

        $result = runIn($tmp, ['bash', '.githooks/pre-commit']);

        expect($result['exitCode'])->toBe(0);
    } finally {
        rrmdir($tmp);
    }
});

it('exits cleanly when nothing user-facing is staged', function (): void {
    $tmp = buildHookWorkspace();

    try {
        file_put_contents($tmp.'/notes.txt', "irrelevant\n");
        runIn($tmp, ['git', 'add', 'notes.txt']);

        $result = runIn($tmp, ['bash', '.githooks/pre-commit']);

        expect($result['exitCode'])->toBe(0);
    } finally {
        rrmdir($tmp);
    }
});
