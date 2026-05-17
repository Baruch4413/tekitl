<?php

declare(strict_types=1);

// Synthetic negative case for the i18n audit script.
// Every string below is developer-facing: log messages, exception messages,
// Artisan command output. The auditor MUST NOT flag any of these.

namespace Tekitl\Fixtures\I18n;

use Exception;
use Illuminate\Support\Facades\Log;

class DeveloperStrings
{
    public function log(): void
    {
        Log::info('Job dispatched for tenant');
        Log::error('Failed to send email', ['reason' => 'smtp']);
    }

    public function throw(): never
    {
        throw new Exception('Unable to resolve dependency');
    }

    public function dump(): void
    {
        // Developer-only debugging output.
        dump('debug payload');
    }
}
