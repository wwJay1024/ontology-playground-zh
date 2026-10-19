import { useCallback } from 'react';
import { create } from 'zustand';
import { zhCN } from './zh-CN';

export type Locale = 'zh-CN' | 'en';

const STORAGE_KEY = 'ontology-playground.locale';

/**
 * 词条以英文原文为键，中文词典只登记译法。
 * 未登记的文案直接回落英文，新增文案不会因为缺词条而中断渲染。
 */
type Vars = Record<string, string | number>;

function readStoredLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh-CN' || saved === 'en') return saved;
  } catch {
    // 隐私模式或受限环境下读不到，按默认语言处理
  }
  return 'zh-CN';
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: readStoredLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // 存储不可用时仅本次会话生效
    }
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

export function translateIn(locale: Locale, key: string, vars?: Vars): string {
  const template = locale === 'en' ? key : (zhCN[key] ?? key);
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in vars ? String(vars[name]) : placeholder,
  );
}

export function t(key: string, vars?: Vars): string {
  return translateIn(useI18nStore.getState().locale, key, vars);
}

export function useT() {
  const locale = useI18nStore((state) => state.locale);
  return useCallback((key: string, vars?: Vars) => translateIn(locale, key, vars), [locale]);
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = useI18nStore.getState().locale;
}
