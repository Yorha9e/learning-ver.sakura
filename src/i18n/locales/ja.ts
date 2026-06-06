import type { LocaleMessages } from '../types.js';

export const ja: LocaleMessages = {
  cli: {
    programDescription: 'AI を活用した再帰的学習システム — ソクラテス式メソッドと TDD 形式の演習',
    initCommandDescription: '現在のプロジェクトに Learn Anything の学習スキルを初期化',
    updateCommandDescription: 'Learn Anything のスキルファイルを最新版に更新',
    toolsOptionDescription: (ids: string) =>
      `AI ツールを指定（非インタラクティブモード）。"all"、"none"、またはカンマ区切りのリストを使用: ${ids}`,
    notDirectory: (path: string) => `パス "${path}" はディレクトリではありません`,
    dirNotExist: (path: string) =>
      `ディレクトリ "${path}" は存在しないため、自動的に作成されます。`,
    cannotAccess: (path: string, msg: string) => `パス "${path}" にアクセスできません: ${msg}`,
    errorPrefix: (msg: string) => `エラー: ${msg}`,
    updateComplete: 'Learn Anything のスキルファイルを更新しました。',
    forceOption: '確認プロンプトをスキップ',
    langOption: '表示言語: zh-CN / en / ja（デフォルト: システム言語）',
  },

  init: {
    header: '\n🧠 Learn Anything — AI を活用した再帰的学習システム\n',
    noToolsSelected:
      'AI ツールが選択されていません。--tools オプションで指定するか、インタラクティブモードで選択してください。',
    availableTools: (tools: string) => `利用可能なツール: ${tools}`,
    skillGenerated: (toolName: string) => `  ✓ ${toolName} — 5 個のスキルファイルを生成しました`,
    initComplete: '🎉 Learn Anything の初期化が完了しました！\n',
    globalDataPath: (dir: string) => `  学習データ保存先: ${dir}/`,
    startLearning: (example: string) => `  ${example} を実行して最初の学習トピックを始めましょう\n`,
    availableCommands: '利用可能な学習コマンド:',
    cmdLine: (cmd: string, desc: string) => `  ${cmd}${desc}`,
    interactiveSelectPrompt: 'スキルを生成する AI ツールを選択（スペースで選択、エンターで確定）:',
  },

  docSelection: {
    storagePath: '📁 ドキュメントをキャッシュするローカルディレクトリのパスを入力してください:',
    storagePathRequired: '保存パスは必須です。ディレクトリパスを入力してください。',
  },
};
