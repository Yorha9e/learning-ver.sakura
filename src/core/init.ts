import path from 'path';
import chalk from 'chalk';
import * as fs from 'fs';
import { createRequire } from 'module';
import boxen from 'boxen';
import ora from 'ora';
import { FileSystemUtils } from '../utils/file-system.js';
import { AI_TOOLS, AIToolOption, LEARN_DIR, DEFAULT_DOC_URLS } from './config.js';
import { isInteractive } from '../utils/interactive.js';
import { generateCommands, CommandAdapterRegistry } from './command-generation/index.js';
import {
  getSkillTemplates,
  getCommandContents,
  generateSkillContent,
  buildDocUrlsSection,
  buildDocsPathSection,
} from './shared/index.js';
import type { SupportedLocale } from '../i18n/types.js';
import { getMessages } from '../i18n/index.js';
import { promptDocStoragePath } from './doc-selection.js';

const require = createRequire(import.meta.url);
const { version: VERSION } = require('../../package.json');

type InitCommandOptions = {
  tools?: string;
  force?: boolean;
  locale?: SupportedLocale;
  update?: boolean;
  global?: boolean;
};

export class InitCommand {
  private readonly toolsArg?: string;
  private readonly force: boolean;
  private readonly locale: SupportedLocale;
  private readonly isUpdate: boolean;
  private readonly isGlobal: boolean;

  constructor(options: InitCommandOptions = {}) {
    this.toolsArg = options.tools;
    this.force = options.force ?? false;
    this.locale = options.locale ?? 'en';
    this.isUpdate = options.update ?? false;
    this.isGlobal = options.global ?? false;
  }

  async execute(targetPath: string = '.'): Promise<void> {
    const resolvedPath = path.resolve(targetPath);
    const m = getMessages(this.locale);

    // Determine base directory: global (~) or project
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const basePath = this.isGlobal ? homeDir : resolvedPath;

    // Ensure target directory exists
    await FileSystemUtils.ensureDir(basePath);

    // .learn/ is always created in the project directory (resolvedPath), not global
    const learnDir = path.join(resolvedPath, LEARN_DIR);
    await FileSystemUtils.ensureDir(path.join(learnDir, 'topics'));
    await FileSystemUtils.ensureDir(path.join(learnDir, 'docs'));

    console.log('');

    // Japanese theme colors
    const sakura = chalk.hex('#FFB7C5');
    const pink = chalk.hex('#FF6B9D');

    console.log(
      boxen(
        pink.bold('⛩️  Learn Anything') +
          chalk.dim(`  v${VERSION}`) +
          '\n' +
          chalk.dim(this.isGlobal ? 'Global Installation' : 'AI-Powered Recursive Learning System'),
        {
          padding: 1,
          margin: { top: 0, bottom: 0, left: 2, right: 2 },
          borderStyle: 'round',
          borderColor: '#FF6B9D',
        },
      ),
    );
    console.log('');

    // Detect available tools
    const availableTools = await this.detectTools(basePath);

    // Select tools
    let selectedTools: AIToolOption[];
    if (this.toolsArg === 'all') {
      selectedTools = availableTools.filter((t) => t.available);
    } else if (this.toolsArg === 'none') {
      selectedTools = [];
    } else if (this.toolsArg) {
      const toolIds = this.toolsArg.split(',').map((t) => t.trim());
      selectedTools = availableTools.filter((t) => toolIds.includes(t.value));
    } else if (this.isUpdate || !isInteractive()) {
      selectedTools = availableTools.filter((t) => t.available && this.hasToolDir(basePath, t));
    } else {
      selectedTools = await this.interactiveSelect(availableTools);
    }

    if (selectedTools.length === 0) {
      console.log(chalk.yellow(m.init.noToolsSelected));
      console.log(
        chalk.dim(
          m.init.availableTools(
            availableTools
              .filter((t) => t.available)
              .map((t) => t.value)
              .join(', '),
          ),
        ),
      );
      return;
    }

    // Collect doc storage path — all DEFAULT_DOC_URLS are baked into skills
    const storagePath = await promptDocStoragePath(this.locale);
    console.log(chalk.dim(`  📚 Doc storage → ${storagePath}`));
    console.log('');

    // Generate skill files for each tool
    const spinner2 = ora({
      text: sakura('🌸') + ' Generating skills...',
      spinner: 'dots',
      color: 'magenta',
    }).start();
    const toolResults: {
      name: string;
      skillsDir: string;
      skillCount: number;
      commandCount: number;
    }[] = [];

    for (const tool of selectedTools) {
      if (!tool.skillsDir) continue;
      const skillCount = await this.generateSkillsForTool(basePath, tool, storagePath);
      const commandCount = await this.generateCommandsForTool(basePath, tool);
      toolResults.push({ name: tool.name, skillsDir: tool.skillsDir, skillCount, commandCount });
    }
    spinner2.succeed(sakura('🌸') + ' Skills generated');
    console.log('');

    // Tool results
    for (const result of toolResults) {
      console.log(pink('  ⛩️ ') + pink.bold(result.name));
      console.log(
        sakura('     ├─ ') +
          chalk.dim(`${result.skillCount} skills    → ${result.skillsDir}/skills/`),
      );
      console.log(
        sakura('     └─ ') +
          chalk.dim(`${result.commandCount} commands  → ${result.skillsDir}/commands/learn/`),
      );
    }
    console.log('');

    // Summary
    const summaryLines: string[] = [];
    if (this.isGlobal) {
      summaryLines.push(
        sakura('  🌸 ') + chalk.bold('Global install') + chalk.dim(` → ${basePath}`),
      );
    }
    summaryLines.push(
      sakura('  🌸 ') + chalk.bold('Learning data') + chalk.dim(` → ${LEARN_DIR}/`),
    );
    summaryLines.push(sakura('  📚 ') + chalk.bold('Doc storage') + chalk.dim(` → ${storagePath}`));
    for (const result of toolResults) {
      summaryLines.push(
        pink('  ⛩️ ') + chalk.bold(result.name) + chalk.dim(` → ${result.skillsDir}/`),
      );
    }
    summaryLines.push('');
    summaryLines.push(pink('  🌸 ') + pink.bold('Ready!') + chalk.dim('  Try these commands:'));
    summaryLines.push('');
    summaryLines.push(
      chalk.cyan('     /learn:topic') +
        chalk.dim(' <topic-name>') +
        chalk.dim('      — Initialize a learning topic'),
    );
    summaryLines.push(
      chalk.cyan('     /learn:explain') +
        chalk.dim(' <concept>') +
        chalk.dim('      — Deep-dive into a concept'),
    );
    summaryLines.push(
      chalk.cyan('     /learn:practice') +
        chalk.dim(' <concept>') +
        chalk.dim('     — TDD-style exercises'),
    );
    summaryLines.push(
      chalk.cyan('     /learn:review') +
        chalk.dim(' [topic]') +
        chalk.dim('        — Review progress'),
    );
    summaryLines.push(
      chalk.cyan('     /learn:status') +
        chalk.dim(' [topic]') +
        chalk.dim('        — Visualize knowledge map'),
    );
    summaryLines.push('');
    summaryLines.push(sakura('  🌸') + chalk.dim('  Happy learning! ') + sakura('🌸'));

    console.log(
      boxen(summaryLines.join('\n'), {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 0, left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: '#FF6B9D',
        title: sakura('🌸') + pink.bold(' Summary ') + sakura('🌸'),
        titleAlignment: 'center',
      }),
    );
    console.log('');
  }

  private async detectTools(_resolvedPath: string): Promise<AIToolOption[]> {
    return AI_TOOLS;
  }

  private hasToolDir(resolvedPath: string, tool: AIToolOption): boolean {
    if (!tool.skillsDir) return false;
    const dirPath = path.join(resolvedPath, tool.skillsDir);
    try {
      return fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  private async interactiveSelect(tools: AIToolOption[]): Promise<AIToolOption[]> {
    const availableTools = tools.filter((t) => t.available && t.skillsDir);
    const { checkbox } = await import('@inquirer/prompts');

    // Auto-detect existing tool dirs and pre-select them
    const detected = availableTools.filter((t) => this.hasToolDir(process.cwd(), t));
    const detectedValues = new Set(detected.map((t) => t.value));

    const choices = availableTools.map((t) => ({
      name: t.name,
      value: t.value,
      checked: detectedValues.has(t.value),
    }));

    const selected = await checkbox({
      message: getMessages(this.locale).init.interactiveSelectPrompt,
      choices,
      pageSize: 15,
    });

    return availableTools.filter((t) => selected.includes(t.value));
  }

  private async generateSkillsForTool(
    resolvedPath: string,
    tool: AIToolOption,
    storagePath: string,
  ): Promise<number> {
    const skillTemplates = getSkillTemplates();
    const docUrlsSection = buildDocUrlsSection(DEFAULT_DOC_URLS);
    const docsPathSection = buildDocsPathSection(storagePath);

    for (const entry of skillTemplates) {
      const skillDir = path.join(resolvedPath, tool.skillsDir!, 'skills', entry.dirName);
      const skillFile = path.join(skillDir, 'SKILL.md');
      const content = generateSkillContent(entry.template, VERSION, (instructions) => {
        return instructions
          .replace(/\{\{DOC_URLS\}\}/g, docUrlsSection)
          .replace(/\{\{DOCS_PATH\}\}/g, docsPathSection);
      });
      await FileSystemUtils.writeFile(skillFile, content);
    }
    return skillTemplates.length;
  }

  private async generateCommandsForTool(resolvedPath: string, tool: AIToolOption): Promise<number> {
    const adapter = CommandAdapterRegistry.get(tool.value);
    if (!adapter) return 0;

    const commandContents = getCommandContents();
    const generatedCommands = generateCommands(commandContents, adapter);

    for (const cmd of generatedCommands) {
      const filePath = path.resolve(resolvedPath, cmd.path);
      await FileSystemUtils.writeFile(filePath, cmd.fileContent);
    }
    return generatedCommands.length;
  }
}
