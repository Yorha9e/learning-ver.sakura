import type { ProjectProfile, TechStackInfo, DependencyInfo, TestingInfo } from './types.js';
import { detectFromPackageJson } from './detectors/package-json.js';
import { detectCodeStyle } from './detectors/code-style.js';
import { detectProjectType } from './detectors/project-type.js';

export type {
  ProjectProfile,
  TechStackInfo,
  DependencyInfo,
  CodeStyleInfo,
  TestingInfo,
} from './types.js';

export async function analyzeProject(rootPath: string): Promise<ProjectProfile> {
  const [pkgResult, codeStyle] = await Promise.all([
    detectFromPackageJson(rootPath),
    detectCodeStyle(rootPath),
  ]);

  const techStack: TechStackInfo = {
    language: pkgResult?.techStack.language ?? null,
    framework: pkgResult?.techStack.framework ?? null,
    runtime: pkgResult?.techStack.runtime ?? null,
    packageManager: pkgResult?.techStack.packageManager ?? null,
  };

  const dependencies: DependencyInfo[] = pkgResult?.dependencies ?? [];

  const projectType = detectProjectType({
    hasWorkspaces: pkgResult?.hasWorkspaces ?? false,
    dependencies,
    scripts: undefined, // we don't need scripts for now, deps are enough
  });

  const testingSetup: TestingInfo = {
    framework: pkgResult?.testingSetup.framework ?? null,
    coverageTool: pkgResult?.testingSetup.coverageTool ?? null,
    hasTests: pkgResult?.testingSetup.hasTests ?? false,
  };

  const buildTools: string[] = pkgResult?.buildTools ?? [];

  return {
    techStack,
    dependencies,
    projectType,
    codeStyle,
    testingSetup,
    buildTools,
  };
}
