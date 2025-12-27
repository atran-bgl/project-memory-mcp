import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Organize/migrate existing CLAUDE.md into project-memory structure
 * This is a one-time migration tool for existing projects
 */
export const ORGANIZE_PROMPT = `
# Organize CLAUDE.md into Project Memory
You are helping migrate an existing project's CLAUDE.md into the project-memory system.
## Goal
Extract architecture, conventions, commands, tasks, and specs from CLAUDE.md / project files and organize them into \`.project-memory/\` while keeping minimal references in CLAUDE.md.
---
## Step 1: Initialize Project Memory (if not exists)
Check if \`.project-memory/\` folder exists:

\`\`\`bash
ls -la .project-memory 2>/dev/null || echo "Not initialized"
\`\`\`

If not initialized, run the \`project-memory init\` tool first, then return to this organize workflow.
---
## Step 2: Read and Analyze CLAUDE.md
Use \`Read\` tool to read the current CLAUDE.md (or claude.md, check both):
**Identify these sections:**
1. **Architecture/Design** - System design, project structure, technical decisions
2. **Conventions/Standards** - Coding standards, style guides, patterns
3. **Commands** - Common commands, scripts, build/test/deploy instructions
4. **Tasks/TODOs** - Active tasks, task lists, work items
5. **Specs/Plans** - Implementation plans, feature specs, requirements

**Mark line numbers** for each section to extract.

---
## Step 3: Create Migration Plan
Present a clear migration plan to user using \`AskUserQuestion\`:

\`\`\`
Found the following sections in CLAUDE.md and ANY FILES referenced within the project:

📐 Architecture (lines 45-120, 75 lines)
   → Will move to: .project-memory/architecture.md

📋 Coding Standards (lines 121-180, 60 lines)
   → Will move to: .project-memory/conventions.md

⚡ Common Commands (lines 181-210, 30 lines)
   → Will move to: .project-memory/useful-commands.md

✅ Active Tasks (lines 15-44, task list format)
   → Will convert to: .project-memory/tasks/tasks-active.json

📄 Feature Spec: Authentication (lines 220-280)
   → Will move to: .project-memory/specs/authentication.md

IMPORTANT: 
BEFORE Migration, MUST CHECK if these files are still relevvant and up-to-date. ONLY migrate content that is still accurate.
If project-memory files already exist, check for differences and MERGE intelligently. ONLY overwrite if user approves.

After migration, CLAUDE.md will have minimal references pointing to these files.

Proceed with migration?
\`\`\`

**IMPORTANT:** Get explicit user approval before proceeding.
**CRITICAL:** ALWAYS preserve existing content that is NOT accounted for in project-memory. Do NOT delete anything.

---

## Step 4: Migrate Content

After approval, migrate each section:

### 4.1: Migrate Architecture

If architecture section found:

1. Read the architecture content from CLAUDE.md
2. Check if \`.project-memory/architecture.md\` exists
3. If exists, use \`Edit\` to append/merge; if not, use \`Write\` to create
4. Format properly with markdown headers

### 4.2: Migrate Conventions

If conventions section found:

1. Read the conventions content from CLAUDE.md
2. Check if \`.project-memory/conventions.md\` exists
3. If exists, merge with existing; if not, create new
4. Organize into logical sections (File Naming, Code Style, Testing, etc.)

### 4.3: Migrate Commands

If commands section found:

1. Read the commands content from CLAUDE.md
2. Check if \`.project-memory/useful-commands.md\` exists
3. If exists, merge; if not, create
4. Organize by category (Development, Build, Test, Deploy, etc.)

### 4.4: Migrate Tasks

If tasks/todos found:

1. Read the task content from CLAUDE.md
2. Parse into structured task format:

${TASK_JSON_SCHEMA}

3. Read existing \`.project-memory/tasks/tasks-active.json\`
4. Merge new tasks with existing (avoid duplicate IDs)
5. Update tasks-active.json with \`Write\` or \`Edit\`

**Task Parsing Rules:**
- Generate unique IDs (TASK-001, TASK-002, etc.)
- Set status to "pending" unless marked done
- Extract acceptance criteria if present
- Identify dependencies between tasks

### 4.5: Migrate Specs

If spec/plan sections found:

1. For each spec section, create a separate .md file in \`.project-memory/specs/\`
2. Use descriptive filenames: \`feature-auth.md\`, \`api-redesign.md\`, etc.
3. Preserve full spec content
4. Mark as immutable (add note at top: "This is an immutable spec")
---
## Step 5: Update CLAUDE.md with References

After migrating content, update CLAUDE.md to replace verbose sections with minimal references:

Use \`Edit\` tool to replace each migrated section with a reference:

**Architecture section** → Replace with:
\`\`\`markdown
## Architecture
See \`.project-memory/architecture.md\` for system design and project structure.
\`\`\`

**Conventions section** → Replace with:
\`\`\`markdown
## Coding Conventions
See \`.project-memory/conventions.md\` for coding standards and patterns.
\`\`\`

**Commands section** → Replace with:
\`\`\`markdown
## Common Commands
See \`.project-memory/useful-commands.md\` for build, test, and deployment commands.
\`\`\`

**Tasks section** → Replace with:
\`\`\`markdown
## Current Tasks
See \`.project-memory/tasks/tasks-active.json\` for active work items and priorities.
\`\`\`

**Specs section** → Replace with:
\`\`\`markdown
## Specifications
See \`.project-memory/specs/\` for detailed feature specifications and implementation plans.
\`\`\`

**CRITICAL:** Keep the "IMPORTANT: Project Memory System" section that was added during init!

---

## Step 6: Verify and Summarize
1. **Verify all files created:**
   - List \`.project-memory/\` contents using \`Bash\`
   - Confirm all migrations successful
2. **Show summary** to user:
   \`\`\`
   ✅ Migration complete!

   Migrated content:
   - Architecture (75 lines) → .project-memory/architecture.md
   - Conventions (60 lines) → .project-memory/conventions.md
   - Commands (30 lines) → .project-memory/useful-commands.md
   - Tasks (5 items) → .project-memory/tasks/tasks-active.json
   - Specs (1 file) → .project-memory/specs/authentication.md
   CLAUDE.md reduced from 350 lines to 120 lines.
   Next steps:
   - Review migrated files in .project-memory/
   - Use 'project-memory parse-tasks' for any new specs
   - Use 'project-memory review' before commits
   - Use 'project-memory sync' after commits
   \`\`\`
---
## Important Notes

1. **Always get user approval** before making any changes
2. **Preserve all content** - don't delete anything, only move/reorganize
3. **Keep references in CLAUDE.md** - never leave it disconnected from project-memory
4. **Merge intelligently** - if project-memory files already exist, merge rather than overwrite
5. **Maintain markdown formatting** - ensure all files are properly formatted
6. **Generate valid JSON** for tasks file
You're done! The project is now organized with project-memory structure.
`.trim();
