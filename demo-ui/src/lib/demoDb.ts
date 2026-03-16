import initSqlJs, { type Database } from 'sql.js'

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (db) return db
  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })
  db = new SQL.Database()

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      privacy TEXT NOT NULL,
      amount REAL NOT NULL,
      sender_pubkey TEXT NOT NULL,
      recipient_pubkey TEXT NOT NULL,
      signature TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      use_case TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tenant_visibility (
      tenant_pubkey TEXT NOT NULL,
      transaction_id INTEGER NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_tv_tenant ON tenant_visibility(tenant_pubkey);
  `)

  return db
}

export function resetDb() {
  if (!db) return
  db.run('DELETE FROM tenant_visibility;')
  db.run('DELETE FROM transactions;')
}

export interface InsertTx {
  channelId: string
  privacy: 'public' | 'private' | 'partial'
  amount: number
  senderPubkey: string
  recipientPubkey: string
  signature: string
  timestamp: number
  useCase: string
}

/**
 * Insert a transaction and set up tenant visibility based on privacy level.
 * - public: visible to ALL tenants
 * - private: visible ONLY to sender + recipient
 * - partial: visible to sender + recipient (others need explicit grant)
 */
export function insertTx(database: Database, tx: InsertTx, allTenants: string[]) {
  database.run(
    `INSERT INTO transactions (channel_id, privacy, amount, sender_pubkey, recipient_pubkey, signature, timestamp, use_case)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tx.channelId, tx.privacy, tx.amount, tx.senderPubkey, tx.recipientPubkey, tx.signature, tx.timestamp, tx.useCase]
  )

  const result = database.exec('SELECT last_insert_rowid()')
  const txId = result[0].values[0][0] as number

  if (tx.privacy === 'public') {
    // Everyone can see public transactions
    for (const tenant of allTenants) {
      database.run(
        'INSERT INTO tenant_visibility (tenant_pubkey, transaction_id) VALUES (?, ?)',
        [tenant, txId]
      )
    }
  } else {
    // private & partial: only sender + recipient
    const visible = new Set([tx.senderPubkey, tx.recipientPubkey])
    for (const tenant of visible) {
      database.run(
        'INSERT INTO tenant_visibility (tenant_pubkey, transaction_id) VALUES (?, ?)',
        [tenant, txId]
      )
    }
  }
}

export interface TxRow {
  id: number
  channel_id: string
  privacy: string
  amount: number
  sender_pubkey: string
  recipient_pubkey: string
  signature: string
  timestamp: number
  use_case: string
}

/**
 * Query transactions visible to a specific tenant.
 * This is REAL row-level security via JOIN on tenant_visibility.
 */
export function queryByTenant(database: Database, tenantPubkey: string): TxRow[] {
  const results = database.exec(
    `SELECT t.id, t.channel_id, t.privacy, t.amount, t.sender_pubkey,
            t.recipient_pubkey, t.signature, t.timestamp, t.use_case
     FROM transactions t
     INNER JOIN tenant_visibility tv ON t.id = tv.transaction_id
     WHERE tv.tenant_pubkey = ?
     ORDER BY t.timestamp DESC`,
    [tenantPubkey]
  )

  if (results.length === 0) return []
  return results[0].values.map((row) => ({
    id: row[0] as number,
    channel_id: row[1] as string,
    privacy: row[2] as string,
    amount: row[3] as number,
    sender_pubkey: row[4] as string,
    recipient_pubkey: row[5] as string,
    signature: row[6] as string,
    timestamp: row[7] as number,
    use_case: row[8] as string,
  }))
}

/**
 * Query ALL transactions (admin view, no tenant filter).
 */
export function queryAll(database: Database): TxRow[] {
  const results = database.exec(
    `SELECT id, channel_id, privacy, amount, sender_pubkey,
            recipient_pubkey, signature, timestamp, use_case
     FROM transactions
     ORDER BY timestamp DESC`
  )

  if (results.length === 0) return []
  return results[0].values.map((row) => ({
    id: row[0] as number,
    channel_id: row[1] as string,
    privacy: row[2] as string,
    amount: row[3] as number,
    sender_pubkey: row[4] as string,
    recipient_pubkey: row[5] as string,
    signature: row[6] as string,
    timestamp: row[7] as number,
    use_case: row[8] as string,
  }))
}

/** Count total transactions in the DB */
export function countAll(database: Database): number {
  const r = database.exec('SELECT COUNT(*) FROM transactions')
  return r.length > 0 ? (r[0].values[0][0] as number) : 0
}

/** Execute arbitrary SQL and return raw column/value results */
export function execRaw(
  database: Database,
  sql: string,
): { columns: string[]; values: (string | number | null)[][] }[] {
  return database.exec(sql) as { columns: string[]; values: (string | number | null)[][] }[]
}
