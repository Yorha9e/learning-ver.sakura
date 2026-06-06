import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { analyzeProject } from '../src/core/analysis/index.js';
import { buildProjectContext, injectProjectContext } from '../src/core/shared/context-builder.js';
import { detectFromPackageJson } from '../src/core/analysis/detectors/package-json.js';
import { detectCodeStyle } from '../src/core/analysis/detectors/code-style.js';
import { detectProjectType } from '../src/core/analysis/detectors/project-type.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'learn-anything-test-'));
});

afterEach(async () => {
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
});

describe('detectFromPackageJson', () => {
  it('should detect TypeScript + React + Vite project', async () => {
    const pkg = {
      name: 'my-app',
      type: 'module',
      dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
      devDependencies: { typescript: '^5.9.0', vite: '^6.0.0', vitest: '^3.0.0' },
      scripts: { dev: 'vite', build: 'vite build', test: 'vitest' },
    };
    await fs.promises.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify(pkg));
    // create a lockfile so packageManager is detected
    await fs.promises.writeFile(path.join(tmpDir, 'package-lock.json'), '{}');

    const result = await detectFromPackageJson(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.techStack.language).toContain('TypeScript');
    expect(result!.techStack.framework).toContain('React');
    expect(result!.techStack.packageManager).toBe('npm');
    expect(result!.isEsm).toBe(true);
    expect(result!.testingSetup.framework).toBe('Vitest');
    expect(result!.buildTools).toContain('Vite');
  });

  it('should return null for non-Node project', async () => {
    const result = await detectFromPackageJson(tmpDir);
    expect(result).toBeNull();
  });
});

describe('detectCodeStyle', () => {
  it('should detect code style from source files', async () => {
    const srcDir = path.join(tmpDir, 'src');
    await fs.promises.mkdir(srcDir);

    const code = `import React from 'react';

const myComponent = () => {
  const name = 'hello';
  return <div>{name}</div>;
};

export default myComponent;
`;
    await fs.promises.writeFile(path.join(srcDir, 'App.tsx'), code);

    const style = await detectCodeStyle(tmpDir);
    expect(style.moduleSystem).toBe('esm');
  });

  it('should handle empty project gracefully', async () => {
    const style = await detectCodeStyle(tmpDir);
    expect(style.indent).toBeNull();
    expect(style.quotes).toBeNull();
    expect(style.moduleSystem).toBeNull();
  });
});

describe('detectProjectType', () => {
  it('should detect CLI project', () => {
    const type = detectProjectType({
      hasWorkspaces: false,
      dependencies: [
        { name: 'commander', version: '^14.0.0', type: 'dependency', category: 'utility' },
        { name: 'chalk', version: '^5.0.0', type: 'dependency', category: 'utility' },
      ],
      scripts: { build: 'tsc', start: 'node dist/index.js' },
    });
    expect(type).toBe('cli');
  });

  it('should detect web app project', () => {
    const type = detectProjectType({
      hasWorkspaces: false,
      dependencies: [
        { name: 'next', version: '^15.0.0', type: 'dependency', category: 'framework' },
        { name: 'react', version: '^19.0.0', type: 'dependency', category: 'framework' },
      ],
      scripts: {},
    });
    expect(type).toBe('web-app');
  });

  it('should detect API project', () => {
    const type = detectProjectType({
      hasWorkspaces: false,
      dependencies: [
        { name: 'fastify', version: '^5.0.0', type: 'dependency', category: 'framework' },
      ],
      scripts: {},
    });
    expect(type).toBe('api');
  });

  it('should detect library project', () => {
    const type = detectProjectType({
      hasWorkspaces: false,
      dependencies: [{ name: 'tsup', version: '^8.0.0', type: 'devDependency', category: 'build' }],
      scripts: { prepublishOnly: 'npm run build' },
    });
    expect(type).toBe('library');
  });

  it('should return unknown for empty project', () => {
    const type = detectProjectType({
      hasWorkspaces: false,
      dependencies: [],
      scripts: {},
    });
    expect(type).toBe('unknown');
  });
});

describe('analyzeProject', () => {
  it('should return full profile for a Node.js project', async () => {
    const pkg = {
      name: 'my-api',
      type: 'module',
      dependencies: { express: '^4.18.0', prisma: '^6.0.0' },
      devDependencies: { typescript: '^5.9.0', '@types/express': '^4.17.0' },
    };
    await fs.promises.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify(pkg));

    const srcDir = path.join(tmpDir, 'src');
    await fs.promises.mkdir(srcDir);
    await fs.promises.writeFile(path.join(srcDir, 'index.ts'), "import express from 'express';\n");

    const profile = await analyzeProject(tmpDir);
    expect(profile.techStack.language).toContain('TypeScript');
    expect(profile.techStack.framework).toContain('Express');
    expect(profile.projectType).toBe('api');
    expect(profile.codeStyle.moduleSystem).toBe('esm');
  });

  it('should handle empty directory gracefully', async () => {
    const profile = await analyzeProject(tmpDir);
    expect(profile.techStack.language).toBeNull();
    expect(profile.techStack.framework).toBeNull();
    expect(profile.projectType).toBe('unknown');
    expect(profile.dependencies).toEqual([]);
  });
});

describe('buildProjectContext', () => {
  it('should generate Markdown context block', async () => {
    const pkg = {
      dependencies: { react: '^19.0.0' },
      devDependencies: { typescript: '^5.9.0', vitest: '^3.0.0' },
    };
    await fs.promises.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify(pkg));

    const profile = await analyzeProject(tmpDir);
    const context = buildProjectContext(profile);

    expect(context).toContain('## Project Context (auto-detected)');
    expect(context).toContain('TypeScript');
    expect(context).toContain('React');
    expect(context).toContain('Vitest');
    expect(context).toContain('When generating code examples');
  });

  it('should skip null fields gracefully', async () => {
    const profile = await analyzeProject(tmpDir);
    const context = buildProjectContext(profile);

    expect(context).toContain('## Project Context (auto-detected)');
    // should not crash, and should still have the guidance line
    expect(context).toContain('When generating code examples');
  });
});

describe('injectProjectContext', () => {
  it('should append context to instructions', async () => {
    const pkg = { dependencies: { react: '^19.0.0' } };
    await fs.promises.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify(pkg));

    const profile = await analyzeProject(tmpDir);
    const instructions = 'You are a learning tutor. Help the user learn.';
    const result = injectProjectContext(instructions, profile);

    expect(result).toContain(instructions);
    expect(result).toContain('---');
    expect(result).toContain('## Project Context (auto-detected)');
    expect(result).toContain('React');
  });
});
