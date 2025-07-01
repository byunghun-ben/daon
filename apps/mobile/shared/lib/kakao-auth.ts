import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { parseKakaoCallback, requestKakaoLoginUrl } from "../api/kakao-auth";

export interface KakaoLoginResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  needsChildSetup?: boolean;
  error?: string;
}

/**
 * 카카오톡 로그인 서비스 클래스
 */
export class KakaoAuthService {
  private static instance: KakaoAuthService;
  private isLoginInProgress = false;
  private loginPromiseResolve: ((result: KakaoLoginResult) => void) | null =
    null;

  private constructor() {
    // 딥링크 리스너 설정
    this.setupDeepLinkListener();
  }

  public static getInstance(): KakaoAuthService {
    if (!KakaoAuthService.instance) {
      KakaoAuthService.instance = new KakaoAuthService();
    }
    return KakaoAuthService.instance;
  }

  /**
   * 딥링크 리스너 설정
   */
  private setupDeepLinkListener() {
    Linking.addEventListener("url", (event) => {
      this.handleDeepLink(event.url);
    });
  }

  /**
   * 딥링크 처리
   */
  private handleDeepLink(url: string) {
    // 카카오 로그인 콜백인지 확인
    if (url.startsWith("daon://auth/kakao/callback")) {
      try {
        const result = parseKakaoCallback(url);
        this.resolveLogin(result);
      } catch (error) {
        this.resolveLogin({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다",
        });
      }
    }
  }

  /**
   * 로그인 Promise 해결
   */
  private resolveLogin(result: KakaoLoginResult) {
    if (this.loginPromiseResolve) {
      this.loginPromiseResolve(result);
      this.loginPromiseResolve = null;
    }
    this.isLoginInProgress = false;
  }

  /**
   * 카카오톡 로그인 시작
   */
  public async login(): Promise<KakaoLoginResult> {
    if (this.isLoginInProgress) {
      throw new Error("이미 로그인이 진행 중입니다");
    }

    this.isLoginInProgress = true;

    try {
      // 1. 백엔드에서 카카오 로그인 URL 가져오기
      const { loginUrl } = await requestKakaoLoginUrl({
        platform: "mobile",
      });

      // 2. 웹브라우저로 카카오 로그인 페이지 열기
      const result = await WebBrowser.openBrowserAsync(loginUrl, {
        dismissButtonStyle: "close",
        showTitle: true,
        controlsColor: "#007AFF",
        browserPackage: undefined, // 기본 브라우저 사용
      });

      // 3. 사용자가 브라우저를 닫은 경우
      if (result.type === "cancel" || result.type === "dismiss") {
        this.isLoginInProgress = false;
        return {
          success: false,
          error: "로그인이 취소되었습니다",
        };
      }

      // 4. 딥링크 콜백을 기다림
      return new Promise<KakaoLoginResult>((resolve) => {
        this.loginPromiseResolve = resolve;

        // 30초 타임아웃 설정
        setTimeout(() => {
          if (this.isLoginInProgress) {
            this.resolveLogin({
              success: false,
              error: "로그인 시간이 초과되었습니다",
            });
          }
        }, 30000);
      });
    } catch (error) {
      this.isLoginInProgress = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : "로그인에 실패했습니다",
      };
    }
  }

  /**
   * 초기 딥링크 확인 (앱이 딥링크로 시작된 경우)
   */
  public async checkInitialURL(): Promise<void> {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        this.handleDeepLink(initialUrl);
      }
    } catch (error) {
      console.warn("Failed to get initial URL:", error);
    }
  }

  /**
   * 로그인 상태 정리
   */
  public cleanup(): void {
    this.isLoginInProgress = false;
    this.loginPromiseResolve = null;
  }
}

// 싱글톤 인스턴스 내보내기
export const kakaoAuthService = KakaoAuthService.getInstance();
