import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'

type FirebaseEnvironment = {
  VITE_FIREBASE_API_KEY: string
  VITE_FIREBASE_AUTH_DOMAIN: string
  VITE_FIREBASE_PROJECT_ID: string
  VITE_FIREBASE_MESSAGING_SENDER_ID: string
  VITE_FIREBASE_APP_ID: string
}

const keys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID'] as const
const environment = import.meta.env as Partial<FirebaseEnvironment>
const isConfigured = keys.every((key) => typeof environment[key] === 'string' && environment[key]!.length > 0)

export const firebaseConfigurationStatus = isConfigured
  ? { configured: true as const, projectId: environment.VITE_FIREBASE_PROJECT_ID! }
  : { configured: false as const, projectId: null }

/**
 * Menginisialisasi Firebase App secara idempoten. Modul produk (Auth/Firestore)
 * harus diimpor terpisah pada feature slice terkait. Cloud Storage dilarang.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isConfigured) return null
  if (getApps().length > 0) return getApp()

  const options: FirebaseOptions = {
    apiKey: environment.VITE_FIREBASE_API_KEY!,
    authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: environment.VITE_FIREBASE_PROJECT_ID!,
    messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: environment.VITE_FIREBASE_APP_ID!,
  }

  return initializeApp(options)
}
