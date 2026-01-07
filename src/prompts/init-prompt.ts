import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Hardcoded init prompt - bootstrap tool for NEW projects
 * Runtime composed with fallback templates (parse-tasks, review, sync) so Claude can write them as starting files
 * All workflow prompts become project-specific after initialization
 */
export const INIT_PROMPT = `
# Project Memory Initialization
Initialize: create folder structure, analyze project, generate customized prompts, populate memory files.

**CRITICAL:**
- All prompts ≤ 400 lines composed (see CLAUDE.md)
- Get user approval before writing files
- After completing init, read and cache project memory files as instructed in CLAUDE.md "Session Startup"
---

## Step 0: Safety Check

Check: \`test -d .project-memory && echo "EXISTS" || echo "NOT_FOUND"\`

If EXISTS:
- Warn: "⚠️ .project-memory/ exists! Reinitializing will overwrite all files."
- Create Backup: \`cp -r .project-memory .project-memory.backup-$(date +%Y%m%d-%H%M%S)\`
- Ask via AskUserQuestion: "Backup created. Proceed with reinitialization?"
- If declined → STOP, suggest sync/organize tools instead
- If approved → Delete existing .project-memory, then continue to Step 1

---

## Step 1: Create Folders

\`.project-memory/\`: tasks/, specs/, prompts/ (base.md, parse-tasks.md, review.md, sync.md), architecture.md, conventions.md, useful-commands.md, commit-log.md

---

## Step 2: Analyze Codebase & Validate Docs

**CRITICAL: Use actual code implementation as source of truth, NOT documentation.**

**REQUIRED ACTIONS:**
1. Read: package.json OR requirements.txt OR go.mod OR Cargo.toml
2. Scan: src/, lib/, components/, tests/ scripts/ app/ directories
3. Find: .eslintrc, .prettierrc, tsconfig.json, or similar config files
4. Check for existing tasks: .github/tasks/, tasks/, .tasks/, task.json, work-items.json
5. Read: CLAUDE.md, README.md, docs/, specs/ if they exist

**OUTPUT REQUIRED - Show user:**
- Tech stack detected: [list]
- Project structure: [list]
- Conventions found: [list]
- Commands found: [list]
- Scripts/tools found: [list]
- Existing task patterns: [list or "none"]
- Docs vs code discrepancies: [list or "none"]

**If discrepancies between documentation and code implemenation found:**
Ask via AskUserQuestion: "Found X discrepancies. Use current code as source of truth?"

**CHECKPOINT: Get user approval before proceeding to Step 4**

---

## Step 4: Create Prompt Templates

**Use the fallback templates provided at the end of this prompt** as starting content.

Write these 4 files to \`.project-memory/prompts/\`:

1. **base.md** - Create with generic content including:
   - Core Responsibilities (file reading, git, task management)
   - Project Memory file structure (list paths)
   - Task Schema: ${TASK_JSON_SCHEMA}
   - Rules (approval, 200-line limit, JSON format, timestamps)
   - Documentation Rules: **CRITICAL: Do NOT create massive .md files.** Prefer code documentation (docstrings, comments) for implementation details. Use markdown files ONLY for essential architecture, setup, and usage guides. Keep each .md file ≤100 lines.
   - Task Completion Criteria: **CRITICAL: Always mark task as COMPLETED only when:** (1) Implementation is verified to work (code exists and functions as intended), (2) Tests pass (unit tests, integration tests, or manual verification completed), (3) No blocking issues remain
   - Security Rules: **NEVER** commit .env, hardcode credentials, log secrets, write API keys in tests. **ALWAYS** use environment variables, keep .env in .gitignore, define ports in .env (never hardcode), check port conflicts before deployment

2. **parse-tasks.md** - Use the "Template for parse-tasks.md" provided below

3. **review.md** - Use the "Template for review.md" provided below

4. **sync.md** - Use the "Template for sync.md" provided below

**Note:** The templates are complete, working prompts. Write them as-is to the files (you'll customize them in Step 5).

---

## Step 5: Customize Prompts

**Use code-based analysis from Step 2, NOT documentation.**

Add project-specific details to each file:
- Language guidelines (TypeScript types/ESLint, Python PEP 8, Go gofmt, etc.) - from actual code
- Framework patterns (React hooks, Django apps, etc.) - from actual imports
- Testing approach and patterns - from actual test files
- Build/deploy/CI commands - from actual config files
- Security/performance review checklists
- For parse-tasks prompt: incorporate any existing task file naming/structure patterns detected in Step 2

**MANDATORY QUESTION - Ask user via AskUserQuestion:**
"For code review customization, are there specific files/directories that need special attention? (e.g., API contracts, microservice boundaries, security modules, infrastructure code)"

[Wait for response, then incorporate answer into review.md]

**Examples for customization:**
- Review prompt: "Pay special attention to API contracts and inter-service communication patterns."
- Parse-tasks prompt: "Project uses domain-based task structure: tasks-active_{domain}.json (auth, api, ui, database, infra)."
- Sync prompt: "Pay special attention to changes in deployment scripts or infrastructure-as-code files."

Keep each ≤ 200 lines. For multi-language projects, create .project-memory/prompts/languages/ with language-specific extensions.

---

## Step 6: Create Project Memory Files

**IMPORTANT: Base ALL content on ACTUAL code analysis from Step 2, NOT documentation.**

**Task File Structure** (choose based on Step 2 scope):
- **Existing pattern found**: Use same naming/structure
- **Small/Medium** (<100 tasks): Single-file (tasks-active.json, tasks-completed.json = {"tasks": []})
- **Large** (>100 tasks or multi-module): Multi-file with tasks-active_{domain}.json, tasks-completed_{domain}.json, tasks-index.json (domain registry + task counts)
- **Domain examples**: auth, api, ui, database, infra - infer from project structure

**architecture.md**: Language & framework (from code), project structure (from actual dirs), key components (from code), dependencies (from package files), architectural patterns (from code organization)

**conventions.md**: File naming patterns (from actual files), code style/formatter/linter (from actual code + configs), testing framework (from test files), import/module patterns (from code), documentation style (if present)

**useful-commands.md**: Dev commands, build commands, test commands, lint/format commands - extracted from package.json, Makefile, scripts/, CI configs (NOT from README)

**commit-log.md**: \`# Commit Log (Last 20 Commits)\\n\\n(Will be populated during first sync)\`

Checkpoint: Ensure these files are current code implementation-based, NOT documentation-based.
---

## Step 7: Check for Existing CLAUDE.md

**STOP: Do not proceed to Step 8 until you complete this check.**

1. Check if CLAUDE.md exists: \`test -f CLAUDE.md && wc -l CLAUDE.md\`
2. If exists AND >50 lines:
   - Analyze for: Architecture/Conventions/Commands/Tasks/Specs sections
   - **REQUIRED:** Ask via AskUserQuestion: "Found CLAUDE.md with [X] lines. Organize into project-memory now?"
   - If yes → run \`project-memory organize\` tool, then continue to Step 8
   - If no → proceed to Step 8
3. If doesn't exist OR ≤50 lines → proceed to Step 8

---

## Step 8: Update or Create CLAUDE.md

If CLAUDE.md doesn't exist, create it with this content at the top section
If CLAUDE.md exists, add this reference section to the top of CLAUDE.md:

\`\`\`markdown
## Project Memory System - CRITICAL

This project uses \`.project-memory/\` for AI-managed task and context tracking.

**REQUIRED AT EVERY SESSION START - DO NOT SKIP:**

Before working on ANY task, you MUST read these files in order:

1. \`.project-memory/tasks/tasks-active.json\` (or \`tasks-active_{domain}.json\` if multi-file)
   - **Why:** Know what work is in progress and what's pending
   - **Read:** ALL active tasks before starting any work

2. \`.project-memory/architecture.md\`
   - **Why:** Understand system design and component interactions
   - **Read:** Before making architectural decisions

3. \`.project-memory/conventions.md\`
   - **Why:** Follow existing code patterns and standards
   - **Read:** Before writing any code

4. \`.project-memory/useful-commands.md\`
   - **Why:** Use correct commands for dev/build/test/deploy
   - **Read:** Before running any commands

5. \`.project-memory/prompts/base.md\`
   - **Why:** Full workflow instructions and rules
   - **Read:** For task management, review, and sync guidelines

**Failure to read these files will result in:**
- Duplicate work (tasks already in progress)
- Incorrect implementations (violating architecture/conventions)
- Build/test failures (using wrong commands)

**Use proactively:**
- \`project-memory parse-tasks\` - Parse tasks from new specs
- \`project-memory review\` - Before commits
- \`project-memory sync\` - After commits
- \`project-memory create-spec\` - Create specifications from requirements
\`\`\`

---

## Final Steps

1. Show summary: folders created, prompts generated, memory files initialized, CLAUDE.md changes
2. Get user final approval
3. Write all approved files
4. Confirm success and explain next steps (organise, parse-tasks, review, sync workflows)

Done!
`.trim();
