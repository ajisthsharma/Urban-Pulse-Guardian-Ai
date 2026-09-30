import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import config from "../../firebase-applet-config.json";

// Safe public client configuration with environment fallback
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain || "urbanpulse-gardian-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId || "urbanpulse-gardian-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket || "urbanpulse-gardian-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId || "234829673567",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId || "1:234829673567:web:ec4f17630cf8a9308d97ea",
  firestoreDatabaseId: "(default)"
};

// Canonical Single Firebase App initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Canonical Auth, Firestore, and Storage Singletons
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Operation types for standard Firebase Error Handling
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized error handler adhering strictly to the Firebase Integration Skill.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuthUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid || null,
      email: currentAuthUser?.email || null,
      emailVerified: currentAuthUser?.emailVerified || null,
      isAnonymous: currentAuthUser?.isAnonymous || null,
      tenantId: currentAuthUser?.tenantId || null,
      providerInfo: currentAuthUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Test connectivity to Firestore server
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes("the client is offline") || error.message.includes("unavailable"))) {
      console.warn("Firestore client is offline or re-establishing connection.");
      return false;
    }
    // Any other response (like permission denied on test/connection) confirms server contact
    return true;
  }
}

/**
 * Recursively strips any keys whose value is undefined, ensuring Firestore
 * setDoc, updateDoc, and converter calls never fail with "Unsupported field value: undefined".
 */
export function stripUndefinedDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripUndefinedDeep).filter((item) => item !== undefined) as unknown as T;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = stripUndefinedDeep(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}
