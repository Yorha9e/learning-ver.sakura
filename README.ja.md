# 🌸 learning-ver.sakura

> **AI による再帰的学習 — ソクラテス式メソッド × TDD × プロジェクト理解**

AI コーディングアシスタントをインタラクティブなチューターに変えます。AI はまずあなたのプロジェクトを学習し、**Context7 MCP** で取得した**公式ドキュメント**に基づき、あらゆることを教えてくれます。

> 🌏 [中文](./README.md) | [English](./README.en.md) | [日本語](./README.ja.md)

[![npm version](https://img.shields.io/npm/v/learning-ver.sakura?color=ff6b9d&style=flat-square)](https://www.npmjs.com/package/learning-ver.sakura)
[![CI](https://img.shields.io/github/actions/workflow/status/yorha9e/learning-ver.sakura/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/yorha9e/learning-ver.sakura/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffb7c5?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node ≥20](https://img.shields.io/badge/node-%E2%89%A520-ff6b9d?style=flat-square)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ffb7c5?style=flat-square)](https://github.com/yorha9e/learning-ver.sakura/pulls)

---

## ✨ 主な特徴

|                           |                                                               |
| ------------------------- | ------------------------------------------------------------- |
| 🌸 **Sakura UI**          | `boxen` + `ora` でレンダリングされた桜テーマのターミナル UI   |
| 🧠 **プロジェクト理解**   | 技術スタック、コードスタイル、テストフレームワークを自動検出  |
| 📚 **Context7 検証**      | Context7 MCP 経由で AI に公式ドキュメントを参照させる         |
| 💾 **スマートキャッシュ** | ドキュメント要約をローカル保存し、次回以降を高速化            |
| 🔄 **自己修復**           | Context7 未設定時にインストール手順（`npx ctx7 setup`）を案内 |
| 🎯 **30+ AI ツール対応**  | Claude Code、Cursor、Gemini、Codex、Copilot、Windsurf など    |
| 🌏 **3 言語対応**         | English / 中文 / 日本語                                       |
| ⚡ **5 つのワークフロー** | topic / explain / practice / review / status                  |

---

## 🚀 クイックスタート

```bash
# グローバルインストール
npm install -g learning-ver.sakura

# プロジェクトディレクトリで初期化（インタラクティブに AI ツール選択）
learning-sakura init

# ツールを明示的に指定
learning-sakura init --tools claude,cursor

# プロジェクトディレクトリにインストール（~/ の代わり）
learning-sakura init --local

# 言語を切り替える
learning-sakura init --lang ja
learning-sakura init --lang zh-CN

# 使い捨て実行
npx learning-ver.sakura init --tools claude
```

初期化が完了すると、AI アシスタントに 5 つの学習コマンドが追加されます：

| コマンド                     | 機能                                 |
| ---------------------------- | ------------------------------------ |
| `/learn:topic <トピック名>`  | トピックを初期化し、知識マップを生成 |
| `/learn:explain <概念名>`    | ソクラテス式に深く掘り下げて解説     |
| `/learn:practice <概念名>`   | TDD 形式の演習                       |
| `/learn:review [トピック名]` | 間隔反復による復習                   |
| `/learn:status [トピック名]` | 学習状態を可視化                     |

---

## 📚 強制ドキュメント検証 (Context7 MCP)

> 🌸 **本プロジェクトの中核となる革新**：AI は教える前に必ず公式ドキュメントを参照し、ハルシネーションを排除します。

すべての teaching テンプレート（`learn:topic` / `learn:explain` / `learn:practice`）には **Step 0.5: 強制ドキュメント検証** が組み込まれています：

```
Step 0.5 — 検証ワークフロー

1. ローカルキャッシュ .learn/docs/<lang>/summary.md を確認
   ├─ あり → それを使用（即座に開始）
   └─ なし ↓
2. Context7 MCP の get-library-docs で公式ドキュメントを取得
   ├─ 成功 → キャッシュ → 教える
   └─ 失敗 ↓
3. 🔧 自己修復:
   → ユーザーに `npx ctx7 setup` の実行を促す
   → 同時に内蔵ナレッジで続行（「未検証」と明示）
```

**7 つの組み込みドキュメントソース**（Context7 ライブラリ ID）：

| 言語       | ライブラリ ID                    | ソース                      |
| ---------- | -------------------------------- | --------------------------- |
| JavaScript | `/mdn/content`                   | MDN Web Docs                |
| TypeScript | `/microsoft/TypeScript-Handbook` | TypeScript 公式ハンドブック |
| React      | `/reactjs/react.dev`             | React 公式ドキュメント      |
| Vue        | `/vuejs/docs`                    | Vue 公式ガイド              |
| Python     | `/python/cpython`                | Python 公式チュートリアル   |
| Rust       | `/rust-lang/book`                | Rust 公式ブック             |
| Go         | `/golang/website`                | Go 公式ドキュメント         |

> **初めて Context7 を使う方へ**：`npx ctx7 setup` を実行して MCP を設定してください（一度きりの操作です）。

---

## 🧠 プロジェクト理解に基づく指導

`init` 実行時にプロジェクトを自動スキャンします：

```
🔍 プロジェクト検出:

   Language:   TypeScript ^5.9.0
   Framework:  Next.js ^15.0.0
   Testing:    Vitest
   Type:       web-app
   Code Style: ESM, single quotes, 2-space indent
```

この情報は生成されたスキルファイルに注入され、AI はあなたの実際の技術スタックを使って指導します：

> 「[MDN の Closures セクション](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) によると：A closure is the combination of a function and its lexical environment...」

---

## 🎓 5 つの学習ワークフロー

### 1️⃣ `/learn:topic <トピック>` — 知識マップの構築

```
🌟 JavaScript 知識マップ

基本構文                    関数                        オブジェクトとプロトタイプ
├── 変数と型               ├── 宣言と式                 ├── オブジェクトリテラル
├── 演算子                 ├── スコープとクロージャ       ├── コンストラクタ
├── 制御フロー              ├── this キーワード            ├── prototype & __proto__
└── 型変換                 ├── アロー関数                 └── 継承パターン
                            └── 高階関数

非同期プログラミング         ツールとエンジニアリング
├── Promise                 ├── モジュールシステム
├── async/await             ├── npm/パッケージ管理
└── イベントループ            └── ビルドツール
```

### 2️⃣ `/learn:explain <概念>` — ソクラテス式深掘り解説

- レベルを評価（初心者 / 中級 / 上級）
- たとえ + コアメカニズム + コード例 + よくある誤解
- セッションを `.learn/topics/<topic>/sessions/` に自動保存

### 3️⃣ `/learn:practice <概念>` — TDD 形式の演習

- 🟢 **初級** / 🟡 **中級** / 🔴 **挑戦** の 3 段階
- `.learn/topics/<topic>/exercises/<concept>/` に演習ファイルを自動生成
- ソクラテス式フィードバック（「間違い」とは言わず、発見に導く）

### 4️⃣ `/learn:review` — 間隔反復復習

- 習熟度のヒートマップ
- 優先度スコア = `(1 - 信頼度) × 前回練習からの経過日数`
- 個別最適化された次のステッププラン

### 5️⃣ `/learn:status` — 学習状態の可視化

```
📊 JavaScript 学習状態

✅ 習得済み: 4   🔄 学習中: 2   ⚠️ 要復習: 1   ⬜ 未着手: 8
```

---

## 🌐 30+ 対応 AI ツール

<details>
<summary><b>クリックすると全リストが表示されます</b></summary>

Amazon Q Developer · Antigravity · Auggie · Bob Shell · Claude Code · Cline · Codex · ForgeCode · CodeBuddy Code · Continue · CoStrict · Crush · Cursor · Factory Droid · Gemini CLI · GitHub Copilot · iFlow · Junie · Kilo Code · Kiro · OpenCode · Pi · Qoder · Lingma · Qwen Code · RooCode · Trae · Windsurf · AGENTS.md 対応アシスタント

</details>

---

## 📂 プロジェクト構成

```
あなたのプロジェクト/
├── .claude/                          # Claude Code スキル + コマンド
│   ├── commands/learn/               # /learn:topic, /learn:explain, ...
│   └── skills/                       # SKILL.md（完全なワークフロー + Step 0.5）
├── .cursor/commands/                 # Cursor 専用コマンド形式
├── .gemini/commands/learn/           # Gemini TOML 形式コマンド
├── .learn/                           # 学習データ
│   ├── docs/                         # 🌸 キャッシュされたドキュメント要約
│   │   └── <language>/summary.md
│   └── topics/
│       └── <topic>/
│           ├── knowledge-map.md      # 階層的なトピック構造
│           ├── state.yaml            # 進捗トラッカー
│           ├── sessions/             # 学習セッション記録
│           └── exercises/            # Project Mode 演習ファイル
└── ...
```

---

## 🛠️ CLI オプション

```bash
learning-sakura init [path]
  --tools <list>       # カンマ区切り: claude,cursor,gemini | "all" | "none"
  --local              # プロジェクトディレクトリにインストール（デフォルト: ~/）
  --force              # 確認プロンプトをスキップ
  --lang <locale>      # zh-CN | en | ja（デフォルト: システム言語）

learning-sakura update [path]
  --force              # 確認をスキップ
  --lang <locale>      # 上記と同じ
```

---

## 👨‍💻 開発

```bash
# クローン
git clone https://github.com/yorha9e/learning-ver.sakura.git
cd learning-ver.sakura

# 依存関係インストール
pnpm install

# よく使うコマンド
pnpm build           # TypeScript をコンパイル
pnpm test            # 30 個のユニットテストを実行
pnpm lint            # ESLint
pnpm format          # Prettier フォーマット
pnpm format:check    # フォーマット確認
pnpm dev             # tsc --watch
pnpm dev:cli         # ビルドして CLI を実行

# Git フック（設定済み）
# - pre-commit: lint-staged（ESLint + Prettier）
# - commit-msg: commitlint（Conventional Commits）
```

### 技術スタック

| カテゴリー         | ツール                                          |
| ------------------ | ----------------------------------------------- |
| 言語               | TypeScript 5.9                                  |
| テスト             | Vitest 3.2                                      |
| コードスタイル     | ESLint 9 + Prettier 3                           |
| Git フック         | Husky 9 + lint-staged 17 + commitlint 21        |
| ターミナル UI      | boxen 8 + ora 9 + chalk 5 + @inquirer/prompts 7 |
| CLI フレームワーク | commander 14                                    |
| ドキュメントソース | Context7 MCP                                    |
| バリデーション     | zod 4 + yaml 2                                  |

### CI/CD

プッシュと PR のたびに以下が自動実行されます：

- ✅ **Lint** (ESLint)
- ✅ **Type Check** (`tsc --noEmit`)
- ✅ **Test** (30 個の Vitest テスト)
- ✅ **Build** (Lint + Test 通過が条件)

---

## 🤝 コントリビューション

PR を歓迎します！以下のガイドラインに従ってください：

1. Fork → feature ブランチを作成 (`git checkout -b feat/amazing`)
2. コミットは [Conventional Commits](https://www.conventionalcommits.org/) に従う
   - `feat:` 新機能
   - `fix:` バグ修正
   - `docs:` ドキュメントのみ
   - `chore:` ビルド/CI 関連
3. `pnpm lint && pnpm test && pnpm build` がすべて通ることを確認
4. PR タイトルは簡潔に、説明で動機を明確に

特に歓迎する貢献：

- 🌐 新しい言語への翻訳（日本語 UI メッセージなど）
- 🛠️ 新しい AI ツールのアダプター
- 📚 追加のドキュメントソース

---

## 🙏 謝辞

- [learn-anything](https://github.com/ChenChenyaqi/learn-anything) （[@ChenChenyaqi](https://github.com/ChenChenyaqi) 氏）をベースにしています
- ドキュメントは [Context7 MCP](https://github.com/upstash/context7) 経由で取得
- 桜テーマのインスピレーションは 🌸 日本の春の美意識から

---

## 📜 ライセンス

[MIT](./LICENSE) © 2026 yorha9e

---

<p align="center">
  <sub>🌸 <b>Happy learning!</b> 🌸</sub>
  <br>
  <sub>Made with ❤️ and 🍵</sub>
</p>
