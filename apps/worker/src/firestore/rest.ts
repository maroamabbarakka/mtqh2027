import { importPKCS8, SignJWT } from 'jose'

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }

type FirestoreDocument = {
  name: string
  fields?: Record<string, FirestoreValue>
  updateTime: string
}

export type FirestoreRecord = Record<string, unknown>

export interface FirestoreGateway {
  get(path: string): Promise<{ data: FirestoreRecord; updateTime: string } | null>
  commit(writes: unknown[]): Promise<{ commitTime: string }>
  documentName(path: string): string
}

type ServiceAccountEnv = {
  FIREBASE_PROJECT_ID: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PRIVATE_KEY: string
}

let cachedAccessToken: { token: string; expiresAt: number } | undefined

function decodeValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('timestampValue' in value) return value.timestampValue
  if ('stringValue' in value) return value.stringValue
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeValue)
  return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, item]) => [key, decodeValue(item)]))
}

function decodeDocument(document: FirestoreDocument) {
  return {
    data: Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decodeValue(value)])),
    updateTime: document.updateTime,
  }
}

export function stringValue(value: string): FirestoreValue {
  return { stringValue: value }
}

async function requestAccessToken(env: ServiceAccountEnv, fetchImpl: typeof fetch) {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.token
  const now = Math.floor(Date.now() / 1000)
  const privateKey = await importPKCS8(env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256')
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/datastore' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(env.FIREBASE_CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey)
  const response = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  if (!response.ok) throw new Error('service_auth_failed')
  const result = await response.json() as { access_token?: string; expires_in?: number }
  if (!result.access_token) throw new Error('service_auth_failed')
  cachedAccessToken = { token: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000 }
  return result.access_token
}

export function createFirestoreGateway(env: ServiceAccountEnv, fetchImpl: typeof fetch = fetch): FirestoreGateway {
  const root = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`
  const endpoint = `https://firestore.googleapis.com/v1/${root}`
  const headers = async () => ({ authorization: `Bearer ${await requestAccessToken(env, fetchImpl)}` })
  return {
    documentName: (path) => `${root}/${path}`,
    async get(path) {
      const response = await fetchImpl(`${endpoint}/${path}`, { headers: await headers() })
      if (response.status === 404) return null
      if (!response.ok) throw new Error('firestore_read_failed')
      return decodeDocument(await response.json() as FirestoreDocument)
    },
    async commit(writes) {
      const response = await fetchImpl(`${endpoint}:commit`, {
        method: 'POST',
        headers: { ...(await headers()), 'content-type': 'application/json' },
        body: JSON.stringify({ writes }),
      })
      if (response.status === 409 || response.status === 412) throw new Error('write_conflict')
      if (!response.ok) throw new Error('firestore_commit_failed')
      return response.json() as Promise<{ commitTime: string }>
    },
  }
}
