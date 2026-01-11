# Useful Commands

## Development

```bash
npm run build              # Compile TypeScript to dist/index.js
npm run watch             # TypeScript watch mode (auto-recompile)
npm run dev               # Run MCP server in dev mode with tsx
npm test                  # Run Vitest test suite
npm run lint              # Run ESLint on src/
npm run format            # Run Prettier to format src/
```

## Project Management

```bash
# Check for type errors
npm run build

# Run all tests
npm test

# Run specific test file
npm test prompt-loader.test.ts

# Format all code
npm run format

# Check linting without fixing
npm run lint
```

## Git Workflow

```bash
# See recent commits
git log --oneline -20

# Check git status
git status

# View current changes
git diff

# View staged changes
git diff --cached

# View changed files only
git diff --name-only
git diff --cached --name-only
```

## Installation & Publishing

```bash
# Install dependencies
npm install

# Install globally from local build (for testing)
npm install -g .

# Publish to npm (requires auth)
npm publish

# Pre-publish (runs build automatically)
npm run prepublishOnly
```

## Prompt Validation

Compose prompt path: `.project-memory/prompts/`
- Prompt files: base.md, parse-tasks.md, review.md, sync.md
- Composed limit: base.md + specific prompt ≤ 400 lines
- Individual limit: each prompt ≤ 200 lines

Check prompt composition in index.ts → composePrompt() function

## Task Management

```bash
# Check active tasks
cat .project-memory/tasks/tasks-active.json

# Check completed tasks
cat .project-memory/tasks/tasks-completed.json

# View all specs
ls -la .project-memory/specs/

# View architecture
cat .project-memory/architecture.md

# View conventions
cat .project-memory/conventions.md
```

## Building for Release

```bash
# Full release build
npm run build
npm test
npm run lint
npm run format

# Verify binary works
./dist/index.js --help    # May not show help (MCP-specific)

# Test locally with Claude
npm install -g .
# Then use 'project-memory-mcp' command in Claude config
```

## Debugging

```bash
# Run with verbose output
npm run dev

# See MCP server output
npm run dev 2>&1 | tee mcp-output.log

# Check Node version
node --version              # Should be >=18.0.0
```

## Configuration Files

- **package.json** - Project metadata and scripts
- **tsconfig.json** - TypeScript compiler settings
- **vitest.config.ts** - Test runner configuration
- **.eslintignore** - ESLint ignore patterns (if exists)
- **.prettierignore** - Prettier ignore patterns (if exists)
