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
      {
        name: 'create-spec',
        description:
          'Create detailed specifications from user requirements. Clarifies ambiguity, validates against codebase, considers security/edge cases/tests, and writes spec to .project-memory/specs/. Use when user describes a feature to build or asks to write a spec.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'implement-feature',
        description:
          'Implement features, fix bugs, or code from specifications. Audits codebase for reusable code, validates against acceptance criteria, confirms modifications with user, and guides step-by-step implementation. Use when user wants to implement, code, build, or fix something.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'refresh-prompts',
        description:
          'Refresh project-specific prompts with latest template improvements while preserving customizations. Backs up existing prompts, compares with new templates, and merges updates. Use when user asks to refresh or update prompts.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-new-sync-prompt',
        description: 'Get the new sync.md template. Called during refresh-prompts to fetch the latest sync prompt template for comparison.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-new-review-prompt',
        description: 'Get the new review.md template. Called during refresh-prompts to fetch the latest review prompt template for comparison.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-new-parse-tasks-prompt',
        description: 'Get the new parse-tasks.md template. Called during refresh-prompts to fetch the latest parse-tasks prompt template for comparison.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-new-create-spec-prompt',
        description: 'Get the new create-spec.md template. Called during init or refresh-prompts to fetch the latest create-spec prompt template.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-new-implement-feature-prompt',
        description: 'Get the new implement-feature.md template. Called during init or refresh-prompts to fetch the latest implement-feature prompt template.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-new-self-reflect-prompt',
        description: 'Get the new self-reflect.md template. Called during init or refresh-prompts to fetch the latest self-reflect prompt template.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-task-schema',
        description: 'Get the task JSON schema. Returns the structure for tasks in tasks-active.json and tasks-completed.json. Used during init to create schemas/task-schema.json or when Claude needs to understand task structure.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'self-reflect',
        description: 'Mid-implementation self-reflection check. Lightweight quality check to catch issues early before they compound. Called during implement-feature Stage 2 when 4+ tasks or high complexity. Checks: mental checklist (spec, DRY, patterns), critical bugs, security issues, forbidden actions.',
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
        // Init prompt instructs Claude to fetch templates via get-new-* tools
        prompt = INIT_PROMPT;
        validatePromptLength(prompt, 'init');
        break;

      case 'parse-tasks':
        // Parse tasks from specs, uses project-specific prompt if available
        const parseTasksPrompt = await readPromptFile(projectRoot, 'parse-tasks.md');
        prompt = parseTasksPrompt || PARSE_TASKS_PROMPT;
        validatePromptLength(prompt, 'parse-tasks');
        break;

      case 'review':
        // Review code changes, uses project-specific prompt if available
        const reviewPrompt = await readPromptFile(projectRoot, 'review.md');
        prompt = reviewPrompt || REVIEW_PROMPT;
        validatePromptLength(prompt, 'review');
        break;

      case 'sync':
        // Sync project memory with commits, uses project-specific prompt if available
        const syncPrompt = await readPromptFile(projectRoot, 'sync.md');
        prompt = syncPrompt || SYNC_PROMPT;
        validatePromptLength(prompt, 'sync');
        break;

      case 'organize':
        // Organize/migrate existing CLAUDE.md into project-memory
        prompt = ORGANIZE_PROMPT;
        validatePromptLength(prompt, 'organize');
        break;

      case 'create-spec':
        // Create spec from user requirements, uses project-specific prompt if available
        const createSpecPrompt = await readPromptFile(projectRoot, 'create-spec.md');
        prompt = createSpecPrompt || CREATE_SPEC_PROMPT;
        validatePromptLength(prompt, 'create-spec');
        break;

      case 'implement-feature':
        // Implement feature from spec and tasks, uses project-specific prompt if available
        const implementFeaturePrompt = await readPromptFile(projectRoot, 'implement-feature.md');
        prompt = implementFeaturePrompt || IMPLEMENT_FEATURE_PROMPT;
        validatePromptLength(prompt, 'implement-feature');
        break;

      case 'refresh-prompts':
        // Refresh prompts with new templates while preserving customizations
        prompt = REFRESH_PROMPTS_PROMPT;
        validatePromptLength(prompt, 'refresh-prompts');
        break;

      case 'get-new-sync-prompt':
        // Return the new sync.md template for comparison during refresh
        validatePromptLength(SYNC_PROMPT, 'sync.md template');
        return {
          content: [
            {
              type: 'text',
              text: SYNC_PROMPT,
            },
          ],
        };

      case 'get-new-review-prompt':
        // Return the new review.md template for comparison during refresh
        validatePromptLength(REVIEW_PROMPT, 'review.md template');
        return {
          content: [
            {
              type: 'text',
              text: REVIEW_PROMPT,
            },
          ],
        };

      case 'get-new-parse-tasks-prompt':
        // Return the new parse-tasks.md template for comparison during refresh
        validatePromptLength(PARSE_TASKS_PROMPT, 'parse-tasks.md template');
        return {
          content: [
            {
              type: 'text',
              text: PARSE_TASKS_PROMPT,
            },
          ],
        };

      case 'get-new-create-spec-prompt':
        // Return the new create-spec.md template for init or refresh
        validatePromptLength(CREATE_SPEC_PROMPT, 'create-spec.md template');
        return {
          content: [
            {
              type: 'text',
              text: CREATE_SPEC_PROMPT,
            },
          ],
        };

      case 'get-new-implement-feature-prompt':
        // Return the new implement-feature.md template for init or refresh
        validatePromptLength(IMPLEMENT_FEATURE_PROMPT, 'implement-feature.md template');
        return {
          content: [
            {
              type: 'text',
              text: IMPLEMENT_FEATURE_PROMPT,
            },
          ],
        };

      case 'get-new-self-reflect-prompt':
        // Return the new self-reflect.md template for init or refresh
        validatePromptLength(SELF_REFLECT_PROMPT, 'self-reflect.md template');
        return {
          content: [
            {
              type: 'text',
              text: SELF_REFLECT_PROMPT,
            },
          ],
        };

      case 'get-task-schema':
        // Return the task JSON schema for Claude to write to schemas/task-schema.json
        return {
          content: [
            {
              type: 'text',
              text: TASK_JSON_SCHEMA,
            },
          ],
        };

      case 'self-reflect':
        // Return the self-reflect prompt for mid-implementation checks
        prompt = SELF_REFLECT_PROMPT;
        validatePromptLength(prompt, 'self-reflect');
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
