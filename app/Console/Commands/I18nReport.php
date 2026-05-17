<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

class I18nReport extends Command
{
    protected $signature = 'i18n:report
                            {--locale= : Limit the report to a single locale (defaults to every non-default locale)}
                            {--format=text : Output format (text|json)}
                            {--strict : Exit non-zero when any key is untranslated}';

    protected $description = 'List untranslated keys in lang/<locale>/.';

    public function handle(): int
    {
        $base = $this->laravel->langPath();
        $defaultLocale = (string) config('app.locale', 'es');

        $locales = $this->resolveLocales($base, $defaultLocale);
        $format = (string) $this->option('format');

        if (! in_array($format, ['text', 'json'], true)) {
            $this->components->error("Unknown --format value: {$format}");

            return self::FAILURE;
        }

        $reports = [];
        $totalUntranslated = 0;

        foreach ($locales as $locale) {
            $untranslated = $this->collectUntranslated($base, $locale);
            sort($untranslated);

            $reports[] = [
                'locale' => $locale,
                'untranslated' => $untranslated,
                'total' => count($untranslated),
            ];

            $totalUntranslated += count($untranslated);
        }

        if ($format === 'json') {
            $payload = count($reports) === 1 ? $reports[0] : ['locales' => $reports, 'total' => $totalUntranslated];
            $this->line((string) json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } else {
            foreach ($reports as $report) {
                $this->line(sprintf('[%s] %d untranslated key(s):', $report['locale'], $report['total']));
                foreach ($report['untranslated'] as $key) {
                    $this->line('  - '.$key);
                }
            }
        }

        if ((bool) $this->option('strict') && $totalUntranslated > 0) {
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * @return array<int, string>
     */
    private function resolveLocales(string $base, string $defaultLocale): array
    {
        $explicit = $this->option('locale');
        if (is_string($explicit) && $explicit !== '') {
            return [$explicit];
        }

        $found = [];
        foreach (glob($base.DIRECTORY_SEPARATOR.'*', GLOB_ONLYDIR) ?: [] as $dir) {
            $name = basename($dir);
            if ($name !== $defaultLocale) {
                $found[] = $name;
            }
        }

        sort($found);

        return $found;
    }

    /**
     * @return array<int, string>
     */
    private function collectUntranslated(string $base, string $locale): array
    {
        $localeDir = $base.DIRECTORY_SEPARATOR.$locale;

        if (! is_dir($localeDir)) {
            return [];
        }

        $sourceDir = $base.DIRECTORY_SEPARATOR.((string) config('app.locale', 'es'));

        $untranslated = [];

        foreach (glob($localeDir.DIRECTORY_SEPARATOR.'*.php') ?: [] as $path) {
            $domain = basename($path, '.php');
            $tree = require $path;

            if (! is_array($tree)) {
                continue;
            }

            $sourceTree = is_file($sourceDir.DIRECTORY_SEPARATOR.$domain.'.php')
                ? (array) require $sourceDir.DIRECTORY_SEPARATOR.$domain.'.php'
                : [];

            $this->walk($tree, $sourceTree, $domain, $untranslated);
        }

        return $untranslated;
    }

    /**
     * @param  array<string, mixed>  $tree
     * @param  array<string, mixed>  $sourceTree
     * @param  array<int, string>  $untranslated
     */
    private function walk(array $tree, array $sourceTree, string $prefix, array &$untranslated): void
    {
        foreach ($tree as $key => $value) {
            $path = $prefix.'.'.$key;
            $sourceValue = is_array($sourceTree) ? ($sourceTree[$key] ?? null) : null;

            if (is_array($value)) {
                $childSource = is_array($sourceValue) ? $sourceValue : [];
                $this->walk($value, $childSource, $path, $untranslated);

                continue;
            }

            if (! is_string($value) || $value === '') {
                $untranslated[] = $path;

                continue;
            }

            if (is_string($sourceValue) && $sourceValue !== '' && $value === $sourceValue) {
                $untranslated[] = $path;
            }
        }
    }
}
