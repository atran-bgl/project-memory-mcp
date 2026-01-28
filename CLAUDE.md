# Claude Assistant Configuration for project-memory-mcp

## Project Memory System - CRITICAL

This project uses `.project-memory/` for AI-managed task and context tracking.

**REQUIRED AT EVERY SESSION START - DO NOT SKIP:**

Before working on ANY task, you MUST read these files in order:

1. `.project-memory/tasks/tasks-active.json`
   - **Why:** Know what work is in progress and what's pending
   - **Read:** ALL active tasks before starting any work

2. `.project-memory/architecture.md`
   - **Why:** Understand system design and component interactions
   - **Read:** Before making architectural decisions

3. `.project-memory/conventions.md`
   - **Why:** Follow existing code patterns and standards
   - **Read:** Before writing any code

4. `.project-memory/useful-commands.md`
   - **Why:** Use correct commands for dev/build/test
   - **Read:** Before running any commands

5. `.project-memory/prompts/base.md`
   - **Why:** Full workflow instructions and rules
   - **Read:** For understanding project memory system

**Failure to read these files will result in:**
- Duplicate work (tasks already in progress)
- Incorrect implementations (violating architecture/conventions)
- Build/test failures (using wrong commands)

**Use proactively:**
- `project-memory parse-tasks` - Parse tasks from new specs
- `project-memory review` - Before commits
- `project-memory sync` - After commits
- `project-memory create-spec` - Create specifications from requirements

---

## Project Overview

This is an MCP (Model Context Protocol) server that acts as a **pure prompt provider** for AI-driven project memory management. It never touches files directly - only returns instructions for Claude to execute.

## Key Architecture Rules

1. **Pure Prompt Provider**
   - MCP server ONLY returns prompt text
   - NEVER reads/writes project files (except .project-memory/prompts/)
   - NEVER executes git commands
   - NEVER parses JSON or processes data

2. **Prompt Size Limit - CRITICAL**
   - Overall composed prompt MUST be ≤ 400 lines
   - Composed prompts = base.md (optional) + specific prompt (e.g., sync.md)
   - This prevents context bloat
   - Validate during init and warn if exceeded

3. **Project-Specific Prompts**
   - Only ONE hardcoded prompt: init
   - All other prompts (parse-tasks, review, sync) are created during init
   - Prompts are customized per project based on language/framework

## Development Workflow

### Before any task, check complexity:
- Simple: Direct implementation
- Complex: Break down into subtasks, iterate with testing

### For each implementation:
1. **Research**: Check spec.md, understand requirements
2. **Plan**: Break down if complex
3. **Implement**: Write focused code
4. **Test**: Run build and tests
5. **Verify**: Ensure TypeScript compiles, tests pass

### Definition of Done:
- ✅ `npm run build` succeeds
- ✅ All TypeScript type checks pass
- ✅ `npm test` passes
- ✅ No new warnings or errors

## Tech Stack

- **Language**: TypeScript (ES2022, Node16 modules)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Testing**: Vitest
- **Build**: tsc

## File Structure

```
src/
├── index.ts                    # Main MCP server
├── prompts/
│   └── init-prompt.ts          # ONLY hardcoded prompt
├── schemas/
│   └── task-schema.ts          # Task JSON schema
└── utils/
    └── prompt-loader.ts        # Prompt composition & validation
```

## Key Commands

```bash
npm run build      # Compile TypeScript
npm run watch      # Watch mode
npm test           # Run tests
npm run dev        # Dev mode with tsx
```

## Scope & Authority - CRITICAL

**Forbidden Actions (NEVER Without Explicit Permission):**

❌ NO large refactors
❌ NO dependency upgrades or additions
❌ NO config file changes (package.json, tsconfig.json, etc.)
❌ NO auto-formatting entire files
❌ NO removing existing features
❌ NO changing public APIs
❌ NO architectural changes
❌ NO introducing new patterns
❌ NO changing build scripts
❌ NO changing business logic (calculations, validations, business rules)
❌ NO changing UI/UX (copy, visual design, UX flows - frontend projects)

**Business Logic Protection:**
Never change existing calculations, validation rules, business constraints, or data transformations unless explicitly requested. When unsure: ASK FIRST.

**UI/UX Protection (Frontend Projects):**
Never change UI copy/text, visual design (colors, layouts, spacing), or user flows unless explicitly requested. Follow existing design system, use existing components, respect accessibility rules. When unsure: ASK FIRST.

**Minimal Change Philosophy:**
- Only modify files explicitly mentioned or clearly required
- NEVER refactor unless explicitly asked
- NEVER remove existing behavior without confirmation
- Prefer surgical changes over broad refactoring

**Before Making Changes, Ask:**
1. Is this file explicitly part of my task?
2. Is this change necessary to complete the task?
3. Am I removing or changing existing functionality?
4. Would this affect other features or systems?

**If ANY answer is uncertain → Use AskUserQuestion**

**Detailed Authority Rules:**
See `.project-memory/prompts/base.md` → "Scope & Authority Rules"

---

## Important Constraints

1. **NO file I/O** in main server logic (except reading prompts)
2. **NO git operations** in server code
3. **NO data processing** - just return prompts
4. **Prompts read context files** - No composition, each prompt instructs Claude to read base.md, conventions.md, etc.
5. **User approval required** - all prompts must instruct Claude to use AskUserQuestion
6. **Minimal changes only** - Never refactor unless asked, modify only task-related files

## Security Rules

- ✅ No hardcoded credentials
- ✅ No sensitive data in prompts
- ✅ No file path traversal vulnerabilities
- ✅ Validate prompt file paths

## Testing Requirements

- Test prompt length validation
- Test prompt composition
- Test edge cases (empty files, missing prompts)
- NO need to test actual file operations (Claude does those)

## Session Startup - CRITICAL

**At the start of EVERY session, immediately:**

1. Read and cache these project memory files in your session context:
   - `.project-memory/architecture.md` - Current system structure and components
   - `.project-memory/useful-commands.md` - Available commands and scripts
   - `.project-memory/conventions.md` - Established coding patterns
   - `.project-memory/commit-log.md` - Recent commits and changes
   - All `.project-memory/specs/*.md` - Feature specifications

2. Retain this knowledge throughout the entire session
3. Reference these files whenever working with project-memory-mcp tools

This ensures you understand the current system state before executing any tasks.

## Project Memory Tools - When to Use

**Available Tools** (via project-memory-mcp MCP server):
- `mcp__project-memory__init` - Initialize project memory system
- `mcp__project-memory__parse-tasks` - Extract tasks from specs
- `mcp__project-memory__review` - Review code changes
- `mcp__project-memory__sync` - Sync project memory with commits
- `mcp__project-memory__create-spec` - Create detailed specifications
- `mcp__project-memory__refresh-prompts` - Update prompt templates with latest improvements
- `mcp__project-memory__organize` - Migrate existing CLAUDE.md to project memory

**Trigger refresh-prompts when user asks:**
- "refresh prompts", "update prompts", "sync prompts"
- "merge new templates", "update prompt templates", "get latest prompts"
- Or any similar refresh-related requests

## Documentation Rule

**NO MASSIVE .MD FILES. EVER.**
- Keep documentation in code (docstrings, comments)
- README.md for overview
- spec.md for detailed specification
- CLAUDE.md for project instructions (this file)
- NO other markdown files unless absolutely necessary

---

When working on this project, always remember: **We build prompts, not file processors.**
