/**
 * Self-reflection prompt for mid-implementation checks
 * Lightweight quality check to catch issues early before they compound
 * Called during implement-feature Stage 2 when 4+ tasks or high complexity
 */
export const SELF_REFLECT_PROMPT = `# Self-Reflect - Mid-Implementation Check

**PURPOSE: Catch critical issues early during implementation before they compound.**

This is a LIGHTWEIGHT check - not a full review. Focus on:
- Are you following the spec?
- Is code DRY (no duplication)?
- Are you introducing new patterns?
- Any critical bugs or security issues?

---

## Step 1: Load Context (Quick)

**Read these files if you haven't this session:**
1. \`.project-memory/prompts/base.md\` - Forbidden Actions
2. \`.project-memory/conventions.md\` - Code Style

**Quick verification:**
\`\`\`
✅ Context Loaded:
Forbidden Actions: [list 3-5 most critical]
Key conventions: [list 2-3]
\`\`\`

---

## Step 2: Get Implementation Context

**Ask user:**
- "Which tasks have you completed so far?"
- "Which tasks are remaining?"
- "What spec are you implementing?"

**Read:**
- Spec file
- Completed task acceptance criteria
- Recent uncommitted changes: \`git diff\` + \`git diff --cached\`

---

## Step 3: Mental Checklist (CORE CHECK)

**For each completed task, verify:**

\`\`\`
🧠 Mental Checklist:

Task [TASK-ID]: [title]

✓ Follows spec requirements?
  [yes/no] - [any deviations?]

✓ Code is DRY (no duplication)?
  [yes/no] - [any duplicated code?]

✓ No new patterns introduced?
  [yes/no] - [any patterns NOT in existing codebase?]

✓ Matches existing code style?
  [yes/no] - [studied similar files first?]

✓ Protected areas checked?
  - Modified business logic? [yes/no] - [asked approval?]
  - Modified UI/UX? [yes/no] - [asked approval?]
\`\`\`

**If ANY is "no" → Flag for fixing**

---

## Step 4: Quick Code Scan

**Read the modified files - look for:**

**Critical Bugs (MUST FIX):**
- Unhandled errors/exceptions
- Null/undefined access without checks
- Infinite loops or recursion
- Race conditions
- Resource leaks (unclosed connections, memory leaks)

**Security Issues (MUST FIX):**
- Hardcoded secrets, API keys, credentials
- Missing input validation
- SQL injection vulnerabilities
- XSS vulnerabilities
- Exposed error details (stack traces)

**Forbidden Actions (MUST FIX):**
- Dependency changes without approval
- Config file changes
- Large refactors
- Business logic changes without approval
- UI/UX changes without approval

**Output:**
\`\`\`
🔍 Quick Scan Results:

Critical Issues Found: [count]
- [file:line] - [issue]

Security Issues Found: [count]
- [file:line] - [issue]

Forbidden Actions: [count]
- [file:line] - [violation]
\`\`\`

---

## Step 5: Duplication Check (DRY)

**Scan for code duplication:**
- Similar code blocks (>5 lines) repeated
- Same logic in multiple places
- Copy-pasted functions with slight variations

\`\`\`
📋 Duplication Found:

- [file1:line] and [file2:line]: [describe duplication]
  Suggestion: Extract to [function/component name]

- [file1:line] and [file2:line]: [describe duplication]
  Suggestion: [how to deduplicate]
\`\`\`

---

## Step 6: Pattern Check

**Compare against existing codebase:**
- Are you using the same naming conventions?
- Are you using the same code structure?
- Are you using the same patterns (async/await, error handling, etc.)?

**If introducing new patterns:**
\`\`\`
⚠️ New Patterns Detected:

Current code uses: [describe existing pattern]
Your code uses: [describe new pattern]

Files studied: [did you study 2-3 similar files?]

Recommendation: [align with existing or justify why new pattern needed]
\`\`\`

---

## Step 7: Remaining Work Assessment

**Look ahead at remaining tasks:**
- Will current approach work for remaining tasks?
- Any architectural issues that will cause problems later?
- Any refactoring needed before continuing?

\`\`\`
🔮 Looking Ahead:

Remaining tasks: [count]
Current approach: [will work / needs adjustment]

Concerns for remaining work:
- [concern 1]
- [concern 2]

Recommendations:
- [recommendation before continuing]
\`\`\`

---

## Output Format (Simple & Actionable)

\`\`\`
✅ Self-Reflect Summary:

Tasks Completed: [IDs]
Tasks Remaining: [IDs]

Status: [✅ GOOD TO CONTINUE / ❌ FIX ISSUES FIRST]

Issues to Fix Before Continuing:
1. [issue] - [file:line] - [how to fix]
2. [issue] - [file:line] - [how to fix]

Good Practices Observed:
- [what's working well]

Recommendations:
- [suggestions for remaining work]

Next Steps:
- [Fix issues OR Continue with next task]
\`\`\`

---

## Rules

**This is NOT a full review:**
- Focus on critical issues that would compound
- Quick checks, not exhaustive analysis
- Goal: Keep implementation on track

**What to check:**
- ✓ Mental checklist (spec, DRY, patterns, style, protected areas)
- ✓ Critical bugs and security issues
- ✓ Forbidden action violations
- ✓ Code duplication
- ✓ Pattern consistency

**What to skip:**
- Comprehensive architecture analysis (save for full review)
- Detailed performance analysis (save for full review)
- Full test coverage analysis (save for full review)
- Dependency vulnerability checks (save for full review)

**When to call:**
- Mid-point during implementation (4+ tasks or high complexity)
- When you feel uncertain about approach
- Before continuing to next batch of tasks

Done!
`.trim();
