# Agentic Coding Guidelines for www.omega2k.de

This document outlines the guidelines and standards for agentic coding in the `www.omega2k.de` project. It ensures that both human and agent contributors can collaborate effectively.

## Overview

### What is Agentic Coding?

Agentic coding involves the use of AI agents to assist in software development tasks, such as:

- Code generation and refactoring
- Issue triage and prioritization
- Pull request reviews
- Documentation updates
- Test generation

### Goals

- **Consistency**: Ensure all contributions (human and agent) follow the same standards.
- **Clarity**: Provide clear guidelines for agent tasks and decision-making.
- **Collaboration**: Facilitate seamless interaction between human and agent contributors.

## Agent Roles and Responsibilities

### 1. **Issue Triage Agent**

- **Responsibilities**:
  - Label issues based on type (bug, feature, documentation).
  - Prioritize issues based on impact and urgency.
  - Assign issues to appropriate contributors or request more information.
- **Guidelines**:
  - Use the provided issue templates (`bug_report.md`, `feature_request.md`).
  - Follow the triage checklist in `CONTRIBUTING.md`.

### 2. **Pull Request Review Agent**

- **Responsibilities**:
  - Review pull requests for adherence to standards.
  - Check for test coverage, documentation, and code quality.
  - Request changes or approve based on predefined criteria.
- **Guidelines**:
  - Use the pull request template (`pull_request_template.md`).
  - Follow the code review checklist in `CONTRIBUTING.md`.

### 3. **Documentation Agent**

- **Responsibilities**:
  - Update documentation based on code changes.
  - Generate architectural decision records (ADRs).
  - Ensure documentation is clear and up-to-date.
- **Guidelines**:
  - Follow the documentation standards in `CONTRIBUTING.md`.
  - Use clear, concise language and include examples.

### 4. **Test Generation Agent**

- **Responsibilities**:
  - Generate unit and integration tests for new features.
  - Ensure test coverage meets the ≥80% threshold.
  - Update tests based on code changes.
- **Guidelines**:
  - Follow the testing guidelines in `CONTRIBUTING.md`.
  - Use the project's testing frameworks (Vitest, Playwright).

### 5. **Refactoring Agent**

- **Responsibilities**:
  - Identify and refactor code for improved readability and maintainability.
  - Ensure refactoring does not introduce breaking changes.
  - Update documentation and tests as needed.
- **Guidelines**:
  - Follow the refactoring checklist in `CONTRIBUTING.md`.
  - Use conventional commits for refactoring changes (`refactor(scope): description`).

## Agentic Workflow

### 1. **Issue Triage Workflow**

1. **Input**: New issue created in GitHub.
2. **Processing**:
   - Analyze issue title and description.
   - Apply appropriate labels (e.g., `bug`, `enhancement`, `documentation`).
   - Prioritize based on impact and urgency.
   - Assign to appropriate contributor or request more information.
3. **Output**: Labeled, prioritized, and assigned issue.

### 2. **Pull Request Review Workflow**

1. **Input**: New pull request created in GitHub.
2. **Processing**:
   - Check for adherence to commit message standards.
   - Verify test coverage (≥80%).
   - Ensure documentation is updated.
   - Review code quality and style.
3. **Output**: Approved pull request or requested changes.

### 3. **Documentation Update Workflow**

1. **Input**: Code changes merged into `main`.
2. **Processing**:
   - Analyze changes for documentation impact.
   - Update relevant documentation files (e.g., `README.md`, `CHANGELOG.md`).
   - Generate or update ADRs for significant changes.
3. **Output**: Updated documentation.

### 4. **Test Generation Workflow**

1. **Input**: New feature or code changes.
2. **Processing**:
   - Generate unit tests for new functions/components.
   - Generate integration tests for new features.
   - Ensure test coverage meets the ≥80% threshold.
3. **Output**: New or updated tests.

### 5. **Refactoring Workflow**

1. **Input**: Code identified for refactoring.
2. **Processing**:
   - Analyze code for readability and maintainability.
   - Refactor code without introducing breaking changes.
   - Update documentation and tests as needed.
3. **Output**: Refactored code with updated documentation and tests.

## Agentic Coding Standards

### 1. **Commit Messages**

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
- Use the following format:

  ```plaintext
  <type>(<scope>): <description>

  [optional body]

  [optional footer(s)]
  ```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

### 2. **Code Style**

- Follow the project's ESLint and Prettier configurations.
- Use TypeScript for all new code.
- Follow the Angular style guide for frontend code.

### 3. **Testing**

- Aim for ≥80% test coverage for new features.
- Use Vitest for unit tests and Playwright for E2E tests.
- Ensure tests are clear, concise, and cover edge cases.

### 4. **Documentation**

- Follow the [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/).
- Use Markdown for all documentation files.
- Include code samples where applicable.

### 5. **Issue and Pull Request Templates**

- Use the provided templates for issues and pull requests.
- Ensure all required fields are filled out.
- Follow the checklists for issue triage and pull request reviews.

## Integration with Spec-Kit

### Overview

[Spec-Kit](https://github.com/github/spec-kit) is a tool for managing specifications and documentation in a structured way. It provides a framework for defining, validating, and sharing specifications across teams. The Spec-Kit output is generated automatically in the CI/CD pipeline and stored in the [`docs/spec-kit`](docs/spec-kit) directory.

### Preparation for Spec-Kit Integration

1. **Structured Documentation**: Ensure all documentation is structured and follows Spec-Kit standards.
2. **Metadata and Annotations**: Add metadata and annotations to documentation files for Spec-Kit compatibility.
3. **Agentic Workflows**: Define agentic workflows that align with Spec-Kit standards.

### Steps for Integration

1. **Review Spec-Kit Requirements**: Understand the requirements for Spec-Kit integration.
2. **Update Documentation**: Ensure all documentation files are structured and include necessary metadata.
3. **Define Agentic Workflows**: Create workflows that align with Spec-Kit standards.
4. **Test Integration**: Test the integration with Spec-Kit and address any issues.
5. **Deploy**: Deploy the updated documentation and workflows.

### Spec-Kit Output

The Spec-Kit output is generated automatically in the CI/CD pipeline and includes the following sections:

1. **Applications**: Documentation for the frontend and backend applications.
2. **Libraries**: Documentation for the core, UI, and page libraries.
3. **Docker Services**: Documentation for the Docker services (SSR and API).
4. **CI/CD Pipeline**: Documentation for the CI/CD pipeline.
5. **Testing**: Documentation for the testing frameworks.
6. **Documentation**: Documentation for the documentation tools.
7. **Agentic Coding**: Documentation for the agentic coding standards.

For more details, see the [Spec-Kit Output](docs/spec-kit/README.md).

## Examples

### Example 1: Issue Triage

**Input**:

```markdown
Title: "Bug: WebSocket connection fails intermittently"
Description: "The WebSocket connection fails intermittently when the server is under heavy load."
```

**Processing**:

1. Analyze the title and description.
2. Apply labels: `bug`, `websocket`, `triage`.
3. Prioritize: High (impact on user experience).
4. Assign to the WebSocket team or request more information.

**Output**:

```markdown
Labels: `bug`, `websocket`, `triage`, `priority:high`
Assignees: @websocket-team
```

### Example 2: Pull Request Review

**Input**:

```markdown
Title: "feat(websocket): add real-time likes counter"
Description: "Implement WebSocket endpoint for likes and update frontend to display real-time counts."
```

**Processing**:

1. Check commit messages for conventional commits format.
2. Verify test coverage (≥80%).
3. Ensure documentation is updated.
4. Review code quality and style.

**Output**:

```markdown
Approved: Yes/No
Comments: "Please add tests for edge cases and update the README.md."
```

### Example 3: Documentation Update

**Input**:

```typescript
// New function added to core library
export function calculateLikes(likes: number[]): number {
  return likes.reduce((sum, like) => sum + like, 0);
}
```

**Processing**:

1. Analyze the new function.
2. Update the `README.md` with usage examples.
3. Add JSDoc comments to the function.

**Output**:

````markdown
// README.md

## calculateLikes

Calculates the total number of likes from an array of like counts.

**Parameters**:

- `likes`: An array of like counts.

**Returns**:

- The total number of likes.

**Example**:

```typescript
const likes = [1, 2, 3];
const total = calculateLikes(likes); // 6
```
````

```

## Tools and Resources

### 1. **Agentic Coding Tools**
- [GitHub Copilot](https://github.com/features/copilot): AI-powered code completion.
- [GitHub Actions](https://github.com/features/actions): Automate workflows.
- [Spec-Kit](https://github.com/github/spec-kit): Manage specifications and documentation.

### 2. **Documentation Tools**
- [Markdown](https://www.markdownguide.org/): Lightweight markup language.
- [PlantUML](https://plantuml.com/): Generate UML diagrams from text.
- [Mermaid](https://mermaid.js.org/): Generate diagrams and visualizations.

### 3. **Testing Tools**
- [Vitest](https://vitest.dev/): Unit testing framework.
- [Playwright](https://playwright.dev/): E2E testing framework.
- [Cypress](https://www.cypress.io/): Alternative E2E testing framework.

## Best Practices

### 1. **Clear Communication**
- Use clear, concise language in all communications.
- Provide context and examples where helpful.
- Be respectful and inclusive in all interactions.

### 2. **Consistent Standards**
- Follow the project's coding and documentation standards.
- Use conventional commits for all changes.
- Ensure test coverage meets the ≥80% threshold.

### 3. **Collaboration**
- Work closely with human contributors to ensure alignment.
- Provide regular updates on progress and any issues encountered.
- Be open to feedback and willing to make adjustments as needed.

### 4. **Continuous Improvement**
- Regularly review and update agentic workflows.
- Incorporate feedback from human contributors.
- Stay up-to-date with the latest agentic coding tools and techniques.

## Conclusion

This document provides a comprehensive guide to agentic coding in the `www.omega2k.de` project. By following these guidelines, we can ensure that both human and agent contributors can collaborate effectively and maintain high standards of quality and consistency.

---

*Last updated: 2025-04-01*
```
