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
        $run = $payload['workflow_run'] ?? [];

        if (($payload['action'] ?? '') !== 'completed') {
            return response('Not completed', 200);
        }

        if (($run['name'] ?? '') !== 'tests') {
            return response('Not tests workflow', 200);
        }

        if (! in_array($run['head_branch'] ?? '', ['main', 'master'])) {
            return response('Not main/master', 200);
        }

        if (($run['conclusion'] ?? '') !== 'success') {
            Log::info('GitHub webhook: CI did not pass — skipping deploy');

            return response('CI did not pass', 200);
        }

        $sha = $run['head_sha'] ?? 'unknown';
        Log::info("GitHub webhook: CI passed for {$sha} — deploying");

        shell_exec('nohup sudo /var/www/html/tekitl/deploy.sh > /dev/null 2>&1 &');

        return response('Deploy triggered', 200);
    }
}
