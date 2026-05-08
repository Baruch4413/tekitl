<?php

declare(strict_types=1);

/**
 * US4 / FR-013 / SC-005.
 *
 * Asserts the leaf-key set of lang/es/ matches lang/en/. Both sides flatten
 * the nested arrays via dotted paths so the comparison is shape-aware.
 */
function flattenLangDir(string $dir): array
{
    $keys = [];

    foreach (glob($dir.'/*.php') ?: [] as $path) {
        $domain = basename($path, '.php');
        $tree = require $path;

        if (! is_array($tree)) {
            continue;
        }

        foreach (flattenArray($tree, $domain) as $leaf) {
            $keys[$leaf] = true;
        }
    }

    ksort($keys);

    return array_keys($keys);
}

function flattenArray(array $tree, string $prefix): array
{
    $out = [];

    foreach ($tree as $key => $value) {
        $path = $prefix.'.'.$key;

        if (is_array($value)) {
            foreach (flattenArray($value, $path) as $leaf) {
                $out[] = $leaf;
            }
        } else {
            $out[] = $path;
        }
    }

    return $out;
}

it('keeps lang/es and lang/en leaf-key sets in lockstep', function (): void {
    $esKeys = flattenLangDir(base_path('lang/es'));
    $enKeys = flattenLangDir(base_path('lang/en'));

    $missingInEn = array_values(array_diff($esKeys, $enKeys));
    $missingInEs = array_values(array_diff($enKeys, $esKeys));

    expect($missingInEn)->toBe([], 'Keys present in es/ but missing from en/: '.implode(', ', $missingInEn));
    expect($missingInEs)->toBe([], 'Keys present in en/ but missing from es/: '.implode(', ', $missingInEs));
});
