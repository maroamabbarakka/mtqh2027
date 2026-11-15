import { describe, expect, it } from 'vitest'
import { firebaseConfigurationStatus, getFirebaseApp } from './firebase'

describe('Firebase bootstrap', () => {
  it('konsisten antara status environment dan hasil bootstrap', () => {
    const app = getFirebaseApp()
    expect(app === null).toBe(!firebaseConfigurationStatus.configured)
    if (firebaseConfigurationStatus.configured) expect(app?.options.projectId).toBe(firebaseConfigurationStatus.projectId)
  })
})
