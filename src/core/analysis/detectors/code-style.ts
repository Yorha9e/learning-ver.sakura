import * as fs from 'fs';
import path from 'path';
import type { CodeStyleInfo } from '../types.js';

const SAMPLE_SIZE = 20;       // max files to sample
const LINES_TO_CHECK = 50;    // lines per file to analyze

async function collectSourceFiles(rootPath: string): Promise<string[]> {
  const srcDir = path.join(rootPath, 'src');
  const targetDir = fs.existsSync(srcDir) ? srcDir : rootPath;
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    if (files.length >= SAMPLE_SIZE) return;
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (files.length >= SAMPLE_SIZE) break;
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (exts.includes(path.extname(entry.name))) {
        files.push(full);
      }
    }
  }

  await walk(targetDir);
  return files;
}

function detectIndent(lines: string[]): { indent: 'spaces' | 'tabs'; size: number } | null {
  let spaceCount = 0;
  let tabCount = 0;
  const spaceSizes: Record<number, number> = {};

  for (const line of lines) {
    if (line.length === 0 || !line.match(/^\s/)) continue;
    if (line.startsWith('\t')) {
      tabCount++;
    } else {
      const match = line.match(/^( +)/);
      if (match) {
        spaceCount++;
        const size = match[1].length;
        spaceSizes[size] = (spaceSizes[size] || 0) + 1;
      }
    }
  }

  if (tabCount > spaceCount) return { indent: 'tabs', size: 1 };
  if (spaceCount > tabCount) {
    // find most common indent size
    let bestSize = 2;
    let bestCount = 0;
    for (const [size, count] of Object.entries(spaceSizes)) {
      if (count > bestCount) {
        bestCount = count;
        bestSize = parseInt(size);
      }
    }
    return { indent: 'spaces', size: bestSize };
  }
  return null;
}

function detectQuotes(lines: string[]): 'single' | 'double' | null {
  let single = 0;
  let double = 0;

  for (const line of lines) {
    // simple heuristic: count non-escaped quote chars
    const stripped = line.replace(/\/\/.*/, '').replace(/\/\*.*?\*\//g, '');
    single += (stripped.match(/(?<!\\)'/g) || []).length;
    double += (stripped.match(/(?<!\\)"/g) || []).length;
  }

  if (single > double * 1.5) return 'single';
  if (double > single * 1.5) return 'double';
  return null;
}

function detectSemicolons(lines: string[]): boolean | null {
  let withSemi = 0;
  let withoutSemi = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    // only check lines that look like statements
    if (trimmed.endsWith(';') && !trimmed.endsWith(';;')) {
      withSemi++;
    } else if (
      trimmed.endsWith(',') ||
      trimmed.endsWith('{') ||
      trimmed.endsWith('}') ||
      trimmed.endsWith('(') ||
      trimmed.endsWith(')') ||
      trimmed.endsWith(':') ||
      trimmed.startsWith('import') ||
      trimmed.startsWith('export')
    ) {
      // these are structural, skip
    } else if (trimmed.length > 3 && !trimmed.startsWith('//')) {
      withoutSemi++;
    }
  }

  if (withSemi + withoutSemi < 5) return null;
  return withSemi > withoutSemi;
}

function detectNamingConvention(files: string[]): CodeStyleInfo['namingConvention'] {
  // Simple heuristic: look at variable/function declarations
  let camelCase = 0;
  let snakeCase = 0;
  let pascalCase = 0;

  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    if (/^[a-z][a-zA-Z0-9]*$/.test(basename)) camelCase++;
    else if (/^[a-z][a-z0-9_]*$/.test(basename)) snakeCase++;
    else if (/^[A-Z][a-zA-Z0-9]*$/.test(basename)) pascalCase++;
  }

  if (camelCase > snakeCase && camelCase > pascalCase) return 'camelCase';
  if (snakeCase > camelCase && snakeCase > pascalCase) return 'snake_case';
  if (pascalCase > camelCase && pascalCase > snakeCase) return 'PascalCase';
  return 'mixed';
}

export async function detectCodeStyle(rootPath: string): Promise<CodeStyleInfo> {
  const files = await collectSourceFiles(rootPath);

  if (files.length === 0) {
    return { indent: null, indentSize: null, quotes: null, namingConvention: null, moduleSystem: null, semicolons: null };
  }

  const allLines: string[] = [];
  for (const file of files.slice(0, SAMPLE_SIZE)) {
    try {
      const content = await fs.promises.readFile(file, 'utf-8');
      const lines = content.split('\n').slice(0, LINES_TO_CHECK);
      allLines.push(...lines);
    } catch {
      // skip unreadable files
    }
  }

  const indentResult = detectIndent(allLines);
  const quotes = detectQuotes(allLines);
  const semicolons = detectSemicolons(allLines);
  const namingConvention = detectNamingConvention(files);

  // module system: check if files use import/export (ESM) or require (CJS)
  let esmCount = 0;
  let cjsCount = 0;
  for (const line of allLines) {
    if (/^\s*import\s/.test(line) || /^\s*export\s/.test(line)) esmCount++;
    if (/require\s*\(/.test(line)) cjsCount++;
  }
  const moduleSystem = esmCount > cjsCount ? 'esm' : cjsCount > esmCount ? 'cjs' : null;

  return {
    indent: indentResult?.indent ?? null,
    indentSize: indentResult?.size ?? null,
    quotes,
    namingConvention,
    moduleSystem,
    semicolons,
  };
}
