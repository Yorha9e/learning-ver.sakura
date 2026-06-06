# 🌸 Learning-Ver.Sakura

> **AI-Powered Recursive Learning — Socratic Method × TDD × Project-Aware**

Turn your AI coding assistant into an interactive tutor. The AI studies your project first, then teaches you anything — grounded in **official documentation** fetched via **Context7 MCP**.

[![npm version](https://img.shields.io/npm/v/learning-ver.sakura?color=ff6b9d&style=flat-square)](https://www.npmjs.com/package/learning-ver.sakura)
[![CI](https://img.shields.io/github/actions/workflow/status/yorha9e/learning-ver.sakura/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/yorha9e/learning-ver.sakura/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffb7c5?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node ≥20](https://img.shields.io/badge/node-%E2%89%A520-ff6b9d?style=flat-square)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ffb7c5?style=flat-square)](https://github.com/yorha9e/learning-ver.sakura/pulls)

---

## ✨ 特性一览

|                          |                                                        |
| ------------------------ | ------------------------------------------------------ |
| 🌸 **Sakura UI**         | 樱花主题的终端界面，使用 `boxen` + `ora` 渲染          |
| 🧠 **Project-Aware**     | 自动检测技术栈、代码风格、测试框架                     |
| 📚 **Context7 Verified** | 通过 Context7 MCP 强制 AI 参考官方文档                 |
| 💾 **Smart Cache**       | 本地缓存文档摘要，下次教学秒开                         |
| 🔄 **Self-Healing**      | Context7 缺失时引导用户安装（`npx ctx7 setup`）        |
| 🎯 **30+ AI Tools**      | Claude Code、Cursor、Gemini、Codex、Copilot、Windsurf… |
| 🌏 **Bilingual**         | English / 简体中文                                     |
| ⚡ **5 Workflows**       | topic / explain / practice / review / status           |

---

## 🚀 快速开始

```bash
# 全局安装
npm install -g learning-ver.sakura

# 在项目目录中初始化（交互式选择 AI 工具）
learning-sakura init

# 或指定工具
learning-sakura init --tools claude,cursor

# 限定到项目目录（不安装到 ~）
learning-sakura init --local

# 中文界面
learning-sakura init --lang zh-CN

# 一次性运行
npx learning-ver.sakura init --tools claude
```

初始化完成后，AI 助手自动获得 5 个学习命令：

| 命令                     | 作用                     |
| ------------------------ | ------------------------ |
| `/learn:topic <主题>`    | 初始化主题，生成知识地图 |
| `/learn:explain <概念>`  | 苏格拉底式深度讲解       |
| `/learn:practice <概念>` | TDD 风格练习             |
| `/learn:review [主题]`   | 间隔重复复习             |
| `/learn:status [主题]`   | 可视化学习状态           |

---

## 📚 强制文档校准 (Context7 MCP)

> 🌸 **这是本项目的核心创新**：AI 教学前必须参考官方文档，杜绝幻觉。

每个教学模板（`learn:topic` / `learn:explain` / `learn:practice`）内置 **Step 0.5: 强制文档校准**：

```
Step 0.5 — Verification Workflow

1. 检查本地缓存 .learn/docs/<lang>/summary.md
   ├─ 有 → 直接用，零延迟
   └─ 无 ↓
2. 用 Context7 MCP 的 get-library-docs 拉官方文档
   ├─ 成功 → 写缓存 → 教学
   └─ 失败 ↓
3. 🔧 Self-healing:
   → 提示用户运行 npx ctx7 setup
   → 同时用内置知识继续教（明确标注"未验证"）
```

**7 个内置文档源**（通过 Context7 library ID）：

| 语言       | Library ID                       | 来源                |
| ---------- | -------------------------------- | ------------------- |
| JavaScript | `/mdn/content`                   | MDN Web Docs        |
| TypeScript | `/microsoft/TypeScript-Handbook` | TypeScript 官方手册 |
| React      | `/reactjs/react.dev`             | React 官方文档      |
| Vue        | `/vuejs/docs`                    | Vue 官方指南        |
| Python     | `/python/cpython`                | Python 官方教程     |
| Rust       | `/rust-lang/book`                | Rust 官方书籍       |
| Go         | `/golang/website`                | Go 官方文档         |

> **首次使用 Context7？** 运行 `npx ctx7 setup` 配置 MCP（一次性操作）。

---

## 🧠 项目感知教学

init 时自动扫描你的项目：

```
🔍 Project detected:

   Language:   TypeScript ^5.9.0
   Framework:  Next.js ^15.0.0
   Testing:    Vitest
   Type:       web-app
   Code Style: ESM, single quotes, 2-space indent
```

这些信息会被注入到每个生成的 skill 文件，AI 教学时会用你的真实技术栈：

> "根据 [MDN Closures 章节](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)：A closure is the combination of a function and its lexical environment..."

---

## 🎓 5 个学习工作流

### 1️⃣ `/learn:topic <主题>` — 建立知识地图

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

### 2️⃣ `/learn:explain <概念>` — 苏格拉底式深度讲解

- 评估水平（初学者 / 中级 / 高级）
- 类比 + 核心机制 + 代码示例 + 常见误解
- 自动保存会话到 `.learn/topics/<topic>/sessions/`

### 3️⃣ `/learn:practice <概念>` — TDD 风格练习

- 🟢 **初级** / 🟡 **中级** / 🔴 **挑战** 三种难度
- 自动生成真实练习文件（`.learn/topics/<topic>/exercises/<concept>/`）
- 苏格拉底式反馈（不问"你错了"，而是引导发现）

### 4️⃣ `/learn:review` — 间隔重复复习

- 掌握热力图
- 优先级评分 = `(1 - 置信度) × 距上次练习天数`
- 个性化下一步计划

### 5️⃣ `/learn:status` — 学习状态可视化

```
📊 JavaScript 学习状态

✅ Mastered: 4   🔄 In Progress: 2   ⚠️ Needs Practice: 1   ⬜ Unexplored: 8
```

---

## 🌐 支持的 30+ AI 工具

<details>
<summary><b>点击展开完整列表</b></summary>

Amazon Q Developer · Antigravity · Auggie · Bob Shell · Claude Code · Cline · Codex · ForgeCode · CodeBuddy Code · Continue · CoStrict · Crush · Cursor · Factory Droid · Gemini CLI · GitHub Copilot · iFlow · Junie · Kilo Code · Kiro · OpenCode · Pi · Qoder · Lingma · Qwen Code · RooCode · Trae · Windsurf · AGENTS.md 兼容助手

</details>

---

## 📂 项目结构

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

## 🛠️ CLI 选项

```bash
learning-sakura init [path]
  --tools <list>       # 逗号分隔: claude,cursor,gemini | "all" | "none"
  --local              # 安装到项目目录（默认安装到 ~）
  --force              # 跳过确认提示
  --lang <locale>      # zh-CN | en (默认: 系统语言)

learning-sakura update [path]
  --force              # 跳过确认
  --lang <locale>      # 同上
```

---

## 👨‍💻 开发

```bash
# 克隆
git clone https://github.com/yorha9e/learning-ver.sakura.git
cd learning-ver.sakura

# 安装依赖
pnpm install

# 常用命令
pnpm build           # 编译 TypeScript
pnpm test            # 运行 30 个单元测试
pnpm lint            # ESLint
pnpm format          # Prettier 格式化
pnpm format:check    # 检查格式
pnpm dev             # tsc --watch
pnpm dev:cli         # 构建并运行 CLI

# Git 钩子（已配置）
# - pre-commit: lint-staged (ESLint + Prettier)
# - commit-msg: commitlint (Conventional Commits)
```

### 技术栈

| 类别     | 工具                                            |
| -------- | ----------------------------------------------- |
| 语言     | TypeScript 5.9                                  |
| 测试     | Vitest 3.2                                      |
| 代码风格 | ESLint 9 + Prettier 3                           |
| Git 钩子 | Husky 9 + lint-staged 17 + commitlint 21        |
| 终端 UI  | boxen 8 + ora 9 + chalk 5 + @inquirer/prompts 7 |
| CLI 框架 | commander 14                                    |
| 文档源   | Context7 MCP                                    |
| 文档校验 | zod 4 + yaml 2                                  |

### CI/CD

每次 push 和 PR 都会自动跑：

- ✅ **Lint** (ESLint)
- ✅ **Type Check** (tsc --noEmit)
- ✅ **Test** (Vitest 30 tests)
- ✅ **Build** (依赖 Lint + Test 通过)

---

## 🤝 贡献

欢迎 PR！请遵循：

1. Fork → 创建 feature branch (`git checkout -b feat/amazing`)
2. 提交遵循 [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` 新功能
   - `fix:` 修复
   - `docs:` 仅文档
   - `chore:` 构建/CI 变更
3. 确保 `pnpm lint && pnpm test && pnpm build` 通过
4. PR 标题简洁，描述清楚动机

---

## 🙏 致谢

- 基于 [learn-anything](https://github.com/ChenChenyaqi/learn-anything) by [@ChenChenyaqi](https://github.com/ChenChenyaqi)
- 文档源通过 [Context7 MCP](https://github.com/upstash/context7) 获取
- 樱花主题灵感来自 🌸 Japanese spring aesthetics

---

## 📜 License

[MIT](./LICENSE) © 2026 yorha9e

---

<p align="center">
  <sub>🌸 <b>Happy learning!</b> 🌸</sub>
  <br>
  <sub>Made with ❤️ and 🍵 in China</sub>
</p>
