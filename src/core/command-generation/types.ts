export interface CommandContent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
}

export interface ToolCommandAdapter {
  toolId: string;
  getFilePath(commandId: string): string;
  formatFile(content: CommandContent): string;
}

export interface GeneratedCommand {
  path: string;
  fileContent: string;
}
