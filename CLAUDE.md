# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs-First Rule

**Before generating or modifying any code, always read and refer to the relevant documentation files in the `/docs` directory.** These docs contain project-specific conventions, patterns, and requirements that must be followed. If a docs file covers the area you are working on, treat it as the source of truth.

Current docs:
- `docs/ui.md` — UI conventions and component guidelines

## Commands

- `npm run dev` — Start dev server (http://localhost:3000) with hot reload
- `npm run build` — Production build
- `npm start` — Start production server
- `npm run lint` — Run ESLint (Next.js core-web-vitals + TypeScript rules)

No test framework is configured yet.

## Architecture

Next.js 16 app using the **App Router** (`src/app/`), React 19, TypeScript (strict mode), and Tailwind CSS v4.

- **Path alias**: `@/*` maps to `./src/*`
- **Styling**: Tailwind utility classes with `@theme` CSS custom properties for dark mode (`dark:` prefix, `prefers-color-scheme`)
- **Fonts**: Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`) via `next/font/google`
- **Components are server components by default** (App Router convention)
- **ESLint**: Flat config format (v9+), config in `eslint.config.mjs`
