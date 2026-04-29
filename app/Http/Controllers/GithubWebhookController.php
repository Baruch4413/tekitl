<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class GithubWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $secret = config('services.github.webhook_secret');
        $signature = $request->header('X-Hub-Signature-256', '');
        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $secret);

        if (! hash_equals($expected, $signature)) {
            Log::warning('GitHub webhook: invalid signature');

            return response('Forbidden', 403);
        }

        $payload = $request->json()->all();

        if (! in_array($payload['ref'] ?? '', ['refs/heads/main', 'refs/heads/master'])) {
            return response('Not main/master', 200);
        }

        $before = $payload['before'] ?? '';
        $after = $payload['after'] ?? '';

        if ($before === $after || empty($after) || $after === str_repeat('0', 40)) {
            return response('No new commits', 200);
        }

        if (! $this->ciPassed($after)) {
            Log::info("GitHub webhook: CI not yet passing for {$after}, skipping deploy");

            return response('CI not passing', 200);
        }

        Log::info("GitHub webhook: deploying commit {$after}");

        shell_exec('nohup sudo /var/www/html/tekitl/deploy.sh > /dev/null 2>&1 &');

        return response('Deploy triggered', 200);
    }

    private function ciPassed(string $sha): bool
    {
        $token = config('services.github.token');
        $repo = config('services.github.repo');

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
            Log::error('GitHub webhook: failed to fetch workflow runs from API');

            return false;
        }

        $data = json_decode($json, true);
        $runs = $data['workflow_runs'] ?? [];

        foreach ($runs as $run) {
            if ($run['name'] === 'tests' && $run['head_sha'] === $sha) {
                return $run['status'] === 'completed' && $run['conclusion'] === 'success';
            }
        }

        Log::info("GitHub webhook: no 'tests' run found for SHA {$sha}");

        return false;
    }
}
