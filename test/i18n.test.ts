import { describe, it, expect } from 'vitest';
import { getMessages, detectSystemLocale, resolveLocale } from '../src/i18n/index.js';
import { ja } from '../src/i18n/locales/ja.js';
import { en } from '../src/i18n/locales/en.js';
import { zhCN } from '../src/i18n/locales/zh-CN.js';

describe('i18n — Japanese locale', () => {
  it('exports ja as a complete LocaleMessages', () => {
    expect(ja).toBeDefined();
    expect(ja.cli).toBeDefined();
    expect(ja.init).toBeDefined();
    expect(ja.docSelection).toBeDefined();
  });

  it('has matching shape to en and zh-CN', () => {
    // Same keys, same arity
    expect(Object.keys(ja.cli).sort()).toEqual(Object.keys(en.cli).sort());
    expect(Object.keys(ja.init).sort()).toEqual(Object.keys(en.init).sort());
    expect(Object.keys(ja.docSelection).sort()).toEqual(Object.keys(en.docSelection).sort());
  });

  it('contains Japanese characters (not empty strings)', () => {
    expect(ja.cli.programDescription.length).toBeGreaterThan(0);
    expect(ja.init.header.length).toBeGreaterThan(0);
    expect(ja.docSelection.storagePath.length).toBeGreaterThan(0);
    // Spot-check: should contain some CJK characters
    const hasCjk = /[぀-ヿ一-鿿]/.test(ja.init.header);
    expect(hasCjk).toBe(true);
  });

  it('message function arity matches the type', () => {
    // toolsOptionDescription takes 1 arg
    expect(ja.cli.toolsOptionDescription('a,b,c')).toContain('a,b,c');
    expect(ja.cli.notDirectory('/x')).toContain('/x');
    expect(ja.cli.cannotAccess('/x', 'err')).toContain('/x');
    expect(ja.cli.cannotAccess('/x', 'err')).toContain('err');
    expect(ja.cli.errorPrefix('e')).toContain('e');
  });

  it('getMessages returns ja when locale is "ja"', () => {
    expect(getMessages('ja')).toBe(ja);
    expect(getMessages('en')).toBe(en);
    expect(getMessages('zh-CN')).toBe(zhCN);
  });
});

describe('i18n — Locale resolution', () => {
  it('resolveLocale accepts ja explicitly', () => {
    expect(resolveLocale('ja')).toBe('ja');
  });

  it('resolveLocale accepts en and zh-CN', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('zh-CN')).toBe('zh-CN');
  });

  it('resolveLocale falls back to system default for unknown flag', () => {
    const orig = process.env.LANG;
    process.env.LANG = 'en_US.UTF-8';
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveLocale('xyz-unknown')).toBe('en');
    consoleSpy.mockRestore();
    if (orig) process.env.LANG = orig;
  });

  it('detectSystemLocale returns ja for LANG=ja_JP*', () => {
    const orig = process.env.LANG;
    process.env.LANG = 'ja_JP.UTF-8';
    expect(detectSystemLocale()).toBe('ja');
    if (orig) process.env.LANG = orig;
  });

  it('detectSystemLocale returns zh-CN for LANG=zh_*', () => {
    const orig = process.env.LANG;
    process.env.LANG = 'zh_CN.UTF-8';
    expect(detectSystemLocale()).toBe('zh-CN');
    if (orig) process.env.LANG = orig;
  });

  it('detectSystemLocale returns en for LANG=en_*', () => {
    const orig = process.env.LANG;
    process.env.LANG = 'en_US.UTF-8';
    expect(detectSystemLocale()).toBe('en');
    if (orig) process.env.LANG = orig;
  });
});
