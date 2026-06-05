import * as fs from 'fs';
import path from 'path';
import type { TechStackInfo, DependencyInfo, TestingInfo } from '../types.js';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  type?: string;
  engines?: Record<string, string>;
  packageManager?: string;
  workspaces?: string[] | { packages: string[] };
}

const FRAMEWORK_DEPS: Record<string, string> = {
  'next': 'Next.js',
  'nuxt': 'Nuxt',
  'gatsby': 'Gatsby',
  'remix': 'Remix',
  'astro': 'Astro',
  'sveltekit': 'SvelteKit',
  '@sveltejs/kit': 'SvelteKit',
  'react': 'React',
  'vue': 'Vue',
  'svelte': 'Svelte',
  'angular': 'Angular',
  '@angular/core': 'Angular',
  'solid-js': 'Solid.js',
  'preact': 'Preact',
  'express': 'Express',
  'fastify': 'Fastify',
  'koa': 'Koa',
  'hono': 'Hono',
  'nestjs': 'NestJS',
  '@nestjs/core': 'NestJS',
  'electron': 'Electron',
  'tauri-apps': 'Tauri',
};

const TESTING_DEPS: Record<string, { framework: string; coverage?: string }> = {
  'vitest': { framework: 'Vitest', coverage: 'c8' },
  'jest': { framework: 'Jest', coverage: 'istanbul' },
  'mocha': { framework: 'Mocha' },
  'chai': { framework: 'Chai' },
  '@playwright/test': { framework: 'Playwright' },
  'cypress': { framework: 'Cypress' },
  'pytest': { framework: 'pytest' },
  'unittest': { framework: 'unittest' },
  'rspec': { framework: 'RSpec' },
  'minitest': { framework: 'Minitest' },
  '@testing-library/react': { framework: 'Testing Library (React)' },
  '@testing-library/vue': { framework: 'Testing Library (Vue)' },
  'happy-dom': { framework: 'happy-dom' },
  'jsdom': { framework: 'jsdom' },
};

const BUILD_DEPS: Record<string, string> = {
  'vite': 'Vite',
  'webpack': 'Webpack',
  'esbuild': 'esbuild',
  'rollup': 'Rollup',
  'parcel': 'Parcel',
  'turbopack': 'Turbopack',
  'tsup': 'tsup',
  'unbuild': 'unbuild',
  'swc': 'SWC',
  '@swc/core': 'SWC',
  'turbo': 'Turborepo',
};

const LINTING_DEPS = [
  'eslint', 'prettier', 'biome', 'oxlint', '@biomejs/biome',
  'stylelint', 'commitlint',
];

const DATABASE_DEPS: Record<string, string> = {
  'prisma': 'Prisma',
  '@prisma/client': 'Prisma',
  'drizzle-orm': 'Drizzle ORM',
  'typeorm': 'TypeORM',
  'sequelize': 'Sequelize',
  'mongoose': 'Mongoose',
  'knex': 'Knex',
  'kysely': 'Kysely',
  'pg': 'PostgreSQL',
  'mysql2': 'MySQL',
  'better-sqlite3': 'SQLite',
  'sqlite3': 'SQLite',
  'redis': 'Redis',
  'ioredis': 'Redis',
};

const STYLING_DEPS: Record<string, string> = {
  'tailwindcss': 'Tailwind CSS',
  '@emotion/react': 'Emotion',
  'styled-components': 'styled-components',
  'sass': 'Sass',
  'less': 'Less',
  'postcss': 'PostCSS',
  'css-modules': 'CSS Modules',
};

function categorizeDep(name: string, _version: string): DependencyInfo['category'] {
  if (FRAMEWORK_DEPS[name]) return 'framework';
  if (TESTING_DEPS[name]) return 'testing';
  if (BUILD_DEPS[name]) return 'build';
  if (LINTING_DEPS.includes(name)) return 'linting';
  if (DATABASE_DEPS[name]) return 'database';
  if (STYLING_DEPS[name]) return 'styling';
  if (name.startsWith('@types/') || name === 'typescript') return 'build';
  return 'utility';
}

export async function detectFromPackageJson(rootPath: string): Promise<{
  techStack: Partial<TechStackInfo>;
  dependencies: DependencyInfo[];
  testingSetup: Partial<TestingInfo>;
  buildTools: string[];
  isEsm: boolean;
  hasWorkspaces: boolean;
} | null> {
  const pkgPath = path.join(rootPath, 'package.json');

  let raw: string;
  try {
    raw = await fs.promises.readFile(pkgPath, 'utf-8');
  } catch {
    return null;
  }

  let pkg: PackageJson;
  try {
    pkg = JSON.parse(raw);
  } catch {
    return null;
  }

  const allDeps: Record<string, string> = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  // Detect framework
  let framework: string | null = null;
  for (const [dep, name] of Object.entries(FRAMEWORK_DEPS)) {
    if (allDeps[dep]) {
      framework = `${name} ${allDeps[dep]}`;
      break;
    }
  }

  // Detect runtime
  let runtime: string | null = null;
  if (pkg.engines?.node) {
    runtime = `Node.js ${pkg.engines.node}`;
  }

  // Detect package manager
  let packageManager: string | null = null;
  if (pkg.packageManager) {
    packageManager = pkg.packageManager.split('@')[0];
  } else if (fs.existsSync(path.join(rootPath, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(rootPath, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (fs.existsSync(path.join(rootPath, 'package-lock.json'))) {
    packageManager = 'npm';
  } else if (fs.existsSync(path.join(rootPath, 'bun.lockb'))) {
    packageManager = 'bun';
  }

  // Detect language
  let language: string | null = null;
  if (allDeps['typescript']) {
    language = `TypeScript ${allDeps['typescript']}`;
  }

  const isEsm = pkg.type === 'module';
  const hasWorkspaces = Array.isArray(pkg.workspaces) ||
    !!(pkg.workspaces && typeof pkg.workspaces === 'object' && 'packages' in pkg.workspaces);

  // Build dependencies list
  const dependencies: DependencyInfo[] = [];
  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    dependencies.push({
      name,
      version,
      type: 'dependency',
      category: categorizeDep(name, version),
    });
  }
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
    dependencies.push({
      name,
      version,
      type: 'devDependency',
      category: categorizeDep(name, version),
    });
  }

  // Detect testing setup
  let testFramework: string | null = null;
  let coverageTool: string | null = null;
  const hasTestScript = !!pkg.scripts?.test && pkg.scripts.test !== 'echo "Error: no test specified" && exit 1';

  for (const [dep, info] of Object.entries(TESTING_DEPS)) {
    if (allDeps[dep]) {
      testFramework = info.framework;
      if (info.coverage) coverageTool = info.coverage;
      break;
    }
  }

  // Detect build tools
  const buildTools: string[] = [];
  for (const [dep, name] of Object.entries(BUILD_DEPS)) {
    if (allDeps[dep]) {
      buildTools.push(name);
    }
  }

  return {
    techStack: { language, framework, runtime, packageManager },
    dependencies,
    testingSetup: {
      framework: testFramework,
      coverageTool,
      hasTests: hasTestScript,
    },
    buildTools,
    isEsm,
    hasWorkspaces,
  };
}
