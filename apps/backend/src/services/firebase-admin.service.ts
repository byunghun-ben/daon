import admin from "firebase-admin";
import { config } from "../config/index.js";

class FirebaseAdminService {
  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Firebase Admin SDK 초기화
      // 환경 변수에서 서비스 계정 키 경로 또는 직접 인증 정보 사용
      if (config.firebase.serviceAccountPath) {
        // 서비스 계정 JSON 파일 사용
        const serviceAccount = config.firebase.serviceAccountPath;
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else if (
        config.firebase.projectId &&
        config.firebase.privateKey &&
        config.firebase.clientEmail
      ) {
        // 환경 변수로 직접 인증 정보 제공
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            privateKey: config.firebase.privateKey.replace(/\\n/g, "\n"),
            clientEmail: config.firebase.clientEmail,
          }),
        });
      } else {
        throw new Error("Firebase Admin SDK 인증 정보가 없습니다.");
      }

      this.initialized = true;
      console.log("Firebase Admin SDK 초기화 완료");
    } catch (error) {
      console.error("Firebase Admin SDK 초기화 실패:", error);
      throw error;
    }
  }

  getMessaging(): admin.messaging.Messaging {
    if (!this.initialized) {
      this.initialize();
    }
    return admin.messaging();
  }

  getAuth(): admin.auth.Auth {
    if (!this.initialized) {
      this.initialize();
    }
    return admin.auth();
  }
}

export const firebaseAdmin = new FirebaseAdminService();
