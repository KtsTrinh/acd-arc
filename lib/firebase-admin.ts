import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedApp: App | null = null;

/**
 * Khởi tạo Firebase Admin SDK trên server. Cần biến môi trường:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * (hoặc GOOGLE_APPLICATION_CREDENTIALS trỏ tới file JSON service account).
 */
export function getFirebaseAdminApp(): App | null {
  if (cachedApp) return cachedApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    cachedApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
    return cachedApp;
  }

  // Thử dùng application default credentials
  try {
    if (getApps().length) {
      cachedApp = getApps()[0];
      return cachedApp;
    }
    cachedApp = initializeApp();
    return cachedApp;
  } catch {
    return null;
  }
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}
