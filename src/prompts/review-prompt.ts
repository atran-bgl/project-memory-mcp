/**
 * Fallback prompt for review tool
 * Unified review workflow with consistent criteria across all scopes
 */
export const REVIEW_PROMPT = `# Code Review

**COMPREHENSIVE CODE REVIEW with consistent criteria regardless of scope.**

---

## Step 1: Detect Review Scope

**Check your session context:**

Do you have knowledge of:
- Recent implementation from implement-feature tool?
- Spec file path being implemented?
- Task IDs being worked on?

**If YES (have context):**
- Scope: **Recent uncommitted changes** (post-implementation)
- Files: Run git diff to get changed files

**If NO (no context):**
Ask via AskUserQuestion: "What would you like to review?"
Options:
1. Recent uncommitted changes (git diff)
2. Recent commits (git log + diff)
3. Specific files/directories (provide path)
4. Entire codebase (full health check)

**Set scope based on answer, then continue.**

---

## Step 2: Load Project Context - MANDATORY

**Read these files NOW:**
1. \`.project-memory/prompts/base.md\` - Forbidden Actions, Business Logic/UI/UX Protection
2. \`.project-memory/conventions.md\` - Code Style Enforcement
3. \`.project-memory/useful-commands.md\` - Commands
4. \`.project-memory/architecture.md\` - System structure

**Verify:**
\`\`\`
✅ Context Loaded:
Forbidden Actions: [list ALL - typically 11+]
Conventions: [list 2-3 key patterns]
Commands: [build/test/lint]
Architecture: [key components]
\`\`\`

---

## Step 3: Gather Code for Review

Based on scope from Step 1:

**For Recent Uncommitted Changes:**
- Run: \`git diff --name-only\` + \`git diff --cached --name-only\`
- Get list of modified files
- Read each modified file completely

**For Recent Commits:**
- Ask: "How many recent commits?" (default: last 5)
- Run: \`git log -n [count] --name-only\`
- Run: \`git diff HEAD~[count]..HEAD\`
- Get changed files, read each completely

**For Specific Area:**
- Ask: "What file or directory path?"
- If user provided spec/tasks → Read spec file + tasks
- Use Glob to list all files in path
- Read all files in area

**For Entire Codebase:**
- Use Explore agent (subagent_type: 'Explore', thoroughness: 'very thorough')
- Query: "Analyze codebase structure, identify files by category (backend/frontend/config/tests), flag potential issues"
- Get comprehensive file list from Explore output
- Read key files identified by Explore

---

## Step 4: Get Context References (If Available)

**Ask via AskUserQuestion:**
"Are these changes related to specific specs or tasks?"
- Provide spec file path(s) and/or task ID(s)
- Or leave blank if none

**If provided:**
- Read spec file(s)
- Read tasks from \`.project-memory/tasks/tasks-active.json\`
- Note requirements and acceptance criteria for later verification

---

## Step 5: Security & Dependency Check

**If dependency files modified** (package.json, requirements.txt, etc.):

a) Run \`git diff [dependency-file]\` - extract changed packages

b) Check vulnerabilities:
   - npm: \`npm audit\` + WebFetch \`https://registry.npmjs.org/[pkg]\`
   - Python: WebFetch \`https://pypi.org/pypi/[pkg]/json\`
   - Rust: WebFetch \`https://crates.io/api/v1/crates/[pkg]\`

c) Output:
   \`\`\`
   🔒 Dependency Security:
   - [pkg@ver]: [VULNERABLE/SAFE] - Severity: [CRITICAL/HIGH/LOW] - Fix: [version]
   Summary: [X critical, Y high] - [BLOCK/proceed]
   \`\`\`

d) Flag CRITICAL/HIGH as blocking

**If no dependency changes:** "✅ No dependency changes"

---

## Step 6: Core Review Checks (ALL SCOPES)

### 6.1: Mental Checklist

\`\`\`
🧠 Mental Checklist:

✓ Follows spec/requirements? [yes/no] - [deviations]
✓ Code is DRY (no duplication)? [yes/no] - [duplications found]
✓ No new patterns introduced? [yes/no] - [new patterns]
✓ Matches existing code style? [yes/no] - [style violations]
✓ Protected areas:
  - Business logic modified? [yes/no] - [list]
  - UI/UX modified? [yes/no] - [list]
\`\`\`

### 6.2: Forbidden Actions Check (HIGH PRIORITY)

Scan for violations:
- ❌ Large refactors, dependency changes, config changes
- ❌ Auto-formatting entire files, removed features
- ❌ API changes, architectural changes, new patterns
- ❌ Build script changes, business logic changes, UI/UX changes

**Flag violations as Critical**

### 6.3: Focus Areas by Project Type

**Backend Issues:**
- Database: N+1 queries, missing indexes, unclosed connections, missing pagination
- Error Handling: Unhandled exceptions, missing try-catch, missing null checks
- Performance: Blocking operations, missing caching, missing timeouts
- API Security: Missing validation, missing auth checks, exposed errors
- Resource Management: Memory leaks, circular dependencies

**Frontend Issues:**
- Type Safety: any types, missing null checks, unsafe casts
- State Management: Stale closures, infinite loops, circular updates
- React: Missing dependency arrays, infinite renders, missing keys
- Async: Unhandled promise rejections, race conditions
- Edge Cases: Off-by-one errors, boundary conditions

### 6.4: Security Scan

- Hardcoded secrets, API keys, credentials
- Missing input validation
- SQL injection, XSS vulnerabilities
- Exposed error details (stack traces)
- .env file committed

### 6.5: Code Patterns & Style

- Compare against conventions.md
- Check naming conventions
- Check code structure (exports, imports, error handling)
- Check formatting (indentation, quotes, semicolons)

---

## Step 7: Verify Against Spec (If Provided in Step 4)

\`\`\`
📋 Spec & Acceptance Criteria:

Spec: [file]
Tasks: [IDs]

Requirements:
- Req 1: [✅ met / ⚠️ partial / ❌ missing / ⚡ extra]
- Req 2: [status]

Acceptance Criteria:
✅ [TASK-ID] Criterion 1: [met/not met] - [file:line]
✅ [TASK-ID] Criterion 2: [met/not met] - [file:line]

Inconsistencies:
- [Critical/Important/Minor]: [issue]
\`\`\`

---

## Step 8: Run Quality Checks

**Run build:**
- Command: From useful-commands.md (e.g., \`npm run build\`)
- Must succeed with no errors
- Output: "✅ Build: success" or "❌ Build failed: [errors]"

**Run tests:**
- Command: From useful-commands.md (e.g., \`npm test\`)
- All tests must pass
- Output: "✅ Tests: [X/X passed]" or "❌ Tests failed: [details]"

**Run linter (optional):**
- Command: \`npm run lint\`
- Check for warnings/errors
- Output: "✅ Linter: clean" or "⚠️ Linter: [X warnings]"

---

## Step 9: Evaluate Code Quality

**Assessment Criteria:**

1. **Maintainability** [score /10]:
   - Code clarity, modularity, DRY principle
   - Notes: [issues found]

2. **Alignment to Requirements** [score /10]:
   - Matches spec, meets acceptance criteria
   - Notes: [deviations]

3. **Security** [score /10]:
   - No vulnerabilities, proper validation
   - Notes: [security issues]

4. **Code Quality** [score /10]:
   - Follows conventions, proper error handling
   - Notes: [quality issues]

5. **Architecture Alignment** [score /10]:
   - Fits architecture.md, no forbidden actions
   - Notes: [violations]

**Overall Assessment: [X/50]**

---

## Step 10: Output Review Feedback

\`\`\`
📊 Review Feedback:

Scope: [Recent changes / Recent commits / Specific area / Entire codebase]
Files Reviewed: [count] - [list key files]

Critical Issues (Must Fix - Blocks commit):
- [file:line] - [issue] - Fix: [how to fix]

Important Issues (Should Fix - Quality/correctness):
- [file:line] - [issue] - Fix: [how to fix]

Minor Issues (Nice to Fix - Style/optimization):
- [file:line] - [issue] - Fix: [how to fix]

Suggestions (Optional improvements):
- [suggestion with rationale]

Quality Assessment:
✅ Maintainability: [score/10]
✅ Requirements: [score/10]
✅ Security: [score/10]
✅ Code Quality: [score/10]
✅ Architecture: [score/10]
Overall: [X/50]

Build & Tests:
✅ Build: [success/failed]
✅ Tests: [X/Y passed]
✅ Linter: [clean/warnings]

Summary:
✅ Spec alignment: [if applicable]
✅ Forbidden actions: [no violations/violations found]
✅ Dependencies: [safe/vulnerabilities found]

Recommendation: [✅ READY FOR COMMIT / ❌ FIX ISSUES FIRST]
\`\`\`

---

## Rules

**Consistent Criteria:**
- All scopes use same review checks (mental checklist, forbidden actions, focus areas, security)
- All scopes get same quality assessment (5 criteria)
- All scopes run build/tests

**Scope Differences (HOW to gather code):**
- Recent changes: git diff
- Recent commits: git log + diff
- Specific area: Glob + read files (+ optional Explore for large areas)
- Entire codebase: Explore agent + read key files

**Output Format:**
- Always: Critical/Important/Minor/Suggestions
- Always: Quality scores (5 criteria)
- Always: Build/test results
- Always: Commit recommendation

Done!
`.trim();
