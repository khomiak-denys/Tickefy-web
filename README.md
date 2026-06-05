# Tickefy

![Build](https://img.shields.io/badge/build-not_configured-lightgrey)
![Coverage](https://img.shields.io/badge/coverage-target%2080%25-blue)

Tickefy is an Angular app for managing teams, tickets, and activity logs with a clean, modular structure.

## Quickstart

### Prerequisites
- Node.js 20 LTS
- npm 10+

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```

### Tests
```bash
npm test
```

### Build
```bash
npm run build
```

## Configuration

Copy the example environment file and adjust values as needed:
```bash
copy .env.example .env
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| NG_APP_JWT_ISSUER | Yes | tickefy | JWT issuer used by the backend. |
| NG_APP_JWT_AUDIENCE | Yes | tickefy-web | JWT audience used by the backend. |
| NG_APP_API_BASE_URL | Yes | http://localhost:5000 | Base URL for the REST API. |

## Commands

| Command | Description |
| --- | --- |
| npm run dev | Start the Angular dev server. |
| npm run build | Build the production bundle. |
| npm test | Run Jest unit tests. |
| npm run test:ci | Run tests in CI mode. |
| npm run lint | Run ESLint on TS/HTML. |
| npm run format | Format files with Prettier. |
| npm run typecheck | Run TypeScript type checks only. |
| npm run clean | Remove build and coverage artifacts. |

## Project Structure

- src/app/core: API, guards, interceptors, shared services
- src/app/features: feature areas (auth, dashboard, settings)
- src/app/routes: route definitions
- src/app/shared: utilities and icons
- docs/adr: architecture decision records

## Architecture Overview

The app is structured around feature modules with a shared core for cross-cutting concerns like auth, HTTP interceptors, and API configuration. Routes are centralized for clarity and to keep navigation logic in one place.

Environment configuration is validated at startup to avoid silent misconfiguration in production builds. HTTP calls flow through interceptors so authentication and error handling remain consistent across the app.

## Decisions

- ADR template: docs/adr/ADR-000-template.md
- First ADR: docs/adr/ADR-001-tech-choices.md

## Contributing

Contributions are welcome. Open a pull request with a clear description and tests.

## Code of Conduct

A code of conduct will be added. For now, please be respectful in all interactions.

## Roadmap / Next Steps

- Add CI workflow for build and tests.
- Add coverage reporting.
- Extend the API client with retries and request tracing.

## Coverage Target

Target unit test coverage is 80% lines.
