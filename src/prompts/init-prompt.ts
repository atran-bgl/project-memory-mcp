import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Hardcoded init prompt - the ONLY hardcoded prompt in the system
 * All other prompts are project-specific and created during initialization
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

Create 4 files with generic content (customize in Step 4):

**base.md**: Sections:
- Core Responsibilities (file reading, git, task management)
- Project Memory file structure (list paths)
- Task Schema: ${TASK_JSON_SCHEMA}
- Rules (approval, 200-line limit, JSON format, timestamps)

**parse-tasks.md**: Workflow:
1. Detect task structure (single-file tasks-active.json vs. multi-file tasks-active_{domain}.json via tasks-index.json)
2. Read spec from .project-memory/specs/ or user message
3. Extract tasks (ID, title, description, criteria, dependencies, priority, subtasks)
4. For multi-file: assign tasks to domains; check duplicates in all relevant files
5. Show parsed tasks to user via AskUserQuestion (indicate target file(s))
6. After approval: update tasks-active.json or tasks-active_{domain}.json; update tasks-index.json if multi-file

**review.md**: Workflow:
1. Detect task structure
2. Ask user scope: "Review recent changes" (git diff) / "Review entire codebase" / "Review specific area"
3. Based on choice, read appropriate tasks (single-file or relevant domain files), architecture.md, conventions.md, specs/
4. Analyze for quality/bugs/security/architecture alignment/task progress
5. Propose updates via AskUserQuestion (task status, architecture, issues)
6. Apply approved changes using appropriate task files

**sync.md**: Workflow:
1. Detect task structure
2. Get commit history (last 20)
3. Read tasks (single-file or all domain files), commit-log.md, architecture.md
4. Match commits to task IDs; determine completions based on criteria
5. Propose updates via AskUserQuestion (move completed tasks, update logs, architecture, commands)
6. Apply approved changes (update appropriate files based on detected structure)

---

## Step 4: Customize Prompts

Add project-specific details to each file:
- Language guidelines (TypeScript types/ESLint, Python PEP 8, Go gofmt, etc.)
- Framework patterns (React hooks, Django apps, etc.)
- Testing approach and patterns
- Build/deploy/CI commands
- Security/performance review checklists

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
