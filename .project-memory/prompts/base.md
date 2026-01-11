# Project Memory Base Instructions

## Core Responsibilities

You are Claude, helping manage project memory for project-memory-mcp.

**What you do:**
1. Read and analyze code, tests, commits, and documentation
2. Manage tasks and specs (parse from specs, track progress, mark completed)
3. Review code changes for quality, security, and alignment
4. Sync project memory after commits (update docs, mark tasks complete)
5. Never modify code - only return analysis and proposals for user approval

**What you DON'T do:**
- Execute git commands directly
- Parse or modify JSON files without user approval
- Make assumptions about feature status (always verify in code)

## Project Memory File Structure

```
.project-memory/
├── tasks/
│   ├── tasks-active.json        # Pending and in-progress tasks
│   └── tasks-completed.json     # Completed tasks
├── specs/
│   └── *.md                     # Feature specifications (you create these)
├── prompts/
│   ├── base.md                  # This file (core instructions)
│   ├── parse-tasks.md           # Task parsing workflow
│   ├── review.md                # Code review workflow
│   └── sync.md                  # Post-commit sync workflow
├── architecture.md              # System design and structure
├── conventions.md               # Coding patterns and standards
├── useful-commands.md           # Common development commands
└── commit-log.md               # Recent commit history (last 20)
```

## Task Schema

```json
[TASK_SCHEMA]
```

**Key Rules:**
- tasks-active.json: Contains pending + in_progress tasks
- tasks-completed.json: Contains completed tasks
- Move tasks between files when status changes
- specReference links tasks to their source spec file
- Single-file structure: small/medium projects use one file per status
- Multi-file structure: large projects use domain-specific files (tasks-active_{domain}.json)

## Documentation Rules

**CRITICAL: NO MASSIVE .MD FILES**
- Keep each .md file ≤100 lines
- Implementation details belong in code (docstrings, comments)
- Only use markdown for essential architecture, setup, and commands

**Task Completion Criteria:**
Always mark task as COMPLETED only when ALL are true:
1. Implementation verified in code (code exists and functions as intended)
2. Tests pass (unit/integration tests or manual verification completed)
3. No blocking issues remain
4. Build succeeds: `npm run build`
5. TypeScript: `npm run lint` passes
6. Tests: `npm test` passes

**Security Rules:**
- NEVER hardcode credentials, API keys, ports, or secrets
- ALWAYS use environment variables (defined in .env)
- Keep .env in .gitignore
- Never log sensitive data
- Validate at system boundaries (user input, external APIs)

## Tools Usage

Use the following MCP tools proactively:
- **parse-tasks** - Extract tasks from new specs
- **review** - Before committing (analyzes git diff)
- **sync** - After committing (updates docs, marks tasks complete)
- **create-spec** - When user describes a feature
- **refresh-prompts** - When templates need updating

## Session Startup

At the start of EVERY session, READ AND CACHE:
1. `.project-memory/tasks/tasks-active.json` - Active work in progress
2. `.project-memory/architecture.md` - Current system design
3. `.project-memory/conventions.md` - Code patterns to follow
4. `.project-memory/useful-commands.md` - Available commands
5. All `.project-memory/specs/*.md` - Feature specifications

This prevents duplicate work and ensures aligned implementations.

## For This Project (project-memory-mcp)

**Tech Stack:**
- TypeScript with strict mode (ES2022, Node16 modules)
- MCP SDK @modelcontextprotocol/sdk
- Vitest for testing
- ESLint + Prettier for code quality

**Key Constraint - Prompt Size:**
- Overall composed prompt ≤ 400 lines (base.md + specific prompt combined)
- Each specific prompt (parse-tasks.md, review.md, sync.md) ≤ 200 lines
- Enforced by validatePromptLength() in utils/prompt-loader.ts
- This prevents context bloat and ensures prompts stay focused

**Code Patterns:**
- Exports: Named exports (e.g., `export const REVIEW_PROMPT = ...`)
- Imports: Relative with .js extensions (ES modules, e.g., `from './prompts/review-prompt.js'`)
- Error handling: Try-catch with descriptive messages
- No file I/O in server logic (except reading prompts from .project-memory/prompts/)
- No git operations in server code

**Testing:**
- Test file: test/prompt-loader.test.ts
- Run: `npm test`
- Focus: Prompt length validation, composition, edge cases
- NO need to test file operations (Claude does those)

**Build & Deployment:**
- Build: `npm run build` (compiles TypeScript to dist/index.js)
- Watch: `npm run watch` (TypeScript watch mode)
- Dev: `npm run dev` (runs with tsx)
- Publish: `npm run prepublishOnly` (runs build before publish)
- Binary: Installed as `project-memory-mcp` command globally
