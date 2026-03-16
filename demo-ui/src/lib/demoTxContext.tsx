import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react'
import { type Database } from 'sql.js'
import { getDb, resetDb, insertTx, queryByTenant, queryAll, countAll, execRaw, type TxRow, type InsertTx } from './demoDb'
import { PERSONAS } from './authContext'

interface DemoTxContextValue {
  /** Whether the SQLite DB is ready */
  ready: boolean
  /** Initialize the DB (call once on mount) */
  init: () => Promise<void>
  /** Insert demo transactions after scenario run */
  saveDemoResults: (txs: InsertTx[]) => Promise<void>
  /** Query transactions visible to a tenant */
  query: (tenantPubkey: string) => TxRow[]
  /** Query all transactions (admin) */
  queryAdmin: () => TxRow[]
  /** Total transaction count */
  total: () => number
  /** Whether demo has been run */
  hasData: boolean
  /** Execute arbitrary SQL and return raw results */
  execRaw: (sql: string) => { columns: string[]; values: (string | number | null)[][] }[]
}

const DemoTxContext = createContext<DemoTxContextValue | null>(null)

export function DemoTxProvider({ children }: { children: ReactNode }) {
  const dbRef = useRef<Database | null>(null)
  const [ready, setReady] = useState(false)
  const [hasData, setHasData] = useState(false)

  const init = useCallback(async () => {
    if (dbRef.current) return
    dbRef.current = await getDb()
    setReady(true)
  }, [])

  const saveDemoResults = useCallback(async (txs: InsertTx[]) => {
    if (!dbRef.current) {
      dbRef.current = await getDb()
      setReady(true)
    }
    const db = dbRef.current

    // Clear previous demo data
    resetDb()

    // All tenant pubkeys that can potentially see data
    const allTenants = PERSONAS.map((p) => p.pubkey)

    for (const tx of txs) {
      insertTx(db, tx, allTenants)
    }

    setHasData(true)
  }, [])

  const query = useCallback((tenantPubkey: string): TxRow[] => {
    if (!dbRef.current) return []
    return queryByTenant(dbRef.current, tenantPubkey)
  }, [])

  const queryAdmin = useCallback((): TxRow[] => {
    if (!dbRef.current) return []
    return queryAll(dbRef.current)
  }, [])

  const total = useCallback((): number => {
    if (!dbRef.current) return 0
    return countAll(dbRef.current)
  }, [])

  const execRawFn = useCallback(
    (sql: string): { columns: string[]; values: (string | number | null)[][] }[] => {
      if (!dbRef.current) return []
      return execRaw(dbRef.current, sql)
    },
    [],
  )

  return (
    <DemoTxContext.Provider value={{ ready, init, saveDemoResults, query, queryAdmin, total, hasData, execRaw: execRawFn }}>
      {children}
    </DemoTxContext.Provider>
  )
}

export function useDemoTx(): DemoTxContextValue {
  const ctx = useContext(DemoTxContext)
  if (!ctx) throw new Error('useDemoTx must be used inside DemoTxProvider')
  return ctx
}

// Re-export types for convenience
export type { InsertTx, TxRow } from './demoDb'
