# ADR 001: Use Nx Workspace for Monorepo Management

## Status

**Accepted**

## Context

The project requires a scalable and maintainable architecture to manage multiple applications (frontend, backend) and libraries (core, ui, page). Traditional monorepo tools like Lerna or standalone workspaces lack built-in support for modern Angular applications and efficient task orchestration.

## Decision

We will use **Nx** as the monorepo management tool for the following reasons:

1. **Built-in Angular Support**: Nx provides first-class support for Angular applications, including SSR, testing, and build optimizations.
2. **Task Orchestration**: Nx efficiently schedules and caches tasks, reducing build times and improving developer experience.
3. **Dependency Graph**: Visualize and manage dependencies between applications and libraries.
4. **Plugin Ecosystem**: Access to a rich ecosystem of plugins for Angular, Node.js, and other technologies.
5. **Incremental Builds**: Only rebuild what is necessary, improving CI/CD performance.

## Consequences

- **Positive**:
  - Faster builds and tests due to caching and parallelization.
  - Easier dependency management between applications and libraries.
  - Built-in support for Angular and Node.js applications.
  - Better visibility into the project structure with `nx graph`.

- **Negative**:
  - Learning curve for developers unfamiliar with Nx.
  - Additional configuration overhead compared to standalone workspaces.

## Alternatives Considered

1. **Lerna**: Lacks built-in Angular support and efficient task orchestration.
2. **Standalone Workspaces**: No built-in task caching or dependency graph visualization.
3. **Turborepo**: Similar to Nx but less mature for Angular applications.

## Implementation

1. Initialize Nx workspace with Angular and Node.js support.
2. Configure Nx plugins for Angular, Vitest, and Playwright.
3. Set up task caching and dependency graph visualization.
4. Document Nx commands and workflows in `CONTRIBUTING.md`.

## References

- [Nx Documentation](https://nx.dev/)
- [Nx Angular Tutorial](https://nx.dev/getting-started/tutorials/angular-www-tutorial)
