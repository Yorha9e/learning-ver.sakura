export type ProjectType = 'web-app' | 'cli' | 'library' | 'api' | 'monorepo' | 'unknown';

export interface TechStackInfo {
  language: string | null; // e.g. "TypeScript 5.x", "Rust 1.78"
  framework: string | null; // e.g. "React 19 + Next.js 15"
  runtime: string | null; // e.g. "Node.js 20", "Deno 2"
  packageManager: string | null; // e.g. "pnpm", "npm", "yarn"
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
  category:
    | 'framework'
    | 'testing'
    | 'build'
    | 'linting'
    | 'database'
    | 'styling'
    | 'utility'
    | 'other';
}

export interface CodeStyleInfo {
  indent: 'spaces' | 'tabs' | null;
  indentSize: number | null; // 2, 4, etc.
  quotes: 'single' | 'double' | null;
  namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'mixed' | null;
  moduleSystem: 'esm' | 'cjs' | null;
  semicolons: boolean | null;
}

export interface TestingInfo {
  framework: string | null; // e.g. "vitest", "jest", "pytest"
  coverageTool: string | null; // e.g. "c8", "istanbul"
  hasTests: boolean;
}

export interface ProjectProfile {
  techStack: TechStackInfo;
  dependencies: DependencyInfo[];
  projectType: ProjectType;
  codeStyle: CodeStyleInfo;
  testingSetup: TestingInfo;
  buildTools: string[];
}
