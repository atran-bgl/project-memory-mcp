import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Hardcoded init prompt - the ONLY hardcoded prompt in the system
 * All other prompts are project-specific and created during initialization
 */
export const INIT_PROMPT = `
# Project Memory Initialization

Initialize project-memory system: create structure, analyze project, generate prompts, populate memory files.

**CRITICAL:**
- All prompts ≤ 200 lines
- Get user approval before writing files
- Customize everything for this project's tech stack

---

## Step 1: Create Folder Structure

\`\`\`bash
mkdir -p .project-memory/tasks .project-memory/specs .project-memory/prompts
\`\`\`

Full structure will be:
- \`.project-memory/tasks/\` - Task JSON files
- \`.project-memory/specs/\` - Spec markdown files
- \`.project-memory/prompts/\` - Prompt templates
- \`.project-memory/architecture.md\` - Architecture doc
- \`.project-memory/conventions.md\` - Coding conventions
- \`.project-memory/useful-commands.md\` - Common commands
- \`.project-memory/commit-log.md\` - Recent commits

---

## Step 2: Analyze Project

Detect and record:
- **Language(s)**: package.json, requirements.txt, go.mod, Cargo.toml, etc. (note if multi-language)
- **Framework**: React, Next.js, Django, FastAPI, etc.
- **Conventions**: Code style, testing framework, file naming patterns
- **Commands**: npm scripts, make targets, build/test commands

---

## Step 3: Create Generic Prompt Templates

Create 4 files with generic content (customize in Step 4):

### .project-memory/prompts/base.md
Include sections:
- Core Responsibilities (Read/analyze files, git commands, task management)
- Project Memory Structure (list all file paths)
- Task Schema: ${TASK_JSON_SCHEMA}
- Important Rules (user approval, no spec modifications, 200-line limit, JSON format, timestamps)

### .project-memory/prompts/parse-tasks.md
Workflow steps:
1. Read spec from .project-memory/specs/ or user message
2. Extract tasks (ID, title, description, criteria, dependencies, priority, subtasks)
3. Check existing tasks to avoid duplicate IDs
4. Show parsed tasks to user via AskUserQuestion
5. Update tasks-active.json after approval with specReference field

### .project-memory/prompts/review.md
Workflow steps:
1. Ask user for review scope via AskUserQuestion:
   - "Review recent uncommitted changes" (git diff)
   - "Review entire codebase" (full code against architecture/standards)
   - "Review specific file/directory" (focused review of selected area)
2. Based on user choice:
   - Recent changes: Get git diff (unstaged and staged)
   - Full codebase: Read architecture, conventions, key files
   - Specific area: Ask for path, review that section
3. Read context (tasks, architecture, specs)
4. Analyze changes/code for quality, bugs, security, architecture alignment, task progress
5. Propose updates via AskUserQuestion (task status, architecture changes, issues)
6. Apply approved changes

### .project-memory/prompts/sync.md
Workflow steps:
1. Get commit history (last 20 commits)
2. Read current state (tasks, commit-log, architecture)
3. Determine task completions (match commits to task IDs, check criteria)
4. Propose updates via AskUserQuestion (move completed tasks, update commit-log, architecture, commands)
5. Apply approved changes

---

## Step 4: Customize Prompts for This Project

Update the 4 prompt files with project-specific details:
- **Language guidelines**: TypeScript (types, ESLint), Python (PEP 8, type hints), Go (gofmt, go vet), etc.
- **Framework patterns**: React hooks, Django apps, etc.
- **Testing approach**: Jest, pytest, testing patterns
- **Build commands**: Project-specific build/deploy commands
- **Review checklist**: Performance, security patterns from existing claude.md

Keep each file ≤ 200 lines. If multi-language project detected, create .project-memory/prompts/languages/ with language-specific extensions.

---

## Step 5: Create Project Memory Files

Create with content from Step 2 analysis:

### tasks-active.json & tasks-completed.json
\`{"tasks": []}\`

### architecture.md
Populate with:
- Language & Framework (detected)
- Project Structure (key directories)
- Key Components (entry points, config, tests)
- Dependencies (major libs from package.json/etc.)
- Notes (architectural patterns observed)

### conventions.md
Populate with:
- File Naming (kebab-case, PascalCase, etc.)
- Code Style (formatter: Prettier, Black, gofmt; linter: ESLint, Pylint)
- Testing (framework, file patterns)
- Imports/Modules (style patterns)
- Documentation (JSDoc, docstrings)

### useful-commands.md
Populate with:
- Development (dev server commands)
- Build (build commands)
- Test (test commands)
- Lint/Format (lint/format commands)
- Other (detected commands from package.json scripts or make targets)

### commit-log.md
\`# Commit Log (Last 20 Commits)\\n\\n(Will be populated during first sync)\`

---

## Step 6: Check for Existing CLAUDE.md Content

1. Check if CLAUDE.md or claude.md exists and is >50 lines
2. Analyze for sections: Architecture, Conventions, Commands, Tasks, Specs
3. If substantial content found, ask user via AskUserQuestion:
   - Show detected sections with line counts
   - Offer to organize now using \`project-memory organize\` tool
   - Options: "Yes, organize now (recommended)" or "No, I'll do it manually later"
4. If approved, invoke \`project-memory organize\` tool before Step 7
5. If declined or minimal content, proceed to Step 7

---

## Step 7: Update claude.md

Add this section to CLAUDE.md or claude.md:

\`\`\`markdown
## IMPORTANT: Project Memory System

This project uses \`.project-memory/\` for AI-managed task and context tracking.

**Always check these files at session start:**
- \`.project-memory/tasks/tasks-active.json\` - Current work and priorities
- \`.project-memory/architecture.md\` - System design and structure
- \`.project-memory/conventions.md\` - Coding standards
- \`.project-memory/prompts/base.md\` - Full workflow instructions

**Proactive prompts:** Ask user to parse tasks (new specs), review (before commits), and sync (after commits).
\`\`\`

---

## Final Steps

1. Show summary: folders, prompts, memory files, CLAUDE.md update (including organize if done)
2. Get user confirmation before writing files
3. Write all approved files
4. Confirm success and explain next steps (parse-tasks, review, sync usage)

Done! Project has customized project-memory system.
`.trim();
