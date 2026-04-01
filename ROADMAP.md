# Roadmap for www.omega2k.de

This document outlines the future development roadmap for the `www.omega2k.de` project, focusing on structured workflows, documentation, and agentic coding standards.

## Phase 1: Immediate Steps (Next 2-4 Weeks)

### 1. **Establish Development Workflow**

- **Task**: Define and document a standardized workflow for software development.
- **Details**:
  - Create templates for:
    - Changelog entries (conventional commits format)
    - Pull Requests (structure, required checks, labels)
    - Issue tracking (bugs, features, enhancements)
  - Integrate with existing tools:
    - Semantic Release (`release.config.mjs`)
    - Commitlint (`commitlint.config.js`)
    - Husky (Git Hooks)
- **Outcome**: Clear, reproducible workflow for all contributors.

### 2. **Enhance Documentation**

- **Task**: Expand documentation for applications (server and client).
- **Details**:
  - Add architectural decision records (ADRs) for key design choices.
  - Document API endpoints (WebSocket and REST).
  - Create sequence diagrams for critical flows (e.g., SSR, WebSocket communication).
- **Outcome**: Comprehensive documentation for onboarding and maintenance.

### 3. **Prepare for Spec-Kit Integration**

- **Task**: Align project structure and documentation with [Spec-Kit](https://github.com/github/spec-kit) standards.
- **Details**:
  - Review Spec-Kit requirements for:
    - Documentation structure
    - Metadata and annotations
    - Agentic coding guidelines
  - Create a migration plan for gradual adoption.
- **Outcome**: Readiness for future Spec-Kit integration.

## Phase 2: Mid-Term Goals (Next 1-3 Months)

### 1. **Automate Release Process**

- **Task**: Fully automate the release pipeline.
- **Details**:
  - Integrate semantic-release with GitLab CI/CD.
  - Automate changelog generation from commit messages.
  - Add validation for conventional commits in CI.
- **Outcome**: Zero-touch releases with standardized versioning.

### 2. **Improve Testing Coverage**

- **Task**: Expand test coverage for critical paths.
- **Details**:
  - Add unit tests for core libraries (`@o2k/core`).
  - Extend E2E tests for WebSocket and SSR interactions.
  - Integrate coverage gates in CI (e.g., 80% minimum).
- **Outcome**: Higher confidence in refactoring and updates.

### 3. **Optimize Docker Deployments**

- **Task**: Streamline Docker builds and deployments.
- **Details**:
  - Multi-stage builds for smaller images.
  - Health checks for all services.
  - Documentation for local development with Docker Compose.
- **Outcome**: Faster, more reliable deployments.

## Phase 3: Long-Term Vision (3-6 Months)

### 1. **Agentic Coding Readiness**

- **Task**: Fully prepare the project for agentic coding.
- **Details**:
  - Document all agentic workflows (e.g., issue triage, PR reviews).
  - Create templates for agent-generated content (e.g., ADRs, code reviews).
  - Integrate with Spec-Kit for metadata-driven development.
- **Outcome**: Seamless collaboration between human and agent contributors.

### 2. **Scalability Improvements**

- **Task**: Address scalability for content and users.
- **Details**:
  - Evaluate database options (SQLite → PostgreSQL).
  - Optimize WebSocket performance (e.g., Redis pub/sub).
  - Load testing for SSR and API endpoints.
- **Outcome**: Ready for increased traffic and content volume.

### 3. **Community and Contribution**

- **Task**: Foster a contributor community.
- **Details**:
  - Publish contribution guidelines.
  - Add "good first issue" labels.
  - Document local development setup.
- **Outcome**: Lower barrier to entry for new contributors.

## Success Metrics

- **Phase 1**: Workflow templates in place, documentation expanded, Spec-Kit readiness assessed.
- **Phase 2**: Automated releases, test coverage ≥80%, optimized Docker workflows.
- **Phase 3**: Agentic workflows documented, scalability improvements implemented, active contributor community.

## Open Questions

1. Should we prioritize Spec-Kit integration over other mid-term goals?
2. Are there specific scalability pain points to address first?
3. How should we structure agentic workflows (e.g., PR reviews, issue triage)?

## Spec-Kit

The Spec-Kit output is generated automatically in the CI/CD pipeline and stored in the [`docs/spec-kit`](docs/spec-kit) directory. It includes structured documentation for the project's applications, libraries, and workflows.

For more details, see the [Spec-Kit Output](docs/spec-kit/README.md).

## Next Steps

- [ ] Finalize workflow templates (Task #3).
- [ ] Expand application documentation (Task #4).
- [ ] Research Spec-Kit integration (Task #5).

---

_Last updated: 2025-04-01_
