/**
 * Create spec from user message or file content
 * Ensures project memory is synced, validates against codebase, considers security/maintainability
 * Supports modular specs (≤200 lines each) to avoid token limits
 */
export const CREATE_SPEC_PROMPT = `# Create Specification

Create detailed, actionable spec from user requirements, validated against existing codebase.

**CRITICAL: Specs must be clear for coding agents, secure, maintainable, with test cases.**
**CRITICAL: Each spec file ≤200 lines. If total content >400 lines, MUST use modular specs.**
**CRITICAL: Modular specs MUST be in folder: \`.project-memory/specs/[feature-name]/\`**

---

## Step 0: Load Project Context & Rules - MANDATORY

**Before creating any spec, you MUST read and understand project rules.**

Read these files NOW if you haven't this session:
1. **\`.project-memory/prompts/base.md\`** - READ for Forbidden Actions, Scope & Authority, Business Logic & UI/UX Protection
2. **\`.project-memory/conventions.md\`** - READ for Forbidden Actions and Code Style rules
3. \`.project-memory/useful-commands.md\` - Available commands
4. \`.project-memory/architecture.md\` - System structure

**Verification Required - Output this:**
\`\`\`
✅ Project Context Loaded:

FORBIDDEN ACTIONS (from base.md & conventions.md):
[List ALL forbidden actions - typically 11+ items]

Base Rules: [list 2-3 critical rules from base.md]
Conventions: [list 2-3 key patterns from conventions.md]
Commands: [list 2-3 key commands from useful-commands.md]
Architecture: [list 2-3 key components from architecture.md]
\`\`\`

**CRITICAL: If you cannot list the forbidden actions, you MUST read base.md and conventions.md now.**

When creating specs, ensure they don't require any forbidden actions for implementation.

Do not proceed to Step 1 until you've verified and outputted the above.

---

## Step 1: Initialize & Sync Project Memory

**REQUIRED - Do NOT skip:**
1. Check if \`.project-memory/\` exists: \`ls -la .project-memory 2>/dev/null\`
2. If NOT exists → Run \`project-memory init\` first, then return to this workflow
3. If exists → Run \`project-memory sync\` to ensure latest codebase state
4. **CHECKPOINT:** Wait for sync completion before proceeding

---

## Step 2: Determine Spec Structure

**Analyze requirements and recommend structure:**

**Complexity Levels:**
- **LOW:** Single domain, 1-2 components, no external integrations
- **MEDIUM:** 2 domains, 3-5 components, 1-2 integrations
- **HIGH:** 3+ domains, 6+ components, 3+ integrations, or affects core architecture

**Spec Structure:**
- **SINGLE SPEC:** LOW complexity, <200 lines
- **MODULAR SPECS:** MEDIUM/HIGH complexity, >400 lines, or multiple domains

**Output your analysis:**
\`\`\`
Recommendation: [SINGLE | MODULAR]
Reasoning: [1-2 sentences on why]
Estimated lines: [rough estimate]
Complexity: [LOW | MEDIUM | HIGH]
\`\`\`

**If complexity is HIGH (large scope, multiple domains, complex integrations):**
- Use EnterPlanMode tool to thoroughly explore codebase before creating spec
- Plan mode will help design the specification approach and get user approval
- STOP here and enter plan mode

**If complexity is LOW/MEDIUM:**
- Ask user via AskUserQuestion: "I recommend [SINGLE/MODULAR] spec because [reason]. Proceed?"
- If MODULAR, plan structure:
  - overview.md (≤100 lines)
  - backend.md, frontend.md (≤200 lines each) [if needed]
  - security.md (≤200 lines) [if security-critical]
  - tests.md, tasks.md (≤200 lines each)

---

## Step 3: Gather Requirements & Context

**Read user requirements:**
- If user provided file path → Read the file
- If user provided message → Use message content
- Extract: Feature description, user story, acceptance criteria, constraints

**Clarify ambiguity - Ask via AskUserQuestion:**
- Unclear requirements? Ask specific questions
- Missing user story? Ask: "What problem does this solve? Who is the user?"
- Vague acceptance criteria? Ask: "What defines 'done' for this feature?"
- Technology choices? Ask: "Any specific libraries/patterns to use or avoid?"

**Ask for larger context - MANDATORY:**
"To write a comprehensive spec, I need context:
1. Is this module part of a larger system/ecosystem? (microservices, monorepo, standalone)
2. Are there external integrations or APIs this will interact with?
3. Are there performance/security requirements? (SLA, compliance, data sensitivity)
4. Who are the users? (internal devs, end users, admins)
5. Any existing patterns/conventions I should follow?
6. What's the expected scale/load?
7. Is there domain knowledge I need to research? (industry standards, protocols, regulations)
   - If yes: Ask permission via AskUserQuestion: 'May I search the web to research [domain topic]?'"

**CHECKPOINT:** Get user answers before proceeding

---

## Step 4: Check Tech Stack & Dependencies

**MANDATORY: Verify new dependencies and compatibility before spec creation.**

1. **Identify if feature requires new tech stack/libraries:**
   - Review requirements from Step 3
   - Check if existing project dependencies can handle the feature
   - List any new libraries, frameworks, or tools needed

2. **If new dependencies required:**

   **a) Fetch latest versions using WebFetch:**
   - For npm packages: Use WebFetch on \`https://registry.npmjs.org/[package-name]/latest\`
   - For other ecosystems: Use appropriate registry (PyPI, RubyGems, crates.io, etc.)
   - Get: Latest stable version, release date, description
   - Example: "Checking latest version of 'express-rate-limit' for API rate limiting"

   **b) Check compatibility with existing project:**
   - Read \`package.json\` (or \`requirements.txt\`, \`Cargo.toml\`, \`go.mod\`, etc.)
   - Identify existing dependency versions (Node, Python, framework versions)
   - Use WebFetch to check new package compatibility:
     - Check package documentation for version requirements
     - Check for peer dependency conflicts
     - Verify compatibility with current runtime version

   **c) Output findings:**
   \`\`\`
   📦 New Dependencies Analysis:

   Proposed: [package-name@version]
   Latest Version: [version from registry]
   Purpose: [why needed]

   Compatibility Check:
   ✅ Compatible with Node [current-version]
   ✅ Compatible with [existing-framework@version]
   ⚠️ Requires peer dependency: [package@version]
   ❌ Conflicts with [existing-package] - requires migration

   Recommendation: [proceed / needs resolution / consider alternative]
   \`\`\`

   **d) If conflicts found:**
   - Ask via AskUserQuestion: "Dependency conflict detected. How should we proceed?"
     - Options: "Use alternative package" / "Plan migration strategy" / "Reconsider feature approach"

3. **If no new dependencies needed:**
   - Output: "✅ Feature can be implemented with existing tech stack"

**CHECKPOINT:** Resolve all dependency issues before proceeding to codebase analysis.

---

## Step 5: Analyze Existing Codebase

**CRITICAL: Validate requirements against actual code implementation.**

**Required analysis:**
1. Read project memory:
   - .project-memory/architecture.md
   - .project-memory/conventions.md
   - .project-memory/useful-commands.md
   - .project-memory/tasks/tasks-active.json
2. Read actual code:
   - package.json, tsconfig.json (tech stack)
   - src/, lib/, components/ (structure)
   - tests/ (testing patterns)
   - Relevant modules that will interact with new feature
3. Identify:
   - Existing patterns (API design, error handling, validation)
   - Tech stack compatibility (does requirement fit?)
   - Integration points (where new feature connects)
   - Similar features (learn from existing implementations)

**Flag inconsistencies - OUTPUT REQUIRED:**
- **Conflicts:** [Requirements that contradict existing architecture]
- **Missing dependencies:** [New libraries needed]
- **Breaking changes:** [Existing code that needs modification]
- **Compatibility issues:** [Tech stack or pattern mismatches]

**CHECKPOINT:** If conflicts found, ask user: "Found X inconsistencies. How should we proceed?"

---

## Step 6: Design Specification Content

### For SINGLE SPEC (≤200 lines):

**Include these sections (concise):**
1. **Overview:** Purpose, scope, user story
2. **Requirements:** Functional, non-functional
3. **Technical Design:** Architecture, components, data flow, integration points
4. **Security:** Auth, validation, secrets, OWASP
5. **Edge Cases:** Error scenarios, fallbacks, logging
6. **Testing:** Unit/integration/E2E/security tests
7. **Tasks:** Implementation steps (brief)
8. **Maintainability:** Follow conventions, documentation strategy

**Keep ≤200 lines total**

---

### For MODULAR SPECS (multiple files in \`.project-memory/specs/[feature-name]/\`):

**Create folder and files:**

**1. overview.md (≤100 lines):**
- Purpose, user story, scope, context
- Related specs (links), high-level architecture
- Success criteria

**2. backend.md (≤200 lines):** [if backend work]
- API endpoints, database schema, business logic
- Data flow, integration, error handling

**3. frontend.md (≤200 lines):** [if frontend work]
- UI components, user flows, state management
- API integration, UX considerations

**4. security.md (≤200 lines):** [if security-critical]
- Auth/authorization, input validation, data protection
- OWASP Top 10, threat model, secure practices

**5. tests.md (≤200 lines):**
- Unit/integration/E2E/security tests
- Edge cases, test data, coverage

**6. tasks.md (≤200 lines):**
- Implementation plan, task breakdown, dependencies
- Acceptance criteria, risks

**Each file must:**
- Include "**Related Specs:**" section with links
- Stay ≤200 lines (≤100 for overview)
- Be independently readable

---

## Step 7: Validate Spec Against Codebase

**REQUIRED validation:**
1. **Architecture alignment:** Does design match existing patterns?
2. **Tech stack compatibility:** All dependencies available/compatible?
3. **Integration feasibility:** Can it connect to existing code without breaking changes?
4. **Security review:** Addresses auth, validation, secrets, OWASP?
5. **Test coverage:** Are all edge cases covered?
6. **Maintainability:** Follows conventions, reusable, documented?
7. **Line count:** Each file ≤200 lines (≤100 for overview)?

**OUTPUT REQUIRED - Show user:**
- ✅ **Validated:** [Aspects that align with codebase]
- ⚠️ **Warnings:** [Potential issues, needs user decision]
- ❌ **Blockers:** [Must be resolved before implementation]

**CHECKPOINT:** Get user approval on spec(s)

---

## Step 8: Write Spec File(s)

After approval:

### For SINGLE SPEC:

1. **Filename:** \`.project-memory/specs/[feature-name].md\`
2. **Header:**
\`\`\`markdown
# [Feature Name] Specification

**Status:** Draft | **Created:** [YYYY-MM-DD] | **Updated:** [YYYY-MM-DD]

> Immutable spec. Once approved, implementation follows this spec.

[... all sections from Step 5 ...]
\`\`\`
3. **Write using Write tool**
4. **Verify ≤200 lines**

### For MODULAR SPECS:

1. **Create folder:** \`.project-memory/specs/[feature-name]/\`
2. **Create each file in that folder:**
   - \`overview.md\` (≤100 lines)
   - \`backend.md\` (≤200 lines) [if needed]
   - \`frontend.md\` (≤200 lines) [if needed]
   - \`security.md\` (≤200 lines) [if needed]
   - \`tests.md\` (≤200 lines)
   - \`tasks.md\` (≤200 lines)

3. **Each file header:**
\`\`\`markdown
# [Feature Name] - [Domain] Specification

**Status:** Draft | **Created:** [YYYY-MM-DD]

**Related Specs:**
- [Overview](./overview.md)
- [Backend](./backend.md)
- [Frontend](./frontend.md)
- [Security](./security.md)
- [Tests](./tests.md)
- [Tasks](./tasks.md)

[... content ...]
\`\`\`

4. **Write all files using Write tool**
5. **Verify each ≤200 lines**

**Confirm:** Show all file paths to user

---

## Step 9: Parse Tasks (Optional)

Ask user via AskUserQuestion: "Spec(s) created. Parse tasks now?"

If yes:
- **Single spec:** Run \`project-memory parse-tasks\` on the spec file
- **Modular specs:** Run \`project-memory parse-tasks\` on tasks.md in the feature folder

---

## Rules

- **Always initialize/sync** project memory first (Step 1)
- **Analyze complexity** - If HIGH, use EnterPlanMode before creating spec (Step 2)
- **Recommend structure** - If >400 lines, MUST use modular specs (Step 2)
- **Modular specs folder** - Must be in \`.project-memory/specs/[feature-name]/\`
- **Clarify ambiguity** - Ask questions, don't guess (Step 3)
- **Ask for context** - Ecosystem, integrations, scale, users (Step 3)
- **Validate against code** - Flag conflicts, check compatibility (Step 4)
- **Focus on security** - Auth, validation, secrets, OWASP Top 10 (all specs)
- **Consider edge cases** - Errors, limits, failures, concurrency (all specs)
- **Include tests** - Unit, integration, E2E, security, edge cases (all specs)
- **Keep maintainable** - Follow conventions, document, reusable (all specs)
- **Write for agents** - Clear, actionable, unambiguous (all specs)
- **Respect line limits** - Each file ≤200 lines (overview ≤100)
- **Cross-reference** - Modular specs must link to related files

Done!
`.trim();
