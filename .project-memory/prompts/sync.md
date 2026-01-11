# Post-Commit Sync

You are helping sync project memory with recent commits.

**Note:** You should have already cached project memory files at session start (architecture.md, conventions.md, etc.). Reference this knowledge.

## Task Schema (Reference)

```json
[TASK_SCHEMA]
```

## Instructions

### Step 1: Get Commit History

Run: `git log --oneline -20`

Check for new commits since last sync.

### Step 2: Read Active Tasks

- Open tasks-active.json and tasks-completed.json
- Count active/pending tasks
- List them briefly (just titles)

### Step 3: Review Task Implementation Against Codebase

**MANDATORY - Always do this, no opt-out:**

For each active/pending task:
1. Read task description and acceptance criteria
2. Use Explore agent (thoroughness: "very thorough") to check:
   - Does the feature/code mentioned in the task exist in the codebase?
   - Does the implementation match the acceptance criteria?
   - Are related tests present?
3. Verify by running:
   - `npm test` - all tests pass?
   - `npm run build` - code compiles?
4. Determine status: completed / in-progress / blocked / outdated

**Explore Agent Instructions:**
```
Use the Explore agent to efficiently check task implementation:
- Task ID: [TASK-ID]
- Acceptance Criteria: [list them]
- Search the codebase for: [files/functions/components mentioned]
- Verify: code exists, matches criteria, tests pass
```

### Step 4: Collect Review Results

Document findings for each task:
- Actual implementation status (does code exist and match specs?)
- Test results (do tests pass?)
- Build results (does it compile?)
- Any blockers or issues discovered

### Step 5: Validate Consistency

**Check CLAUDE.md - CRITICAL:**
- NEVER leave outdated references
- CLAUDE.md MUST reflect current code
- Verify: file paths, function names, commands
- Check for: renamed files, deleted modules, changed APIs

**OUTPUT REQUIRED - Show inconsistencies:**
```
⚠️ CLAUDE.md Inconsistencies:
- Line X: References [old path] but file is at [new path]
- Line Y: Describes [old pattern] but code uses [new pattern]
```

If ANY inconsistencies found → MUST update CLAUDE.md (ask user approval)

**Check architecture.md - CRITICAL:**
- NEVER leave stale architecture.md
- Compare documented structure vs actual file organization
- Detect: new files/dirs, removed modules, renamed components

**OUTPUT REQUIRED - List all changes:**
```
⚠️ architecture.md is STALE:
- New file: [path] added but not documented
- Removed: [old path] no longer exists
- Renamed: [old name] → [new name]
```

If ANY changes found → propose updating architecture.md

If NO changes → explicitly confirm: "✅ architecture.md is current"

### Step 6: Propose Task Status Updates

Based on review findings from Step 3, propose task status changes:
- Tasks with complete implementation + passing tests → mark COMPLETED
- Tasks with partial implementation → mark IN_PROGRESS
- Tasks blocked by issues → mark with blockers noted
- Outdated tasks (specs no longer valid) → discuss with user

**CRITICAL: Mark task as COMPLETED only when ALL are true:**
- Code implementation exists and matches acceptance criteria
- Tests pass: `npm test` succeeds
- Build succeeds: `npm run build` succeeds
- No failing tests or compilation errors

### Step 7: Propose Updates

Use AskUserQuestion to propose:
- **Documentation updates:**
  * CLAUDE.md corrections (if inconsistencies found)
- **Task updates:**
  * Mark completed tasks as completed
  * Move completed tasks to tasks-completed.json
  * Update task statuses
- **Project memory updates:**
  * Update commit-log.md (keep last 20 commits)
  * Update architecture.md if structure changed
  * Add new commands to useful-commands.md
  * Update conventions.md if new patterns established

### Step 8: Apply Changes

After user approval, update files using Write/Edit tools.

---

## Critical Rules

**CLAUDE.md must NEVER be outdated:**
- Sync MUST fix all outdated references
- If code changed → CLAUDE.md MUST be updated
- Outdated docs is worse than no docs
- Every sync should verify accuracy

**architecture.md must NEVER be stale:**
- Sync MUST detect all structural changes
- If structure changed → architecture.md MUST be updated
- Always output whether architecture is current or stale

**Code issues discovered during sync:**
- **DO NOT attempt to fix code issues**
- **Bring issues to user attention immediately** (security, bugs, architecture violations)
- **Request project memory review** using review tool
- Sync focuses on documentation/metadata - code fixes need dedicated review

Remember: Get user approval before writing any files.
