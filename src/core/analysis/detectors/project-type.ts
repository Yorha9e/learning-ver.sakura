import type { ProjectType, DependencyInfo } from '../types.js';

interface ProjectTypeHints {
  hasWorkspaces: boolean;
  dependencies: DependencyInfo[];
  scripts: Record<string, string> | undefined;
}

const CLI_DEPS = [
  'commander',
  'yargs',
  'meow',
  'oclif',
  'clipanion',
  'caporal',
  'inquirer',
  '@inquirer/prompts',
  'prompts',
  'ora',
  'chalk',
  'picocolors',
  'boxen',
  'listr',
  'ink',
  'blessed',
];

const API_DEPS = [
  'express',
  'fastify',
  'koa',
  'hono',
  'hapi',
  '@nestjs/core',
  '@trpc/server',
  'graphql',
  'apollo-server',
  'graphql-yoga',
  'elysia',
  'nitro',
];

const LIBRARY_DEPS = ['rollup', 'tsup', 'unbuild', '@rollup/plugin-typescript'];

const WEB_APP_FRAMEWORKS = [
  'next',
  'nuxt',
  'gatsby',
  'remix',
  'astro',
  'sveltekit',
  '@sveltejs/kit',
  '@angular/core',
  'vitepress',
];

export function detectProjectType(hints: ProjectTypeHints): ProjectType {
  const depNames = new Set(hints.dependencies.map((d) => d.name));
  const scripts = hints.scripts ?? {};

  // Monorepo: workspaces + turbo/lerna/nx
  if (hints.hasWorkspaces) {
    if (depNames.has('turbo') || depNames.has('lerna') || depNames.has('nx')) {
      return 'monorepo';
    }
  }

  // CLI: has commander/yargs/etc + bin script
  const hasCliDep = CLI_DEPS.some((d) => depNames.has(d));
  const hasBinScript = !!(scripts.build && scripts.start) || !!scripts.prepublishOnly;
  if (
    hasCliDep &&
    (hasBinScript || scripts.dev?.includes('tsx') || scripts.dev?.includes('node'))
  ) {
    return 'cli';
  }

  // API: has server framework but no frontend framework
  const hasApiDep = API_DEPS.some((d) => depNames.has(d));
  const hasWebFramework = WEB_APP_FRAMEWORKS.some((d) => depNames.has(d));
  if (hasApiDep && !hasWebFramework) {
    return 'api';
  }

  // Web app: has frontend framework
  if (hasWebFramework) {
    return 'web-app';
  }

  // Library: has build tool + prepublishOnly
  const hasLibBuild = LIBRARY_DEPS.some((d) => depNames.has(d));
  if (hasLibBuild || scripts.prepublishOnly) {
    return 'library';
  }

  // Fallback: check for common patterns
  if (hasCliDep) return 'cli';
  if (hasApiDep) return 'api';

  return 'unknown';
}
