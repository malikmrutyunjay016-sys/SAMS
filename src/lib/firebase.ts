import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-d7d173c0-b7d1-4d2c-8274-6f17561cf0cf'
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
  };
}

// Quota tracking
let quotaExceededState = false;
const quotaListeners: Array<(exceeded: boolean) => void> = [];

export function isFirestoreQuotaExceeded(): boolean {
  return quotaExceededState;
}

export function markQuotaExceeded() {
  if (!quotaExceededState) {
    quotaExceededState = true;
    quotaListeners.forEach((fn) => fn(true));
    console.warn(
      'Firestore quota limit exceeded for today. Transitioning gracefully to LocalStorage fallback cache.'
    );
  }
}

export function subscribeQuotaState(listener: (exceeded: boolean) => void): () => void {
  quotaListeners.push(listener);
  listener(quotaExceededState);
  return () => {
    const idx = quotaListeners.indexOf(listener);
    if (idx !== -1) quotaListeners.splice(idx, 1);
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code || '';

  if (
    errCode === 'resource-exhausted' ||
    errMsg.includes('Quota limit exceeded') ||
    errMsg.includes('Quota exceeded')
  ) {
    markQuotaExceeded();
    console.warn(`Firestore Quota Exceeded on ${operationType} ${path}. Using fallback state.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Safe wrapper around setDoc that avoids throwing unhandled quota errors
 * or triggering repetitive exponential backoff loops.
 */
export async function safeSetDoc(
  docRef: DocumentReference,
  data: any,
  options?: SetOptions
): Promise<boolean> {
  if (quotaExceededState) {
    return false;
  }
  try {
    if (options) {
      await setDoc(docRef, data, options);
    } else {
      await setDoc(docRef, data);
    }
    return true;
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const errCode = error?.code || '';
    if (
      errCode === 'resource-exhausted' ||
      errMsg.includes('Quota limit exceeded') ||
      errMsg.includes('Quota exceeded')
    ) {
      markQuotaExceeded();
      return false;
    }
    if (errMsg.includes('Missing or insufficient permissions') || errCode === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, docRef.path);
    }
    return false;
  }
}

/**
 * Safe wrapper around deleteDoc that handles quota exhaustion cleanly.
 */
export async function safeDeleteDoc(docRef: DocumentReference): Promise<boolean> {
  if (quotaExceededState) {
    return false;
  }
  try {
    await deleteDoc(docRef);
    return true;
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const errCode = error?.code || '';
    if (
      errCode === 'resource-exhausted' ||
      errMsg.includes('Quota limit exceeded') ||
      errMsg.includes('Quota exceeded')
    ) {
      markQuotaExceeded();
      return false;
    }
    if (errMsg.includes('Missing or insufficient permissions') || errCode === 'permission-denied') {
      handleFirestoreError(error, OperationType.DELETE, docRef.path);
    }
    return false;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'systemSettings', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using LocalStorage fallback cache.');
      return false;
    }
    return true;
  }
}
