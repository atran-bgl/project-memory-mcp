# Coding Conventions

## Forbidden Actions - NEVER Do These Without Permission

❌ NO large refactors
❌ NO dependency upgrades or additions
❌ NO config file changes (package.json, tsconfig.json, .eslintrc, etc.)
❌ NO auto-formatting entire files
❌ NO removing existing features
❌ NO changing public APIs
❌ NO architectural changes
❌ NO introducing new patterns
❌ NO changing build scripts
❌ NO changing business logic (calculations, validations, rules)
❌ NO changing UI/UX (copy, visual design, UX flows - frontend projects)

**Business Logic Protection:**
Preserve existing calculations, validation rules, business constraints, data transformations.
When unsure if something is business logic: STOP and ASK FIRST.

**UI/UX Protection (Frontend Projects):**
Don't change UI copy/text, colors, layouts, spacing, or user flows.
Follow design system. Use existing components. Respect accessibility (ARIA, keyboard, contrast).
When unsure if something affects UX: STOP and ASK FIRST.

If needed: STOP, ask user, wait for approval.

---

## Code Style Enforcement - CRITICAL

**ALWAYS match existing code style. NEVER introduce new patterns.**

Before writing any code:
1. **Read 2-3 similar files** in the codebase
2. **Identify patterns:** naming, formatting, file structure, error handling
3. **Match exactly:** Use SAME conventions, SAME patterns, SAME style
4. **Run linters:** Fix all errors before committing

**Rules:**
- If codebase uses functional components, don't introduce classes
- If codebase uses camelCase, don't use snake_case
- If codebase uses named exports, don't use default exports
- If codebase uses async/await, don't mix with .then()
- Match indentation (tabs vs spaces), quotes (single vs double), semicolons

**Verification:**
- Run: `npm run lint` or `npx eslint [file]`
- Fix all linting errors
- Confirm: naming, patterns, formatting all match existing code

---

## File Naming

- **Source files:** camelCase.ts (e.g., prompt-loader.ts, init-prompt.ts)
- **Prompts:** {action}-prompt.ts (e.g., review-prompt.ts, sync-prompt.ts)
- **Test files:** {module}.test.ts (e.g., prompt-loader.test.ts)
- **Directories:** kebab-case (src/, test/, .project-memory/)

## TypeScript & Code Style

- **Strict Mode:** Enable all strict checks
  - `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
  - `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Module System:** ES2022 modules with .js file extensions
  - Imports: `import { X } from './file.js'`
  - Exports: Named exports preferred
- **Naming:** camelCase for variables/functions, PascalCase for types/classes/constants
- **Comments:** JSDoc-style for functions and public APIs
  - Example: `/** Description of what this does */`

## Error Handling

- Use try-catch blocks for async operations
- Provide descriptive error messages
- Never silently swallow errors
- Return structured error responses via MCP

Example:
```typescript
try {
  // operation
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return { content: [{ type: 'text', text: `Error: ${errorMessage}` }], isError: true };
}
```

## Prompt Template Patterns

- **Structure:** Clear section headers with markdown (##, ###)
- **Code Blocks:** Use ``` for JSON, bash, or code examples
- **Instructions:** Step-by-step numbered lists
- **Output Examples:** Show expected format in code blocks
- **Variables:** Use ${VAR} for template substitution in base prompts
- **Size:** Keep each prompt ≤ 200 lines (composed ≤ 400 lines)

## Testing

- Framework: Vitest
- Test naming: `test('description', () => { ... })`
- Coverage: Focus on core functionality (prompt loading, validation, composition)
- Edge cases: Test empty files, missing files, oversized prompts
- No need to test file operations (Claude does those)

Run: `npm test`

## Imports & Exports

- **Relative imports:** Use .js extensions (ES modules)
  - ✅ `import { X } from './utils/loader.js'`
  - ❌ `import { X } from './utils/loader'`
- **Named exports:** Prefer named over default
  - ✅ `export const REVIEW_PROMPT = ...`
  - ❌ `export default { REVIEW_PROMPT }`
- **Constants:** UPPER_SNAKE_CASE for exported constants
  - ✅ `export const SYNC_PROMPT = ...`
  - ❌ `export const syncPrompt = ...`

## Code Organization

- **index.ts:** Main server, tool registration, request handlers
- **prompts/:** One file per tool (contains exported constant)
- **schemas/:** JSON schema definitions
- **utils/:** Helper functions (prompt composition, validation)
- **test/:** Test files (1:1 with src structure)

## Security Rules

- ✅ No hardcoded credentials or API keys
- ✅ No sensitive data in prompts
- ✅ No file path traversal vulnerabilities
- ✅ Validate prompt file paths before reading
- ✅ Never expose full error stacks to users

## TypeScript Types

- Always type function parameters and return values
- Use proper types (never implicit `any`)
- Example:
```typescript
async function composePrompt(
  projectRoot: string,
  promptName: string,
  fallback: string
): Promise<string> {
  // implementation
}
```

## Prompts - Content Rules

- **Tone:** Clear, actionable instructions
- **Length:** Single prompts ≤ 200 lines, composed ≤ 400 lines
- **Markdown:** Use clear headers, code blocks, numbered steps
- **Examples:** Show expected input/output formats
- **Task Schema:** Always include full JSON schema definition
- **Approval:** Always instruct Claude to use AskUserQuestion for changes

## Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Current: 0.1.0 (pre-release, development phase)
- Update in package.json only (version is single source of truth)

## Build & Deployment

- **Build command:** `npm run build`
- **Output directory:** dist/
- **Main entry:** dist/index.js
- **Binary:** Installed as `project-memory-mcp` command
- **Dependencies:** Minimize external dependencies
  - Core: @modelcontextprotocol/sdk only
  - Dev: TypeScript, testing, linting, formatting tools
