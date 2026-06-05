# ADR-001: Core Tech Choices

## Status
Accepted

## Context
We need a frontend app with strong typing, consistent tooling, and a minimal runnable setup.

## Decision
- Use Angular 19 with TypeScript.
- Use Jest for unit tests.
- Use ESLint and Prettier for linting and formatting.
- Use npm with an LTS Node version.

## Consequences
- Jest configuration replaces the default Karma runner.
- Linting requires Angular ESLint plugins.
