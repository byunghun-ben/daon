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
  private processedUrls = new Set<string>();

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
    console.log("🔗 Setting up deep link listener");

    Linking.addEventListener("url", (event) => {
      console.log("🔗 URL event received:", event.url);
      this.handleDeepLink(event.url);
    });

    // 현재 등록된 스킴 확인
    Linking.canOpenURL("daon://").then((supported) => {
      console.log("🔗 Daon scheme supported:", supported);
    });
  }

  /**
   * 딥링크 처리
   */
  private handleDeepLink(url: string) {
    console.log("🔗 Deep link received:", url);

    // 이미 처리된 URL인지 확인
    if (this.processedUrls.has(url)) {
      console.log("⚠️ URL already processed, skipping:", url);
      return;
    }

    // 카카오 로그인 콜백인지 확인
    if (url.startsWith("daon://auth/kakao/callback")) {
      console.log("✅ Kakao callback detected");

      // 로그인이 진행 중이 아니라면 무시 (새로고침으로 인한 잘못된 호출)
      if (!this.isLoginInProgress) {
        console.log("⚠️ No login in progress, ignoring callback");
        return;
      }

      // 처리된 URL로 표시
      this.processedUrls.add(url);

      try {
        const result = parseKakaoCallback(url);
        console.log("📦 Parsed result:", result);
        this.resolveLogin(result);
      } catch (error) {
        console.log("❌ Parse error:", error);
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
    console.log("🎯 Resolving login with result:", {
      success: result.success,
      hasToken: !!result.token,
      needsChildSetup: result.needsChildSetup,
      error: result.error,
    });

    // 딥링크로 로그인 성공시 WebBrowser를 닫음
    if (result.success) {
      try {
        WebBrowser.dismissBrowser();
        console.log("🌐 WebBrowser dismissed");
      } catch (error) {
        console.log("⚠️ WebBrowser dismiss error:", error);
      }
    }

    if (this.loginPromiseResolve) {
      console.log("✅ loginPromiseResolve is available, resolving immediately");
      this.loginPromiseResolve(result);
      this.loginPromiseResolve = null;
      this.isLoginInProgress = false;
      console.log("✅ loginPromiseResolve completed");
    } else {
      console.log("⚠️ loginPromiseResolve is not ready, waiting...");
      // loginPromiseResolve가 아직 설정되지 않은 경우, 잠시 대기 후 재시도
      const waitForResolver = (attempts = 0) => {
        if (attempts >= 50) {
          // 최대 5초 대기 (100ms * 50)
          console.log("❌ Timeout waiting for loginPromiseResolve");
          this.isLoginInProgress = false;
          return;
        }

        setTimeout(() => {
          if (this.loginPromiseResolve) {
            console.log(
              `✅ loginPromiseResolve available after ${attempts * 100}ms`,
            );
            this.loginPromiseResolve(result);
            this.loginPromiseResolve = null;
            this.isLoginInProgress = false;
            console.log("✅ loginPromiseResolve completed (delayed)");
          } else {
            waitForResolver(attempts + 1);
          }
        }, 100);
      };

      waitForResolver();
    }
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

      // 2. Promise를 먼저 설정하여 race condition 방지
      const loginPromise = new Promise<KakaoLoginResult>((resolve) => {
        console.log("🔗 Setting up loginPromiseResolve");
        this.loginPromiseResolve = resolve;

        // 60초 타임아웃 설정
        setTimeout(() => {
          if (this.isLoginInProgress) {
            console.log("⏰ Login timeout reached");
            this.resolveLogin({
              success: false,
              error: "로그인 시간이 초과되었습니다",
            });
          }
        }, 60000);
      });

      // 3. Promise 설정 후 WebBrowser 열기
      console.log("🌐 Opening browser with URL:", loginUrl);

      // WebBrowser 비동기적으로 실행 (결과 대기하지 않음)
      WebBrowser.openBrowserAsync(loginUrl, {
        dismissButtonStyle: "close",
        showTitle: true,
        controlsColor: "#007AFF",
        browserPackage: undefined, // 기본 브라우저 사용
        showInRecents: false, // iOS에서 최근 항목에 표시하지 않음
        enableBarCollapsing: false, // iOS에서 바 숨김 방지
      })
        .then((result) => {
          console.log("🌐 Browser result:", result);
          // WebBrowser 결과 처리를 별도로 수행 (cancel이어도 딥링크를 기다림)
          if (result.type === "cancel" || result.type === "dismiss") {
            console.log("🌐 WebBrowser closed, waiting for deep link...");
          }
        })
        .catch((error) => {
          console.error("🌐 WebBrowser error:", error);
        });

      // 4. 딥링크 콜백을 기다림
      return await loginPromise;
    } catch (error) {
      this.isLoginInProgress = false;
      this.loginPromiseResolve = null;
      console.error("🌐 Login error:", error);
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
        console.log("🔗 Initial URL found:", initialUrl);

        // 카카오 콜백 URL이라면 로그인이 진행중이 아니므로 무시
        if (initialUrl.startsWith("daon://auth/kakao/callback")) {
          console.log(
            "⚠️ Ignoring initial Kakao callback URL (no login in progress)",
          );
          return;
        }

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
    // 오래된 처리된 URL 정리 (최대 10개만 유지)
    if (this.processedUrls.size > 10) {
      const urlsArray = Array.from(this.processedUrls);
      this.processedUrls = new Set(urlsArray.slice(-10));
    }
  }

  /**
   * 딥링크 히스토리 완전 정리
   */
  public clearProcessedUrls(): void {
    console.log("🔗 Clearing all processed URLs");
    this.processedUrls.clear();
  }

  /**
   * 현재 로그인 진행 상태 확인
   */
  public isLoginInProgressStatus(): boolean {
    return this.isLoginInProgress;
  }
}

// 싱글톤 인스턴스 내보내기
export const kakaoAuthService = KakaoAuthService.getInstance();
