#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { INIT_PROMPT } from './prompts/init-prompt.js';
import { ORGANIZE_PROMPT } from './prompts/organize-prompt.js';
import { PARSE_TASKS_PROMPT } from './prompts/parse-tasks-prompt.js';
import { REVIEW_PROMPT } from './prompts/review-prompt.js';
import { SYNC_PROMPT } from './prompts/sync-prompt.js';
import { composePrompt, getProjectRoot } from './utils/prompt-loader.js';

/**
 * Project Memory MCP Server
 *
 * A pure prompt provider that returns instructions for Claude to execute.
 * Never reads/writes project files directly - only loads prompt templates.
 */

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

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'init',
        description:
          'Initialize project memory system. Creates folder structure, generates project-specific prompts, and sets up claude.md instructions. Only run once per project.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'parse-tasks',
        description:
          'Parse tasks from spec files or implementation plans. Extracts tasks with IDs, descriptions, acceptance criteria, dependencies, and adds them to tasks-active.json after user approval.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'review',
        description:
          'Review uncommitted code changes. Analyzes git diff, checks against current tasks and architecture, identifies issues, and proposes task/architecture updates for user approval.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sync',
        description:
          'Sync project memory with recent commits. Updates tasks (marks completed), prunes commit log to last 20 commits, updates architecture if needed, and extracts new commands.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'organize',
        description:
          'Organize existing CLAUDE.md into project-memory structure. Migrates architecture, conventions, commands, tasks, and specs from CLAUDE.md to .project-memory/ files while keeping minimal references. Requires user approval.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls - returns prompts only, never executes operations
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  const projectRoot = getProjectRoot();

  try {
    let prompt: string;

    switch (name) {
      case 'init':
        // Compose init prompt with fallback templates for Claude to use as starting points
        prompt = `${INIT_PROMPT}

---

## FALLBACK PROMPT TEMPLATES

Use these as starting templates - write them to .project-memory/prompts/, then customize in Step 4:

### Template for parse-tasks.md:
${PARSE_TASKS_PROMPT}

### Template for review.md:
${REVIEW_PROMPT}

### Template for sync.md:
${SYNC_PROMPT}
`;
        break;

      case 'parse-tasks':
        prompt = await composePrompt(projectRoot, 'parse-tasks.md', PARSE_TASKS_PROMPT);
        break;

      case 'review':
        prompt = await composePrompt(projectRoot, 'review.md', REVIEW_PROMPT);
        break;

      case 'sync':
        prompt = await composePrompt(projectRoot, 'sync.md', SYNC_PROMPT);
        break;

      case 'organize':
        // Organize/migrate existing CLAUDE.md into project-memory
        prompt = ORGANIZE_PROMPT;
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

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
