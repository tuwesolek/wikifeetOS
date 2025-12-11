# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/`: `pages/` (Next.js routes and `api/*`), `components/` (UI), `context/`, `system/` (apps, components, config, security, services), `models/`, `lib/`, `styles/`, `themes/`.
- Static assets: `public/` (e.g., `public/backgrounds/`, `public/icons/`).
- Tests: `tests/` with unit and integration suites; mocks under `tests/__mocks__/`.
- Docs: `docs/`. Environment template: `.env.example`.

## Build, Test, and Development Commands

- `npm run dev`: Start Next.js dev server at `http://localhost:3000`.
- `npm run dev:test-unapproved`: Dev with `ORBIT_DEV_MODE=true` (enables unapproved packages for local testing).
- `npm run build` / `npm start`: Build and run production.
- `npm test`: Run Jest suite. `npm run format` / `format:check`: Prettier write/check.
- Husky hooks: pre-commit runs tests and lint-staged; commit-msg enforces commitlint. Requires Node.js 16+.

## Coding Style & Naming Conventions

- JavaScript (ES2020+), React functional components, hooks-first.
- Prettier: 2-space indent, single quotes, semicolons, trailing commas, width 80.
- Components: PascalCase (e.g., `Desktop.js`). Pages/API: route-aligned filenames in `src/pages/*`.
- Styling: Tailwind utility classes; shared theme tokens in `src/themes/*`.
- Imports: use `@/` alias for `src` (see `jsconfig.json`).

## Testing Guidelines

- Frameworks: Jest + Testing Library (`jsdom`), setup at `tests/setup.js`.
- File names: `*.test.js` (unit) and `*.integration.test.js` (flows).
- Mocks: `framer-motion` mocked in `tests/__mocks__/`; alias `@/` works in tests.
- Run with `npm test`. Pre-commit runs tests automatically.

## Commit & Pull Request Guidelines

- Conventional Commits enforced by commitlint.
  - Example: `feat(taskbar): add clock hover tooltip`.
- PRs: clear description, linked issues, test notes, and UI screenshots (see `.github/PULL_REQUEST_TEMPLATE.md`).
- Keep diffs focused; update tests/docs alongside code; pass CI hooks locally.

## Security & Configuration Tips

- Copy `.env.example` to `.env.local`; set `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`. Never commit secrets.
- API routes live under `src/pages/api/*`; real-time socket at `/api/socket/io`.
- Avoid logging sensitive data; validate/authorize in API route handlers.
