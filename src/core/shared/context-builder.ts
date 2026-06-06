import type { ProjectProfile } from '../analysis/types.js';

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'web-app': 'Web Application',
  cli: 'CLI Tool',
  library: 'Library / Package',
  api: 'API / Backend Service',
  monorepo: 'Monorepo',
  unknown: 'Unknown',
};

/**
 * Converts a ProjectProfile into a Markdown context block
 * that can be injected into skill template instructions.
 */
export function buildProjectContext(profile: ProjectProfile): string {
  const lines: string[] = [];

  lines.push('## Project Context (auto-detected)');
  lines.push('');

  // Tech stack
  if (profile.techStack.language || profile.techStack.framework || profile.techStack.runtime) {
    if (profile.techStack.language) lines.push(`- **Language**: ${profile.techStack.language}`);
    if (profile.techStack.framework) lines.push(`- **Framework**: ${profile.techStack.framework}`);
    if (profile.techStack.runtime) lines.push(`- **Runtime**: ${profile.techStack.runtime}`);
    if (profile.techStack.packageManager)
      lines.push(`- **Package Manager**: ${profile.techStack.packageManager}`);
  }

  // Project type
  if (profile.projectType !== 'unknown') {
    lines.push(`- **Project Type**: ${PROJECT_TYPE_LABELS[profile.projectType]}`);
  }

  // Testing
  if (profile.testingSetup.framework) {
    const testLine = profile.testingSetup.coverageTool
      ? `${profile.testingSetup.framework} + ${profile.testingSetup.coverageTool}`
      : profile.testingSetup.framework;
    lines.push(`- **Testing**: ${testLine}`);
  }

  // Build tools
  if (profile.buildTools.length > 0) {
    lines.push(`- **Build Tools**: ${profile.buildTools.join(', ')}`);
  }

  // Key dependencies (only framework/testing/database/styling, not all deps)
  const keyDeps = profile.dependencies.filter(
    (d) => ['framework', 'database', 'styling'].includes(d.category) && d.type === 'dependency',
  );
  if (keyDeps.length > 0) {
    lines.push(`- **Key Libraries**: ${keyDeps.map((d) => d.name).join(', ')}`);
  }

  // Code style
  const styleItems: string[] = [];
  if (profile.codeStyle.moduleSystem) styleItems.push(profile.codeStyle.moduleSystem.toUpperCase());
  if (profile.codeStyle.quotes) styleItems.push(`${profile.codeStyle.quotes} quotes`);
  if (profile.codeStyle.indent)
    styleItems.push(
      `${profile.codeStyle.indentSize ?? 2}-${profile.codeStyle.indent === 'tabs' ? 'tab' : 'space'} indent`,
    );
  if (profile.codeStyle.semicolons !== null)
    styleItems.push(profile.codeStyle.semicolons ? 'semicolons' : 'no semicolons');
  if (profile.codeStyle.namingConvention)
    styleItems.push(`${profile.codeStyle.namingConvention} naming`);
  if (styleItems.length > 0) {
    lines.push(`- **Code Style**: ${styleItems.join(', ')}`);
  }

  // Guidance for AI
  lines.push('');
  lines.push('When generating code examples, use the above tech stack and code style.');
  lines.push(
    "When suggesting practice exercises, align with this project's patterns and frameworks.",
  );

  return lines.join('\n');
}

/**
 * Injects project context into template instructions.
 * Appends the context block at the end of the instructions.
 */
export function injectProjectContext(instructions: string, profile: ProjectProfile): string {
  const context = buildProjectContext(profile);
  return `${instructions}\n\n---\n\n${context}\n`;
}
