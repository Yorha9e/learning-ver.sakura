# 混合文档爬取方案 — 完整实施计划

> **项目**: learning-ver.sakura  
> **日期**: 2026-06-06  
> **状态**: 待实施

---

## 一、背景与动机

### 当前问题

我们 fork 中已有的 **Step 0.5 强制文档校准** 机制是这样工作的：

```
AI 开始教学
  → 检查 .learn/docs/<lang>/summary.md 是否存在
  → 不存在 → AI 用 WebFetch 去下载官方文档
  → AI 自己写 summary 到本地
  → 基于 summary 教学
```

问题：

1. **AI 可能跳过 WebFetch** — prompt 里写了 MUST，但没有架构层面的阻断
2. **WebFetch 不稳定** — 大型文档站（MDN 有几千页）容易超时或失败
3. **summary 质量不可控** — AI 写的 summary 可能夹杂幻觉
4. **每次教学都要网络** — 慢，且离线无法使用

### 改进目标

```
用户运行 learn-anything sync --lang javascript
  → CLI 用 git clone 从 mdn/content 仓库爬取所有 JS 文档
  → 转为 Markdown 存储到 .learn/docs/javascript/
  → 生成 index.md 目录索引

AI 开始教学
  → Read .learn/docs/javascript/index.md（本地文件，100% 可靠）
  → Read .learn/docs/javascript/closures.md（本地文件，官方原文）
  → 基于官方文档原文教学，引用具体段落
  → 如果本地没有 → 提示用户运行 sync
```

### 核心变化对比

| 维度     | 当前方案                        | 改进后                         |
| -------- | ------------------------------- | ------------------------------ |
| 文档获取 | AI 运行时 WebFetch              | CLI 预同步 git clone           |
| 文档质量 | AI 生成的 summary（可能有幻觉） | 官方原文 Markdown（100% 准确） |
| 网络依赖 | 每次教学都需要                  | 仅 sync 时需要                 |
| 离线支持 | 不支持                          | 同步后完全离线可用             |
| 教学引用 | 无具体来源                      | "根据 MDN Closures 章节：..."  |

---

## 二、架构设计

### 两种获取策略

| 策略          | 工具                               | 适用场景                 | 速度       | 质量                  |
| ------------- | ---------------------------------- | ------------------------ | ---------- | --------------------- |
| **Git Clone** | `child_process.exec('git clone')`  | 有 GitHub 文档仓库的语言 | 快（~10s） | 最高（原始 Markdown） |
| **Web Crawl** | Node 20 fetch + cheerio + turndown | 无 git repo 的文档站     | 慢（~60s） | 中等（HTML→MD 有损）  |

### 7 个内置语言的 Git 仓库源

| 语言       | GitHub 仓库                     | 文档目录                            | 文件格式    |
| ---------- | ------------------------------- | ----------------------------------- | ----------- |
| JavaScript | `mdn/content`                   | `files/en-us/web/javascript/guide/` | Markdown ✅ |
| TypeScript | `microsoft/TypeScript-Handbook` | `docs/handbook/`                    | Markdown ✅ |
| React      | `reactjs/react.dev`             | `src/content/learn/`                | MDX → MD    |
| Vue        | `vuejs/docs`                    | `src/guide/`                        | Markdown ✅ |
| Python     | `python/cpython`                | `Doc/tutorial/`                     | reST → MD   |
| Rust       | `rust-lang/book`                | `src/`                              | Markdown ✅ |
| Go         | `golang/website`                | `content/doc/`                      | Markdown ✅ |

**好消息**：7 个全部有 Markdown 源文件的 GitHub 仓库，git clone 即可覆盖。Web crawl 仅作为未来用户自定义文档源的 fallback。

### 整体流程图

```
┌─────────────────────────────────────────────────┐
│              learn-anything init                │
│                                                 │
│  1. 选择 AI 工具                                 │
│  2. 指定文档缓存路径                              │
│  3. 生成 skill 文件（含 {{DOC_URLS}} 占位符）      │
│  4. 提示：是否立即同步文档？                        │
│     └─ Y → 调用 syncDocs()                      │
│     └─ N → 完成，提示稍后运行 sync                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           learn-anything sync                   │
│                                                 │
│  1. 读取 config 中的 doc sources                 │
│  2. 对每个语言：                                  │
│     ├─ 优先 git clone --depth 1 --sparse        │
│     │   └─ 提取 .md → 规范化 → 写入本地           │
│     └─ fallback: web crawl                      │
│         └─ fetch → cheerio → turndown → .md     │
│  3. 生成 index.md（目录索引）                     │
│  4. 生成 _meta.json（同步元数据）                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           AI 教学时                              │
│                                                 │
│  Step 0.5:                                      │
│  1. Read .learn/docs/<lang>/index.md            │
│  2. 找到相关主题文件                               │
│  3. Read .learn/docs/<lang>/<topic>.md          │
│  4. 基于官方文档原文教学                            │
│  5. 如果文件不存在 → 阻断，提示运行 sync            │
└─────────────────────────────────────────────────┘
```

### 本地目录结构

```
.learn/docs/
  javascript/
    _meta.json              ← 同步元数据（时间戳、来源、文件数）
    index.md                ← 文档目录索引（自动生成）
    closures.md             ← 每个主题一个文件
    promises.md
    async-await.md
    iterators-and-generators.md
    ...
  typescript/
    _meta.json
    index.md
    basic-types.md
    interfaces.md
    ...
  react/
    _meta.json
    index.md
    state-a-components-memory.md
    ...
  vue/
    _meta.json
    index.md
    ...
```

### `_meta.json` 格式

```json
{
  "language": "javascript",
  "name": "JavaScript",
  "source": "git",
  "repo": "mdn/content",
  "commitSha": "abc123def456",
  "syncedAt": "2026-06-06T12:00:00Z",
  "fileCount": 42,
  "totalSize": 262144,
  "totalSizeFormatted": "256KB"
}
```

---

## 三、新增文件清单（5 个）

### 3.1 `src/core/doc-sync/types.ts`

类型定义文件，定义同步策略、数据源和结果类型。

```typescript
export type SyncStrategy = 'git' | 'web';

export interface GitSource {
  url: string; // GitHub 仓库 URL
  docsPath: string; // 仓库内文档目录路径
  filePattern?: string; // 文件匹配模式（默认 *.md）
}

export interface WebSource {
  urls: string[]; // 要爬取的 URL 列表
  selector?: string; // 内容区域 CSS 选择器（默认 'article, main, .content'）
}

export interface DocSource {
  key: string; // 语言标识符，如 'javascript'
  name: string; // 显示名称，如 'JavaScript'
  strategy: SyncStrategy;
  git?: GitSource;
  web?: WebSource;
}

export interface SyncResult {
  language: string;
  name: string;
  success: boolean;
  strategy: SyncStrategy;
  fileCount: number;
  totalSize: number;
  error?: string;
  duration: number; // 毫秒
}

export interface SyncOptions {
  docsPath: string; // 文档存储根目录（如 .learn/docs）
  languages: string[]; // 要同步的语言列表（空 = 全部）
  force?: boolean; // 是否强制重新同步（忽略缓存）
}

export interface SyncMeta {
  language: string;
  name: string;
  source: SyncStrategy;
  repo?: string;
  commitSha?: string;
  syncedAt: string; // ISO 日期
  fileCount: number;
  totalSize: number;
  totalSizeFormatted: string;
}
```

### 3.2 `src/core/doc-sync/git-sync.ts`

Git clone 策略实现。

核心逻辑：

```typescript
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import type { GitSource, SyncResult, SyncMeta } from './types.js';

/**
 * 从 GitHub 仓库同步文档（shallow clone + sparse checkout）
 *
 * 流程：
 * 1. git clone --depth 1 --filter=blob:none --sparse <url> <tempDir>
 * 2. git sparse-checkout set <docsPath>
 * 3. 提取所有 .md 文件，规范化文件名
 * 4. 复制到目标目录 .learn/docs/<lang>/
 * 5. 生成 index.md 和 _meta.json
 * 6. 清理临时目录
 */
export async function syncFromGit(
  language: string,
  name: string,
  source: GitSource,
  docsPath: string,
): Promise<SyncResult> {
  const startTime = Date.now();
  const tempDir = path.join(os.tmpdir(), `learn-docs-${language}-${Date.now()}`);
  const targetDir = path.join(docsPath, language);

  try {
    // Step 1: Shallow clone（只拉最新一层 commit）
    execSync(`git clone --depth 1 --filter=blob:none --sparse "${source.url}" "${tempDir}"`, {
      stdio: 'pipe',
      timeout: 60000,
    });

    // Step 2: Sparse checkout（只拉取文档目录）
    execSync(`git sparse-checkout set "${source.docsPath}"`, {
      cwd: tempDir,
      stdio: 'pipe',
    });

    // Step 3: 收集 .md 文件
    const sourceDir = path.join(tempDir, source.docsPath);
    const files = await collectMarkdownFiles(sourceDir);

    // Step 4: 复制到目标目录
    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(targetDir, { recursive: true });

    for (const file of files) {
      const relativePath = path.relative(sourceDir, file);
      const normalized = normalizeFileName(relativePath);
      const targetFile = path.join(targetDir, normalized);
      const content = await fs.readFile(file, 'utf-8');
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.writeFile(targetFile, content, 'utf-8');
    }

    // Step 5: 生成 index.md
    await generateIndex(targetDir, name, files, sourceDir);

    // Step 6: 生成 _meta.json
    const commitSha = execSync('git rev-parse HEAD', { cwd: tempDir }).toString().trim();
    const totalSize = await calcDirSize(targetDir);

    const meta: SyncMeta = {
      language,
      name,
      source: 'git',
      repo: source.url.replace('https://github.com/', '').replace('.git', ''),
      commitSha,
      syncedAt: new Date().toISOString(),
      fileCount: files.length,
      totalSize,
      totalSizeFormatted: formatSize(totalSize),
    };
    await fs.writeFile(path.join(targetDir, '_meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

    return {
      language,
      name,
      success: true,
      strategy: 'git',
      fileCount: files.length,
      totalSize,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      language,
      name,
      success: false,
      strategy: 'git',
      fileCount: 0,
      totalSize: 0,
      error: (error as Error).message,
      duration: Date.now() - startTime,
    };
  } finally {
    // 清理临时目录
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
```

关键辅助函数：

```typescript
/** 递归收集所有 .md / .mdx 文件 */
async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectMarkdownFiles(fullPath)));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/** 规范化文件名：路径分隔符统一、转小写、空格转连字符 */
function normalizeFileName(filePath: string): string {
  return filePath
    .replace(/\\/g, '/') // Windows 路径
    .toLowerCase()
    .replace(/\s+/g, '-') // 空格 → 连字符
    .replace(/\.mdx$/i, '.md'); // .mdx → .md
}

/** 生成 index.md 目录索引 */
async function generateIndex(
  targetDir: string,
  name: string,
  files: string[],
  sourceDir: string,
): Promise<void> {
  const lines = [
    `# ${name} Documentation Index`,
    '',
    `> Synced from official documentation. ${files.length} files available.`,
    '',
    '## Topics',
    '',
  ];

  for (const file of files) {
    const relative = path.relative(sourceDir, file);
    const normalized = normalizeFileName(relative);
    const title = extractTitle(file) || path.basename(normalized, '.md');
    lines.push(`- [${title}](./${normalized})`);
  }

  await fs.writeFile(path.join(targetDir, 'index.md'), lines.join('\n'), 'utf-8');
}

/** 从 .md 文件提取第一个 # 标题 */
async function extractTitle(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

/** 计算目录总大小（字节） */
async function calcDirSize(dir: string): Promise<number> {
  let size = 0;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += await calcDirSize(fullPath);
    } else {
      const stat = await fs.stat(fullPath);
      size += stat.size;
    }
  }
  return size;
}

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
```

### 3.3 `src/core/doc-sync/web-sync.ts`

Web crawl fallback 策略实现。

```typescript
import { promises as fs } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import type { WebSource, SyncResult, SyncMeta } from './types.js';

/**
 * 从网页爬取文档（fallback 方案）
 *
 * 流程：
 * 1. 逐个 fetch URL
 * 2. cheerio 解析 HTML
 * 3. 提取内容区域（article/main/.content）
 * 4. 移除导航、侧边栏、footer
 * 5. turndown 转换为 Markdown
 * 6. 写入 .learn/docs/<lang>/<filename>.md
 */
export async function syncFromWeb(
  language: string,
  name: string,
  source: WebSource,
  docsPath: string,
): Promise<SyncResult> {
  const startTime = Date.now();
  const targetDir = path.join(docsPath, language);
  await fs.mkdir(targetDir, { recursive: true });

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  const files: string[] = [];

  for (const url of source.urls) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'learn-anything-cli/0.2.0' },
        signal: AbortSignal.timeout(30000), // 30s 超时
      });

      if (!response.ok) {
        console.warn(`  ⚠ Skipped ${url} (HTTP ${response.status})`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 提取内容区域
      const selector = source.selector || 'article, main, .content, #content';
      const content = $(selector).first();

      // 移除无关元素
      content.find('nav, aside, footer, .sidebar, .toc, .breadcrumb, script, style').remove();

      // HTML → Markdown
      const markdown = turndown.turndown(content.html() || '');

      // 添加来源标注
      const header = `> Source: ${url}\n> Synced: ${new Date().toISOString().slice(0, 10)}\n\n`;

      // 文件名从 URL 路径推导
      const fileName = urlToFileName(url);
      const filePath = path.join(targetDir, fileName);
      await fs.writeFile(filePath, header + markdown, 'utf-8');
      files.push(fileName);
    } catch (error) {
      console.warn(`  ⚠ Failed to fetch ${url}: ${(error as Error).message}`);
    }

    // 礼貌延迟，避免请求过快
    await new Promise((r) => setTimeout(r, 500));
  }

  // 生成 index.md
  const indexLines = [
    `# ${name} Documentation Index`,
    '',
    `> Synced from web sources. ${files.length} files available.`,
    '',
    '## Topics',
    '',
    ...files.map((f) => `- [${path.basename(f, '.md')}](${f})`),
  ];
  await fs.writeFile(path.join(targetDir, 'index.md'), indexLines.join('\n'), 'utf-8');

  // 生成 _meta.json
  const totalSize = await calcDirSize(targetDir);
  const meta: SyncMeta = {
    language,
    name,
    source: 'web',
    syncedAt: new Date().toISOString(),
    fileCount: files.length,
    totalSize,
    totalSizeFormatted: formatSize(totalSize),
  };
  await fs.writeFile(path.join(targetDir, '_meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

  return {
    language,
    name,
    success: files.length > 0,
    strategy: 'web',
    fileCount: files.length,
    totalSize,
    duration: Date.now() - startTime,
  };
}

/** 将 URL 转为文件名 */
function urlToFileName(url: string): string {
  const pathname = new URL(url).pathname;
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || 'index';
  return last
    .replace(/\.html?$/, '.md')
    .replace(/[^a-z0-9\-_.]/gi, '-')
    .toLowerCase();
}
```

### 3.4 `src/core/doc-sync/index.ts`

入口函数，协调两种策略。

```typescript
import { promises as fs } from 'fs';
import path from 'path';
import { DEFAULT_DOC_URLS } from '../config.js';
import { syncFromGit } from './git-sync.js';
import { syncFromWeb } from './web-sync.js';
import type { SyncOptions, SyncResult, SyncMeta } from './types.js';

const CACHE_DAYS = 7; // 7 天内不重复同步

export async function syncDocs(options: SyncOptions): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  // 确定要同步的语言
  const allKeys = Object.keys(DEFAULT_DOC_URLS);
  const targetKeys =
    options.languages.length > 0 ? options.languages.filter((l) => allKeys.includes(l)) : allKeys;

  for (const key of targetKeys) {
    const entry = DEFAULT_DOC_URLS[key];

    // 检查缓存：7 天内不重复同步
    if (!options.force) {
      const metaPath = path.join(options.docsPath, key, '_meta.json');
      try {
        const raw = await fs.readFile(metaPath, 'utf-8');
        const meta: SyncMeta = JSON.parse(raw);
        const age = Date.now() - new Date(meta.syncedAt).getTime();
        if (age < CACHE_DAYS * 24 * 60 * 60 * 1000) {
          results.push({
            language: key,
            name: entry.name,
            success: true,
            strategy: meta.source,
            fileCount: meta.fileCount,
            totalSize: meta.totalSize,
            duration: 0,
          });
          continue; // 跳过，已缓存
        }
      } catch {
        // _meta.json 不存在，需要重新同步
      }
    }

    // 执行同步
    if (entry.repo) {
      results.push(
        await syncFromGit(
          key,
          entry.name,
          {
            url: entry.repo.url,
            docsPath: entry.repo.docsPath,
          },
          options.docsPath,
        ),
      );
    } else if (entry.crawl) {
      results.push(
        await syncFromWeb(
          key,
          entry.name,
          {
            urls: entry.crawl.urls,
            selector: entry.crawl.selector,
          },
          options.docsPath,
        ),
      );
    } else {
      results.push({
        language: key,
        name: entry.name,
        success: false,
        strategy: 'git',
        fileCount: 0,
        totalSize: 0,
        error: 'No sync source configured',
        duration: 0,
      });
    }
  }

  return results;
}

/** 读取所有已同步语言的元数据（用于 sync --status） */
export async function getSyncStatus(docsPath: string): Promise<Record<string, SyncMeta | null>> {
  const status: Record<string, SyncMeta | null> = {};
  for (const key of Object.keys(DEFAULT_DOC_URLS)) {
    const metaPath = path.join(docsPath, key, '_meta.json');
    try {
      const raw = await fs.readFile(metaPath, 'utf-8');
      status[key] = JSON.parse(raw);
    } catch {
      status[key] = null;
    }
  }
  return status;
}
```

### 3.5 `src/cli/sync-command.ts`

sync CLI 子命令定义。

```typescript
// 注册到 Commander
program
  .command('sync [path]')
  .description(m.cli.syncCommandDescription)
  .option('--lang <languages>', '要同步的语言，逗号分隔（如 javascript,react）')
  .option('--force', '强制重新同步（忽略缓存）')
  .option('--status', '查看当前同步状态')
  .action(async (targetPath = '.', options) => {
    const resolvedPath = path.resolve(targetPath);
    const docsPath = path.join(resolvedPath, LEARN_DIR, 'docs');

    // --status 模式
    if (options.status) {
      const status = await getSyncStatus(docsPath);
      console.log(chalk.bold('\n📊 Documentation Sync Status\n'));
      for (const [key, meta] of Object.entries(status)) {
        if (meta) {
          const date = new Date(meta.syncedAt).toLocaleDateString();
          console.log(
            `  ✅ ${meta.name} — ${meta.fileCount} files, synced ${date} (${meta.totalSizeFormatted})`,
          );
        } else {
          console.log(`  ⬜ ${DEFAULT_DOC_URLS[key].name} — not synced`);
        }
      }
      console.log('');
      return;
    }

    // 正常同步模式
    const languages = options.lang ? options.lang.split(',').map((l: string) => l.trim()) : [];

    const { syncDocs } = await import('../core/doc-sync/index.js');
    const spinner = ora({ text: 'Syncing documentation...', spinner: 'dots' }).start();

    const results = await syncDocs({ docsPath, languages, force: options.force });

    // 显示结果
    for (const r of results) {
      if (r.duration === 0 && r.success) {
        console.log(chalk.dim(`  ℹ ${r.name} — already synced, skipped (use --force to re-sync)`));
      } else if (r.success) {
        spinner.succeed(
          `${r.name} — ${r.fileCount} files synced (${(r.duration / 1000).toFixed(1)}s)`,
        );
      } else {
        spinner.fail(`${r.name} — sync failed: ${r.error}`);
      }
    }
    console.log('');
  });
```

---

## 四、修改现有文件（8 个）

### 4.1 `src/core/config.ts`

扩展 `DocUrlEntry` 接口，为 7 个语言补充 `repo` 字段：

```typescript
export interface DocUrlEntry {
  name: string;
  toc: string;
  base: string;
  // 新增 ↓
  repo?: {
    url: string; // GitHub clone URL
    docsPath: string; // 仓库内文档目录路径
  };
  crawl?: {
    urls: string[];
    selector?: string;
  };
}

export const DEFAULT_DOC_URLS: Record<string, DocUrlEntry> = {
  javascript: {
    name: 'JavaScript',
    toc: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    base: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/',
    repo: {
      url: 'https://github.com/mdn/content.git',
      docsPath: 'files/en-us/web/javascript/guide',
    },
  },
  typescript: {
    name: 'TypeScript',
    toc: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    base: 'https://www.typescriptlang.org/docs/handbook/',
    repo: {
      url: 'https://github.com/microsoft/TypeScript-Handbook.git',
      docsPath: 'docs/handbook',
    },
  },
  react: {
    name: 'React',
    toc: 'https://react.dev/learn',
    base: 'https://react.dev/learn/',
    repo: {
      url: 'https://github.com/reactjs/react.dev.git',
      docsPath: 'src/content/learn',
    },
  },
  vue: {
    name: 'Vue',
    toc: 'https://vuejs.org/guide/introduction.html',
    base: 'https://vuejs.org/guide/',
    repo: {
      url: 'https://github.com/vuejs/docs.git',
      docsPath: 'src/guide',
    },
  },
  python: {
    name: 'Python',
    toc: 'https://docs.python.org/3/tutorial/index.html',
    base: 'https://docs.python.org/3/tutorial/',
    repo: {
      url: 'https://github.com/python/cpython.git',
      docsPath: 'Doc/tutorial',
    },
  },
  rust: {
    name: 'Rust',
    toc: 'https://doc.rust-lang.org/book/',
    base: 'https://doc.rust-lang.org/book/',
    repo: {
      url: 'https://github.com/rust-lang/book.git',
      docsPath: 'src',
    },
  },
  go: {
    name: 'Go',
    toc: 'https://go.dev/doc/',
    base: 'https://go.dev/doc/',
    repo: {
      url: 'https://github.com/golang/website.git',
      docsPath: 'content/doc',
    },
  },
};
```

### 4.2 `src/cli/index.ts`

新增 `sync` 命令注册（约 40 行），复用 `resolveLocale` 和 `getMessages` 模式。

### 4.3 `src/core/init.ts`

在技能生成完成后，增加交互提示：

```typescript
// 技能生成完毕后...
if (isInteractive() && !this.isUpdate) {
  const { confirm } = await import('@inquirer/prompts');
  const shouldSync = await confirm({
    message: '📚 Sync documentation now? (downloads official docs for AI reference)',
    default: true,
  });
  if (shouldSync) {
    const { syncDocs } = await import('./doc-sync/index.js');
    const results = await syncDocs({
      docsPath: path.join(resolvedPath, LEARN_DIR, 'docs'),
      languages: [],
    });
    // 显示同步结果...
  }
}
```

### 4.4 三个模板文件 — Step 0.5 改造

**learn-topic.ts** / **learn-explain.ts** / **learn-practice.ts**：

**当前版本**（运行时 WebFetch）：

```markdown
### Verification Workflow (MUST follow before every explanation)

1. Check local cache: Check if `{{DOCS_PATH}}/<language>/summary.md` exists
2. If cached → Read it. Use as ground truth.
3. If NOT cached → Use WebFetch to download the relevant documentation URL above.
   - Fetch the documentation index page
   - Extract key sections relevant to the current topic
   - Write a comprehensive summary to `{{DOCS_PATH}}/<language>/summary.md`
   - Include: key concepts, API references, code examples, best practices, gotchas
4. Cross-reference: ...
```

**改进版本**（读本地预同步文件）：

```markdown
### Verification Workflow (MUST follow before every explanation)

1. Check if `{{DOCS_PATH}}/<language>/index.md` exists
2. If exists → Read it. Find topic files relevant to the current concept.
3. Read the relevant topic file(s) for detailed reference.
4. Cross-reference your explanation against the official doc content:
   - Terminology must match official documentation
   - Code examples must follow official patterns
   - If your explanation conflicts with official docs → **defer to official docs**
5. If `index.md` does NOT exist → **STOP** and tell the user:
   > "⚠️ {language} documentation has not been synced yet.
   > Please run: `learn-anything sync --lang {language}`
   > Then try again."
   > Do NOT proceed with teaching until docs are available.
```

### 4.5 `src/core/shared/skill-generation.ts`

修改 `buildDocUrlsSection()` 输出格式，增加本地路径提示：

```typescript
export function buildDocUrlsSection(urls: Record<string, DocUrlEntry>): string {
  const entries = Object.entries(urls);
  if (entries.length === 0) {
    return '_(No mandatory documentation configured.)_';
  }
  const lines = entries.map(([, entry]) => {
    const repoNote = entry.repo
      ? ` (source: ${entry.repo.url.replace('https://github.com/', '').replace('.git', '')})`
      : '';
    return `- **${entry.name}**: \`.learn/docs/\`${repoNote}`;
  });
  return lines.join('\n') + '\n\n> If docs are not yet synced, run: `learn-anything sync`';
}
```

### 4.6 `src/i18n/types.ts`

新增 `SyncMessages` 接口：

```typescript
export interface SyncMessages {
  commandDescription: string;
  syncing: (lang: string) => string;
  syncComplete: (lang: string, count: number, time: string) => string;
  syncFailed: (lang: string, reason: string) => string;
  alreadySynced: (lang: string, date: string) => string;
  noGit: string;
  statusHeader: string;
  statusLine: (lang: string, date: string, files: number, size: string) => string;
  statusNotSynced: (lang: string) => string;
  initPrompt: string;
}

// LocaleMessages 中新增 sync 字段
export interface LocaleMessages {
  cli: CLIMessages;
  init: InitMessages;
  docSelection: DocSelectionMessages;
  sync: SyncMessages; // 新增
}
```

### 4.7 `src/i18n/locales/en.ts` + `zh-CN.ts`

英文文案：

```typescript
sync: {
  commandDescription: 'Sync official documentation to local for AI reference',
  syncing: (lang) => `📚 Syncing ${lang} documentation...`,
  syncComplete: (lang, count, time) => `  ✓ ${lang} — ${count} files synced (${time})`,
  syncFailed: (lang, reason) => `  ✗ ${lang} — sync failed: ${reason}`,
  alreadySynced: (lang, date) => `  ℹ ${lang} — already synced on ${date}, skipped (use --force to re-sync)`,
  noGit: 'git is not installed. Please install git and try again.',
  statusHeader: '📊 Documentation Sync Status',
  statusLine: (lang, date, files, size) => `  ✅ ${lang} — ${files} files, synced ${date} (${size})`,
  statusNotSynced: (lang) => `  ⬜ ${lang} — not synced`,
  initPrompt: '📚 Sync documentation now? (downloads official docs for AI reference)',
},
```

中文文案：

```typescript
sync: {
  commandDescription: '同步官方文档到本地，供 AI 教学时参考',
  syncing: (lang) => `📚 正在同步 ${lang} 文档...`,
  syncComplete: (lang, count, time) => `  ✓ ${lang} — ${count} 个文件已同步 (${time})`,
  syncFailed: (lang, reason) => `  ✗ ${lang} — 同步失败: ${reason}`,
  alreadySynced: (lang, date) => `  ℹ ${lang} — 已于 ${date} 同步，跳过（使用 --force 强制更新）`,
  noGit: '未检测到 git，请安装 git 后重试。',
  statusHeader: '📊 文档同步状态',
  statusLine: (lang, date, files, size) => `  ✅ ${lang} — ${files} 个文件，上次同步 ${date} (${size})`,
  statusNotSynced: (lang) => `  ⬜ ${lang} — 尚未同步`,
  initPrompt: '📚 是否立即同步文档？（下载官方文档供 AI 教学参考）',
},
```

### 4.8 `package.json`

新增依赖：

```json
"dependencies": {
  "cheerio": "^1.0.0",
  "turndown": "^7.2.0"
}
```

新增 devDependencies：

```json
"devDependencies": {
  "@types/turndown": "^5.0.5"
}
```

---

## 五、用户体验流程

### 场景 1：新用户完整流程

```bash
$ learn-anything init
⛩️  Learn Anything v0.2.0

📁 Enter doc storage path: [.learn/docs]
📚 Doc storage → .learn/docs

✓ Claude Code — 5 skill files generated

📚 Sync documentation now? (Y/n) Y
📚 Syncing JavaScript documentation...
  ✓ JavaScript — 42 files synced (8.3s)
📚 Syncing TypeScript documentation...
  ✓ TypeScript — 28 files synced (5.1s)

🌸 Ready!
```

### 场景 2：手动同步

```bash
$ learn-anything sync --lang javascript,react

📚 Syncing JavaScript documentation...
  ✓ JavaScript — 42 files synced (8.3s)
📚 Syncing React documentation...
  ✓ React — 35 files synced (6.7s)

✅ All done! 77 files synced.
```

### 场景 3：查看同步状态

```bash
$ learn-anything sync --status

📊 Documentation Sync Status
  ✅ JavaScript — 42 files, synced 2026-06-06 (256KB)
  ✅ React — 35 files, synced 2026-06-06 (180KB)
  ⬜ Vue — not synced
  ⬜ Python — not synced
  ⬜ Rust — not synced
  ⬜ Go — not synced
  ⬜ TypeScript — not synced
```

### 场景 4：缓存命中（7 天内不重复同步）

```bash
$ learn-anything sync --lang javascript

  ℹ JavaScript — already synced on 2026-06-06, skipped (use --force to re-sync)
```

### 场景 5：强制重新同步

```bash
$ learn-anything sync --lang javascript --force

📚 Syncing JavaScript documentation...
  ✓ JavaScript — 42 files synced (8.3s)
```

### 场景 6：AI 教学时（文档已同步）

```
用户: /learn:explain closures

AI 内部流程:
  1. Read .learn/docs/javascript/index.md → 找到 closures.md
  2. Read .learn/docs/javascript/closures.md → 官方原文
  3. 基于官方文档教学：

AI 输出:
  "根据 MDN JavaScript Guide 的 Closures 章节：
   A closure is the combination of a function and the lexical
   environment within which that function was declared.
   This environment consists of any local variables that were
   in-scope at the time the closure was created."
```

### 场景 7：AI 教学时（文档未同步）

```
用户: /learn:explain closures

AI 内部流程:
  1. 检查 .learn/docs/javascript/index.md → 不存在
  2. 阻断教学

AI 输出:
  "⚠️ JavaScript 文档尚未同步。请运行：
   `learn-anything sync --lang javascript`
   同步完成后再试。"
```

---

## 六、新增 CLI 命令

```bash
# 同步所有语言
learn-anything sync

# 同步指定语言（逗号分隔）
learn-anything sync --lang javascript,react,typescript

# 在指定目录同步
learn-anything sync ./my-project --lang javascript

# 强制重新同步（忽略 7 天缓存）
learn-anything sync --lang javascript --force

# 查看同步状态
learn-anything sync --status
```

---

## 七、测试计划

### 单元测试

```typescript
// test/doc-sync.test.ts

describe('Git Sync', () => {
  it('should clone and extract markdown files', async () => { ... });
  it('should generate index.md with correct structure', async () => { ... });
  it('should write _meta.json with correct metadata', async () => { ... });
  it('should handle git clone timeout gracefully', async () => { ... });
  it('should clean up temp directory after sync', async () => { ... });
  it('should normalize file names correctly', async () => { ... });
  it('should handle .mdx files by converting to .md', async () => { ... });
});

describe('Web Sync', () => {
  it('should fetch and convert HTML to markdown', async () => { ... });
  it('should respect rate limiting (500ms delay)', async () => { ... });
  it('should handle 404 errors gracefully', async () => { ... });
  it('should add source URL header to each file', async () => { ... });
});

describe('syncDocs', () => {
  it('should skip already-synced languages within 7 days', async () => { ... });
  it('should re-sync when --force is passed', async () => { ... });
  it('should return results for all requested languages', async () => { ... });
  it('should handle unknown language keys', async () => { ... });
});

describe('getSyncStatus', () => {
  it('should return null for unsynced languages', async () => { ... });
  it('should return metadata for synced languages', async () => { ... });
});
```

### 集成测试

```bash
# 完整流程
pnpm build

# 同步单个语言
node bin/learn-anything.js sync --lang javascript --force

# 验证目录结构
ls -la .learn/docs/javascript/
cat .learn/docs/javascript/index.md
cat .learn/docs/javascript/_meta.json

# 同步多个语言
node bin/learn-anything.js sync --lang react,typescript

# 查看状态
node bin/learn-anything.js sync --status

# 缓存命中
node bin/learn-anything.js sync --lang javascript
# 应显示 "already synced, skipped"

# 完整 init + sync
node bin/learn-anything.js init --tools claude --local
```

---

## 八、风险与应对

| 风险                   | 影响                       | 应对方案                                                       |
| ---------------------- | -------------------------- | -------------------------------------------------------------- |
| git 未安装             | 无法 clone                 | 启动时检测 `git --version`，提示安装；或 fallback 到 web crawl |
| 文档仓库过大           | mdn/content 有 1GB+        | 使用 `--depth 1 --filter=blob:none --sparse` 只拉取目标子目录  |
| 网络不稳定             | clone/fetch 超时           | 60s 超时 + 错误提示 + 允许重试                                 |
| .rst 文件（Python）    | 无法直接作为 Markdown 使用 | 简单正则转换（去掉 reST 标记），或跳过非 .md 文件              |
| .mdx 文件（React）     | 包含 JSX 组件标签          | 去除 import/JSX 标签，保留纯文本和代码块                       |
| 磁盘空间不足           | 文档可能很大               | \_meta.json 记录大小；sync --status 显示占用；提示用户         |
| 文档过期               | 官方文档更新后本地过时     | 7 天缓存期，过期自动重新同步                                   |
| sparse-checkout 不支持 | 旧版 git                   | 检测 git 版本 >= 2.25，不支持则 fallback 到完整 clone          |

---

## 九、实施步骤顺序

| 步骤 | 文件                                                        | 说明                              |
| ---- | ----------------------------------------------------------- | --------------------------------- |
| 1    | `package.json`                                              | 添加 cheerio、turndown 依赖       |
| 2    | `src/core/config.ts`                                        | 扩展 DocUrlEntry + 补充 repo 字段 |
| 3    | `src/core/doc-sync/types.ts`                                | 新增类型定义                      |
| 4    | `src/core/doc-sync/git-sync.ts`                             | 实现 git clone 策略               |
| 5    | `src/core/doc-sync/web-sync.ts`                             | 实现 web crawl 策略               |
| 6    | `src/core/doc-sync/index.ts`                                | 实现 syncDocs 入口                |
| 7    | `src/cli/sync-command.ts`                                   | 注册 sync CLI 命令                |
| 8    | `src/cli/index.ts`                                          | 引入 sync 命令                    |
| 9    | `src/core/init.ts`                                          | init 后提示同步                   |
| 10   | `src/core/shared/skill-generation.ts`                       | 修改 buildDocUrlsSection 输出     |
| 11   | `learn-topic.ts` / `learn-explain.ts` / `learn-practice.ts` | 更新 Step 0.5                     |
| 12   | `src/i18n/types.ts` + `en.ts` + `zh-CN.ts`                  | 新增 sync 文案                    |
| 13   | `test/doc-sync.test.ts`                                     | 新增测试                          |
| 14   | `pnpm install` + 验证                                       | 安装依赖 + build + test + lint    |
