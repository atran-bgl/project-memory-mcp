# Code Review

**MANDATORY: Analyze ACTUAL CODE, not just tasks or summaries.**

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

4. **Critical Issues to Check:**
   - **Prompt Size:** Composed prompt > 400 lines? (base.md + specific prompt combined)
   - **File I/O:** Any file operations in server logic (except reading prompts)?
   - **Git Operations:** Any git commands in server code?
   - **TypeScript:** Strict mode violations, type safety issues
   - **Security:** Hardcoded values, exposed error details, missing validation
   - **Error Handling:** Unhandled exceptions, silent failures
   - **Testing:** Proper test structure, edge cases covered

5. Cross-reference with active tasks

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

3. **Systematic check for common issues:**
   - Prompt size validation (400-line limit enforced?)
   - File I/O constraints (only reading prompts?)
   - Type safety (TypeScript strict mode)
   - Error handling (try-catch patterns, error messages)
   - Testing coverage (prompt loading, composition, validation)
   - Security (no secrets, env variables used)

4. List critical issues found

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
