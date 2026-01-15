import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Fallback prompt for sync tool
 * Used when project-specific sync.md doesn't exist
 */
export const SYNC_PROMPT = `# Post-Commit Sync

You are helping sync project memory with recent commits.

**Note:** You should have already cached the project memory files (architecture.md, useful-commands.md, conventions.md, etc.) at session start. Reference this cached knowledge throughout this sync.

## Task Schema

${TASK_JSON_SCHEMA}

## STEP 0: User Confirmation - MANDATORY

**Before doing ANYTHING else, ask the user via AskUserQuestion:**

Question: "Sync mode - how thorough should task/spec verification be?"
Options:
1. "Quick sync - only check recent commits (5 min)"
2. "Full verification - scan entire codebase for ALL tasks/specs (15-30 min)" (Recommended)
3. "Skip verification - only update commit log"

**Based on user choice:**
- Option 1 (Quick): Check only files changed in recent commits against active tasks
- Option 2 (Full): Verify EVERY active task and spec against entire codebase
- Option 3 (Skip): Only update commit-log.md, skip task/spec checks

**CRITICAL: Do not proceed until user answers this question.**

---

## Detect Task Structure

Check if tasks-index.json exists:
- **Single-file**: Use tasks-active.json and tasks-completed.json
- **Multi-file**: Use {task sequence}-{tasks status active / pending }_{domain}.json files

## Spec Organization Convention

Specs MUST follow naming format: **[status].[domain]-[feature].md**

Status values (in filename):
- \`active\` - In progress or planned for current cycle
- \`completed\` - Feature fully implemented and tested
- \`deprecated\` - No longer used, superseded or removed
- \`blocked\` - Implementation blocked by impediment

Examples:
- \`active.auth-login.md\` - Login feature being worked on
- \`completed.api-caching.md\` - Caching feature done
- \`deprecated.old-search.md\` - Old search replaced
- \`blocked.payment-integration.md\` - Waiting for payment provider

Frontmatter metadata (required in each spec):
\`\`\`
---
status: [active | completed | deprecated | blocked]
domain: [feature-domain]
implementation-status: [NOT-STARTED | IN-PROGRESS | IMPLEMENTED]
impediment: [if blocked, describe blocker]
---
\`\`\`

## Instructions

### Step 1: Get Commit History

Run: \`git log --oneline -20\`

Check for new commits since last sync.

### Step 2: Read Current State

Read ALL of these files:
- Tasks: Single-file (tasks-active.json, tasks-completed.json) OR multi-file (all tasks-*.json files)
- tasks-index.json (if multi-file structure)
- .project-memory/commit-log.md
- .project-memory/architecture.md
- CLAUDE.md
- All spec files in .project-memory/specs/*.md

**Count and list:**
- Active/pending tasks: [X] tasks
- Spec files: [Y] specs

### Step 3: Execute Verification (Based on Step 0 Choice)

**If user chose "Skip verification" → skip to Step 6**

**If user chose "Quick sync":**
- Get changed files: \`git diff --name-only HEAD~5..HEAD\`
- For each active task, check if any changed files relate to that task
- For each spec, check if any changed files relate to that spec
- Only verify tasks/specs that have related file changes

**If user chose "Full verification" (RECOMMENDED):**

Execute this FOR EVERY active/pending task - NO EXCEPTIONS:

**For Each Task:**
1. Read task ID, description, acceptance criteria
2. **MANDATORY: Use Explore agent** (thoroughness: "very thorough"):
   - Search entire codebase for implementation
   - Look for: files, functions, components, tests mentioned in task
   - Verify: Does code exist? Does it match acceptance criteria?
3. **RUN verification commands:**
   - \`npm test\` (or project test command) - do tests pass?
   - \`npm run build\` (or project build command) - does it compile?
4. **Determine status:** completed / in-progress / blocked / outdated
5. **Document findings:** Must output status for EVERY task

**For Each Spec:**
1. Read spec file completely
2. **MANDATORY: Use Explore agent** (thoroughness: "very thorough"):
   - Search entire codebase for spec implementation
   - Look for: modules, components, APIs described in spec
   - Verify: Does implementation exist? Does it match spec requirements?
3. **RUN verification commands:**
   - Test coverage for spec features
   - Build success
4. **Determine spec status:** NOT-STARTED / IN-PROGRESS / IMPLEMENTED / OUTDATED / BLOCKED
5. **Document findings:** Must output status for EVERY spec

### Step 4: Output Verification Results

**MANDATORY OUTPUT - Cannot skip this:**

For EVERY task checked, output:
\`\`\`
📋 Task: [TASK-ID] - [Title]
Status: [completed / in-progress / blocked / outdated]
Implementation Found: [Yes/No - list key files]
Tests: [passing / failing / not found]
Build: [succeeds / fails]
Recommendation: [mark complete / keep in-progress / mark blocked]
\`\`\`

For EVERY spec checked, output:
\`\`\`
📄 Spec: [filename]
Implementation Status: [NOT-STARTED / IN-PROGRESS / IMPLEMENTED / OUTDATED / BLOCKED]
Code Found: [Yes/No - list key modules]
Tests: [passing / failing / not found]
Build: [succeeds / fails]
Recommendation: [update frontmatter / deprecate / keep as-is]
\`\`\`

**If you do not output status for ALL tasks/specs, the sync is INCOMPLETE.**

### Step 5: Validate Documentation Consistency

**Check CLAUDE.md:**
- Verify: file paths, function names, architectural references, commands
- Check for: renamed files, deleted modules, changed APIs, deprecated patterns
- **OUTPUT:** List all inconsistencies found or "✅ CLAUDE.md is current"

**Check architecture.md:**
- Compare documented structure vs actual file organization
- Detect: new files/dirs, removed modules, renamed components
- **OUTPUT:** List all structural changes or "✅ architecture.md is current"

### Step 6: Propose Updates

Use AskUserQuestion to propose updates based on findings:

**Must include:**
1. **Task status changes** (from Step 4 verification):
   - Tasks to mark as completed
   - Tasks to keep in-progress
   - Tasks to mark as blocked/outdated
   - Move completed tasks to tasks-completed.json

2. **Spec updates** (from Step 4 verification):
   - Spec frontmatter updates (status, implementation-status)
   - Spec file renames to match [status].[domain]-[feature].md convention
   - Specs to deprecate or mark blocked

3. **Documentation updates:**
   - CLAUDE.md corrections (if inconsistencies found)
   - architecture.md updates (if structural changes found)
   - conventions.md updates (if new patterns established)
   - useful-commands.md updates (if new commands added)

4. **Project memory maintenance:**
   - Update commit-log.md (keep last 20 commits)
   - Update tasks-index.json if multi-file structure

**Show summary:**
- [X] tasks will be marked complete
- [Y] specs will be updated
- [Z] documentation files need updates

### Step 7: Apply Changes

After user approval, apply all changes using Write/Edit tools.

---

## CRITICAL RULES

**Task Completion Criteria:**
Mark task as COMPLETED only when ALL are true:
- Code implementation exists and matches task acceptance criteria
- Tests pass: \`npm test\` succeeds
- Build succeeds: \`npm run build\` succeeds
- No blocking issues remain

**Spec Verification:**
- Specs MUST follow naming: [status].[domain]-[feature].md
- Specs MUST have frontmatter (status, implementation-status, impediment)
- If spec status changes → rename file to match new status
- Always output spec implementation status for ALL reviewed specs

**Documentation Must Stay Current:**
- CLAUDE.md must reflect actual code (file paths, commands, patterns)
- architecture.md must match actual codebase structure
- Always output whether docs are current or need updates

**Code Issues:**
- DO NOT fix code issues during sync
- Report security/bugs/violations to user immediately
- Request separate review for code fixes

**User Approval:**
- Get user approval before writing any files
- Show clear summary of all proposed changes

**Verification is Mandatory:**
- If you skip verification for any task/spec without user choosing "Skip", the sync is INCOMPLETE
- Must use Explore agent for full codebase verification when requested
- Must output status for EVERY task/spec checked
`.trim();
