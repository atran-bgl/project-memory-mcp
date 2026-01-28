D# Task Parsing

You are helping parse tasks from a spec or implementation plan.

## Task Schema

```json
[TASK_SCHEMA]
```

## Step 0: Load Project Context & Rules - MANDATORY

**Before parsing any tasks, you MUST read and understand project rules.**

Read these files NOW if you haven't this session:
1. **`.project-memory/prompts/base.md`** - READ for Forbidden Actions and all rules
2. **`.project-memory/conventions.md`** - READ for Forbidden Actions and Code Style
3. `.project-memory/useful-commands.md` - Available commands
4. `.project-memory/architecture.md` - System structure

**Verification Required - Output this:**
```
✅ Project Context Loaded:

FORBIDDEN ACTIONS (from base.md & conventions.md):
[List ALL forbidden actions - typically 11+ items]

Base Rules: [list 2-3 critical rules from base.md]
Conventions: [list 2-3 key patterns from conventions.md]
Commands: [list 2-3 key commands from useful-commands.md]
Architecture: [list 2-3 key components from architecture.md]
```

**CRITICAL: If you cannot list the forbidden actions, you MUST read base.md and conventions.md now.**

When parsing tasks, ensure they don't require forbidden actions for implementation.

Do not proceed to Step 1 until you've verified and outputted the above.

---

## Instructions

### Step 1: Detect Task Storage Structure

Check `.project-memory/tasks/` for file organization:
- **Single-file:** tasks-active.json, tasks-completed.json
- **Multi-file:** tasks-index.json exists, use domain-specific files (tasks-active_{domain}.json)

This project uses single-file structure.

### Step 2: Parse Tasks from Spec

1. Read spec from `.project-memory/specs/` or user message
2. Extract tasks with unique IDs (TASK-001, TASK-002, etc.)
3. Include: title, description, acceptance criteria, dependencies, priority
4. **CRITICAL:** Set `specReference` field to spec file path (e.g., "specs/feature-name.md")
5. Without specReference, tasks cannot be traced back to requirements

### Step 3: Check Existing Tasks & Codebase

**CRITICAL: Avoid duplicates and already-implemented tasks**

Check for duplicates:
- Read tasks-active.json AND tasks-completed.json
- Compare new tasks against both files

Verify against codebase:
- For each parsed task, check if already implemented
- Read relevant source files to confirm implementation status
- Validate: Does feature exist? Does it work as described?

**Show validation results:**
```
✅ NEW: TASK-001 - [title]
⚠️ DUPLICATE: TASK-002 - [title] (already in tasks-active.json)
⚠️ IMPLEMENTED: TASK-003 - [title] (code exists at src/...)
❌ FALSE COMPLETE: TASK-004 - [title] (marked complete but not in code!)
```

**Actions:**
- NEW → Add to active tasks
- DUPLICATE → Skip (already tracked)
- IMPLEMENTED → Add directly to completed tasks
- FALSE COMPLETE → Flag to user

### Step 4: Show Parsed Tasks to User

Display parsed tasks via AskUserQuestion for approval.

### Step 5: Update Task Files After Approval

- Update tasks-active.json with Write/Edit tools
- Apply changes after user approval only
