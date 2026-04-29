#!/usr/bin/env php
<?php

$sha = $argv[1] ?? '';
if (! $sha) {
    exit(1);
}

$env = parse_ini_file('/var/www/html/tekitl/.env');
$token = $env['GH_TOKEN'] ?? '';
$repo = 'Baruch4413/tekitl';
$logFile = '/var/log/tekitl-deploy.log';

function logMsg(string $msg): void
{
    global $logFile;
    file_put_contents($logFile, '['.date('Y-m-d H:i:s').'] '.$msg.PHP_EOL, FILE_APPEND);
}

function checkCi(string $sha, string $token, string $repo): string
{
    $url = "https://api.github.com/repos/{$repo}/actions/runs?head_sha={$sha}&per_page=20";
    $context = stream_context_create([
        'http' => [
            'header' => implode("\r\n", [
                "Authorization: Bearer {$token}",
                'Accept: application/vnd.github+json',
                'User-Agent: tekitl-webhook/1.0',
                'X-GitHub-Api-Version: 2022-11-28',
            ]),
            'ignore_errors' => true,
        ],
    ]);

    $json = @file_get_contents($url, false, $context);
    if ($json === false) {
        return 'api_error';
    }

    $data = json_decode($json, true);
    foreach ($data['workflow_runs'] ?? [] as $run) {
        if ($run['name'] === 'tests' && $run['head_sha'] === $sha) {
            return $run['status'].'/'.$run['conclusion'];
        }
    }

    return 'not_found';
}

logMsg("=== Polling CI for SHA {$sha} ===");

$maxAttempts = 40; // 40 × 30s = 20 minutes max
for ($i = 1; $i <= $maxAttempts; $i++) {
    $status = checkCi($sha, $token, $repo);
    logMsg("Attempt {$i}/40: {$status}");

    if ($status === 'completed/success') {
        logMsg('CI passed — triggering deploy');
        passthru('sudo /var/www/html/tekitl/deploy.sh');
        exit(0);
    }

    if (str_starts_with($status, 'completed/')) {
        logMsg("CI finished with non-success status ({$status}) — aborting deploy");
        exit(1);
    }

    sleep(30);
}

logMsg("Timed out after 20 minutes waiting for CI on SHA {$sha}");
exit(1);
