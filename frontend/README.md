# Frontend (React + Tailwind)

Simple UI for CloudTools Expiration Tracker.

## Run locally

```bash
npm install
npm run dev
```

Optional config:

```bash
cp .env.example .env
```

If `.env` is not set, API URL defaults to `http://localhost:8000`.

## Current UX behavior

- Fixed dropdown for item types (tool/company agnostic values)
- 14-day reminder notification section
- Color-coded status in table (expired, reminder, upcoming, healthy)
- Soft delete and restore actions
- Basic item history viewer per row
# Frontend (React + Tailwind)

This UI is a simple dashboard for tracking expiration metadata.

## Run

```bash
npm install
npm run dev
```

Optional env:

```bash
cp .env.example .env
```

If no env file is set, API defaults to `http://localhost:8000`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
