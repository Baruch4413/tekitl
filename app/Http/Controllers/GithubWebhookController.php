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

        Log::info("GitHub webhook: queuing CI poll for commit {$after}");

        shell_exec('nohup php /var/www/html/tekitl/poll-deploy.php '.escapeshellarg($after).' > /dev/null 2>&1 &');

        return response('Polling CI', 200);
    }
}
