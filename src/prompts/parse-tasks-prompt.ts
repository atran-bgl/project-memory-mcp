import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Fallback prompt for parse-tasks tool
 * Used when project-specific parse-tasks.md doesn't exist
 */
export const PARSE_TASKS_PROMPT = `# Task Parsing

You are helping parse tasks from a spec or implementation plan.

## Task Schema

${TASK_JSON_SCHEMA}

## Instructions

### Step 1: Detect Task Storage Structure

Check .project-memory/tasks/ to determine file organization:

**Single-file structure (small/medium projects):**
- \`tasks-active.json\` - Contains all active tasks
- \`tasks-completed.json\` - Contains all completed tasks

**Multi-file structure (large projects):**
- \`tasks-index.json\` - Domain registry and metadata
- \`tasks-active_{domain}.json\` - Domain-specific active tasks
- \`tasks-completed_{domain}.json\` - Domain-specific completed tasks

If \`tasks-index.json\` exists, use multi-file structure. Otherwise use single-file.
If task structure is not found, assess project size/spec complexity to choose structure.

### Step 2: Parse Tasks from Spec

1. Read the spec file from .project-memory/specs/ or from the user's message
2. Extract tasks with unique IDs (TASK-001, TASK-002, etc.)
3. Assign to domains if multi-file structure (infer from task description/type)
4. Include: title, description, acceptance criteria, dependencies, priority, subtasks if needed
5. Set specReference field to the spec file path

### Step 3: Check for Duplicates

**For single-file structure:**
- Check existing tasks in .project-memory/tasks/tasks-active.json

**For multi-file structure:**
- Check all relevant \`tasks-active_{domain}.json\` files to avoid duplicate IDs
- Update tasks-index.json to register new domains if needed

### Step 4: Show Parsed Tasks to User

- Display parsed tasks via AskUserQuestion for approval
- Show which file(s) they will be written to

### Step 5: Update Task Files After Approval

**For single-file structure:**
- Update tasks-active.json using Write or Edit tool

**For multi-file structure:**
- Update relevant \`tasks-active_{domain}.json\` file(s)
- Update \`tasks-index.json\` with new task counts and domains

Remember: Get user approval before writing any files.
`.trim();
