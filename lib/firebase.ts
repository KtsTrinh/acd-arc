import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Cấu hình Firebase lấy từ settings (DB) hoặc biến môi trường.
 * Ưu tiên biến môi trường NEXT_PUBLIC_FIREBASE_* (an toàn cho client bundle),
 * fallback settings (đọc từ DB) khi có.
 */
export function getFirebaseConfig() {
  return {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId) return null;

  if (cachedApp) return cachedApp;
  cachedApp = getApps().length ? getApp() : initializeApp(config);
  return cachedApp;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(app);
  return cachedAuth;
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.appId);
}
