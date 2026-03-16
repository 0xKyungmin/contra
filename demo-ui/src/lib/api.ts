const API_BASE = 'http://localhost:3435/api'

type AuthContext =
  | { type: 'apiKey'; key: string }
  | { type: 'wallet'; pubkey: string }
  | null

let currentAuth: AuthContext = null

export function setAuth(auth: AuthContext) {
  currentAuth = auth
}

export function getAuth(): AuthContext {
  return currentAuth
}

export async function apiFetch(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  }

  if (currentAuth) {
    if (currentAuth.type === 'apiKey') {
      headers['X-API-Key'] = currentAuth.key
    } else if (currentAuth.type === 'wallet') {
      headers['X-Wallet-Pubkey'] = currentAuth.pubkey
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
