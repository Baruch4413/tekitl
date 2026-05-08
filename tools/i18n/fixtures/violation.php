<?php

declare(strict_types=1);

// Synthetic positive case for the i18n audit script (PHP path).
// Contains a hard-coded user-facing Spanish literal in a tracked sink so
// PreCommitHookTest can assert the hook blocks the commit. Excluded from
// the audit's default include set; the hook invokes the audit with explicit
// paths, which bypass the exclude list per audit.mjs:429.

namespace Tekitl\Fixtures\I18n;

use Illuminate\Mail\Mailable;

class ViolationMailable extends Mailable
{
    public function build(): self
    {
        return $this->subject('Bienvenido a Tekitl');
    }
}
