/**
 * Implement feature from spec and tasks
 * Validates spec reference, checks for code reuse, confirms modifications before implementation
 */
export const IMPLEMENT_FEATURE_PROMPT = `# Implement Feature

**MANDATORY: Spec-driven implementation with codebase reuse analysis and user confirmation.**

Before writing ANY code:
1. Ask for spec file and task reference
2. Validate spec exists and is clear
3. Audit codebase for reusable code
4. Confirm any modifications with user
5. Verify task acceptance criteria aligns with spec

---

## Step 0: Load Project Context - MANDATORY

**Before implementing any feature, you MUST have current project context.**

Read these files NOW if you haven't this session:
1. \`.project-memory/prompts/base.md\` - Core rules (Documentation ≤100 lines, Security: no hardcoded secrets, Task Completion criteria, Implementation: break down large features)
2. \`.project-memory/conventions.md\` - Code patterns, style guides, standards to follow
3. \`.project-memory/useful-commands.md\` - Available dev/build/test commands
4. \`.project-memory/architecture.md\` - Current system structure and components

**Verification Required - Output this:**
\`\`\`
✅ Project Context Loaded:
- Base Rules: [list 2-3 critical rules from base.md]
- Conventions: [list 2-3 key patterns from conventions.md]
- Commands: [list 2-3 key commands from useful-commands.md]
- Architecture: [list 2-3 key components from architecture.md]
\`\`\`

**CRITICAL: If you cannot list specifics from each file, you MUST read them now.**

Implementing without this context will violate project standards and patterns.

Do not proceed to Step 1 until you've verified and outputted the above.

---

## Step 1: Get Spec & Task Reference

**REQUIRED - Ask via AskUserQuestion:**
"To implement this feature, I need:
1. **Spec file path** - Where is the specification? (e.g., .project-memory/specs/feature-name.md)
2. **Task reference** - What task(s) are we implementing? (e.g., TASK-001, or leave blank to work on single spec)"

**CHECKPOINT:** Wait for user to provide both

---

## Step 2: Validate Spec & Tasks

**CRITICAL: Spec must be clear, tasks must have acceptance criteria and spec reference**

1. **Read the spec file:**
   - File must exist
   - Must have clear: overview, requirements, technical design, security, edge cases, acceptance criteria
   - Note: requirements, acceptance criteria, integration points

2. **Read active tasks:**
   - Run: \`cat .project-memory/tasks/tasks-active.json 2>/dev/null || echo "No tasks found"\`
   - If task reference provided: Find task(s) with matching ID
   - Verify each task has:
     - ✅ Clear acceptance criteria
     - ✅ **specReference** field linking to spec file
     - ✅ Descriptive title and description
   - If any task is missing acceptance criteria or spec reference:
     - **STOP** and ask user via AskUserQuestion:
     "Task [ID] is missing:
     - Acceptance criteria: [yes/no]
     - Spec reference: [yes/no]

     Please update task before proceeding."

3. **OUTPUT REQUIRED:**
\`\`\`
📋 Spec & Task Validation:
- Spec: [filename] ✅
- Spec status: [Clear/Needs clarification]
- Tasks to implement: [TASK-XXX, ...]
- Task acceptance criteria: ✅ [all present]
- Task spec references: ✅ [all present]
\`\`\`

**CHECKPOINT:** All validations must pass before proceeding

---

## Step 3: Check Tech Stack & Dependencies

**MANDATORY: Verify new dependencies and compatibility before implementation.**

1. **Identify if feature requires new tech stack/libraries:**
   - Review spec requirements (from Step 2)
   - Check if existing project dependencies can handle the feature
   - List any new libraries, frameworks, or tools needed

2. **If new dependencies required:**

   **a) Fetch latest versions using WebFetch:**
   - For npm packages: Use WebFetch on \`https://registry.npmjs.org/[package-name]/latest\`
   - For other ecosystems: Use appropriate registry (PyPI, RubyGems, crates.io, etc.)
   - Get: Latest stable version, release date, description
   - Example: "Checking latest version of 'zod' for schema validation"

   **b) Check compatibility with existing project:**
   - Read \`package.json\` (or \`requirements.txt\`, \`Cargo.toml\`, \`go.mod\`, etc.)
   - Identify existing dependency versions (Node, Python, framework versions)
   - Use WebFetch to check new package compatibility:
     - Check package documentation for version requirements
     - Check for peer dependency conflicts
     - Verify compatibility with current runtime version

   **c) Output findings:**
   \`\`\`
   📦 Dependencies Analysis:

   Proposed: [package-name@version]
   Latest Version: [version from registry]
   Purpose: [why needed for this feature]

   Compatibility Check:
   ✅ Compatible with Node [current-version]
   ✅ Compatible with [existing-framework@version]
   ⚠️ Requires peer dependency: [package@version]
   ❌ Conflicts with [existing-package] - requires migration

   Recommendation: [proceed / needs resolution / consider alternative]
   \`\`\`

   **d) If conflicts found:**
   - Ask via AskUserQuestion: "Dependency conflict detected. How should we proceed?"
     - Options: "Use alternative package" / "Plan migration strategy" / "Reconsider implementation approach"

3. **If no new dependencies needed:**
   - Output: "✅ Feature can be implemented with existing tech stack"

**CHECKPOINT:** Resolve all dependency issues before proceeding to codebase audit.

---

## Step 4: Audit Codebase for Reusable Code

**CRITICAL: Find existing functions/methods that can be reused or adapted**

1. **Read project memory:**
   - .project-memory/architecture.md (system structure)
   - .project-memory/conventions.md (coding patterns)

2. **Scan codebase for reusable patterns:**

   Based on spec requirements, search for:
   - Similar features already implemented
   - Common functions (validation, error handling, API calls, database queries)
   - Utility libraries (auth, logging, formatting)
   - Middleware or decorators matching requirements
   - Models/schemas that could be extended

   **For each requirement in spec:**
   - Search codebase: \`grep -r "keyword" src/ --include="*.ts" --include="*.tsx"\`
   - Read relevant files to understand existing implementation
   - Note: function name, file path, signature, what it does

3. **OUTPUT REQUIRED:**
\`\`\`
🔍 Codebase Reuse Analysis:

Requirement: [from spec]
  Existing code found: [yes/no]
  - Function: [name] at [file:line]
  - What it does: [description]
  - Can reuse as-is: [yes/no]
  - Needs modification: [yes/no + what changes]
  - Recommendation: [reuse / adapt / rebuild]

[Repeat for each major requirement]

Summary:
- Reusable as-is: [count] functions
- Requires adaptation: [count] functions
- New code needed: [count] functions
\`\`\`

**CHECKPOINT:** Reuse analysis complete

---

## Step 5: Propose Code Reuse & Modifications

**Ask user confirmation for any reuse or modifications**

For each function that needs modification, ask via AskUserQuestion:

"Reuse Analysis for Requirement: [requirement]

**Option 1: Reuse existing function as-is**
- Function: [name]
- File: [path:line]
- Pro: No changes needed, maintains consistency
- Con: [any limitations]

**Option 2: Adapt existing function**
- Current: [brief description]
- Proposed changes: [specific modifications]
- Pro: Reuses core logic, reduces duplication
- Con: Requires testing modified function

**Option 3: Write new function**
- Pro: No dependencies on existing code
- Con: Duplicates logic, harder to maintain

**Choose option for this requirement:**"

**Wait for user decision before proceeding**

**OUTPUT REQUIRED:**
\`\`\`
✅ Reuse Confirmation:

[Requirement 1]: [Option X - description]
[Requirement 2]: [Option X - description]

Modifications to existing code:
- [Function name] in [file]: [changes to make]
- User confirmed: ✅

New functions to write:
- [Function 1]
- [Function 2]
\`\`\`

---

## Step 6: Verify Task Acceptance Criteria Aligns with Spec

**Before implementing each task, confirm acceptance criteria matches spec**

For each task in TASK list:

1. **Read task acceptance criteria** from tasks-active.json
2. **Read spec section** referenced in task's specReference
3. **Compare:**
   - Do acceptance criteria fully cover spec requirements? [yes/no]
   - Any missing acceptance criteria from spec? [list]
   - Any acceptance criteria beyond spec scope? [list]
4. **Ask user if misalignment found:**
   "Task [ID] acceptance criteria may not fully align with spec:

   Missing from criteria:
   - [spec requirement not in acceptance criteria]

   Should we:
   1. Update task acceptance criteria to match spec
   2. Update spec to match acceptance criteria
   3. Keep both and implement both

   Choose before proceeding with [task-id]"

**OUTPUT REQUIRED:**
\`\`\`
✅ Task-Spec Alignment:

TASK-001:
  - Spec reference: [file]
  - Acceptance criteria matches spec: ✅
  - Additional requirements found: [none/list]

[Repeat for each task]

Status: ✅ Ready to implement
\`\`\`

**CHECKPOINT:** All tasks aligned with spec

---

## Step 7: Implement Feature

**NOW implement, with spec alignment checks per task**

1. **For each task in order:**

   a. **Pre-implementation spec check:**
      - Re-read spec section for this task
      - Re-read task acceptance criteria
      - Confirm understanding is correct

   b. **Implement:**
      - Write code following conventions.md
      - Use reusable code from Step 4
      - Apply modifications confirmed in Step 4
      - Handle edge cases from spec
      - Include security measures from spec
      - Add error handling per spec

   c. **Verify against acceptance criteria:**
      - Code implements all acceptance criteria: [yes/no]
      - Code aligns with spec: [yes/no]
      - Added logging/monitoring as needed: [yes/no]
      - Tested edge cases: [yes/no]

   d. **Move to next task**

2. **Test:**
   - Build: \`npm run build\`
   - Tests: \`npm test\`
   - Type checks pass: ✅
   - All tests pass: ✅

3. **OUTPUT:**
\`\`\`
✅ Feature Implementation Complete:

Tasks implemented:
- TASK-001: [description] ✅
- TASK-002: [description] ✅

Code reuse applied:
- [existing function] reused in [new code] ✅
- [existing function] adapted: [changes] ✅

Build & tests:
- Build: ✅ Success
- Tests: ✅ All passed
- Type safety: ✅ No errors

Acceptance criteria:
- All tasks meet acceptance criteria: ✅
- All code aligns with spec: ✅
\`\`\`

---

## Rules

- **Always get spec & task reference first** - Never guess or assume
- **Validate spec exists and is clear** - If ambiguous, ask user for clarification
- **Validate task acceptance criteria** - Must be clear and reference spec
- **Audit codebase thoroughly** - Find ALL reusable code before writing new code
- **Ask user for confirmation** - Any modifications to existing code need approval
- **Check alignment before implementing each task** - Compare acceptance criteria to spec
- **Re-check spec before implementing** - Keep spec top-of-mind throughout implementation
- **Test thoroughly** - Build + tests + type checks must all pass
- **Document decisions** - Explain why code was reused, adapted, or newly written

---

## Checklist Before Starting Code

- ✅ User provided spec file path
- ✅ User provided task reference(s)
- ✅ Spec file exists and is clear
- ✅ All tasks have acceptance criteria
- ✅ All tasks have specReference field
- ✅ Codebase audited for reusable code
- ✅ User confirmed code reuse options
- ✅ User confirmed required modifications
- ✅ Task acceptance criteria aligned with spec
- ✅ Ready to implement

Done!
`.trim();
