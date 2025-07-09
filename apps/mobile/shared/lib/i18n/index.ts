import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n, {
  changeLanguage as i18nextChangeLanguage,
  t as i18nextT,
  use as i18nextUse,
} from "i18next";
import { initReactI18next } from "react-i18next";

// 번역 리소스 Import
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

// 언어 설정 키
const LANGUAGE_KEY = "@daon:language";

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = {
  ko: { name: "한국어", nativeName: "한국어", flag: "🇰🇷" },
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// 언어 감지 함수
const detectLanguage = async (): Promise<SupportedLanguage> => {
  try {
    // 저장된 언어 설정 확인
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
      return savedLanguage as SupportedLanguage;
    }

    // 시스템 언어 확인
    const locales = getLocales();
    const systemLanguage = locales[0];

    if (systemLanguage) {
      // 언어 코드 매칭
      const languageCode = systemLanguage.languageCode;
      const regionCode = systemLanguage.regionCode;

      if (languageCode) {
        // 정확한 로케일 매칭 (중국어 등)
        if (regionCode) {
          const fullLocale = `${languageCode}-${regionCode}`;
          if (fullLocale in SUPPORTED_LANGUAGES) {
            return fullLocale as SupportedLanguage;
          }
        }

        // 언어 코드만 매칭
        if (languageCode in SUPPORTED_LANGUAGES) {
          return languageCode as SupportedLanguage;
        }
      }
    }

    // 기본값: 한국어
    return "ko";
  } catch (error) {
    console.error("Error detecting language:", error);
    return "ko";
  }
};

// i18n 설정
const initI18n = async () => {
  const detectedLanguage = await detectLanguage();

  return i18nextUse(initReactI18next).init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: detectedLanguage,
    fallbackLng: "ko",
    debug: __DEV__,

    // 네임스페이스 설정
    defaultNS: "translation",

    // 보간 설정
    interpolation: {
      escapeValue: false, // React는 기본적으로 XSS 방어를 함
      format: (value, format, lng) => {
        if (format === "uppercase") return value.toUpperCase();
        if (format === "lowercase") return value.toLowerCase();

        // 날짜 포맷팅
        if (format === "date") {
          return new Date(value).toLocaleDateString(lng);
        }
        if (format === "time") {
          return new Date(value).toLocaleTimeString(lng);
        }
        if (format === "datetime") {
          return new Date(value).toLocaleString(lng);
        }

        // 숫자 포맷팅
        if (format === "number") {
          return Number(value).toLocaleString(lng);
        }

        return value;
      },
    },

    // 복수형 처리
    pluralSeparator: "_",

    // React 특화 설정
    react: {
      useSuspense: false,
      bindI18n: "languageChanged",
      bindI18nStore: "added removed",
    },
  });
};

// 언어 변경 함수
export const changeLanguage = async (
  language: SupportedLanguage,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18nextChangeLanguage(language);
    console.log(`Language changed to: ${language}`);
  } catch (error) {
    console.error("Error changing language:", error);
    throw error;
  }
};

// 현재 언어 가져오기
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || "ko";
};

// 언어 정보 가져오기
export const getLanguageInfo = (language: SupportedLanguage) => {
  return SUPPORTED_LANGUAGES[language];
};

// 번역 키 타입 정의 (자동 생성)
export type TranslationKey = keyof typeof ko;

// 안전한 번역 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const t = (key: string, options?: any): string => {
  try {
    const result = i18nextT(key, options);
    return typeof result === "string" ? result : key;
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error);
    return key; // 키를 그대로 반환
  }
};

// 복수형 번역 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tp = (key: string, count: number, options?: any): string => {
  try {
    const result = i18nextT(key, { count, ...options });
    return typeof result === "string" ? result : key;
  } catch (error) {
    console.error(`Plural translation error for key: ${key}`, error);
    return key;
  }
};

// 날짜 현지화 함수
export const formatDate = (
  date: Date,
  format: "date" | "time" | "datetime" = "date",
): string => {
  const language = getCurrentLanguage();

  switch (format) {
    case "date":
      return date.toLocaleDateString(language);
    case "time":
      return date.toLocaleTimeString(language);
    case "datetime":
      return date.toLocaleString(language);
    default:
      return date.toLocaleDateString(language);
  }
};

// 숫자 현지화 함수
export const formatNumber = (number: number): string => {
  const language = getCurrentLanguage();
  return number.toLocaleString(language);
};

// 통화 현지화 함수
export const formatCurrency = (amount: number): string => {
  const language = getCurrentLanguage();
  const currencyMap = {
    ko: "KRW",
    en: "USD",
    ja: "JPY",
  };

  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: currencyMap[language] || "KRW",
  }).format(amount);
};

// 상대 시간 현지화 함수
export const formatRelativeTime = (date: Date): string => {
  const language = getCurrentLanguage();
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
};

// 초기화 함수
export const initializeI18n = async (): Promise<void> => {
  try {
    await initI18n();
    console.log("i18n initialized successfully");
  } catch (error) {
    console.error("Failed to initialize i18n:", error);
    throw error;
  }
};

// 기본 i18n 인스턴스 내보내기
export default i18n;
