/**
 * Implement feature from spec and tasks
 * 3-stage workflow: Planning → Implementation → Review & Fix
 */
export const IMPLEMENT_FEATURE_PROMPT = `# Implement Feature

**3-STAGE WORKFLOW: Planning → Implement → Review & Fix**

---

## STAGE 1: PLANNING (3 Steps)

### Step 1: Load Context & Get Spec

**A. Read project files (if you haven't this session):**
1. \`.project-memory/prompts/base.md\` - Forbidden Actions, Business Logic Protection, UI/UX Protection
2. \`.project-memory/conventions.md\` - Code Style Enforcement
3. \`.project-memory/useful-commands.md\` - Dev/build/test commands
4. \`.project-memory/architecture.md\` - System structure

**Output:**
\`\`\`
✅ Project Context Loaded:

FORBIDDEN ACTIONS (list ALL):
- NO large refactors
- NO dependency changes
- NO config changes
- NO business logic changes without approval
- NO UI/UX changes without approval (frontend)
- [... list all from base.md & conventions.md ...]

Key conventions: [list 2-3 patterns]
Key commands: [build/test/lint commands]
\`\`\`

**Commitment: I will NOT perform any forbidden actions. If I need to do something forbidden, I will STOP and ask via AskUserQuestion first.**

**B. Get spec and validate:**
- Ask user: spec file path + task reference
- Read spec + \`.project-memory/tasks/tasks-active.json\`
- Verify: spec clear? tasks have acceptance criteria?

**Output:**
\`\`\`
✅ Spec Validated:
- Spec: [file path]
- Tasks: [TASK-ID: title, TASK-ID: title, ...]
- All tasks have acceptance criteria: [yes/no]
\`\`\`

---

### Step 2: Analyze & Plan

**A. Check dependencies:**
- Review spec: does it require new packages/libraries?
- If YES → STOP and ask via AskUserQuestion for approval
- Output: "✅ Using existing stack" OR "❓ Need approval for [package@version]"

**B. Audit for reusable code:**
- Search codebase for similar features/functions (use Glob/Grep)
- Identify what can be reused vs. needs new implementation
- Output: "🔍 Reusable: [list]. New implementation: [list]"

**C. Identify modifications:**
- Will you modify existing files?
- If YES → Ask via AskUserQuestion for approval: "Need to modify [files]: [describe changes]. Approve?"
- Output: "✅ Modifications approved: [files]" OR "✅ Only new files"

---

### Step 3: Create Implementation Plan with TodoWrite

**Use TodoWrite to create detailed task list.**

**Structure:**

**For each task (in order):**
- "Study code patterns for [TASK-ID]"
  - MANDATORY: Find 2-3 similar files, document naming/structure/formatting
- "Implement [TASK-ID]: [title]"
  - Mental checklist: follows spec? DRY? no new patterns? protected areas checked?
  - Verify acceptance criteria before marking complete

**Mid-point review (if 4+ tasks or high complexity):**
- "Mid-point self-reflect - call project-memory self-reflect"

**Quality checks:**
- "Run linter and fix errors"
- "Run build - must succeed"
- "Run tests - all must pass"

**Final review:**
- "Call project-memory review"
- "Fix issues from review"
- "Final verification - all acceptance criteria met"

**Example output (for 6 tasks):**
\`\`\`
📋 Implementation Plan Created:

1. Study code patterns for TASK-001 (pending)
2. Implement TASK-001: Add user model (pending)
3. Study code patterns for TASK-002 (pending)
4. Implement TASK-002: Add authentication endpoints (pending)
5. Mid-point self-reflect 1 - check progress (pending)
6. Study code patterns for TASK-003 (pending)
7. Implement TASK-003: Add authorization middleware (pending)
8. Study code patterns for TASK-004 (pending)
9. Implement TASK-004: Add password hashing (pending)
10. Mid-point self-reflect 2 - check progress (pending)
11. Study code patterns for TASK-005 (pending)
12. Implement TASK-005: Add session management (pending)
13. Study code patterns for TASK-006 (pending)
14. Implement TASK-006: Add audit logging (pending)
15. Run linter and fix errors (pending)
16. Run build - must succeed (pending)
17. Run tests - all must pass (pending)
18. Call project-memory review (pending)
19. Fix issues from review (pending)
20. Final verification (pending)
\`\`\`

Note: Insert self-reflect checkpoints every 2-3 tasks for complex implementations.
\`\`\`

**CHECKPOINT: Get user approval to proceed to Stage 2.**

---

## STAGE 2: IMPLEMENTATION (Execute Todos)

**Follow the todo list you created. Execute step by step.**

### For each "Study code patterns" todo:

1. Mark todo as \`in_progress\`
2. Find 2-3 similar files in codebase (use Glob/Grep)
3. Read them completely
4. Document patterns:
   \`\`\`
   🔍 Code Patterns from [file1], [file2]:
   - Naming: [camelCase/PascalCase/UPPER_CASE]
   - Structure: [exports/imports/error handling]
   - Formatting: [indentation/quotes/semicolons]
   - Patterns: [async-await/functional/class-based/etc]
   \`\`\`
5. Mark todo as \`completed\`

**CRITICAL: Output patterns BEFORE writing any code.**

---

### For each "Implement [TASK-ID]" todo:

1. Mark todo as \`in_progress\`
2. Re-read task acceptance criteria + relevant spec section
3. Output implementation approach

**As you write code - Mental checklist:**
- ✓ Does implementation follow spec?
- ✓ Is code DRY (no duplication)?
- ✓ Am I introducing new patterns? (should be NO)
- ✓ Am I modifying business logic (calculations/validations/rules)? → Ask first if YES
- ✓ Am I modifying UI/UX (copy/styles/flows/accessibility)? → Ask first if YES

4. Write code:
   - Match patterns from study step
   - Follow conventions.md strictly
   - Handle edge cases from spec
   - Apply security rules from base.md

5. **MANDATORY checkpoint - Verify acceptance criteria:**
   \`\`\`
   ✅ [TASK-ID] Verification:
   ✅ Criterion 1: [implemented] - Location: [file:line]
   ✅ Criterion 2: [implemented] - Location: [file:line]
   ✅ Follows spec requirements
   ✅ Code is DRY
   ✅ No new patterns introduced
   ✅ No forbidden actions violated
   \`\`\`
   **If ANY is ✗ → fix before marking complete**

6. Mark todo as \`completed\`

---

### If you have "Mid-point self-reflect" todo:

- STOP implementation
- Mark todo as \`in_progress\`
- Call: \`mcp__project-memory__self-reflect\`
- This is a lightweight check to catch issues early
- Address any critical issues found before continuing
- Mark todo as \`completed\`
- Continue with remaining implementation todos

**Continue executing todos until all implementation todos are complete.**

---

## STAGE 3: REVIEW & FIX (Verify Quality)

### Execute Quality Check Todos:

**"Run linter and fix errors":**
- Mark as \`in_progress\`
- Run: \`npm run lint\` (from useful-commands.md)
- Fix ALL errors/warnings
- Output: "✅ Linter: passed"
- Mark as \`completed\`

**"Run build - must succeed":**
- Mark as \`in_progress\`
- Run: \`npm run build\`
- Must succeed with no errors
- Output: "✅ Build: success"
- Mark as \`completed\`

**"Run tests - all must pass":**
- Mark as \`in_progress\`
- Run: \`npm test\`
- All tests must pass
- Output: "✅ Tests: [X/X passed]"
- Mark as \`completed\`

---

### Execute Review Todos:

**"Call project-memory review":**
- Mark as \`in_progress\`
- Run: \`mcp__project-memory__review\`
- Output feedback:
  \`\`\`
  📊 Review Feedback:
  Critical: [list]
  Important: [list]
  Minor: [list]
  Suggestions: [list]
  \`\`\`
- Mark as \`completed\`

**"Fix issues from review":**
- Mark as \`in_progress\`
- Address critical and important issues
- Re-run: linter, build, tests after fixes
- If significant changes → call \`mcp__project-memory__review\` again and iterate
- Output: "✅ Fixed: [list of issues fixed]"
- Mark as \`completed\`

---

### Execute Final Verification:

**"Final verification":**
- Mark as \`in_progress\`
- Verify ALL tasks one more time:
  \`\`\`
  ✅ Final Verification:

  [TASK-ID]: [title]
  ✅ All acceptance criteria met - [file:line]

  [TASK-ID]: [title]
  ✅ All acceptance criteria met - [file:line]

  Code Quality:
  ✅ Linter passed
  ✅ Build succeeded
  ✅ All tests passed
  ✅ Review feedback addressed
  ✅ No forbidden actions violated
  \`\`\`
- Mark as \`completed\`

**Final output:**
\`\`\`
✅ Implementation Complete - Ready for Commit

Tasks completed:
- [TASK-ID]: [title]
- [TASK-ID]: [title]

Files modified/created:
- [file1.ts] - [description]
- [file2.ts] - [description]

Quality gates: ✅ All passed

Next steps:
1. Review git diff manually (optional)
2. Commit changes
3. Run \`project-memory sync\` after commit
\`\`\`

---

## Essential Rules - Cannot Skip

**Stage 1 (Planning):**
- ✓ Load project context - understand ALL forbidden actions
- ✓ Validate spec and tasks
- ✓ Create detailed todo list with TodoWrite

**Stage 2 (Implementation):**
- ✓ Study code patterns BEFORE implementing each task (find 2-3 similar files, document patterns)
- ✓ Check protected areas before modifying:
  - Business logic (calculations/validations/rules) → ask first
  - UI/UX (copy/styles/flows/accessibility) → ask first
- ✓ Verify acceptance criteria BEFORE marking task complete
- ✓ Call mid-point review if 4+ tasks or high complexity

**Stage 3 (Review & Fix):**
- ✓ Run linter, build, tests - all must pass
- ✓ Call project-memory review
- ✓ Fix issues found in review
- ✓ Final verification of all acceptance criteria

**Mental Checklist (Stage 2):**
- Follows spec? DRY code? No new patterns? Protected areas checked?

Done!
`.trim();
