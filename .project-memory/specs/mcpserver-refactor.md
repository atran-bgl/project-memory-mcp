# McpServer Refactor Specification

**Status:** Draft | **Created:** 2026-02-04 | **Priority:** High

> Refactor from deprecated `Server` to `McpServer` API in MCP SDK

## Overview

Replace deprecated `Server` class with `McpServer` high-level API in `src/index.ts`. The MCP SDK has deprecated the low-level `Server` class in favor of `McpServer`, which provides a cleaner API for tool registration.

**User Story:** As a maintainer, I need to use the recommended MCP SDK API to avoid future breaking changes and deprecation warnings.

**Scope:**
- ✅ Refactor src/index.ts to use McpServer
- ✅ Update imports and tool registration pattern
- ❌ NO changes to tool logic or prompts
- ❌ NO changes to tests (existing tests don't test Server)
- ❌ NO new features or improvements

## Requirements

### Functional Requirements

1. Replace `Server` import with `McpServer` import
2. Convert tool registration from `setRequestHandler(ListToolsRequestSchema)` to individual `registerTool()` calls
3. Convert tool execution from `setRequestHandler(CallToolRequestSchema)` to callbacks in `registerTool()`
4. Maintain identical functionality - all 16 tools work exactly as before
5. Fix version number discrepancy (use 0.2.0 from package.json)

### Non-Functional Requirements

1. **Zero breaking changes** - MCP clients see no difference
2. **Code compiles** - `npm run build` succeeds
3. **Tests pass** - `npm test` succeeds (existing tests unaffected)
4. **Minimal changes** - Only modify src/index.ts
5. **Match code style** - Follow existing conventions exactly

## Technical Design

### 1. Import Changes (Lines 3-8)

**Before:**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
```

**After:**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// Remove CallToolRequestSchema and ListToolsRequestSchema - not needed with McpServer
```

### 2. Server Initialization (Lines 28-38)

**Before:**
```typescript
const server = new Server(
  {
    name: 'project-memory-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

**After:**
```typescript
const server = new McpServer(
  {
    name: 'project-memory-mcp',
    version: '0.2.0', // Fixed to match package.json
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

### 3. Tool Registration Pattern

**Before (Lines 43-184):** Manual ListToolsRequestSchema handler
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'init',
        description: 'Initialize project memory system...',
        inputSchema: { type: 'object', properties: {} }
      },
      // ... 15 more tools
    ],
  };
});
```

**After:** Individual registerTool calls
```typescript
// Tool 1: init
server.registerTool('init', {
  description: 'Initialize project memory system. Creates folder structure, generates project-specific prompts, and sets up claude.md instructions. Only run once per project.',
  inputSchema: {}
}, async () => {
  try {
    const prompt = INIT_PROMPT;
    validatePromptLength(prompt, 'init');
    return {
      content: [{ type: 'text', text: prompt }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
});

// Tool 2: parse-tasks (uses async readPromptFile)
server.registerTool('parse-tasks', {
  description: 'Parse tasks from spec files or implementation plans. Extracts tasks with IDs, descriptions, acceptance criteria, dependencies, and adds them to tasks-active.json after user approval.',
  inputSchema: {}
}, async () => {
  try {
    const projectRoot = getProjectRoot();
    const parseTasksPrompt = await readPromptFile(projectRoot, 'parse-tasks.md');
    const prompt = parseTasksPrompt || PARSE_TASKS_PROMPT;
    validatePromptLength(prompt, 'parse-tasks');
    return {
      content: [{ type: 'text', text: prompt }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
});

// Tool 3-9: Similar pattern with async readPromptFile
server.registerTool('review', {
  description: 'Review uncommitted code changes. Analyzes git diff, checks against current tasks and architecture, identifies issues, and proposes task/architecture updates for user approval.',
  inputSchema: {}
}, async () => {
  try {
    const projectRoot = getProjectRoot();
    const reviewPrompt = await readPromptFile(projectRoot, 'review.md');
    const prompt = reviewPrompt || REVIEW_PROMPT;
    validatePromptLength(prompt, 'review');
    return {
      content: [{ type: 'text', text: prompt }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
});

// Repeat for: sync, create-spec, implement-feature (same pattern)

// Tool 5: organize (no readPromptFile, uses constant)
server.registerTool('organize', {
  description: 'Organize existing CLAUDE.md into project-memory structure. Migrates architecture, conventions, commands, tasks, and specs from CLAUDE.md to .project-memory/ files while keeping minimal references. Requires user approval.',
  inputSchema: {}
}, async () => {
  try {
    const prompt = ORGANIZE_PROMPT;
    validatePromptLength(prompt, 'organize');
    return {
      content: [{ type: 'text', text: prompt }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
});

// Repeat for: refresh-prompts, self-reflect (same pattern)

// Tool 10-15: get-new-*-prompt tools (return template directly, no error wrapper)
server.registerTool('get-new-sync-prompt', {
  description: 'Get the new sync.md template. Called during refresh-prompts to fetch the latest sync prompt template for comparison.',
  inputSchema: {}
}, async () => {
  validatePromptLength(SYNC_PROMPT, 'sync.md template');
  return {
    content: [{ type: 'text', text: SYNC_PROMPT }]
  };
});

// Repeat for: get-new-review-prompt, get-new-parse-tasks-prompt,
// get-new-create-spec-prompt, get-new-implement-feature-prompt,
// get-new-self-reflect-prompt (same pattern)

// Tool 16: get-task-schema (returns schema, no validation)
server.registerTool('get-task-schema', {
  description: 'Get the task JSON schema. Returns the structure for tasks in tasks-active.json and tasks-completed.json. Used during init to create schemas/task-schema.json or when Claude needs to understand task structure.',
  inputSchema: {}
}, async () => {
  return {
    content: [{ type: 'text', text: TASK_JSON_SCHEMA }]
  };
});
```

### 4. Tool Execution - Switch Statement Removal

**Before (Lines 189-364):** Single CallToolRequestSchema handler with switch
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  const projectRoot = getProjectRoot();

  try {
    let prompt: string;

    switch (name) {
      case 'init':
        prompt = INIT_PROMPT;
        validatePromptLength(prompt, 'init');
        break;

      case 'parse-tasks':
        const parseTasksPrompt = await readPromptFile(projectRoot, 'parse-tasks.md');
        prompt = parseTasksPrompt || PARSE_TASKS_PROMPT;
        validatePromptLength(prompt, 'parse-tasks');
        break;

      // ... 14 more cases

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: prompt }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
});
```

**After:** Logic moved into each registerTool callback (shown above in section 3)

**Remove:** Entire CallToolRequestSchema handler (lines 189-364)

### 5. Transport Connection (Lines 369-373)

**No changes needed:**
```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Project Memory MCP server running on stdio');
}
```

### All 16 Tools to Register

**Main tools (9):** init, parse-tasks, review, sync, organize, create-spec, implement-feature, refresh-prompts, self-reflect

**Helper tools (7):** get-new-sync-prompt, get-new-review-prompt, get-new-parse-tasks-prompt, get-new-create-spec-prompt, get-new-implement-feature-prompt, get-new-self-reflect-prompt, get-task-schema

### Complete File Structure After Refactor

```typescript
#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { INIT_PROMPT } from './prompts/init-prompt.js';
import { ORGANIZE_PROMPT } from './prompts/organize-prompt.js';
import { PARSE_TASKS_PROMPT } from './prompts/parse-tasks-prompt.js';
import { REVIEW_PROMPT } from './prompts/review-prompt.js';
import { SYNC_PROMPT } from './prompts/sync-prompt.js';
import { CREATE_SPEC_PROMPT } from './prompts/create-spec-prompt.js';
import { REFRESH_PROMPTS_PROMPT } from './prompts/refresh-prompts-prompt.js';
import { IMPLEMENT_FEATURE_PROMPT } from './prompts/implement-feature-prompt.js';
import { SELF_REFLECT_PROMPT } from './prompts/self-reflect-prompt.js';
import { TASK_JSON_SCHEMA } from './schemas/task-schema.js';
import { getProjectRoot, readPromptFile, validatePromptLength } from './utils/prompt-loader.js';

/**
 * Project Memory MCP Server
 *
 * A pure prompt provider that returns instructions for Claude to execute.
 * Never reads/writes project files directly - only loads prompt templates.
 */

const server = new McpServer(
  {
    name: 'project-memory-mcp',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register all 16 tools
server.registerTool('init', { ... }, async () => { ... });
server.registerTool('parse-tasks', { ... }, async () => { ... });
server.registerTool('review', { ... }, async () => { ... });
server.registerTool('sync', { ... }, async () => { ... });
server.registerTool('organize', { ... }, async () => { ... });
server.registerTool('create-spec', { ... }, async () => { ... });
server.registerTool('implement-feature', { ... }, async () => { ... });
server.registerTool('refresh-prompts', { ... }, async () => { ... });
server.registerTool('get-new-sync-prompt', { ... }, async () => { ... });
server.registerTool('get-new-review-prompt', { ... }, async () => { ... });
server.registerTool('get-new-parse-tasks-prompt', { ... }, async () => { ... });
server.registerTool('get-new-create-spec-prompt', { ... }, async () => { ... });
server.registerTool('get-new-implement-feature-prompt', { ... }, async () => { ... });
server.registerTool('get-new-self-reflect-prompt', { ... }, async () => { ... });
server.registerTool('get-task-schema', { ... }, async () => { ... });
server.registerTool('self-reflect', { ... }, async () => { ... });

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Project Memory MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

**Lines reduced:** From 379 lines to ~350 lines (cleaner structure, no switch statement)

## Security & Edge Cases

**Security:** No changes (same error handling, no stack traces, same validation, no new dependencies)

**Edge Cases:**
- Tool not found: McpServer handles automatically
- Empty inputSchema: Use `{}`
- Async readPromptFile: Maintain await in callbacks
- Errors: Maintain try-catch in each tool

## Testing

**Automated:** Existing test/prompt-loader.test.ts still passes (tests utilities, not Server class)

**Manual:** Run `npm run build`, `npm test`, then test MCP tools (init, sync) return prompts correctly

**No new tests needed** (refactor maintains identical behavior, integration tests out of scope)

## Implementation Plan

1. Update imports: Replace `Server` with `McpServer`, remove unused schemas
2. Update initialization: `new McpServer()`, fix version to 0.2.0
3. Convert registration: Remove ListToolsRequestSchema handler, add 16 registerTool() calls
4. Move execution logic: Extract switch cases into callbacks with error handling
5. Verify: `npm run build`, `npm test`, `npm run lint` all pass

## Maintainability

Follows conventions (named exports, JSDoc, existing style). Benefits: recommended API, cleaner code, future-proof.

## Acceptance Criteria

- [ ] src/index.ts imports `McpServer` from `@modelcontextprotocol/sdk/server/mcp.js`
- [ ] src/index.ts uses `new McpServer()` instead of `new Server()`
- [ ] Version updated to 0.2.0 in server initialization
- [ ] All 16 tools registered using `server.registerTool()`
- [ ] Each tool has description and callback with error handling
- [ ] `npm run build` succeeds with no errors
- [ ] `npm test` passes all 5 tests
- [ ] `npm run lint` passes with no errors
- [ ] No changes to any other files (prompts, utils, schemas, tests)
- [ ] Manual test: init tool returns INIT_PROMPT
- [ ] Manual test: sync tool returns SYNC_PROMPT or project-specific prompt
