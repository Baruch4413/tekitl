<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

class I18nScaffoldEn extends Command
{
    protected $signature = 'i18n:scaffold-en
                            {--copy : Seed missing English values from the matching Spanish leaf}
                            {--force : Overwrite existing non-empty English values}
                            {--dry-run : Print intended writes without touching disk}';

    protected $description = 'Mirror lang/es/ key structure into lang/en/, preserving existing English values.';

    public function handle(): int
    {
        $base = $this->laravel->langPath();
        $sourceDir = $base.DIRECTORY_SEPARATOR.'es';
        $targetDir = $base.DIRECTORY_SEPARATOR.'en';

        if (! is_dir($sourceDir)) {
            $this->components->error("Spanish source directory missing: {$sourceDir}");

            return self::FAILURE;
        }

        if (! is_dir($targetDir) && ! mkdir($targetDir, 0o755, true) && ! is_dir($targetDir)) {
            $this->components->error("Unable to create target directory: {$targetDir}");

            return self::FAILURE;
        }

        $copy = (bool) $this->option('copy');
        $force = (bool) $this->option('force');
        $dryRun = (bool) $this->option('dry-run');

        $files = glob($sourceDir.DIRECTORY_SEPARATOR.'*.php') ?: [];
        sort($files);

        foreach ($files as $sourcePath) {
            $domain = basename($sourcePath, '.php');
            $targetPath = $targetDir.DIRECTORY_SEPARATOR.$domain.'.php';

            $sourceTree = $this->loadArray($sourcePath);
            $existingTree = is_file($targetPath) ? $this->loadArray($targetPath) : [];

            $merged = $this->mirror($sourceTree, $existingTree, $copy, $force);
            $rendered = $this->render($merged);

            if ($dryRun) {
                $this->components->info("[dry-run] {$targetPath}");

                continue;
            }

            file_put_contents($targetPath, $rendered);
            $this->components->info("Wrote {$targetPath}");
        }

        return self::SUCCESS;
    }

    /**
     * @return array<string, mixed>
     */
    private function loadArray(string $path): array
    {
        $contents = require $path;

        return is_array($contents) ? $contents : [];
    }

    /**
     * @param  array<string, mixed>  $source
     * @param  array<string, mixed>  $existing
     * @return array<string, mixed>
     */
    private function mirror(array $source, array $existing, bool $copy, bool $force): array
    {
        $result = [];

        foreach ($source as $key => $value) {
            if (is_array($value)) {
                $childExisting = is_array($existing[$key] ?? null) ? $existing[$key] : [];
                $result[$key] = $this->mirror($value, $childExisting, $copy, $force);

                continue;
            }

            $existingValue = $existing[$key] ?? null;

            if (is_string($existingValue) && $existingValue !== '' && ! $force) {
                $result[$key] = $existingValue;

                continue;
            }

            $result[$key] = $copy && is_string($value) ? $value : '';
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $tree
     */
    private function render(array $tree): string
    {
        return "<?php\n\ndeclare(strict_types=1);\n\nreturn ".$this->exportNode($tree, 0).";\n";
    }

    private function exportNode(mixed $value, int $indent): string
    {
        if (is_array($value)) {
            if ($value === []) {
                return '[]';
            }

            $pad = str_repeat('    ', $indent);
            $padInner = str_repeat('    ', $indent + 1);

            $lines = [];
            foreach ($value as $key => $child) {
                $keyExport = is_int($key) ? (string) $key : var_export((string) $key, true);
                $lines[] = "{$padInner}{$keyExport} => ".$this->exportNode($child, $indent + 1).',';
            }

            return "[\n".implode("\n", $lines)."\n{$pad}]";
        }

        return var_export($value, true);
    }
}
