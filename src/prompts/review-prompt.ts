import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Fallback prompt for review tool
 * Used when project-specific review.md doesn't exist
 */
export const REVIEW_PROMPT = `# Code Review

You are helping review code changes.

## Review Scope

Before proceeding, ask the user what they want to review:

**Use AskUserQuestion with these options:**
- "Review recent uncommitted changes" - Reviews git diff (staged and unstaged)
- "Review entire codebase" - Comprehensive review of all code against architecture and standards
- "Review specific file or directory" - Focused review of user-selected area

Get user's choice before proceeding.

---

## Task Schema

${TASK_JSON_SCHEMA}

## Detect Task Structure

Check if tasks-index.json exists:
- **Single-file**: Use tasks-active.json and tasks-completed.json
- **Multi-file**: Use tasks-active_{domain}.json and tasks-completed_{domain}.json

## Instructions (based on chosen scope)

### For Recent Changes:
1. Get git diff using Bash: \`git diff\` and \`git diff --cached\`
2. Read current context:
   - Tasks: Single-file (tasks-active.json) or multi-file (all tasks-active_{domain}.json)
   - .project-memory/architecture.md
   - .project-memory/specs/*.md (if relevant)
3. Analyze changes for:
   - Code quality issues
   - Potential bugs or security issues
   - **Security violations**: hardcoded credentials/secrets, .env committed, API keys in code/tests, hardcoded ports
   - Alignment with architecture
   - Task progress

### For Entire Codebase:
1. Read codebase structure from .project-memory/architecture.md
2. Review key files and components against:
   - .project-memory/conventions.md (coding standards)
   - .project-memory/architecture.md (design compliance)
   - Tasks: Single-file (tasks-active.json) or multi-file (relevant tasks-active_{domain}.json)
3. Analyze for:
   - Architectural consistency
   - Adherence to conventions
   - **Security violations**: hardcoded credentials/secrets, .env in git, API keys in code/tests, hardcoded ports, port conflicts
   - Technical debt
   - Unfinished tasks implementation

### For Specific Area:
1. Ask user to specify file/directory path
2. Read relevant files in that area
3. Compare against conventions and architecture
4. **Check for security violations** in the specified area
5. Check if files are part of any active tasks

## Final Step

4. Propose updates via AskUserQuestion:
   - Task status changes
     **CRITICAL: Mark task as COMPLETED only when:**
     • Implementation is verified to work (code exists and functions as intended)
     • Tests pass (unit tests, integration tests, or manual verification completed)
     • No blocking issues remain
   - Architecture updates
   - Issues found (with severity: critical/high/medium/low)
5. After approval, apply changes using Write/Edit tools

Remember: Get user approval before writing any files.
`.trim();
