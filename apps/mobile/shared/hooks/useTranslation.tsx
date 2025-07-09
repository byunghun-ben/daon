import type { SupportedLanguage } from "@/shared/lib/i18n";
import {
  changeLanguage,
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  getCurrentLanguage,
  getLanguageInfo,
  SUPPORTED_LANGUAGES,
  t as translateFunction,
  tp as translatePluralFunction,
} from "@/shared/lib/i18n";
import { useTranslation as useI18nextTranslation } from "react-i18next";

export const useTranslation = () => {
  const { t, i18n } = useI18nextTranslation();

  return {
    // 기본 번역 함수 (i18next 타입 안전성 활용)
    t,

    // 복수형 번역 함수
    tp: (key: string, count: number, options?: Record<string, unknown>) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return t(key, { count, ...options } as any);
      } catch (error) {
        console.error(`Plural translation error for key: ${key}`, error);
        return key;
      }
    },

    // 언어 관리
    currentLanguage: getCurrentLanguage(),
    changeLanguage: async (language: SupportedLanguage) => {
      try {
        await changeLanguage(language);
        return true;
      } catch (error) {
        console.error("Failed to change language:", error);
        return false;
      }
    },

    // 지원하는 언어 목록
    supportedLanguages: SUPPORTED_LANGUAGES,
    getLanguageInfo,

    // 포맷팅 함수들
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,

    // i18n 인스턴스 (필요한 경우)
    i18n,
  };
};

// 컴포넌트 밖에서 사용할 수 있는 함수들
export const translate = translateFunction;
export const translatePlural = translatePluralFunction;
export {
  changeLanguage,
  getCurrentLanguage,
  SUPPORTED_LANGUAGES,
} from "@/shared/lib/i18n";
export type { SupportedLanguage } from "@/shared/lib/i18n";
