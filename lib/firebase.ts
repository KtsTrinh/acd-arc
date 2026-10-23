import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let configPromise: Promise<Record<string, string> | null> | null = null;

/**
 * Cấu hình Firebase. Ưu tiên biến môi trường NEXT_PUBLIC_FIREBASE_* (build-time),
 * fallback về settings từ DB (runtime) để admin có thể cấu hình qua CMS.
 */
export async function loadFirebaseConfig(): Promise<Record<string, string> | null> {
  // 1. Env vars (build-time)
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };
  if (envConfig.apiKey && envConfig.projectId && envConfig.appId) {
    return envConfig;
  }

  // 2. Settings từ DB (runtime) — cache trong session
  if (!configPromise) {
    configPromise = (async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return null;
        const data = await res.json();
        const s = data.settings || {};
        const cfg = {
          apiKey: s.firebaseApiKey || "",
          authDomain: s.firebaseAuthDomain || "",
          projectId: s.firebaseProjectId || "",
          storageBucket: s.firebaseStorageBucket || "",
          messagingSenderId: s.firebaseMessagingSenderId || "",
          appId: s.firebaseAppId || "",
          measurementId: s.firebaseMeasurementId || "",
        };
        if (cfg.apiKey && cfg.projectId && cfg.appId) return cfg;
        return null;
      } catch {
        return null;
      }
    })();
  }
  return configPromise;
}

export function getFirebaseConfigSync() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };
}

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (cachedApp) return cachedApp;
  const config = await loadFirebaseConfig();
  if (!config) return null;
  cachedApp = getApps().length ? getApp() : initializeApp(config as any);
  return cachedApp;
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  if (cachedAuth) return cachedAuth;
  const app = await getFirebaseApp();
  if (!app) return null;
  cachedAuth = getAuth(app);
  return cachedAuth;
}

export async function isFirebaseConfigured(): Promise<boolean> {
  const config = await loadFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId && config.appId);
}
