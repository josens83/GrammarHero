# Contributing to GrammarHero

Thank you for your interest in contributing to GrammarHero! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please be respectful and constructive in all interactions. We're building an educational platform, and our community should reflect those values.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GrammarHero.git
   cd GrammarHero
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/josens83/GrammarHero.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

Examples:
- `feature/dark-mode-toggle`
- `fix/login-validation`
- `docs/api-documentation`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```
feat(auth): add Google OAuth login
fix(api): handle rate limit errors gracefully
docs(readme): update installation instructions
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define explicit types; avoid `any` when possible
- Use interfaces for object shapes
- Export types from dedicated files in `types/`

### React Components

- Use functional components with hooks
- Prefer named exports
- Add JSDoc comments for complex components
- Keep components focused and single-purpose

```tsx
/**
 * @fileoverview Component description
 * @description Detailed description of what this component does
 */

interface MyComponentProps {
  /** Description of prop */
  title: string;
  /** Description of optional prop */
  isActive?: boolean;
}

export function MyComponent({ title, isActive = false }: MyComponentProps) {
  // Implementation
}
```

### File Organization

- One component per file
- Name files the same as the component (PascalCase)
- Group related files in directories
- Use barrel exports (`index.ts`) for public APIs

### CSS/Styling

- Use Tailwind CSS utility classes
- Use the `cn()` utility for conditional classes
- Keep styles co-located with components
- Follow the existing design system

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Writing Tests

- Place tests in `__tests__/` directory
- Follow the existing file structure
- Use descriptive test names
- Test both success and error cases

```tsx
describe("ComponentName", () => {
  it("should render correctly with default props", () => {
    render(<ComponentName />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    const { user } = render(<ComponentName />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Result")).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for meaningful coverage, not just high numbers
- Focus on:
  - User interactions
  - Edge cases
  - Error handling
  - Accessibility

## Pull Request Process

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**:
   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   npm test
   ```

3. **Create a pull request** with:
   - Clear title following commit message conventions
   - Description of changes
   - Screenshots for UI changes
   - Link to related issues

4. **Address review feedback** promptly

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests added for new functionality
- [ ] All tests passing
- [ ] Documentation updated if needed
- [ ] No console.log statements (use proper logging)
- [ ] Accessibility considered for UI changes
- [ ] Mobile responsiveness verified

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information
- Error messages from console

### Feature Requests

Include:
- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (optional)
- Mockups or examples (optional)

## Questions?

Feel free to open an issue for questions or discussion topics.

Thank you for contributing to GrammarHero! 🎉
