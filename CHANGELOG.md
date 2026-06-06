# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-06-06

### Added

- CI workflow (GitHub Actions): lint, typecheck, test, and build on every push and PR.
- Pre-commit hooks: Husky with lint-staged for ESLint, Prettier, and commitlint.
- Prettier configuration for consistent code formatting.
- ESLint flat config with eslint-config-prettier integration.
- CHANGELOG.md for version tracking.

### Fixed

- Session files now written BEFORE echoing to conversation in `learn:practice` and `learn:explain` workflows, eliminating drift between saved content and chat output.
- Test path assertions made cross-platform compatible (Windows vs Unix path separators).
- Relax `engines.node` from `>=20.19.0` to `>=20.0.0` for broader compatibility.

## [0.1.1] - 2026-05-31

### Added

- Mandatory Documentation Verification (Step 0.5) for learn-topic, learn-explain, learn-practice workflows.
- 7 built-in official documentation sources (JavaScript, TypeScript, React, Vue, Python, Rust, Go).
- Interactive documentation cache path prompt (`doc-selection.ts`).
- Project analysis module (`analysis/`) — auto-detects tech stack, code style, project type.
- `{{DOC_URLS}}` and `{{DOCS_PATH}}` placeholder system in skill templates.
- `.learn/docs/` directory for documentation cache.
- Sakura-themed UI with boxen and ora.
- Global installation mode (default) with `--local` flag for project-level install.
- Chinese (`zh-CN`) internationalization for doc selection prompts.

### Fixed

- Reword session-save timing from "after" to "in the same turn" for clarity.

## [0.1.0] - 2026-05-28

### Added

- `learning-sakura` CLI: generate skill and command files for 30+ AI coding tools.
- `init` command: interactive tool detection and selection, skill generation.
- `update` command: update existing skill files.
- Five learning workflows: topic, explain, practice, review, status.
- Dual-mode practice: Project Mode (real code files) + Chat Mode (conceptual discussion).
- Persistent learning session records.
- Locale support: English (`en`) and Chinese (`zh-CN`).
- MIT License.

[Unreleased]: https://github.com/yorha9e/learning-ver.sakura/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/yorha9e/learning-ver.sakura/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/yorha9e/learning-ver.sakura/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/yorha9e/learning-ver.sakura/releases/tag/v0.1.0
