import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { getFirebaseApp } from './firebase'

let auth: Auth | null = null
let firestore: Firestore | null = null
let emulatorConnected = false

export function getFirebaseServices(): { auth: Auth; firestore: Firestore } | null {
  const app = getFirebaseApp()
  if (!app) return null
  auth ??= getAuth(app)
  firestore ??= getFirestore(app)

  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' && !emulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080)
    emulatorConnected = true
  }
  return { auth, firestore }
}
