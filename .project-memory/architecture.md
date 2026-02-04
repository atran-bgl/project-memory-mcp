# Architecture

## System Overview

Project Memory MCP is a Model Context Protocol (MCP) server that acts as a **pure prompt provider** for AI-driven project memory management. It returns structured prompts that Claude executes - it never reads/writes project files directly.

## Architecture Principles

1. **Pure Prompt Provider**
   - Server ONLY returns prompt text
   - NO file I/O in server logic (except reading prompts from .project-memory/prompts/)
   - NO git operations in server code
   - NO JSON parsing or data processing

2. **Prompt Size Control**
   - Overall composed prompt ≤ 400 lines (base.md + specific prompt combined)
   - Each specific prompt (parse-tasks.md, review.md, sync.md) ≤ 200 lines
   - Enforced by validatePromptLength() function

3. **Claude Does The Work**
   - Claude receives prompts from MCP
   - Claude uses standard tools (Read, Write, Edit, Bash)
   - User sees all operations and approves changes
   - Prompts instruct Claude to use AskUserQuestion for approval

## Core Components

### MCP Server (src/index.ts)
- Implements MCP SDK Server interface
- Exposes 16 tools via ListToolsRequestSchema (9 main + 6 get-new-*-prompt + 1 schema tool)
- Routes tool calls in CallToolRequestSchema
- Handles errors gracefully
- Returns prompts only, never executes operations

### Prompts (src/prompts/)
- **init-prompt.ts** - Only hardcoded prompt (setup instructions)
- **parse-tasks-prompt.ts** - Task extraction from specs
- **review-prompt.ts** - Code review workflow
- **sync-prompt.ts** - Post-commit synchronization
- **create-spec-prompt.ts** - Specification creation
- **implement-feature-prompt.ts** - Feature implementation with validation
- **organize-prompt.ts** - Migrate existing CLAUDE.md
- **refresh-prompts-prompt.ts** - Update prompts with new templates

### Utilities (src/utils/)
- **prompt-loader.ts** - Loads and composes prompts, validates length
- Handles base.md + specific prompt composition
- Validates final prompt stays under 400-line limit

### Schemas (src/schemas/)
- **task-schema.ts** - JSON schema for tasks (exported as constant)
- Defines task structure, validation rules
- Used in prompts for task creation

### Tests (test/)
- **prompt-loader.test.ts** - Tests prompt composition and length validation
- Uses Vitest framework
- 5 tests covering core functionality

## Tool Definitions

### Main User-Facing Tools (9)
1. **init** - Initialize project memory system
2. **parse-tasks** - Extract tasks from specs
3. **review** - Review code changes
4. **sync** - Sync memory with commits
5. **organize** - Migrate CLAUDE.md to project-memory
6. **create-spec** - Create detailed specifications
7. **implement-feature** - Implement features from specs
8. **self-reflect** - Mid-implementation quality check (called during implement-feature)
9. **refresh-prompts** - Update prompt templates

### Helper Tools (7)
10. **get-new-sync-prompt** - Fetch sync.md template
11. **get-new-review-prompt** - Fetch review.md template
12. **get-new-parse-tasks-prompt** - Fetch parse-tasks.md template
13. **get-new-create-spec-prompt** - Fetch create-spec.md template
14. **get-new-implement-feature-prompt** - Fetch implement-feature.md template
15. **get-new-self-reflect-prompt** - Fetch self-reflect.md template
16. **get-task-schema** - Return task JSON schema structure

## Data Flow

```
User (Claude Desktop/Code CLI)
    ↓ MCP Protocol
Project Memory MCP Server
    ↓ Returns Prompt
Claude
    ↓ Reads/Writes/Edits
Project Files (.project-memory/)
```

## Key Constraints

1. **No File I/O in Server Logic**
   - Server only reads prompt templates from .project-memory/prompts/
   - Claude does all project file operations

2. **No Git Operations in Server**
   - Claude runs git commands when prompted
   - Server never touches git directly

3. **Prompt Size Limits (CRITICAL)**
   - Base prompt + specific prompt ≤ 400 lines
   - Single specific prompts ≤ 200 lines
   - Prevents context bloat

4. **User Approval Required**
   - All prompts instruct Claude to ask user before changes
   - All file operations require AskUserQuestion approval

5. **TypeScript Strict Mode**
   - All code passes TypeScript strict mode
   - No implicit any types
   - Full type safety required

## Technology Stack

- **Language:** TypeScript (ES2022, Node16 modules)
- **MCP SDK:** @modelcontextprotocol/sdk ^0.5.0
- **Testing:** Vitest ^1.0.0
- **Build:** tsc (TypeScript compiler)
- **Dev:** tsx (TypeScript executor)
- **Linting:** ESLint ^8.54.0
- **Formatting:** Prettier ^3.1.0
- **Node:** >=18.0.0

## Build & Deployment

- **Build:** `npm run build` → compiles to dist/index.js
- **Dev:** `npm run dev` → runs with tsx
- **Watch:** `npm run watch` → TypeScript watch mode
- **Binary:** Installed as `project-memory-mcp` command globally
- **Publish:** `npm publish` (runs build first via prepublishOnly)
