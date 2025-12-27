import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Hardcoded init prompt - bootstrap tool for NEW projects
 * Runtime composed with fallback templates (parse-tasks, review, sync) so Claude can write them as starting files
 * All workflow prompts become project-specific after initialization
 */
export const INIT_PROMPT = `
# Project Memory Initialization

Initialize: create folder structure, analyze project, generate customized prompts, populate memory files.

**CRITICAL: All generated prompts ≤ 200 lines. Get user approval before writing files.**

---

## Step 1: Create Folder Structure

Create directories:
- \`.project-memory/tasks/\` - Task JSON files
- \`.project-memory/specs/\` - Spec markdown files
- \`.project-memory/prompts/\` - Prompt templates: base.md, parse-tasks.md, review.md, sync.md
- \`.project-memory/\` root: architecture.md, conventions.md, useful-commands.md, commit-log.md

---

## Step 2: Analyze Project

Detect and record:
- **Tech**: Language(s), framework, code style, testing/build/lint patterns
- **Scope**: Task volume estimate (small <20, medium 20-100, large >100)
- **Complexity**: Multi-module? External APIs? Deployment stages?
- **Existing task patterns**: Look for .github/tasks/, tasks/, work-items.json, .tasks/ - record naming/structure for reuse

---

## Step 3: Create Prompt Templates

**Use the fallback templates provided at the end of this prompt** as starting content.

Write these 4 files to \`.project-memory/prompts/\`:

1. **base.md** - Create with generic content including:
   - Core Responsibilities (file reading, git, task management)
   - Project Memory file structure (list paths)
   - Task Schema: ${TASK_JSON_SCHEMA}
   - Rules (approval, 200-line limit, JSON format, timestamps)
   - Task Completion Criteria: **CRITICAL: Always mark task as COMPLETED only when:** (1) Implementation is verified to work (code exists and functions as intended), (2) Tests pass (unit tests, integration tests, or manual verification completed), (3) No blocking issues remain
   - Security Rules: **NEVER** commit .env, hardcode credentials, log secrets, write API keys in tests. **ALWAYS** use environment variables, keep .env in .gitignore, define ports in .env (never hardcode), check port conflicts before deployment

2. **parse-tasks.md** - Use the "Template for parse-tasks.md" provided below

3. **review.md** - Use the "Template for review.md" provided below

4. **sync.md** - Use the "Template for sync.md" provided below

**Note:** The templates are complete, working prompts. Write them as-is to the files (you'll customize them in Step 4).

---

## Step 4: Customize Prompts
Add project-specific details to each file:
- Language guidelines (TypeScript types/ESLint, Python PEP 8, Go gofmt, etc.)
- Framework patterns (React hooks, Django apps, etc.)
- Testing approach and patterns
- Build/deploy/CI commands
- Security/performance review checklists
- For code review prompt: ask user if any specific files/directories that need special attention or adding further context to the review scope. 
- For parse-tasks prompt: incorporate any existing task file naming/structure patterns detected in Step 2

**example for additions to review prompt:** 
The current nodule is a microservice that is part of larger system. Pay special attention to API contracts and inter-service communication patterns.

**example for additions to parse-tasks prompt:**
The project uses a domain-based task structure with files named tasks-active_{domain}.json. Domains include auth, api, ui, database, infra.

**example for additions to sync prompt:**
During sync, pay special attention to any changes in deployment scripts or infrastructure-as-code files.

Keep each ≤ 200 lines. For multi-language projects, create .project-memory/prompts/languages/ with language-specific extensions.

---

## Step 5: Create Project Memory Files

**Task File Structure** (choose based on Step 2 scope):
- **Existing pattern found**: Use same naming/structure
- **Small/Medium** (<100 tasks): Single-file (tasks-active.json, tasks-completed.json = {"tasks": []})
- **Large** (>100 tasks or multi-module): Multi-file with tasks-active_{domain}.json, tasks-completed_{domain}.json, tasks-index.json (domain registry + task counts)
- **Domain examples**: auth, api, ui, database, infra - infer from project structure

**architecture.md**: Language & framework, project structure, key components, dependencies, architectural patterns

**conventions.md**: File naming patterns, code style/formatter/linter, testing framework, import/module patterns, documentation style

**useful-commands.md**: Dev commands, build commands, test commands, lint/format commands, detected commands from package.json or make targets

**commit-log.md**: \`# Commit Log (Last 20 Commits)\\n\\n(Will be populated during first sync)\`

---

## Step 6: Check for Existing CLAUDE.md

If CLAUDE.md exists and >50 lines:
1. Analyze for Architecture/Conventions/Commands/Tasks/Specs sections
2. Ask via AskUserQuestion: "Organize into project-memory now?"
3. If yes: run \`project-memory organize\` tool, then continue to Step 7
4. If no: proceed directly to Step 7

---

## Step 7: Update CLAUDE.md

Add this reference section:

\`\`\`markdown
## Project Memory System

This project uses \`.project-memory/\` for AI-managed task and context tracking.

**Check at session start:**
- .project-memory/tasks/tasks-active.json (or tasks-active_{domain}.json if multi-file) - Current work
- .project-memory/architecture.md - System design
- .project-memory/conventions.md - Coding standards
- .project-memory/prompts/base.md - Full instructions

**Use proactively:** Ask to parse tasks (new specs), review (before commits), sync (after commits)
\`\`\`

---

## Final Steps

1. Show summary: folders created, prompts generated, memory files initialized, CLAUDE.md changes
2. Get user final approval
3. Write all approved files
4. Confirm success and explain next steps (parse-tasks, review, sync workflows)

Done!
`.trim();
