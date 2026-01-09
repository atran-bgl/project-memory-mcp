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

## Critical Issues to Check (All Review Paths)

**Common Backend Issues - MUST CHECK in ALL reviews:**
- **Database**: N+1 queries, missing indexes, connection pool exhaustion, unclosed connections, transaction deadlocks, missing pagination on large queries
- **Error Handling**: Unhandled exceptions, silent failures, generic error messages, missing try-catch blocks, improper async error handling, missing null checks
- **Performance**: Blocking operations in async code, missing caching, inefficient algorithms, large unbatched requests, missing timeouts
- **Resource Management**: Memory leaks, resource leaks, missing cleanup in finally/finally blocks, circular dependencies
- **API Security**: Missing input validation, missing rate limiting, missing authentication/authorization checks, exposed error details, missing CORS validation
- **Race Conditions**: Multiple concurrent requests to shared state, improper locking, stale data reads

**Common Frontend Issues - MUST CHECK in ALL reviews:**
- **Type Safety**: TypeScript violations (any types, missing null checks, unsafe casts), runtime type errors
- **State Management**: Stale closures, infinite loops/recursion, circular state updates, missing state synchronization
- **React-specific**: Missing dependency arrays in useEffect/useCallback, infinite rendering loops, missing keys in lists, improper prop drilling, memory leaks from subscriptions
- **Async Issues**: Unhandled promise rejections, missing error boundaries, race conditions from concurrent requests, callback hell
- **Edge Cases**: Off-by-one errors, boundary conditions, empty array handling, null/undefined coalescing

---

## For Recent Changes

**CRITICAL: MUST read the actual modified files (not just diff summary)**

1. **Ask for relevant specs and tasks** via AskUserQuestion:
   "What specs or tasks are these changes related to?"
   - Provide spec file path(s) and/or task ID(s)
   - Leave blank if no specific task/spec

2. **If user provided specs/tasks:**
   - Read the spec file(s) - understand requirements and acceptance criteria
   - Read the task(s) - note acceptance criteria and specReference
   - **Keep spec requirements and acceptance criteria in mind for verification in step 5**

3. Get list of changed files:
   \`git diff --name-only\` and \`git diff --cached --name-only\`

4. **READ THE ACTUAL CODE:**
   - Read each modified file in its entirety
   - Understand what changed and WHY
   - Analyze the logic and implementation
   - Compare against conventions.md for style adherence

5. **Code Analysis - OUTPUT REQUIRED:**
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

6. **Verify Against Spec & Acceptance Criteria** (if user provided specs/tasks in step 2):
   \`\`\`
   📋 Spec & Acceptance Criteria Verification:

   Spec: [filename]
   Task: [task ID if applicable]

   Requirements vs Implementation:
   - Requirement 1: [implemented correctly / partially / missing / extra code not in spec]
   - Requirement 2: [status]
   - [... all spec requirements checked ...]

   Acceptance Criteria Compliance:
   - Criterion 1: [met / not met]
   - Criterion 2: [met / not met]
   - [... all acceptance criteria checked ...]

   Inconsistencies Found:
   - [Severity]: [specific inconsistency between code and spec/criteria]
   - [Severity]: [next issue]
   \`\`\`

   **Flag any:**
   - Missing features from spec
   - Extra code not in spec requirements
   - Failed acceptance criteria
   - Code that contradicts spec design

7. **Check Critical Issues** (see "Critical Issues to Check" section above)
   - Apply all backend and frontend issue checks to modified files
   - Note any issues found by category

8. Cross-reference with active tasks (from project memory context)

---

## For Entire Codebase

**CRITICAL: MUST read actual source files systematically**

1. **Use Explore Agent for Codebase Scanning** (Recommended for efficiency)

   Launch the Explore agent to systematically scan the codebase:
   - Task type: Use "Explore" agent (subagent_type: 'Explore')
   - Thoroughness: Use 'very thorough' for comprehensive analysis
   - Search for:
     * File structure and organization
     * Key architecture patterns and modules
     * Common issues (N+1 queries, error handling, type safety)
     * Security patterns (hardcoded secrets, validation, auth)
     * Testing coverage and patterns
   - Ask Explore agent: "Provide codebase overview with file structure, architecture patterns, and identify potential issues across backend/frontend"

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

3. **Apply Critical Issues checklist** (see "Critical Issues to Check" section above)
   - Check all backend issues across entire codebase
   - Check all frontend issues across entire codebase
   - Categorize findings by severity

4. List critical issues found

---

## For Specific Area

**CRITICAL: READ all files in the specified path**

1. **Ask for relevant specs and tasks** via AskUserQuestion:
   "What specs or tasks are these changes related to?"
   - Provide spec file path(s) and/or task ID(s)
   - Leave blank if no specific task/spec

2. **If user provided specs/tasks:**
   - Read the spec file(s) - understand requirements and acceptance criteria
   - Read the task(s) - note acceptance criteria and specReference
   - **Keep spec requirements and acceptance criteria in mind for verification in step 6**

3. Get user-selected file/directory path

4. **Use Explore Agent for Targeted Scanning** (Optional, for efficiency)

   For larger areas, consider using Explore agent:
   - Task type: Use "Explore" agent (subagent_type: 'Explore')
   - Thoroughness: Use 'medium' for focused exploration
   - Query: "Explore [user-provided path] and identify: file structure, key functions/components, potential issues"

5. Read all source files in that area
6. Analyze: logic, quality, security, architectural fit
7. Compare against conventions and architecture
8. **Verify Against Spec & Acceptance Criteria** (if user provided specs/tasks in step 2):
   - Check if implementation matches all spec requirements
   - Verify all acceptance criteria are met
   - Flag missing features, extra code, failed criteria, or contradictions
   - Provide detailed inconsistency report (see format in "For Recent Changes" section)

9. **Apply Critical Issues checklist** (see "Critical Issues to Check" section above)
   - Check all backend issues relevant to area
   - Check all frontend issues relevant to area
10. Identify area-specific concerns:
   - Backend endpoints: error handling, validation, timeouts, proper HTTP codes
   - Database code: connection management, query efficiency, pagination
   - Frontend components: renders, component composition
   - Async code: cancellation, cleanup
   - Configuration: hardcoded values, secrets

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
