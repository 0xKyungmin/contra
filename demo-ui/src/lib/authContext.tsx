import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { setAuth } from './api'

export type AuthMode = 'demo' | 'phantom'

export interface Persona {
  id: string
  name: string
  pubkey: string
  apiKey: string
  role: string
  color: string
}

export const PERSONAS: Persona[] = [
  {
    id: 'alice',
    name: 'Alice',
    pubkey: 'AKnL4NNf3DGWZJS6cPknBuEGnVsV4A4m5tgebLHaRSZ9',
    apiKey: 'contra-alice-key-2024',
    role: 'Store',
    color: '#94a3b8',
  },
  {
    id: 'bob',
    name: 'Bob',
    pubkey: '9hSR6S7WPtxmTojgo6GG3k4yDPecgJY292j7xrsUGWBu',
    apiKey: 'contra-bob-key-2024',
    role: 'Salary',
    color: '#94a3b8',
  },
  {
    id: 'carol',
    name: 'Carol',
    pubkey: 'GyGKxMyg1p9SsHfm15MkNUu1u9TN2JtTspcdmrtGUdse',
    apiKey: 'contra-carol-key-2024',
    role: 'P2P',
    color: '#94a3b8',
  },
]

export const ADMIN_KEY = 'contra-admin-key-2024'

interface AuthState {
  mode: AuthMode
  activePersona: Persona | null
  isAdmin: boolean
  walletPubkey: string | null
}

interface AuthContextValue extends AuthState {
  setMode: (mode: AuthMode) => void
  selectPersona: (persona: Persona) => void
  setAdminMode: (active: boolean) => void
  setWalletPubkey: (pubkey: string | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AuthMode>('demo')
  const [activePersona, setActivePersona] = useState<Persona | null>(PERSONAS[0])
  const [isAdmin, setIsAdmin] = useState(false)
  const [walletPubkey, setWalletPubkeyState] = useState<string | null>(null)

  const setMode = useCallback((m: AuthMode) => {
    setModeState(m)
    if (m === 'demo') {
      const persona = activePersona ?? PERSONAS[0]
      setAuth({ type: 'apiKey', key: persona.apiKey })
    } else {
      if (walletPubkey) {
        setAuth({ type: 'wallet', pubkey: walletPubkey })
      } else {
        setAuth(null)
      }
    }
  }, [activePersona, walletPubkey])

  const selectPersona = useCallback((persona: Persona) => {
    setActivePersona(persona)
    setIsAdmin(false)
    setAuth({ type: 'apiKey', key: persona.apiKey })
  }, [])

  const setAdminMode = useCallback((active: boolean) => {
    setIsAdmin(active)
    if (active) {
      setAuth({ type: 'apiKey', key: ADMIN_KEY })
    } else if (activePersona) {
      setAuth({ type: 'apiKey', key: activePersona.apiKey })
    }
  }, [activePersona])

  const setWalletPubkey = useCallback((pubkey: string | null) => {
    setWalletPubkeyState(pubkey)
    if (pubkey) {
      setAuth({ type: 'wallet', pubkey })
    } else {
      setAuth(null)
    }
  }, [])

  // Initialize auth on mount
  useState(() => {
    if (activePersona) {
      setAuth({ type: 'apiKey', key: activePersona.apiKey })
    }
  })

  return (
    <AuthContext.Provider value={{
      mode,
      activePersona,
      isAdmin,
      walletPubkey,
      setMode,
      selectPersona,
      setAdminMode,
      setWalletPubkey,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
