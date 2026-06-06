# 🌸 learning-ver.sakura

> **AI-Powered Recursive Learning — Socratic Method × TDD × Project-Aware**

Turn your AI coding assistant into an interactive tutor. The AI studies your project first, then teaches you anything — grounded in **official documentation** fetched via **Context7 MCP**.

> 🌏 [中文](./README.md) | [English](./README.en.md) | [日本語](./README.ja.md)

[![npm version](https://img.shields.io/npm/v/learning-ver.sakura?color=ff6b9d&style=flat-square)](https://www.npmjs.com/package/learning-ver.sakura)
[![CI](https://img.shields.io/github/actions/workflow/status/yorha9e/learning-ver.sakura/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/yorha9e/learning-ver.sakura/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffb7c5?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node ≥20](https://img.shields.io/badge/node-%E2%89%A520-ff6b9d?style=flat-square)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ffb7c5?style=flat-square)](https://github.com/yorha9e/learning-ver.sakura/pulls)

---

## ✨ Features

|                          |                                                                 |
| ------------------------ | --------------------------------------------------------------- |
| 🌸 **Sakura UI**         | Cherry-blossom-themed terminal UI rendered with `boxen` + `ora` |
| 🧠 **Project-Aware**     | Auto-detects tech stack, code style, and testing framework      |
| 📚 **Context7 Verified** | Forces AI to consult official documentation via Context7 MCP    |
| 💾 **Smart Cache**       | Locally caches doc summaries for instant subsequent sessions    |
| 🔄 **Self-Healing**      | Guides user to install Context7 (`npx ctx7 setup`) if missing   |
| 🎯 **30+ AI Tools**      | Claude Code, Cursor, Gemini, Codex, Copilot, Windsurf…          |
| 🌏 **Trilingual**        | English / 中文 / 日本語                                         |
| ⚡ **5 Workflows**       | topic / explain / practice / review / status                    |

---

## 🚀 Quick Start

```bash
# Global install
npm install -g learning-ver.sakura

# Initialize in your project (interactive tool selection)
learning-sakura init

# Or specify tools explicitly
learning-sakura init --tools claude,cursor

# Install to project directory instead of ~/
learning-sakura init --local

# Chinese / Japanese interface
learning-sakura init --lang zh-CN
learning-sakura init --lang ja

# One-off usage
npx learning-ver.sakura init --tools claude
```

After init, your AI assistant gains 5 learning commands:

| Command                          | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| `/learn:topic <topic-name>`      | Initialize a topic, generate knowledge map |
| `/learn:explain <concept-name>`  | Recursive Socratic deep-dive               |
| `/learn:practice <concept-name>` | TDD-style exercises                        |
| `/learn:review [topic-name]`     | Spaced repetition review                   |
| `/learn:status [topic-name]`     | Visualize learning state                   |

---

## 📚 Mandatory Documentation Verification (Context7 MCP)

> 🌸 **The project's core innovation**: AI must consult official documentation before teaching — eliminating hallucinations.

Every teaching template (`learn:topic` / `learn:explain` / `learn:practice`) has a built-in **Step 0.5: Mandatory Documentation Verification**:

```
Step 0.5 — Verification Workflow

1. Check local cache .learn/docs/<lang>/summary.md
   ├─ Found → Use it, zero latency
   └─ Missing ↓
2. Use Context7 MCP's get-library-docs to fetch official docs
   ├─ Success → Cache it → Teach
   └─ Failure ↓
3. 🔧 Self-healing:
   → Prompt user to run `npx ctx7 setup`
   → Meanwhile, teach with built-in knowledge (clearly marked "unverified")
```

**7 built-in documentation sources** (via Context7 library IDs):

| Language   | Library ID                       | Source                       |
| ---------- | -------------------------------- | ---------------------------- |
| JavaScript | `/mdn/content`                   | MDN Web Docs                 |
| TypeScript | `/microsoft/TypeScript-Handbook` | Official TypeScript Handbook |
| React      | `/reactjs/react.dev`             | Official React documentation |
| Vue        | `/vuejs/docs`                    | Official Vue guide           |
| Python     | `/python/cpython`                | Official Python tutorial     |
| Rust       | `/rust-lang/book`                | Official Rust Book           |
| Go         | `/golang/website`                | Official Go documentation    |

> **First time using Context7?** Run `npx ctx7 setup` to configure MCP (one-time setup).

---

## 🧠 Project-Aware Teaching

On `init`, the tool automatically scans your project:

```
🔍 Project detected:

   Language:   TypeScript ^5.9.0
   Framework:  Next.js ^15.0.0
   Testing:    Vitest
   Type:       web-app
   Code Style: ESM, single quotes, 2-space indent
```

This context is injected into every generated skill file, so the AI teaches using your real tech stack:

> "According to [MDN's Closures chapter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures): A closure is the combination of a function and its lexical environment..."

---

## 🎓 5 Learning Workflows

### 1️⃣ `/learn:topic <topic>` — Build a Knowledge Map

```
🌟 JavaScript Knowledge Map

Language Basics              Functions                  Objects & Prototypes
├── Variables & Types       ├── Declarations & Expr     ├── Object Literals
├── Operators               ├── Scope & Closures        ├── Constructors
├── Control Flow            ├── this Keyword            ├── prototype & __proto__
└── Type Coercion           ├── Arrow Functions         └── Inheritance Patterns
                            └── Higher-Order Functions

Async Programming           Tooling & Engineering
├── Promise                 ├── Module System
├── async/await             ├── npm/Package Mgmt
└── Event Loop              └── Build Tools
```

### 2️⃣ `/learn:explain <concept>` — Socratic Deep Dive

- Assesses your level (beginner / intermediate / advanced)
- Analogy + core mechanism + code example + common misconceptions
- Auto-saves sessions to `.learn/topics/<topic>/sessions/`

### 3️⃣ `/learn:practice <concept>` — TDD-Style Exercises

- 🟢 **Beginner** / 🟡 **Intermediate** / 🔴 **Challenge** difficulty tiers
- Auto-generates real practice files in `.learn/topics/<topic>/exercises/<concept>/`
- Socratic feedback (never "you're wrong" — guides you to discover it)

### 4️⃣ `/learn:review` — Spaced Repetition Review

- Mastery heatmap
- Priority score = `(1 - confidence) × days_since_last_practice`
- Personalized next-step plan

### 5️⃣ `/learn:status` — Visualize Learning State

```
📊 JavaScript Learning State

✅ Mastered: 4   🔄 In Progress: 2   ⚠️ Needs Practice: 1   ⬜ Unexplored: 8
```

---

## 🌐 30+ Supported AI Tools

<details>
<summary><b>Click to expand the full list</b></summary>

Amazon Q Developer · Antigravity · Auggie · Bob Shell · Claude Code · Cline · Codex · ForgeCode · CodeBuddy Code · Continue · CoStrict · Crush · Cursor · Factory Droid · Gemini CLI · GitHub Copilot · iFlow · Junie · Kilo Code · Kiro · OpenCode · Pi · Qoder · Lingma · Qwen Code · RooCode · Trae · Windsurf · AGENTS.md-compatible assistants

</details>

---

## 📂 Project Structure

```
Your Project/
├── .claude/                          # Claude Code skills + commands
│   ├── commands/learn/               # /learn:topic, /learn:explain, ...
│   └── skills/                       # SKILL.md (full workflow + Step 0.5)
├── .cursor/commands/                 # Cursor-specific command format
├── .gemini/commands/learn/           # Gemini TOML-format commands
├── .learn/                           # Your learning data
│   ├── docs/                         # 🌸 Cached documentation summaries
│   │   └── <language>/summary.md
│   └── topics/
│       └── <topic>/
│           ├── knowledge-map.md      # Hierarchical topic structure
│           ├── state.yaml            # Progress tracker
│           ├── sessions/             # Learning session records
│           └── exercises/            # Project Mode practice files
└── ...
```

---

## 🛠️ CLI Options

```bash
learning-sakura init [path]
  --tools <list>       # Comma-separated: claude,cursor,gemini | "all" | "none"
  --local              # Install to project dir (default: ~/)
  --force              # Skip confirmation prompts
  --lang <locale>      # zh-CN | en | ja (default: system locale)

learning-sakura update [path]
  --force              # Skip confirmation
  --lang <locale>      # Same as above
```

> Note: `--lang ja` is reserved for a future Japanese UI release. Currently it falls back to English. (We'd love a contribution for Japanese translations!)

---

## 👨‍💻 Development

```bash
# Clone
git clone https://github.com/yorha9e/learning-ver.sakura.git
cd learning-ver.sakura

# Install dependencies
pnpm install

# Common commands
pnpm build           # Compile TypeScript
pnpm test            # Run 30 unit tests
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm format:check    # Check formatting
pnpm dev             # tsc --watch
pnpm dev:cli         # Build and run CLI

# Git hooks (configured)
# - pre-commit: lint-staged (ESLint + Prettier)
# - commit-msg: commitlint (Conventional Commits)
```

### Tech Stack

| Category      | Tools                                           |
| ------------- | ----------------------------------------------- |
| Language      | TypeScript 5.9                                  |
| Testing       | Vitest 3.2                                      |
| Code Style    | ESLint 9 + Prettier 3                           |
| Git Hooks     | Husky 9 + lint-staged 17 + commitlint 21        |
| Terminal UI   | boxen 8 + ora 9 + chalk 5 + @inquirer/prompts 7 |
| CLI Framework | commander 14                                    |
| Doc Source    | Context7 MCP                                    |
| Validation    | zod 4 + yaml 2                                  |

### CI/CD

Every push and PR automatically runs:

- ✅ **Lint** (ESLint)
- ✅ **Type Check** (`tsc --noEmit`)
- ✅ **Test** (30 Vitest tests)
- ✅ **Build** (depends on Lint + Test passing)

---

## 🤝 Contributing

PRs welcome! Please follow these guidelines:

1. Fork → create a feature branch (`git checkout -b feat/amazing`)
2. Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `chore:` build/CI changes
3. Ensure `pnpm lint && pnpm test && pnpm build` all pass
4. PR title concise, description explains motivation

We especially welcome:

- 🌐 New language translations (e.g., Japanese UI messages)
- 🛠️ More AI tool adapters
- 📚 Additional documentation sources

---

## 🙏 Acknowledgments

- Based on [learn-anything](https://github.com/ChenChenyaqi/learn-anything) by [@ChenChenyaqi](https://github.com/ChenChenyaqi)
- Documentation fetched via [Context7 MCP](https://github.com/upstash/context7)
- Sakura theme inspired by 🌸 Japanese spring aesthetics

---

## 📜 License

[MIT](./LICENSE) © 2026 yorha9e

---

<p align="center">
  <sub>🌸 <b>Happy learning!</b> 🌸</sub>
  <br>
  <sub>Made with ❤️ and 🍵</sub>
</p>
