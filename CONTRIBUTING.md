# Contributing to www.omega2k.de

Thank you for your interest in contributing to this project! This document outlines the guidelines for contributing to the `www.omega2k.de` repository.

## Getting Started

### Prerequisites

- Node.js (v20.x or later)
- pnpm (v8.x or later)
- Docker (for local development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/omega2k/www.omega2k.de.git
   cd www.omega2k.de
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm start
   ```

## Development Workflow

### Branching Strategy

- **Main Branch**: `main` (protected, requires PR reviews)
- **Feature Branches**: `feat/<feature-name>`
- **Bugfix Branches**: `fix/<bug-name>`
- **Release Branches**: `release/<version>`

### Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Use the following format:

```plaintext
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (e.g., updating dependencies)

**Example**:

```plaintext
feat(websocket): add real-time likes counter

- Implement WebSocket endpoint for likes
- Update frontend to display real-time counts

Fixes #123
```

### Pull Requests

1. Fork the repository and create a feature branch.
2. Make your changes and ensure all tests pass.
3. Submit a pull request to the `main` branch.
4. Include a clear description of the changes and reference any related issues.
5. Wait for review and address any feedback.

### Code Reviews

- All pull requests require at least one approval.
- Reviews should focus on:
  - Code quality and adherence to standards
  - Test coverage
  - Documentation updates
  - Performance and security implications

## Testing

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm e2e

# Linting
pnpm lint
```

### Test Coverage

- Aim for ≥80% coverage for new features.
- Use `pnpm test -- --coverage` to generate coverage reports.

## Documentation

### Updating Documentation

- Update the relevant documentation files (e.g., `README.md`, `CHANGELOG.md`).
- Add architectural decision records (ADRs) for significant changes.
- Use clear, concise language and include examples where helpful.

### Documentation Standards

- Follow the [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/).
- Use Markdown for all documentation files.
- Include code samples where applicable.

## Issue Tracking

### Reporting Issues

- Use the provided issue templates (`bug_report.md`, `feature_request.md`).
- Include steps to reproduce, expected behavior, and actual behavior.
- Label issues appropriately (e.g., `bug`, `enhancement`, `documentation`).

### Triaging Issues

- The `triage` label indicates issues that need review.
- Prioritize issues based on impact and urgency.

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive.
- Follow the [Contributor Covenant](https://www.contributor-covenant.org/).
- Report unacceptable behavior to the project maintainers.

### Communication

- Use GitHub issues and pull requests for discussions.
- Join the project's Discord server for real-time discussions (if available).

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

_Last updated: 2025-04-01_
