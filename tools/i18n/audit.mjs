#!/usr/bin/env node
// i18n audit — flags hard-coded user-facing literals outside translation files.
// See specs/002-i18n-spanish-baseline/contracts/audit-cli.md for the contract.
//
// Zero runtime dependencies: only Node 20 built-ins.

import { readFileSync, statSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import process from 'node:process'

const EXIT_CLEAN = 0
const EXIT_FINDINGS = 1
const EXIT_CONFIG_ERROR = 2
const EXIT_INTERNAL_ERROR = 3

const ROOT = process.cwd()

function parseArgs(argv) {
    const args = { paths: [], format: 'text', config: 'tools/i18n/audit.config.json' }
    for (const raw of argv) {
        if (raw === '--') continue
        if (raw.startsWith('--format=')) {
            args.format = raw.slice('--format='.length)
        } else if (raw.startsWith('--config=')) {
            args.config = raw.slice('--config='.length)
        } else if (!raw.startsWith('-')) {
            args.paths.push(raw)
        }
    }
    return args
}

function loadConfig(path) {
    try {
        const raw = readFileSync(path, 'utf8')
        const config = JSON.parse(raw)
        if (!Array.isArray(config.include) || !Array.isArray(config.exclude)) {
            throw new Error('config missing include/exclude arrays')
        }
        return config
    } catch (err) {
        process.stderr.write(`[i18n-audit] config error at ${path}: ${err.message}\n`)
        process.exit(EXIT_CONFIG_ERROR)
    }
}

function globToRegExp(glob) {
    // Translate a minimal glob (**, *, ?, {a,b}, [...]) into a RegExp.
    let re = '^'
    let i = 0
    while (i < glob.length) {
        const c = glob[i]
        if (c === '*') {
            if (glob[i + 1] === '*') {
                re += '.*'
                i += 2
                if (glob[i] === '/') i += 1
            } else {
                re += '[^/]*'
                i += 1
            }
        } else if (c === '?') {
            re += '[^/]'
            i += 1
        } else if (c === '{') {
            const end = glob.indexOf('}', i)
            if (end === -1) {
                re += '\\{'
                i += 1
            } else {
                const options = glob.slice(i + 1, end).split(',')
                re += `(?:${options.map(escapeRegex).join('|')})`
                i = end + 1
            }
        } else if (/[.+^$()|\\]/.test(c)) {
            re += '\\' + c
            i += 1
        } else {
            re += c
            i += 1
        }
    }
    re += '$'
    return new RegExp(re)
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function expandIncludes(config) {
    const include = config.include.map(globToRegExp)
    const exclude = config.exclude.map(globToRegExp)
    const results = []

    async function walk(dir) {
        let entries
        try {
            entries = await readdir(dir, { withFileTypes: true })
        } catch {
            return
        }
        for (const entry of entries) {
            const full = join(dir, entry.name)
            const rel = relative(ROOT, full).split(sep).join('/')
            if (entry.isDirectory()) {
                if (exclude.some((re) => re.test(rel + '/'))) continue
                if (entry.name === 'node_modules' || entry.name === 'vendor') continue
                await walk(full)
            } else if (entry.isFile()) {
                if (exclude.some((re) => re.test(rel))) continue
                if (include.some((re) => re.test(rel))) {
                    results.push(rel)
                }
            }
        }
    }

    await walk(ROOT)
    return results.sort()
}

function loadFile(rel) {
    return readFileSync(join(ROOT, rel), 'utf8')
}

function lineColForOffset(source, offset) {
    let line = 1
    let lastNewline = -1
    for (let i = 0; i < offset && i < source.length; i++) {
        if (source[i] === '\n') {
            line += 1
            lastNewline = i
        }
    }
    const column = offset - lastNewline
    return { line, column }
}

function isAllowed(allowList, path, literal) {
    return allowList.some((entry) => {
        const literalMatch = entry.literal === literal
        if (!literalMatch) return false
        if (entry.path === '*' || !entry.path) return true
        return entry.path === path
    })
}

// ---- PHP scanner ---------------------------------------------------------
//
// Heuristic regex pass. Surfaces detected:
//   - calls to user-facing sinks listed in config.userFacingPhpSinks where the
//     argument is a single-quoted or double-quoted string literal that does
//     NOT pass through __()/trans()/trans_choice().
//   - $this->subject('...') on Mailables.
//   - return arrays from messages() methods on FormRequest subclasses with
//     literal string values.

function scanPhp(rel, source, config, findings) {
    const sinks = config.userFacingPhpSinks ?? []
    const sinkPattern = sinks
        .map((s) => escapeRegex(s).replace(/->/g, '->'))
        .join('|')

    if (sinkPattern) {
        const re = new RegExp(
            `(?:${sinkPattern})\\s*\\(([^)]*)\\)`,
            'g',
        )
        let match
        while ((match = re.exec(source)) !== null) {
            const argsBlob = match[1]
            scanPhpStringArgs(rel, source, match.index, argsBlob, findings, config)
        }
    }

    // ->subject('...')
    const subjectRe = /->subject\(\s*(['"])((?:\\.|(?!\1).)*?)\1\s*\)/g
    let m
    while ((m = subjectRe.exec(source)) !== null) {
        const literal = m[2]
        if (isAllowed(config.allowList ?? [], rel, literal)) continue
        const { line, column } = lineColForOffset(source, m.index)
        findings.push({
            path: rel,
            line,
            column,
            surface: 'mailer-subject',
            literal,
        })
    }

    // FormRequest messages() return arrays
    const messagesRe = /public\s+function\s+messages\s*\(\s*\)\s*[^{]*\{([\s\S]*?)\n\s*\}/g
    while ((m = messagesRe.exec(source)) !== null) {
        const body = m[1]
        const bodyOffset = m.index + m[0].indexOf(body)
        const arrowRe = /=>\s*(['"])((?:\\.|(?!\1).)*?)\1/g
        let am
        while ((am = arrowRe.exec(body)) !== null) {
            const literal = am[2]
            if (looksLikeTranslationKey(literal)) continue
            if (isAllowed(config.allowList ?? [], rel, literal)) continue
            const { line, column } = lineColForOffset(source, bodyOffset + am.index)
            findings.push({
                path: rel,
                line,
                column,
                surface: 'request-messages',
                literal,
            })
        }
    }
}

function scanPhpStringArgs(rel, source, callOffset, argsBlob, findings, config) {
    // Skip if any helper wraps the args (cheap heuristic).
    if (/\b(__|trans|trans_choice)\s*\(/.test(argsBlob)) return
    const re = /(['"])((?:\\.|(?!\1).)*?)\1/g
    let m
    while ((m = re.exec(argsBlob)) !== null) {
        const literal = m[2]
        if (!literal || /^\s*$/.test(literal)) continue
        if (looksLikeTranslationKey(literal)) continue
        if (!looksLikeUserProse(literal)) continue
        if (isAllowed(config.allowList ?? [], rel, literal)) continue
        const offset = callOffset + (source.indexOf(argsBlob, callOffset) - callOffset) + m.index
        const { line, column } = lineColForOffset(source, offset)
        findings.push({
            path: rel,
            line,
            column,
            surface: 'controller-render',
            literal,
        })
    }
}

function looksLikeTranslationKey(s) {
    // Translation keys are dotted, lowercase, no spaces, no Spanish accents.
    return /^[a-z0-9_]+(\.[a-z0-9_]+)+$/.test(s)
}

// Conservative heuristic for "prose": separates page names / array keys / IDs
// (e.g. "welcome", "settings/password", "id") from real user-facing strings.
// A literal counts as prose when it has whitespace, Spanish accents, sentence
// punctuation, or two-or-more capitalised words.
function looksLikeUserProse(s) {
    if (/\s/.test(s)) return true
    if (/[áéíóúüñÁÉÍÓÚÜÑ¿¡]/.test(s)) return true
    if (/[.?!,;:](?:$|\s)/.test(s)) return true
    return false
}

// ---- Blade scanner -------------------------------------------------------
//
// Strip @lang, {{ __() }}, comments, <script>, <style>, <pre>, <code>; what
// remains as non-whitespace text is a candidate.

function scanBlade(rel, source, config, findings) {
    let stripped = source
    // Strip Blade directives that wrap translations.
    stripped = stripped.replace(/@lang\s*\(([^)]*)\)/g, '')
    stripped = stripped.replace(/\{\{\s*__\s*\(([^)]*)\)\s*\}\}/g, '')
    stripped = stripped.replace(/\{\{--[\s\S]*?--\}\}/g, '')
    stripped = stripped.replace(/<!--[\s\S]*?-->/g, '')
    stripped = stripped.replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi, '')
    // Strip Blade echo/PHP blocks (their content is server-side, not text).
    stripped = stripped.replace(/\{\{[\s\S]*?\}\}/g, '')
    stripped = stripped.replace(/\{!![\s\S]*?!!\}/g, '')
    stripped = stripped.replace(/@php[\s\S]*?@endphp/g, '')
    // Strip Blade @directives (e.g. @vite, @inertia, @inertiaHead) — they are
    // server-side hooks, never user-facing copy.
    stripped = stripped.replace(/@[a-zA-Z]+(?:\([^)]*\))?/g, '')
    // Strip tags so only text remains.
    stripped = stripped.replace(/<[^>]+>/g, '\n')

    const lineRe = /([^\n]+)/g
    let m
    while ((m = lineRe.exec(stripped)) !== null) {
        const line = m[1].trim()
        if (!line) continue
        if (/^[\s\d.,;:!?\-—–•|()[\]{}<>"'`]+$/.test(line)) continue
        if (!hasUserFacingChars(line)) continue
        if (looksLikeTranslationKey(line)) continue
        if (isAllowed(config.allowList ?? [], rel, line)) continue
        const offset = m.index
        const { line: ln, column } = lineColForOffset(stripped, offset)
        findings.push({
            path: rel,
            line: ln,
            column,
            surface: 'blade-text',
            literal: line,
        })
    }
}

function hasUserFacingChars(s) {
    return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(s)
}

// Reject candidates that look like JavaScript/TypeScript code rather than
// human copy: arrow functions, equality operators, JS keywords adjacent to
// punctuation, trailing semicolons, type-annotation colons. Keeps the JSX
// scanner honest in the presence of generics and inline expressions.
function looksLikeJsExpression(s) {
    if (/=>|===|!==|&&|\|\|/.test(s)) return true
    if (/(^|[^A-Za-z0-9_])(null|true|false|undefined|useState|useRef|useEffect|useMemo|useCallback|setState|Record|Promise|Array|Map|Set|Date|Error|RegExp|Iterable|Awaited|number|string|boolean|typeof|keyof|readonly|extends|implements)([^A-Za-z0-9_]|$)/.test(s)) return true
    if (/[;]\s*$/.test(s)) return true
    if (/^[(){}[\]&|:]/.test(s)) return true
    return false
}

// ---- JSX/TSX scanner -----------------------------------------------------
//
// Three surfaces:
//   * JSX text children:  >literal<
//   * JSX literal attribute values for configured attrs
//   * String literals as first arg to configured helpers

function scanJsx(rel, source, config, findings) {
    const attrs = config.userFacingJsxAttrs ?? []
    const helpers = config.userFacingJsHelpers ?? []
    const allowList = config.allowList ?? []
    const isJsxFile = rel.endsWith('.tsx') || rel.endsWith('.jsx')

    if (!isJsxFile) {
        // Plain *.ts files cannot have JSX children/attributes; only helper
        // call literals are interesting. Skip 1+2 to avoid false positives
        // from TypeScript generics (`Promise<X>`) that look like JSX brackets.
        scanJsHelperCalls(rel, source, helpers, allowList, findings)
        return
    }

    // 1. JSX text children — between a >...</ pair on a single line.
    //    Skip whitespace-only, JSX expressions {…}, and template strings.
    //    Reject anything that smells like leaked TypeScript generics or
    //    inline expressions (e.g. `useState<T>(null)` followed by JSX).
    const childRe = />([^<>{}\n]+)</g
    let m
    while ((m = childRe.exec(source)) !== null) {
        const literal = m[1].trim()
        if (!literal) continue
        if (!hasUserFacingChars(literal)) continue
        // Reject if the captured `>` is the tail of `=>` (arrow function) or
        // a `>=`/`/>` style TS-only token; these never start JSX text.
        const prev = source[m.index - 1]
        if (prev === '=' || prev === '!' || prev === '<') continue
        // Reject if the closing `<` looks like the start of a TS generic
        // (next char is alpha — e.g. `<Promise<T>>`) rather than JSX (next
        // char would be `/`, alpha-uppercase tag, or `>` for fragments).
        const closeIdx = m.index + 1 + m[1].length
        const next = source[closeIdx + 1]
        if (next === undefined) continue
        if (/[A-Za-z/>]/.test(next) === false) continue
        if (looksLikeTranslationKey(literal)) continue
        if (looksLikeJsExpression(literal)) continue
        if (isAllowed(allowList, rel, literal)) continue
        const offset = m.index + 1
        const { line, column } = lineColForOffset(source, offset)
        findings.push({
            path: rel,
            line,
            column,
            surface: 'jsx-child',
            literal,
        })
    }

    // 2. JSX attribute literals
    for (const attr of attrs) {
        const re = new RegExp(
            `(?<![A-Za-z0-9_-])${escapeRegex(attr)}=(["'])((?:\\\\.|(?!\\1).)*?)\\1`,
            'g',
        )
        while ((m = re.exec(source)) !== null) {
            const literal = m[2]
            if (!literal || !hasUserFacingChars(literal)) continue
            if (looksLikeTranslationKey(literal)) continue
            if (isAllowed(allowList, rel, literal)) continue
            const { line, column } = lineColForOffset(source, m.index)
            findings.push({
                path: rel,
                line,
                column,
                surface: `jsx-attr:${attr}`,
                literal,
            })
        }
    }

    // 3. Helper calls: helper("literal", …)
    scanJsHelperCalls(rel, source, helpers, allowList, findings)
}

function scanJsHelperCalls(rel, source, helpers, allowList, findings) {
    for (const helper of helpers) {
        const re = new RegExp(
            `\\b${escapeRegex(helper)}\\s*\\(\\s*(["'])((?:\\\\.|(?!\\1).)*?)\\1`,
            'g',
        )
        let m
        while ((m = re.exec(source)) !== null) {
            const literal = m[2]
            if (!literal || !hasUserFacingChars(literal)) continue
            if (looksLikeTranslationKey(literal)) continue
            if (isAllowed(allowList, rel, literal)) continue
            const { line, column } = lineColForOffset(source, m.index)
            findings.push({
                path: rel,
                line,
                column,
                surface: `helper:${helper}`,
                literal,
            })
        }
    }
}

// ---- Driver --------------------------------------------------------------

async function main() {
    try {
        const args = parseArgs(process.argv.slice(2))
        const config = loadConfig(args.config)

        const targets = args.paths.length > 0 ? args.paths : await expandIncludes(config)

        const findings = []
        for (const rel of targets) {
            try {
                const stat = statSync(join(ROOT, rel))
                if (!stat.isFile()) continue
            } catch {
                continue
            }
            const source = loadFile(rel)
            if (rel.endsWith('.blade.php')) {
                scanBlade(rel, source, config, findings)
            } else if (rel.endsWith('.php')) {
                scanPhp(rel, source, config, findings)
            } else if (rel.endsWith('.tsx') || rel.endsWith('.jsx')) {
                scanJsx(rel, source, config, findings)
            } else if (rel.endsWith('.ts') || rel.endsWith('.js')) {
                scanJsx(rel, source, config, findings)
            }
        }

        emit(findings, args)
        process.exit(findings.length === 0 ? EXIT_CLEAN : EXIT_FINDINGS)
    } catch (err) {
        process.stderr.write(`[i18n-audit] internal error: ${err.message}\n${err.stack ?? ''}\n`)
        process.exit(EXIT_INTERNAL_ERROR)
    }
}

function emit(findings, args) {
    findings.sort((a, b) => {
        if (a.path !== b.path) return a.path.localeCompare(b.path)
        if (a.line !== b.line) return a.line - b.line
        return a.column - b.column
    })

    if (args.format === 'json') {
        const payload = {
            findings,
            total: findings.length,
            config: args.config,
        }
        process.stdout.write(JSON.stringify(payload, null, 2) + '\n')
        return
    }

    for (const f of findings) {
        process.stdout.write(
            `${f.path}:${f.line}:${f.column}  ${f.surface}: ${JSON.stringify(f.literal)}\n`,
        )
    }
    if (findings.length === 0) {
        process.stdout.write('0 finding(s).\n')
    } else {
        process.stdout.write(
            `\n${findings.length} finding(s). Extract these into lang/es/<domain>.php and reference via __() / t().\n`,
        )
    }
}

main()
