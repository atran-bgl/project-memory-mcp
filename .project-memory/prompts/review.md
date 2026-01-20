# Code Review

**MANDATORY: Analyze ACTUAL CODE, not just tasks or summaries.**

## Step 0: Load Project Context & Rules - MANDATORY

**Before reviewing any code, you MUST read and understand project rules.**

Read these files NOW if you haven't this session:
1. **`.project-memory/prompts/base.md`** - READ COMPLETELY for Forbidden Actions, Scope & Authority, Business Logic & UI/UX Protection
2. **`.project-memory/conventions.md`** - READ COMPLETELY for Forbidden Actions and Code Style
3. `.project-memory/useful-commands.md` - Available commands
4. `.project-memory/architecture.md` - System structure

**Verification Required - Output this:**
```
✅ Project Context Loaded:

FORBIDDEN ACTIONS (from base.md & conventions.md):
[List ALL forbidden actions - typically 11+ items like:]
- NO large refactors
- NO dependency changes
- NO config changes
- NO changing business logic
- NO changing UI/UX
- [... list all you found ...]

Base Rules: [list 2-3 critical rules from base.md]
Conventions: [list 2-3 key patterns from conventions.md]
Commands: [list 2-3 key commands from useful-commands.md]
Architecture: [list 2-3 key components from architecture.md]
```

**CRITICAL: If you cannot list ALL the forbidden actions, you MUST read base.md and conventions.md now.**

During code review, you will check for violations of these forbidden actions with HIGH priority.

Do not proceed to choosing review scope until you've verified and outputted the above.

---

## Choose Review Scope

Ask user what to review:
- "Review recent uncommitted changes" - git diff + code analysis
- "Review entire codebase" - Full code scan against standards
- "Review specific file or directory" - Focused code inspection

---

## For Recent Changes

**CRITICAL: MUST read the actual modified files**

1. Get changed files: `git diff --name-only` and `git diff --cached --name-only`

2. **READ EACH FILE:**
   - Read entire modified file
   - Understand what changed and WHY
   - Compare against conventions.md

3. **Code Analysis - OUTPUT REQUIRED:**
   ```
   📝 Code Review:
   Files: [list with line ranges if partial]

   Implementation Quality:
   - Logic correctness: [assessment]
   - Potential bugs: [list any found]
   - Security issues: [hardcoded secrets, .env, API keys, etc.]
   - Code style: [adheres to conventions? yes/no + issues]

   Architectural Impact:
   - Aligns with architecture.md: [yes/no]
   - Breaks patterns/conventions: [list issues]
   - Affects other components: [what impact]
   ```

4. **Check for Forbidden Actions Violations (HIGH PRIORITY):**
   - Large refactors (code restructured unnecessarily)
   - Dependency changes (added/upgraded without approval)
   - Config changes (package.json, tsconfig.json, .eslintrc)
   - Auto-formatting entire files (not just new code)
   - Removed features (deleted working code)
   - API changes (modified signatures, interfaces, exports)
   - Architectural changes (folder structure, organization)
   - New patterns introduced (different from existing code)
   - Build script changes
   - Business logic changes (calculations, validations, rules)
   - UI/UX changes (copy, design, flows - frontend)

   **If ANY violations → Flag as HIGH severity issue**

5. **Critical Issues to Check:**
   - **Prompt Size:** Composed prompt > 400 lines? (base.md + specific prompt combined)
   - **File I/O:** Any file operations in server logic (except reading prompts)?
   - **Git Operations:** Any git commands in server code?
   - **TypeScript:** Strict mode violations, type safety issues
   - **Security:** Hardcoded values, exposed error details, missing validation
   - **Error Handling:** Unhandled exceptions, silent failures
   - **Testing:** Proper test structure, edge cases covered

6. Cross-reference with active tasks

---

## For Entire Codebase

**CRITICAL: MUST read actual source files systematically**

1. **Audit source files:** Read key files (index.ts, prompt-loader.ts, schemas), scan others

2. **Codebase Analysis - OUTPUT REQUIRED:**
   ```
   🏗️ Code Health:

   Structure & Architecture:
   - Follows documented architecture.md: [yes/no]
   - Inconsistencies found: [list violations]

   Code Quality:
   - Convention adherence: [% estimated + violations]
   - Test coverage: [assess]
   - Documentation: [present/missing]

   Security & Performance:
   - Security vulnerabilities: [hardcoded values, input validation, etc.]
   - Performance issues: [inefficient patterns, missing optimizations]
   - Technical debt: [areas needing attention]
   ```

3. **Check for Forbidden Actions Violations (HIGH PRIORITY):**
   - Scan entire codebase for forbidden action violations (same list as step 4 in "For Recent Changes")
   - Output violations by file with severity rating

4. **Systematic check for common issues:**
   - Prompt size validation (400-line limit enforced?)
   - File I/O constraints (only reading prompts?)
   - Type safety (TypeScript strict mode)
   - Error handling (try-catch patterns, error messages)
   - Testing coverage (prompt loading, composition, validation)
   - Security (no secrets, env variables used)

5. List critical issues found

---

## For Specific Area

**CRITICAL: READ all files in the specified path**

1. Get user-selected path
2. Read all source files in area
3. Analyze: logic, quality, security, architectural fit
4. Compare against conventions and architecture
5. Area-specific checks:
   - Prompts: Size limits, template syntax, customization patterns
   - Server (index.ts): Tool registration, error handling, request routing
   - Utils (prompt-loader): Composition logic, validation, file handling
   - Tests: Coverage, edge cases, mock patterns
   - Schemas: JSON structure, validation rules

---

## Code Structure & Testability Score

Assess code quality (score /10):
- **Code clarity:** Intent, naming, readability
- **Documentation:** JSDoc, comments, examples
- **Type safety:** TypeScript usage, null checks
- **Modularity:** Separation of concerns, DRY principle
- **Testability:** Unit testability, mock-ability
- **Error handling:** Exception handling, error clarity
- **Extensibility:** Cost of adding new features
- **Code duplication:** Repeated patterns

For each: provide score, notes, and improvement recommendations if <8/10.

---

## Next Steps

Propose updates via AskUserQuestion:
- Code issues found (severity: critical/high/medium/low + fix recommendations)
- Task status updates (if code implements active tasks)
- Architecture updates needed
- Security violations requiring immediate action

Get user approval before writing files.
