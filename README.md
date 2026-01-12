# Project Memory MCP

A Model Context Protocol (MCP) server that provides AI-driven project memory management through structured prompts. This server acts as a **pure prompt provider** - it never touches your files directly. Instead, it returns instructions for Claude to execute using its standard tools.

## What is This?

`project-memory-mcp` helps Claude manage your project context by:

- **Parsing tasks** from specs and implementation plans
- **Reviewing code** before commits
- **Syncing project memory** with commit history
- **Maintaining project documentation** (architecture, conventions, commands)

All operations are performed by Claude using its Read, Write, Edit, and Bash tools after getting your approval.

## Key Features

✅ **Pure prompt provider** - No file access, only returns instructions
✅ **Interface-agnostic** - Works with Claude Desktop, Claude Code CLI, or custom clients
✅ **No API costs** - Uses your existing Claude subscription
✅ **User approval required** - Claude asks before making any changes
✅ **Project-specific prompts** - Customized during initialization for your stack
✅ **200-line limit** - Prevents context bloat

## Installation

Install globally from GitHub:

```bash
npm install -g git+https://github.com/atran-bgl/project-memory-mcp.git
```

## Setup

### Configure MCP in Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
	"mcpServers": {
		"project-memory": {
			"type": "stdio",
			"command": "project-memory-mcp"
		}
	}
}
```

### Configure MCP in Claude Code CLI

Add to your user config at `~/.claude.json`:

```json
{
	"mcpServers": {
		"project-memory": {
			"type": "stdio",
			"command": "project-memory-mcp"
		}
	}
}
```

This will make the mcp available in all your project.

### Restart Claude

Restart Claude Desktop or Claude Code CLI to load the MCP server.

## Usage

### Initialize Project Memory

In your project directory, ask Claude:

```
"Initialize project memory"
```

Claude will:

1. Create `.project-memory/` folder structure
2. Analyze your project (language, frameworks, structure, conventions)
3. Generate and customize project-specific prompts (base.md, parse-tasks.md, review.md, sync.md)
4. Populate initial documentation files (architecture.md, conventions.md, useful-commands.md) with detected project info
5. Add session-start checklist to CLAUDE.md (ensures project memory is loaded every session)

**Important:** Each prompt file is limited to ≤ 200 lines to prevent context bloat.

### Parse Tasks from Specs

Add a spec file to `.project-memory/specs/feature-name.md`, then ask Claude:

```
"Parse tasks from the spec"
```

Claude will:

1. Read the spec file
2. Extract tasks with IDs, descriptions, acceptance criteria, dependencies
3. Show you the parsed tasks
4. After approval, add them to `.project-memory/tasks/tasks-active.json`

### Review Code Before Committing

Before committing, ask Claude:

```
"Review my changes"
```

Claude will:

1. Get `git diff` and `git diff --cached`
2. Read current tasks and architecture
3. Analyze code for issues
4. Propose task status updates
5. After approval, update project memory

### Sync After Commits

After committing, ask Claude:

```
"Sync project memory"
```

Claude will:

1. Get recent commit history
2. Determine completed tasks
3. Update commit log (last 20 commits)
4. Update architecture if changed
5. After approval, apply updates

### Organize Existing CLAUDE.md

For existing projects with verbose CLAUDE.md files, ask Claude:

```
"Organize my CLAUDE.md into project memory"
```

Claude will:

1. Read and analyze your CLAUDE.md
2. Identify sections: architecture, conventions, commands, tasks, specs
3. Show migration plan with line numbers
4. After approval, migrate content to `.project-memory/` files
5. Replace verbose sections with minimal references in CLAUDE.md

**Example migration:**

- Architecture (75 lines) → `.project-memory/architecture.md`
- Conventions (60 lines) → `.project-memory/conventions.md`
- Commands (30 lines) → `.project-memory/useful-commands.md`
- Tasks → `.project-memory/tasks/tasks-active.json`
- Specs → `.project-memory/specs/*.md`

**Result:** CLAUDE.md stays clean with just references, detailed content lives in organized files.

### Create Spec from Requirements

When you have a feature idea or requirements, ask Claude:

```
"Create a spec for user authentication"
```

Claude will:

1. Clarify ambiguous requirements
2. Validate against existing codebase
3. Consider security, edge cases, and testing
4. Write spec to `.project-memory/specs/`

### Refresh Prompts

When prompt templates have been updated, ask Claude:

```
"Refresh project memory prompts"
```

Claude will:

1. Backup existing prompts
2. Compare with new templates
3. Preserve your customizations
4. Merge improvements into updated prompts

### Proactive Prompting

After initialization, Claude will automatically:

- **Session start:** Read project memory files (tasks, architecture, conventions) before working
- **When you provide a spec:** Offer to parse tasks
- **Before commits:** Offer to review changes
- **After commits:** Offer to sync project memory

## Project Structure

After initialization, your project will have:

```
.project-memory/
├── tasks/
│   ├── tasks-active.json       # Active and in-progress tasks
│   └── tasks-completed.json    # Completed tasks
├── specs/
│   └── *.md                    # Immutable spec files (you create these)
├── prompts/
│   ├── base.md                 # Core instructions (≤200 lines)
│   ├── parse-tasks.md          # Task parsing workflow (≤200 lines)
│   ├── review.md               # Code review workflow (≤200 lines)
│   ├── sync.md                 # Post-commit sync workflow (≤200 lines)
│   └── languages/              # Optional language-specific extensions
├── architecture.md             # Project architecture docs
├── conventions.md              # Coding conventions
├── useful-commands.md          # Common commands
└── commit-log.md               # Last 20 commits
```

## Task Schema

Tasks follow this structure:

```json
{
	"id": "TASK-001",
	"title": "Brief description",
	"description": "Detailed description",
	"status": "pending | in_progress | completed",
	"priority": "low | medium | high | critical",
	"acceptanceCriteria": ["criterion 1", "criterion 2"],
	"dependencies": ["TASK-000"],
	"subtasks": [
		{
			"id": "TASK-001-1",
			"title": "Sub-task title",
			"status": "pending",
			"acceptanceCriteria": ["optional"]
		}
	],
	"specReference": "specs/feature-auth.md",
	"complexity": "simple | moderate | complex",
	"createdAt": "2025-01-15T10:00:00Z",
	"updatedAt": "2025-01-16T14:30:00Z",
	"completedAt": null
}
```

## MCP Tools

The server exposes 7 tools (all return prompts only):

### `init`

Initialize project memory system. Run once per project.

### `parse-tasks`

Parse tasks from spec files or implementation plans. Checks existing tasks AND codebase to avoid duplicates.

### `review`

Review uncommitted code changes against project context. Uses extended thinking for thorough analysis.

### `sync`

Sync project memory with recent commits. Ensures CLAUDE.md never has outdated references.

### `organize`

Organize existing CLAUDE.md into project-memory structure. Migrates architecture, conventions, commands, tasks, and specs from verbose CLAUDE.md to organized files.

### `create-spec`

Create detailed specification from user requirements. Clarifies ambiguity, validates against codebase, considers security and edge cases.

### `refresh-prompts`

Update project-specific prompts with latest template improvements while preserving customizations. Backs up existing prompts before changes.

## How It Works

```
┌─────────────────────────────────────┐
│ Claude (your subscription)          │
│ - Analyzes prompts                  │
│ - Uses Read/Write/Edit/Bash tools   │
│ - Asks for user approval            │
└──────────────┬──────────────────────┘
               │ MCP protocol
               ▼
┌─────────────────────────────────────┐
│ project-memory-mcp Server           │
│ - Returns prompt text only          │
│ - NO file operations                │
│ - NO git commands                   │
└─────────────────────────────────────┘
```

## Architecture Principles

1. **MCP is a pure prompt provider**
    - Only returns text instructions
    - Never reads/writes project files
    - Never executes git commands

2. **Claude does all the work**
    - Uses standard tools (Read, Write, Edit, Bash)
    - User sees all operations
    - Requires approval via AskUserQuestion

3. **Project-specific customization**
    - Prompts tailored to your tech stack
    - Language-specific guidelines
    - Framework conventions

4. **200-line limit per prompt**
    - Prevents context bloat
    - Keeps prompts focused
    - Enforced during init

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:

- Prompt length validation (200-line limit)
- Prompt composition
- Edge cases

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Links

- [Spec](./spec.md) - Detailed specification
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Repository](https://github.com/atran-bgl/project-memory-mcp)

## Support

For issues, questions, or feedback:

- [GitHub Issues](https://github.com/atran-bgl/project-memory-mcp/issues)

---

**Note:** This MCP server requires Claude Desktop, Claude Code CLI, or another MCP-compatible client to function.
