export const config = {
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  server: {
    port: process.env.PORT ?? "3001",
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  kakao: {
    restApiKey: process.env.KAKAO_REST_API_KEY!,
    redirectUri: process.env.KAKAO_REDIRECT_URI!,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? "10485760"), // 10MB default
  },
};