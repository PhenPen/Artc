# Markdown Cross-Platform Converter

A local-first Markdown converter with a React web interface and a Node.js CLI. Both call the same TypeScript conversion core. There is no backend, Python, account, database, publishing integration, or AI rewriting.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```sh
npm install
npm run dev
```

## Verify

```sh
npm test
npm run build
```

## CLI

```sh
npm run cli -- convert article.md --platform astro --title "My article" --description "A short summary" --pub-date 2026-10-24 --tags "typescript,markdown" --draft --output article.astro.md
npm run cli -- convert article.md --platform medium --preset clean-markdown --cleanup
npm run cli -- convert article.md --platform linkedin --preset plain-text
```

Without `--output`, converted content is written to standard output. Astro is the default platform. Metadata flags apply to Astro output; the source file becomes the title if `--title` is omitted.

## Behavior

- Astro frontmatter is written in this order: `title`, `description`, `pubDate`, inline `tags`, `draft`. The article body is appended without modification.
- Medium and LinkedIn have separate cleanup switches in the web UI and `--cleanup` in the CLI. Medium cleanup removes horizontal rules; LinkedIn cleanup also turns headings into paragraphs.
- Presets are `none`, `clean-markdown`, and `plain-text`. `None` returns the input unchanged. Clean Markdown parses and serializes with Remark. Plain Text removes Markdown presentation syntax while preserving code contents, URL fragments are not edited, and HTML comments are retained.
- The UI shows original text, output preview, and a line diff. It can open a Markdown file, copy output, or download `.md` output.
- Processing is local to the browser or CLI process.

## Project layout

```text
src/core/       Shared converter and syntax-aware Markdown transforms
src/web/        React interface
src/cli/        Commander.js CLI
```
