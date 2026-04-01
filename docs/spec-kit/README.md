# Spec-Kit Output

This directory contains the generated Spec-Kit output based on the metadata defined in [`docs/metadata/spec-kit.yaml`](../metadata/spec-kit.yaml).

## Overview

Spec-Kit is a tool for managing specifications and documentation in a structured way. It provides a framework for defining, validating, and sharing specifications across teams.

## Structure

The Spec-Kit output is organized into the following sections:

1. **Applications**: Documentation for the frontend and backend applications.
2. **Libraries**: Documentation for the core, UI, and page libraries.
3. **Docker Services**: Documentation for the Docker services (SSR and API).
4. **CI/CD Pipeline**: Documentation for the CI/CD pipeline.
5. **Testing**: Documentation for the testing frameworks.
6. **Documentation**: Documentation for the documentation tools.
7. **Agentic Coding**: Documentation for the agentic coding standards.

## Applications

### Frontend (Angular)

- **Name**: Frontend (Angular)
- **Description**: Angular-based frontend with SSR support.
- **Type**: Web
- **Framework**: Angular
- **Language**: TypeScript
- **Tags**: frontend, ssr, angular

### WebSocket Server

- **Name**: WebSocket Server
- **Description**: Node.js WebSocket server for real-time communication.
- **Type**: API
- **Framework**: Express
- **Language**: TypeScript
- **Tags**: backend, websocket, nodejs

## Libraries

### Core Library

- **Name**: Core Library
- **Description**: Core logic and data access layer.
- **Language**: TypeScript
- **Tags**: library, core, data

### UI Library

- **Name**: UI Library
- **Description**: Reusable UI components.
- **Language**: TypeScript
- **Tags**: library, ui, components

### Page Library

- **Name**: Page Library
- **Description**: Page components and layouts.
- **Language**: TypeScript
- **Tags**: library, page, layout

## Docker Services

### SSR Service

- **Name**: SSR Service
- **Description**: Docker container for Angular SSR.
- **Dockerfile**: docker/Dockerfile.ssr
- **Ports**: 42000:80
- **Tags**: docker, ssr, frontend

### API Service

- **Name**: API Service
- **Description**: Docker container for WebSocket server.
- **Dockerfile**: docker/Dockerfile.api
- **Ports**: 42001:80
- **Tags**: docker, api, backend

## CI/CD Pipeline

- **Pipeline**: .gitlab-ci.yml
- **Stages**: lint, test, build, deploy
- **Tags**: ci, cd, gitlab

## Testing

### Vitest

- **Name**: Vitest
- **Type**: Unit
- **Coverage**: >=80%
- **Tags**: testing, unit, vitest

### Playwright

- **Name**: Playwright
- **Type**: E2E
- **Tags**: testing, e2e, playwright

## Documentation

### Markdown

- **Name**: Markdown
- **Description**: Lightweight markup language for documentation.
- **Tags**: documentation, markdown

### PlantUML

- **Name**: PlantUML
- **Description**: Generate UML diagrams from text.
- **Tags**: documentation, diagrams, plantuml

### Mermaid

- **Name**: Mermaid
- **Description**: Generate diagrams and visualizations.
- **Tags**: documentation, diagrams, mermaid

## Agentic Coding

### Issue Triage Agent

- **Name**: Issue Triage Agent
- **Description**: Labels and prioritizes issues.
- **Tags**: agentic, issue, triage

### Pull Request Review Agent

- **Name**: Pull Request Review Agent
- **Description**: Reviews pull requests for quality and standards.
- **Tags**: agentic, pr, review

### Documentation Agent

- **Name**: Documentation Agent
- **Description**: Updates and generates documentation.
- **Tags**: agentic, documentation

### Test Generation Agent

- **Name**: Test Generation Agent
- **Description**: Generates unit and integration tests.
- **Tags**: agentic, test, generation

### Refactoring Agent

- **Name**: Refactoring Agent
- **Description**: Refactors code for readability and maintainability.
- **Tags**: agentic, refactoring

## References

- [Spec-Kit GitHub Repository](https://github.com/github/spec-kit)
- [Spec-Kit Documentation](https://github.com/github/spec-kit/blob/main/docs/README.md)

## Next Steps

1. **Generate Spec-Kit Output**: Use the Spec-Kit CLI to generate the output from the metadata.
2. **Integrate with CI/CD**: Add Spec-Kit generation to the CI/CD pipeline.
3. **Review and Update**: Regularly review and update the metadata and generated output.

---

_Last updated: 2025-04-01_
