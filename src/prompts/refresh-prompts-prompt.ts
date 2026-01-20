/**
 * Refresh project-specific prompts with new templates while preserving customizations
 * Used when prompt system evolves and users want to update their projects
 */
export const REFRESH_PROMPTS_PROMPT = `# Refresh Project Memory Prompts

Update prompt templates with latest improvements while preserving project-specific customizations.

**CRITICAL: Backup existing prompts before any changes. Get user approval for all modifications.**

---

## Step 1: Verify & Backup

**REQUIRED checks:**
1. Check if \`.project-memory/prompts/\` exists: \`ls -la .project-memory/prompts/ 2>/dev/null\`
2. If NOT exists → **STOP**: "Project memory not initialized. Run \`project-memory init\` first."
3. **Create backup:** \`cp -r .project-memory/prompts .project-memory/prompts.backup-$(date +%Y%m%d-%H%M%S)\`
4. **Confirm backup:** Show backup path to user

**CHECKPOINT:** Wait for backup confirmation before proceeding

---

## Step 2: Detect Project Type (MANDATORY)

**Re-analyze codebase to determine project type:**

1. Read: package.json OR requirements.txt OR go.mod OR Cargo.toml
2. Scan: src/, lib/, components/, tests/ directories
3. Check: Is there UI code? API routes? Database? CLI commands?

**Classify project as ONE of:**
1. **Frontend-only** - Has UI components, no API/database
2. **Backend-only** - Has API/database, no UI components
3. **Full-stack** - Has BOTH frontend AND backend
4. **CLI/Library** - Has CLI commands or library exports, no UI/API

**OUTPUT REQUIRED:**
\`\`\`
📋 Project Type Detected: [Frontend-only / Backend-only / Full-stack / CLI/Library]

Reasoning:
- [explain based on codebase analysis]

Customizations needed:
- base.md: [will remove UI/UX / will remove backend sections / keep both / remove both]
- conventions.md: [same as base.md]
- review.md: [will remove frontend checks / backend checks / keep both / remove both]
- implement-feature.md: [will remove UI/UX checks / business logic checks / keep both / remove both]
\`\`\`

**CHECKPOINT:** User confirms project type detection is correct

---

## Step 3: Load & Compare Prompts

**IMPORTANT: Refresh ALL prompts including base.md and conventions.md based on project type**

**For each prompt file:**

1. **Read current prompt** from \`.project-memory/prompts/[file]\` or \`.project-memory/[file]\`
2. **Fetch new template** using these MCP tools:
   - \`mcp__project-memory__get-new-sync-prompt\` → sync.md
   - \`mcp__project-memory__get-new-review-prompt\` → review.md
   - \`mcp__project-memory__get-new-parse-tasks-prompt\` → parse-tasks.md
   - \`mcp__project-memory__get-new-create-spec-prompt\` → create-spec.md
   - \`mcp__project-memory__get-new-implement-feature-prompt\` → implement-feature.md
   - \`mcp__project-memory__get-new-self-reflect-prompt\` → self-reflect.md
   - For base.md: Generate from init Step 4 instructions with ALL sections (will be filtered in Step 5a)
   - For conventions.md: Generate from init Step 6 with ALL sections (will be filtered in Step 5a)
3. **Compare by sections** (not line-by-line) between current version and fetched new template to identify differences

**OUTPUT REQUIRED - For each file:**

\`\`\`
📄 [filename] Analysis:

✅ Template sections (standard workflow steps):
- [section name]: matches template

🔧 Customizations found (project-specific additions):
- [section]: "[custom rule or check]"

⚠️ Deprecated (removed in new template):
- [section or rule]

📊 New improvements (in new template):
- [section]: [what it adds]
\`\`\`

**CHECKPOINT:** Show analysis before proceeding

---

## Step 4: Ask About Additional Customizations

**MANDATORY QUESTION - Ask via AskUserQuestion:**

Besides the customizations we found, are there any OTHER improvements or customizations you want to apply to these prompts?

For example:
- Additional rules for review.md (code checks, security validations)
- Extra requirements for parse-tasks.md (acceptance criteria patterns)
- New enforcement rules for sync.md (validation checks, code verification steps)
- Enhancements for create-spec.md (new specification sections, quality gates)
- Custom workflows or patterns specific to your project

**Allow user to:**
1. "No, use defaults" - Skip additional customizations
2. "Yes, here are my changes:" - [User provides list of customizations]
3. "Show me what's possible" - [Show examples of common customizations]

**If user provides customizations:**
- Store them in memory for Step 6a
- These will be merged INTO the new templates alongside existing customizations

**CHECKPOINT:** Get user feedback

---

## Step 5: Ask User How to Proceed

**MANDATORY QUESTION - Ask via AskUserQuestion:**

"Analyzed prompt files. Found:
- X customizations across Y files
- Z deprecated sections
- N new template improvements

How should we refresh the prompts?

1. **Regenerate with new templates + preserve customizations** (Recommended)
   - Merges your customizations into updated templates
   - Re-analyzes codebase for project-specific content
   - You review merged result before applying

2. **Regenerate with new templates only**
   - Uses latest templates without customizations
   - Faster, but loses your project-specific rules
   - ⚠️ Warning: All customizations will be discarded

3. **Keep current prompts**
   - No changes made
   - Skip refresh entirely

4. **Show detailed diff first**
   - See side-by-side comparison for each file
   - Then choose option 1, 2, or 3"

**CHECKPOINT:** Get user choice

---

## Step 6a: If Option 1 - Merge Customizations

**Apply project-type customization (from Step 2) to ALL files:**

### 6a.1: Customize base.md and conventions.md Based on Project Type

**Project Type: [from Step 2]**

**For base.md:**
- **Frontend-only** → KEEP "UI/UX Protection", REMOVE backend-specific items if any
- **Backend-only** → REMOVE entire "UI/UX Protection" section and "❌ NO changing UI/UX" line
- **Full-stack** → KEEP both UI/UX and backend protections
- **CLI/Library** → REMOVE both UI/UX and backend protections

**Example for Backend-only projects - REMOVE these sections:**
\`\`\`
❌ NO changing UI/UX (copy, visual design, UX flows - frontend projects)

**UI/UX Protection (Frontend Projects):**
Don't change UI copy, visual design, or user flows. Follow existing design system.
Use existing components. Respect accessibility rules (ARIA, keyboard nav, contrast).
When unsure: ASK FIRST.
\`\`\`

**For conventions.md:**
Apply same Forbidden Actions customization as base.md

### 6a.2: Customize review.md Based on Project Type

- **Frontend-only** → REMOVE "Common Backend Issues" section
- **Backend-only** → REMOVE "Common Frontend Issues" section
- **Full-stack** → KEEP both sections
- **CLI/Library** → REMOVE both, add CLI-specific checks

### 6a.3: Customize implement-feature.md Based on Project Type

In Step 7.3a (protected areas check):
- **Frontend-only** → KEEP UI/UX Check, REMOVE Business Logic Check
- **Backend-only** → REMOVE UI/UX Check, KEEP Business Logic Check
- **Full-stack** → KEEP both checks
- **CLI/Library** → REMOVE both checks, add CLI-specific checks

### 6a.4: Merge User Customizations

**For each prompt file:**

1. **Start with NEW template** as base structure
2. **Identify customization insertion points:**
   - Language-specific rules → Add to relevant sections
   - Review checklists → Add to review.md checklist section
   - Task patterns → Add to parse-tasks.md task structure section
   - Special attention areas → Add to appropriate prompt sections

3. **Inject preserved customizations + user-requested changes:**
   - Merge BOTH: existing customizations (from Step 3) AND new user requests (from Step 4)
   - Match customization purpose to new template sections
   - Preserve custom language (user's words, not paraphrased)
   - Add comment markers: \`<!-- CUSTOM: [description] -->\` for future refreshes
   - Clearly mark NEW customizations from Step 4: \`<!-- NEW CUSTOM: [description] -->\`

### 6a.5: Verify Project-Type Customization

**OUTPUT REQUIRED - Confirm customizations applied:**
\`\`\`
✅ Project-Type Customization Complete:

Project Type: [Frontend-only / Backend-only / Full-stack / CLI/Library]

Files Customized:
- base.md: [removed UI/UX section / removed backend sections / kept both / removed both]
- conventions.md: [removed UI/UX section / removed backend sections / kept both / removed both]
- review.md: [removed backend checks / removed frontend checks / kept both / removed both]
- implement-feature.md: [removed UI/UX checks / removed business logic checks / kept both / removed both]

Example sections REMOVED (for verification):
[Paste 2-3 lines that were removed based on project type]

OR if full-stack:
[Confirm "Kept all protections - full-stack project"]
\`\`\`

4. **Show merged result - OUTPUT REQUIRED:**
   \`\`\`
   📝 Merged [filename]:

   New template sections: [list]
   Preserved customizations: [list with line numbers]
   Deprecated sections removed: [list]

   [Show full merged content or key sections]
   \`\`\`

**CHECKPOINT:** Ask user: "Review merged prompts. Approve to write files?"

5. **After approval - OVERWRITE existing files:**
   - **CRITICAL:** Write directly to \`.project-memory/prompts/[filename]\` or \`.project-memory/[filename]\`
   - **DO NOT** create \`.new\` files or any other suffix
   - **DO NOT** create backup copies here (already done in Step 1)
   - Use Write tool to overwrite:
     * parse-tasks.md, review.md, sync.md, create-spec.md, implement-feature.md, self-reflect.md
     * **base.md** (with project-type customization applied)
     * **conventions.md** (with project-type customization applied)
6. **Verify line counts:** base.md ≤ 250 lines, others ≤ 400 lines

---

## Step 6b: If Option 2 - Regenerate Without Customizations

**Warn user:**
"⚠️ This will discard all customizations. Are you sure?
- Lost customizations: [list what will be discarded]
- You can restore from backup at: [backup path]

Proceed?"

**If yes:**
1. Use project type from Step 2
2. Generate fresh prompts with new templates + project-type customization (same as Step 6a.1-6a.3)
3. **OVERWRITE existing files** - Write directly to \`.project-memory/prompts/[filename]\` or \`.project-memory/[filename]\`
   - **DO NOT** create \`.new\` files
   - Write: parse-tasks.md, review.md, sync.md, create-spec.md, implement-feature.md, self-reflect.md
   - **Include base.md and conventions.md** (with project-type customization)
4. **Do NOT include** old customizations
5. **Verify project-type customization** (same output as Step 6a.5)

---

## Step 6c: If Option 3 - Keep Current

**Confirm:** "Keeping current prompts. No changes made. Backup preserved at: [backup path]"

**STOP** - Exit workflow

---

## Step 5d: If Option 4 - Show Detailed Diff

**For each file, show side-by-side comparison:**

\`\`\`
📊 Diff for [filename]:

CURRENT (your version)          NEW TEMPLATE
─────────────────────          ────────────────
[line 1]                       [line 1]
[line 2] 🔧 CUSTOM             [line 2]
[line 3]                       [line 3]
...                            ...

Legend:
✅ Same in both
🔧 Custom (only in current)
📊 New (only in new template)
⚠️ Deprecated (removed in new)
\`\`\`

**After showing all diffs, return to Step 4**

---

## Step 6: Verify & Summarize

1. **List updated prompts:** \`ls -lh .project-memory/prompts/\`
2. **Show summary:**

\`\`\`
✅ Prompt refresh complete!

Updated files:
- parse-tasks.md ([X] lines)
- review.md ([Y] lines)
- sync.md ([Z] lines)

Skipped: base.md (project-specific, not refreshed)

Customizations preserved: [list from Step 2]
New customizations added: [list from Step 3 user request]
Template improvements merged: [list of new features]
Backup location: .project-memory/prompts.backup-[timestamp]/

Next steps:
- Test prompts with: project-memory parse-tasks, review, sync
- Restore from backup if needed: cp -r [backup path] .project-memory/prompts/
\`\`\`

---

## Rules

- **Skip base.md** - It's always project-specific, never refresh it
- **Only refresh workflow prompts** - parse-tasks.md, review.md, sync.md
- **OVERWRITE files directly** - Do NOT create .new files or any suffix
- **Always backup first** - Never modify without backup
- **Get user approval** - For analysis results and merged content
- **Preserve exact custom language** - Don't paraphrase user's customizations
- **Re-analyze codebase** - Ensure project-specific content is current
- **Line limits** - Each prompt ≤200 lines
- **Verify before writing** - Show merged result, get approval

Done!
`.trim();
