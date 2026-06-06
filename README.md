# learning-ver.sakura

AI-powered recursive learning system — turns your AI coding assistant into an interactive tutor using the Socratic method and TDD-style exercises.

Generate **project-aware** skill and command files for **30+ AI tools** (Claude Code, Cursor, Gemini CLI, Codex, Copilot, Windsurf, etc.), then use slash commands to systematically master any technical topic.

## Features

- **Project-Aware Skills** — Automatically detects your tech stack, frameworks, testing tools, and code style, then injects project context into generated skills
- **30+ AI Tools** — Supports Claude Code, Cursor, Gemini CLI, Codex, GitHub Copilot, Windsurf, and many more
- **5 Learning Workflows** — Topic, Explain, Practice, Review, Status
- **Localized** — English and Chinese (zh-CN) support
- **Japanese UI Theme** — Sakura-themed terminal interface

## Quick Start

```bash
# Initialize globally (default, skills installed to ~/.claude/)
npx learning-ver.sakura init --tools claude

# Initialize locally (skills installed to project directory)
npx learning-ver.sakura init --local --tools claude

# Chinese terminal output
npx learning-ver.sakura init --lang zh-CN

# Or install globally
npm install -g learning-ver.sakura
learning-sakura init
```

## What Gets Detected

When you run `init`, the tool scans your project and detects:

| What              | How                                                          |
| ----------------- | ------------------------------------------------------------ |
| **Language**      | TypeScript, JavaScript, etc. from `package.json`             |
| **Framework**     | React, Next.js, Vue, Express, Fastify, etc.                  |
| **Testing**       | Vitest, Jest, Playwright, Cypress, etc.                      |
| **Build Tools**   | Vite, Webpack, esbuild, tsup, etc.                           |
| **Project Type**  | Web App, CLI, Library, API, Monorepo                         |
| **Code Style**    | Indent, quotes, semicolons, naming convention, module system |
| **Key Libraries** | Tailwind, Prisma, database drivers, styling tools            |

The detected info is injected into every skill file:

```
🔍 Project detected:

   Language:   TypeScript ^5.9.0
   Framework:  Next.js ^15.0.0
   Testing:    Vitest
   Type:       web-app
```

Generated skills will include this context so the AI uses your actual stack when teaching:

```markdown
## Project Context (auto-detected)

- **Language**: TypeScript ^5.9.0
- **Framework**: Next.js ^15.0.0
- **Project Type**: Web Application
- **Testing**: Vitest + c8
- **Key Libraries**: react, next, tailwindcss, prisma
- **Code Style**: ESM, single quotes, 2-space indent, semicolons

When generating code examples, use the above tech stack and code style.
When suggesting practice exercises, align with this project's patterns.
```

## Learning Commands

After init, your AI assistant gains five learning commands:

| Command                          | What it does                                                 |
| -------------------------------- | ------------------------------------------------------------ |
| `/learn:topic <topic-name>`      | Initialize a topic, generate a knowledge map, track progress |
| `/learn:explain <concept-name>`  | Recursive Socratic deep-dive into a concept                  |
| `/learn:practice <concept-name>` | TDD-style coding exercises with Socratic feedback            |
| `/learn:review [topic-name]`     | Review progress, spaced repetition recommendations           |
| `/learn:status [topic-name]`     | Visualize learning state as a knowledge map heatmap          |

### `/learn:topic` — Initialize a Topic

Generates a hierarchical knowledge map (`.learn/topics/<topic>/knowledge-map.md`), creates a learning state tracker (`state.yaml`), and presents the landscape for you to choose your own path.

### `/learn:explain` — Recursive Deep Dive

Assesses your level (beginner → advanced), explains with analogies and code examples, identifies deeper sub-topics, and lets you choose how deep to go. Every session is recorded for spaced repetition.

### `/learn:practice` — TDD-Style Exercises

Generates test-driven exercises at the right difficulty (beginner / intermediate / challenge), provides structured Socratic feedback, and updates your mastery status.

### `/learn:review` — Progress Review

Analyzes your learning data: mastery heatmap, spaced repetition priority scoring, concept relationship analysis (blocking / orphan concepts). Generates a personalized next-step plan.

### `/learn:status` — Visualize State

Renders a knowledge map heatmap with status icons, practice counts, and confidence scores for every concept.

## Usage Flow

```
1. cd your-project
2. npx learn-anything-cli init --tools claude
   ↓
   Detects: TypeScript + React + Vite + Vitest
   Generates: .claude/skills/ + .claude/commands/learn/
   ↓
3. Open Claude Code in your project
4. /learn:topic javascript
   ↓
   AI generates knowledge map tailored to your stack
5. /learn:explain closures
   ↓
   AI explains using your project's patterns (React hooks, etc.)
6. /learn:practice closures
   ↓
   AI creates exercises using Vitest, your project's test framework
7. /learn:review
   ↓
   Shows what to review next based on spaced repetition
```

## Supported AI Tools

Amazon Q Developer, Antigravity, Auggie, Bob Shell, Claude Code, Cline, Codex, ForgeCode, CodeBuddy Code, Continue, CoStrict, Crush, Cursor, Factory Droid, Gemini CLI, GitHub Copilot, iFlow, Junie, Kilo Code, Kiro, OpenCode, Pi, Qoder, Lingma, Qwen Code, RooCode, Trae, Windsurf, and AGENTS.md-compatible assistants.

```bash
# Update skill files to latest version (detects existing tools automatically)
npx learn-anything-cli update
```

## Project Structure

```
Your Project/
├── .claude/commands/learn/    # Slash commands (learn:topic, learn:explain, ...)
├── .claude/skills/            # Skill files with full workflow instructions + project context
├── .cursor/commands/          # Cursor-specific command format
├── .gemini/commands/learn/    # Gemini TOML-format commands
├── .learn/                    # Your learning data (knowledge maps, progress)
│   └── topics/
│       └── javascript/
│           ├── knowledge-map.md
│           ├── state.yaml
│           └── sessions/
└── ...
```

Each AI tool gets tool-appropriate file formats (YAML frontmatter for Claude, TOML for Gemini, etc.) via an adapter pattern.

## CLI Options

```
learning-sakura init [path]        Initialize skills (default: global)
  --tools <tools>                  Specify AI tools (comma-separated, or "all"/"none")
  --local                          Install skills locally (in project directory)
  --force                          Skip confirmation prompts
  --lang <locale>                  Display language: zh-CN or en

learning-sakura update [path]      Update skill files to latest version
  --force                          Skip confirmation prompts
  --lang <locale>                  Display language: zh-CN or en
```

## Development

```bash
pnpm install
pnpm build        # Compile TypeScript
pnpm test         # Run tests
pnpm dev          # Watch mode
pnpm dev:cli      # Build and run CLI locally
```

## Acknowledgments

Based on [learn-anything](https://github.com/ChenChenyaqi/learn-anything) by [ChenChenyaqi](https://github.com/ChenChenyaqi).

## License

MIT
