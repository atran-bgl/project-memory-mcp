/**
 * Fallback prompt for review tool
 * Used when project-specific review.md doesn't exist
 * Enforces actual code inspection over task-based review
 */
export const REVIEW_PROMPT = `# Code Review

**MANDATORY: Analyze ACTUAL CODE, not just tasks or summaries.**

Use extended thinking - think carefully and thoroughly. Always:
- Read the actual source files
- Analyze code quality, logic, potential bugs
- Check security implications thoroughly
- Verify alignment with architecture and conventions
- Consider edge cases and impact on existing code

## Choose Review Scope

Ask user what to review:
- "Review recent uncommitted changes" - git diff + code analysis
- "Review entire codebase" - Full code scan against standards
- "Review specific file or directory" - Focused code inspection

---

## For Recent Changes

**CRITICAL: MUST read the actual modified files (not just diff summary)**

1. Get list of changed files:
   \`git diff --name-only\` and \`git diff --cached --name-only\`

2. **READ THE ACTUAL CODE:**
   - Read each modified file in its entirety
   - Understand what changed and WHY
   - Analyze the logic and implementation
   - Compare against conventions.md for style adherence

3. **Code Analysis - OUTPUT REQUIRED:**
   \`\`\`
   📝 Code Review:
   Files: [list with line ranges if partial]

   Implementation Quality:
   - Logic correctness: [assessment]
   - Potential bugs: [list any found]
   - Security issues: [hardcoded secrets, .env, API keys, SQL injection, XSS, etc.]
   - Code style: [adheres to conventions? yes/no + issues]

   Architectural Impact:
   - Aligns with architecture.md: [yes/no + explanation]
   - Breaks any patterns/conventions: [list issues]
   - Affects other components: [what impact]
   \`\`\`

4. **Common Backend Issues - MUST CHECK:**
   - **Database**: N+1 queries, missing indexes, connection pool exhaustion, unclosed connections, transaction deadlocks, missing pagination on large queries
   - **Error Handling**: Unhandled exceptions, silent failures, generic error messages, missing try-catch blocks, improper async error handling, missing null checks
   - **Performance**: Blocking operations in async code, missing caching, inefficient algorithms, large unbatched requests, missing timeouts
   - **Resource Management**: Memory leaks, resource leaks, missing cleanup in finally/finally blocks, circular dependencies
   - **API Security**: Missing input validation, missing rate limiting, missing authentication/authorization checks, exposed error details, missing CORS validation
   - **Race Conditions**: Multiple concurrent requests to shared state, improper locking, stale data reads

5. **Common Frontend Issues - MUST CHECK:**
   - **Type Safety**: TypeScript violations (any types, missing null checks, unsafe casts), runtime type errors
   - **State Management**: Stale closures, infinite loops/recursion, circular state updates, missing state synchronization
   - **React-specific**: Missing dependency arrays in useEffect/useCallback, infinite rendering loops, missing keys in lists, improper prop drilling, memory leaks from subscriptions
   - **Async Issues**: Unhandled promise rejections, missing error boundaries, race conditions from concurrent requests, callback hell
   - **Edge Cases**: Off-by-one errors, boundary conditions, empty array handling, null/undefined coalescing

6. Cross-reference with active tasks (from project memory context)

---

## For Entire Codebase

**CRITICAL: MUST read actual source files systematically**

1. Audit all source files: read key files, scan others

2. **Codebase Analysis - OUTPUT REQUIRED:**
   \`\`\`
   🏗️ Code Health:

   Structure & Architecture:
   - Follows documented architecture.md: [yes/no]
   - Inconsistencies found: [list violations]

   Code Quality:
   - Convention adherence: [% estimated + violations]
   - Test coverage: [assess]
   - Documentation: [present/missing]

   Security & Performance:
   - Security vulnerabilities: [hardcoded secrets, .env, input validation, auth checks, etc.]
   - Backend issues: [N+1 queries, connection leaks, error handling, timeouts, etc.]
   - Frontend issues: [type safety, infinite loops, stale closures, missing dependencies, etc.]
   - Technical debt: [areas needing attention]
   \`\`\`

3. **Systematic check for common issues:**
   - Database queries (N+1, pagination, indexes, connections)
   - Error handling (unhandled exceptions, silent failures)
   - Type safety (TypeScript, null checks)
   - Resource management (leaks, cleanup)
   - Edge cases (boundaries, empty states, null coalescing)
   - Concurrency (race conditions, locks)

4. List critical issues found

---

## For Specific Area

**CRITICAL: READ all files in the specified path**

1. Get user-selected file/directory path
2. Read all source files in that area
3. Analyze: logic, quality, security, architectural fit
4. Compare against conventions and architecture
5. Check for common issues specific to the area:
   - Backend endpoints: error handling, validation, timeouts, N+1 queries, proper HTTP codes
   - Database code: connection management, query efficiency, indexes, pagination
   - Frontend components: type safety, state management, renders, memory leaks
   - Async code: error handling, race conditions, cancellation
   - Configuration: hardcoded values, secrets, environment variables

---

## Code Structure & Testability Score

Assess code quality on these dimensions (score /10):
- **Code clarity**: Intent, naming, readability
- **Documentation**: JSDoc, examples, comments
- **Type safety**: TS usage, any types, null checks
- **Modularity**: Separation, DRY, organization
- **Testability**: Unit testability, mock-ability
- **Error handling**: Exception handling, error clarity
- **Extensibility**: Cost of adding new features
- **Code duplication**: Repeated patterns

For each: provide score, notes, and improvement recommendations if <8/10.

---

## Next Steps

Propose updates via AskUserQuestion:
- Code issues found (severity: critical/high/medium/low + fix recommendations)
- Code structure assessment (with scores and improvement recommendations)
- Task status updates (if code implements active tasks)
- Architecture updates needed
- Security violations requiring immediate action

Get user approval before writing files.
`.trim();
