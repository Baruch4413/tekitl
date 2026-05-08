<?php

declare(strict_types=1);

namespace App\Support\I18n;

use Illuminate\Support\Facades\File;

class TranslationLoader
{
    /**
     * Load every PHP translation file under lang/<locale>/ as a domain-keyed
     * associative array suitable for the Inertia shared-prop pipeline.
     *
     * @return array<string, array<string, mixed>>
     */
    public function load(string $locale): array
    {
        $directory = base_path('lang/'.$locale);

        if (! File::isDirectory($directory)) {
            return [];
        }

        $payload = [];

        foreach (File::files($directory) as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }

            $domain = $file->getFilenameWithoutExtension();
            $contents = require $file->getRealPath();

            if (is_array($contents)) {
                $payload[$domain] = $contents;
            }
        }

        ksort($payload);

        return $payload;
    }
}
