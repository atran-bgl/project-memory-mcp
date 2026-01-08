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

1. Get commit history using Bash: \`git log --oneline -20\`. Check for new commits since last sync.

2. **Read active/pending tasks:**
   - Check if tasks-index.json exists to detect structure
   - Count active and pending tasks
   - List them briefly (just titles, not details yet)

3. **Ask user about task review:**
   Use AskUserQuestion:
   - "You have [X] active/pending tasks. Review their progress against codebase?"
   - Options: "Yes, review all" / "No, skip task review" / "Review specific tasks only"
   - If "specific tasks only" → get list of task IDs/names to check
   - If "No" → skip to step 5

3b. **Ask user about spec review:**
   Use AskUserQuestion:
   - Count spec files in .project-memory/specs/
   - "Found [Y] specs. Review their implementation status against codebase?"
   - Options: "Yes, review all" / "No, skip spec review" / "Review specific specs only"
   - If "specific specs only" → get list of spec filenames to check
   - If "No" → skip spec validation in step 6

4. **IF user approved task review:**
   For each active/pending task:
   - Read task description and acceptance criteria
   - **MUST READ actual source files** related to task
   - Verify: code exists, matches description, tests pass, compiles
   - Identify: completed, in-progress, blocked, or outdated

5. Read current state:
   - Tasks: Single-file (tasks-active.json, tasks-completed.json) or multi-file (all tasks-active/completed_{domain}.json)
   - tasks-index.json (if multi-file)
   - .project-memory/commit-log.md
   - .project-memory/architecture.md
   - CLAUDE.md (project instructions)
   - All spec files in .project-memory/specs/*.md

6. Validate consistency between documentation in project-memory, Claude.md and codebase:

   **Check CLAUDE.md - CRITICAL:**
   - **NEVER leave outdated references in CLAUDE.md**
   - CLAUDE.md MUST always reflect current code implementation
   - Verify: file paths, function names, architectural references, commands
   - Check for: renamed files, deleted modules, changed APIs, deprecated patterns
   - **OUTPUT REQUIRED - Show all inconsistencies found:**
     \`\`\`
     ⚠️ CLAUDE.md Inconsistencies:
     - Line X: References [old path] but file is now at [new path]
     - Line Y: Describes [old pattern] but code now uses [new pattern]
     - Line Z: Command [old cmd] no longer works, should be [new cmd]
     \`\`\`
   - If ANY inconsistencies found → **MUST update CLAUDE.md** (ask user approval first)

   **Check architecture.md - CRITICAL:**
   - **NEVER leave stale architecture.md**
   - architecture.md MUST always reflect current codebase structure
   - Compare documented structure against actual file organization, modules, and components
   - Detect: new files/directories, removed modules, renamed components, structural changes
   - **MANDATORY OUTPUT - List all structural changes found:**
     \`\`\`
     ⚠️ architecture.md is STALE - Current changes not reflected:
     - New module: [path] added but not documented
     - Removed: [old path] no longer exists but still documented
     - Renamed: [old name] → [new name] not updated in docs
     - Restructured: [component] moved from [old location] to [new location]
     \`\`\`
   - If ANY changes detected → **MUST propose updating architecture.md** (ask user approval first)
   - If architecture.md has no changes needed, explicitly confirm: "✅ architecture.md is current"

   **Check Task System - CRITICAL:**
   **MUST verify each task against actual code implementation (not just commits/summaries)**
   - For each active/pending task (if user approved review):
     * Read task acceptance criteria
     * **READ the actual source files** mentioned in task or related to feature
     * Check: Does code exist? Does it match the acceptance criteria?
     * **RUN tests** if available: \`npm test\`, \`pytest\`, etc.
     * **CHECK compilation**: \`npm run build\` or equivalent
     * Determine status: completed / in-progress / blocked / outdated
   - Identify tasks that contradict current code
   - Mark inconsistencies with severity and required action
   - **IF code issues found (bugs, security, architecture violations):**
     * **DO NOT fix the code**
     * Note the issue clearly (file, line, type, severity)
     * Continue with sync validation
     * Report issues to user and request project memory review before code fixes
   - If ANY task progress changes found → propose status updates

   **Check Spec System - CRITICAL:**
   **MUST verify each spec against actual code implementation (if user approved in step 3b)**

   For each spec file (if user approved review):
   1. **READ the entire spec** - Understand requirements, acceptance criteria, scope
   2. **SEARCH codebase** for implementation of spec requirements:
      - Look for related files, modules, functions mentioned in spec
      - **READ actual implementation code** - verify it exists and matches spec
      - Check: Is spec partially implemented? Fully implemented? Not started?
   3. **RUN tests** if implementation exists: \`npm test\`, \`pytest\`, etc.
      - Tests should pass if spec is implemented
      - Failing tests = spec not fully implemented or broken implementation
   4. **CHECK compilation** - \`npm run build\` succeeds
   5. **Determine spec status:**
      - ✅ IMPLEMENTED: Code exists, matches spec, tests pass
      - 🔄 IN-PROGRESS: Partial implementation, some tests failing
      - ❌ NOT-STARTED: No code exists for spec requirements
      - ⚠️ OUTDATED: Spec contradicts current code
      - 🚫 BLOCKED: Impediment prevents implementation
   6. **Mark inconsistencies with severity:**
      - CRITICAL: Spec requirements missing from implementation
      - HIGH: Spec partially implemented, gaps exist
      - MEDIUM: Spec out of sync with code, needs update
      - LOW: Minor spec wording needs clarification

   **OUTPUT REQUIRED - For each spec reviewed:**
   \`\`\`
   📋 Spec: [filename]

   Implementation Status: [NOT-STARTED / IN-PROGRESS / IMPLEMENTED / OUTDATED / BLOCKED]

   Implementation Found:
   - File: [path to implementation or "none"]
   - Test Coverage: [passing / failing / not tested]
   - Compilation: [succeeds / fails / N/A]

   Inconsistencies:
   - [Severity]: [issue description]

   Required Action:
   - Update spec frontmatter + rename file to follow convention, OR
   - Complete implementation to match spec requirements, OR
   - Mark as DEPRECATED (set status: deprecated in frontmatter, rename to deprecated.[domain]-[feature].md), OR
   - Mark as BLOCKED with impediment reason (set status: blocked, add impediment in frontmatter)
   \`\`\`

   **Spec file management:**
   - Update frontmatter metadata (status, implementation-status, impediment)
   - Rename files to match [status].[domain]-[feature].md convention if status changed
   - If ANY spec status changes found → propose updates via AskUserQuestion

7. Determine task completions based on commits + code verification
   **CRITICAL: Mark task as COMPLETED only when ALL are true:**
   - Code implementation exists and matches task acceptance criteria (verified by reading source)
   - Tests pass: \`npm test\` / \`pytest\` / test runner succeeds without errors
   - Codebase compiles/builds successfully: \`npm run build\` / equivalent succeeds
   - No failing tests or compilation errors related to this task
   - No blocking issues remain

8. Propose updates via AskUserQuestion:
   - **Documentation updates:**
     * CLAUDE.md corrections (if outdated references found)
   - **Spec updates (if user reviewed specs and changes found):**
     * Update spec frontmatter (status, implementation-status, impediment)
     * Rename specs to match [status].[domain]-[feature].md convention
     * Move/organize specs by status (active, completed, deprecated, blocked)
     * Update/deprecate specs if code contradicts requirements
   - **Task updates:**
     * Update task statuses (completed / pending / outdated)
     * Move completed tasks to appropriate completed file(s)
     * Update tasks-index.json if multi-file (adjust task counts). 
     * In multi-file task system, rename file with the following convention {seq}.{status}.{domain}.json depending on status
   - **Project memory updates:**
     * Update commit-log.md (keep last 20 commits)
     * Update architecture.md if structure changed (keep concise, ≤200 lines)
     * Add new commands, new scripts, new cronjob to useful-commands.md (keep ≤200 lines)
     * Update conventions.md if new patterns established (keep ≤200 lines)

9. After approval, apply changes using Write/Edit tools (respecting task file structure)

**CRITICAL RULES:**

**CLAUDE.md must NEVER be outdated:**
- Sync MUST fix all outdated references in CLAUDE.md
- If code changed → CLAUDE.md MUST be updated to match
- Outdated documentation is worse than no documentation
- Every sync should verify CLAUDE.md accuracy

**architecture.md must NEVER be stale:**
- Sync MUST detect all structural changes in codebase
- If structure changed → architecture.md MUST be updated to match
- Stale architecture is a blocker - prevents understanding current system
- Every sync should verify architecture.md matches actual codebase
- Always output whether architecture is current or stale

**Specs must NEVER be out of sync with implementation:**
- Sync MUST verify each spec against actual code (if user approves)
- If spec requirements not implemented → flag as NOT-STARTED or IN-PROGRESS
- If code contradicts spec → spec is OUTDATED, must be updated or marked deprecated
- Specs MUST follow naming convention: [status].[domain]-[feature].md
- Specs MUST have frontmatter with status, implementation-status, impediment (if blocked)
- If spec status changes → rename file to reflect new status
- Specs are contracts - stale specs lead to broken implementations
- Every sync should verify specs match current implementation status
- Always output spec implementation status for all reviewed specs

**Code issues discovered during sync:**
- **DO NOT attempt to fix code issues**
- **DO bring issues to user attention immediately** (security, bugs, architecture violations)
- **Request project memory review** using the review tool with user approval
- Sync focuses on documentation/metadata - code fixes require dedicated review and approval
- Create issue report via AskUserQuestion if critical issues found

**Documentation conciseness:**
- Keep all .md files concise (≤100 lines)
- Implementation details belong in code docstrings/comments, NOT markdown
- Only update markdown for essential architecture/setup changes

Remember: Get user approval before writing any files.
`.trim();
