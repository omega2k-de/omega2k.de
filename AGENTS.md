# Repository Guidelines

## Project Structure & Module Organization

This Nx workspace keeps deployable targets in `apps/`. The Angular front end lives in `apps/www`, the websocket server in `apps/websocket`, and their Playwright suites in the `*-e2e` siblings. Reuse-ready domain logic, UI widgets, and shared utilities stay in `libs/core`, `libs/ui`, and `libs/page`. Build artifacts land in `dist/`, coverage summaries in `coverage/`, container assets in `docker/`, and helper scripts in `scripts/`. Place environment templates in `.env` (never commit real secrets) and keep SSL inputs under `ssl/`.

## Build, Test, and Development Commands

Run `pnpm install` once per machine, then rely on Nx executors:

- `pnpm start` → `nx run www:serve`, hot-reloading the Angular client on `http://localhost:4200`.
- `pnpx nx run websocket:serve` to boot the Node websocket service with the latest build output.
- `pnpm ci:build` for a full production bundle across all apps, producing artifacts in `dist/apps/*`.
- `pnpm lint` (Nx lint for every project) and `pnpm format` (Prettier write) before pushing.

## Coding Style & Naming Conventions

`.editorconfig` enforces UTF-8, 2-space indentation, 100-column TypeScript, and wrapped Markdown. TypeScript/HTML/SCSS must stay in Angular’s default folder layout (`*.component.ts|html|scss`). Use PascalCase for class names, camelCase for fields/functions, and kebab-case for file names (`feature-toggle.component.ts`). Prettier, ESLint (`eslint.config.mjs`), Stylelint (`.stylelintrc.json`), and HtmlHint run via lint-staged; avoid manual formatting overrides. Keep imports sorted by `eslint-plugin-simple-import-sort` and prefer Nx path aliases from `tsconfig.base.json`.

## Testing Guidelines

Unit tests default to Vitest/Jest (`pnpm test` runs `nx run-many --target=test` with coverage) and create reports in `coverage/<project>`. E2E specs live under `apps/www-e2e` and `apps/websocket-e2e`; execute them with `pnpm ci:www-e2e` or `pnpm ci:websocket-e2e`. Name test files `*.spec.ts` (unit) and `*.e2e.ts` (Playwright). Maintain green coverage gates by keeping statements touched and failing PRs that drop coverage beneath the previous baseline; regenerate HTML summaries with `pnpm test -- --coverage.enabled`.

## Commit & Pull Request Guidelines

Commitlint enforces Conventional Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `ci`, `chore`, `perf`, `revert`, and `vercel`. Use `type(scope?): summary` with imperative verbs (`fix: adjust hero gradient`). Squash WIP commits locally. Pull requests must describe the change, list affected Nx targets, link to issues, and attach UI screenshots or API traces when behavior changes. Include test evidence (`pnpm test`, relevant e2e commands) and call out config updates (`.env`, migrations) in the PR description.\*\*\*
