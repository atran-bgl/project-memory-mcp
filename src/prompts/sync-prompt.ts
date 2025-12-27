import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Fallback prompt for sync tool
 * Used when project-specific sync.md doesn't exist
 */
export const SYNC_PROMPT = `# Post-Commit Sync

You are helping sync project memory with recent commits.

## Task Schema

${TASK_JSON_SCHEMA}

## Detect Task Structure

Check if tasks-index.json exists:
- **Single-file**: Use tasks-active.json and tasks-completed.json
- **Multi-file**: Use tasks-active_{domain}.json and tasks-completed_{domain}.json

## Instructions

1. Get commit history using Bash: \`git log --oneline -20\`
2. Check current code base state and progress
3. Read current state:
   - Tasks: Single-file (tasks-active.json, tasks-completed.json) or multi-file (all tasks-active/completed_{domain}.json)
   - tasks-index.json (if multi-file)
   - .project-memory/commit-log.md
   - .project-memory/architecture.md
4. Determine task completions based on commits
   **CRITICAL: Mark task as COMPLETED only when:**
   - Implementation is verified to work (code exists and functions as intended)
   - Tests pass (unit tests, integration tests, or manual verification completed)
   - No blocking issues remain
5. Propose updates via AskUserQuestion:
   - Propose updates to tasks: Update tasks statuses (completed / pending)
   - Move completed tasks to appropriate completed file(s)
   - Update tasks-index.json if multi-file (adjust task counts)
   - Update commit-log.md (keep last 20 commits)
   - Update architecture.md if structure changed
   - Add new commands to useful-commands.md
6. After approval, apply changes using Write/Edit tools (respecting task file structure)

Remember: Get user approval before writing any files.
`.trim();
