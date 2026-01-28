/**
 * Hardcoded init prompt - bootstrap tool for NEW projects
 * Runtime composed with fallback templates (parse-tasks, review, sync) so Claude can write them as starting files
 * All workflow prompts become project-specific after initialization
 */
export const INIT_PROMPT = `
# Project Memory Initialization
Initialize: create folder structure, analyze project, generate customized prompts, populate memory files.

**CRITICAL:**
- All prompts generated must be less than 400 lines.
- Get user approval before writing files
- After completing init, read and cache project memory files as instructed in CLAUDE.md "Session Startup"
---

## Step 0: Safety Check

Check: \`test -d .project-memory && echo "EXISTS" || echo "NOT_FOUND"\`

If EXISTS - Ask via AskUserQuestion:
"⚠️ .project-memory/ exists! Reinitializing overwrites customizations. Options:
1. Use refresh-prompts instead (Recommended) - Preserves customizations
2. Force reinitialize - Backup and overwrite everything"

If Option 1 → STOP, tell user: "Please run 'refresh project memory prompts' instead"
If Option 2 → Backup: \`cp -r .project-memory .project-memory.backup-$(date +%Y%m%d-%H%M%S)\`, delete .project-memory, continue

---

## Step 1: Create Folders & Schema

Create: \`.project-memory/\` with subdirectories: tasks/, specs/, prompts/, schemas/

**Files to create:**
- prompts/: base.md, parse-tasks.md, review.md, sync.md, create-spec.md, implement-feature.md
- architecture.md, conventions.md, useful-commands.md, commit-log.md
- schemas/task-schema.json

**To get the task schema:**
1. Call the MCP tool: \`mcp__project-memory__get-task-schema\`
2. Write the returned schema to \`.project-memory/schemas/task-schema.json\`

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

**If discrepancies between documentation and code implementation found:**
Ask via AskUserQuestion: "Found X discrepancies. Use current code as source of truth?"

**CHECKPOINT: Get user approval before proceeding to Step 4**

---

## Step 4: Create Prompt Templates

**Fetch template files using the MCP tools, then write them to \`.project-memory/prompts/\`.**

Write these 7 files:

1. **base.md** - Create with GENERIC content (will be customized in Step 5 based on project type):
   - Core Responsibilities (file reading, git, task management)
   - Forbidden Actions section (include ALL: large refactors, dependencies, config, business logic, UI/UX - will be filtered in Step 5)
   - Business Logic Protection (include - will be filtered in Step 5 if not applicable)
   - UI/UX Protection (include - will be filtered in Step 5 if not applicable)
   - File Modification Authority
   - Change Scope Rules
   - Code Style Enforcement
   - Approval Requirements
   - Project Memory file structure (list paths including schemas/task-schema.json)
   - Task Schema: "Use Read tool to read \`.project-memory/schemas/task-schema.json\` when creating/validating tasks. Do NOT call get-task-schema (init-only)."
   - Rules (approval, 200-line limit, JSON format, timestamps)
   - Documentation Rules: **CRITICAL: Do NOT create massive .md files.** Prefer code documentation (docstrings, comments) for implementation details. Use markdown files ONLY for essential architecture, setup, and usage guides. Keep each .md file ≤100 lines.
   - Task Completion Criteria: **CRITICAL: Always mark task as COMPLETED only when:** (1) Implementation is verified to work (code exists and functions as intended), (2) Tests pass (unit tests, integration tests, or manual verification completed), (3) No blocking issues remain
   - Security Rules: **NEVER** commit .env, hardcode credentials, log secrets, write API keys in tests. **ALWAYS** use environment variables, keep .env in .gitignore, define ports in .env (never hardcode), check port conflicts before deployment
   - Implementation Rules: **Break down complex features into multiple tasks.** If a feature requires >5 subtasks or >500 lines of code, split into multiple specs/tasks. Implement incrementally, test after each task. Never implement large features in one massive commit.

   **NOTE:** This is a generic template. Step 5 will customize it based on detected project type.

2. **parse-tasks.md** - Call the MCP tool \`mcp__project-memory__get-new-parse-tasks-prompt\` to fetch the template

3. **review.md** - Call the MCP tool \`mcp__project-memory__get-new-review-prompt\` to fetch the template

4. **sync.md** - Call the MCP tool \`mcp__project-memory__get-new-sync-prompt\` to fetch the template

5. **create-spec.md** - Call the MCP tool \`mcp__project-memory__get-new-create-spec-prompt\` to fetch the template

6. **implement-feature.md** - Call the MCP tool \`mcp__project-memory__get-new-implement-feature-prompt\` to fetch the template

7. **self-reflect.md** - Call the MCP tool \`mcp__project-memory__get-new-self-reflect-prompt\` to fetch the template

**Note:** The templates fetched from the MCP tools are complete, working prompts. Write them as-is to the files (you'll customize them in Step 5).

---

## Step 5: Detect Project Type & Customize ALL Files

**Use code-based analysis from Step 2, NOT documentation.**

### Step 5.1: Determine Project Type (MANDATORY)

Based on Step 2 analysis, classify project as ONE of:

1. **Frontend-only**: React, Vue, Angular, Next.js client-side, mobile app (React Native, Flutter)
   - Has: UI components, styling, client-side state management
   - No: API routes, database, server logic

2. **Backend-only**: API server, microservice, CLI tool, library, backend worker
   - Has: API routes, database, business logic, server code
   - No: UI components, styling, client-side rendering

3. **Full-stack**: Next.js with API routes, monorepo with frontend + backend
   - Has: BOTH frontend AND backend components

4. **CLI/Library**: Command-line tool, npm package, Python library
   - Has: CLI commands, library exports
   - No: UI or API endpoints

**OUTPUT REQUIRED:**
\`\`\`
📋 Project Type Detected: [Frontend-only / Backend-only / Full-stack / CLI/Library]

Reasoning:
- [explain why based on Step 2 analysis]

Customizations to apply:
- [list which sections will be removed/kept]
\`\`\`

### Step 5.2: Customize Files Based on Project Type

**base.md & conventions.md - Forbidden Actions:**
- Frontend → KEEP UI/UX Protection, REMOVE backend items
- Backend → REMOVE UI/UX Protection entirely
- Full-stack → KEEP both
- CLI/Library → REMOVE both

**review.md - Critical Issues:**
- Frontend → REMOVE "Common Backend Issues"
- Backend → REMOVE "Common Frontend Issues"
- Full-stack/CLI → Adjust accordingly

**implement-feature.md - Step 7.3a checks:**
- Frontend → KEEP UI/UX, REMOVE business logic
- Backend → REMOVE UI/UX, KEEP business logic
- Full-stack/CLI → Adjust accordingly

**parse-tasks.md** - Add task naming patterns if found in Step 2
**sync.md** - Add deployment/infra patterns to monitor

### Step 5.3: Verify Customization

Show user: "✅ Project Type: [type]. Customized base.md, conventions.md, review.md, implement-feature.md accordingly."
**CHECKPOINT:** User confirms before proceeding.

### Step 5.4: Add Tech Stack Details

**For each prompt, add from Step 2 analysis:**
- Testing approach: [Jest/Pytest/etc. from test files]
- Build/CI commands: [from package.json, Makefile, .github/workflows/]
- Language guidelines: [TypeScript/Python/Go rules from actual code/config]
- Framework patterns: [React hooks/Django apps/etc. from actual imports]

**MANDATORY QUESTION - Ask user via AskUserQuestion:**
"For code review customization, are there specific files/directories that need special attention? (e.g., API contracts, microservice boundaries, security modules, infrastructure code)"

[Wait for response, then incorporate answer into review.md]

**Examples for customization:**
- Review prompt: "Pay special attention to API contracts and inter-service communication patterns."
- Parse-tasks prompt: "Project uses domain-based task structure: tasks-active_{domain}.json (auth, api, ui, database, infra)."
- Sync prompt: "Pay special attention to changes in deployment scripts or infrastructure-as-code files."
- Create-spec prompt: "All specs must include performance benchmarks and database migration plans."
- Implement-feature prompt: "Always check for reusable utilities in lib/shared/ before implementing new helpers."

Keep each ≤ 400 lines (base.md not composed with create-spec/implement-feature). For multi-language projects, create .project-memory/prompts/languages/ with language-specific extensions.

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

Add to top of CLAUDE.md (create if doesn't exist):

\`\`\`markdown
## Project Memory System - CRITICAL

Uses \`.project-memory/\` for AI-managed task/context tracking.

**REQUIRED AT SESSION START - Read in order:**
1. \`.project-memory/tasks/tasks-active.json\` - Active/pending tasks
2. \`.project-memory/architecture.md\` - System design
3. \`.project-memory/conventions.md\` - Code patterns
4. \`.project-memory/useful-commands.md\` - Dev/build/test commands
5. \`.project-memory/prompts/base.md\` - Workflow rules

**Tools:** \`project-memory parse-tasks\`, \`review\`, \`sync\`, \`create-spec\`

---

## Forbidden Actions

**Git:** ONLY \`git log\` and \`git diff\` allowed. All other git commands forbidden. Ask before any git operation.

**Documentation:** NO massive .md files. Specs ≤400 lines. Prefer code comments over markdown.

**Dependencies:** NO upgrade/downgrade/add without approval. Ask first.

**Implementation:** NO code cleanup/refactor outside requirements. Minimal changes only. Ask if unsure.
\`\`\`

---

## Final Steps

1. Show summary: folders created, prompts generated, memory files initialized, CLAUDE.md changes
2. Get user final approval
3. Write all approved files
4. Confirm success and explain next steps (organise, parse-tasks, review, sync workflows)

Done!
`.trim()
