import { useState, useEffect, useRef } from 'react'
import { Database, ExternalLink, Lock, Play } from 'lucide-react'
import { useAuthContext, PERSONAS } from '../../lib/authContext'
import { useDemoTx } from '../../lib/demoTxContext'
import { useTranslation } from '../../lib/i18n'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPLORER_BASE = 'https://explorer.solana.com/tx'
const EXPLORER_CLUSTER = '?cluster=devnet'

const PRIVACY_COLORS = {
  public:  '#4ade80',
  private: '#94a3b8',
  partial: '#06b6d4',
} as const

const PRIVACY_BG = {
  public:  'rgba(74,222,128,0.08)',
  private: 'rgba(148,163,184,0.06)',
  partial: 'rgba(6,182,212,0.07)',
} as const

const PRIVACY_BORDER = {
  public:  'rgba(74,222,128,0.3)',
  private: 'rgba(148,163,184,0.2)',
  partial: 'rgba(6,182,212,0.25)',
} as const

// ---------------------------------------------------------------------------
// Query builder
// ---------------------------------------------------------------------------

function buildQuery(pubkey: string): string {
  return `SELECT t.* FROM transactions t\nINNER JOIN tenant_visibility tv ON t.id = tv.transaction_id\nWHERE tv.tenant_pubkey = '${pubkey}'\nORDER BY t.timestamp DESC;`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncSig(sig: string, n = 6): string {
  if (sig.length <= n * 2 + 3) return sig
  return `${sig.slice(0, n)}...${sig.slice(-n)}`
}

function privacyColor(privacy: string): string {
  return PRIVACY_COLORS[privacy as keyof typeof PRIVACY_COLORS] ?? '#94a3b8'
}

function privacyBg(privacy: string): string {
  return PRIVACY_BG[privacy as keyof typeof PRIVACY_BG] ?? 'rgba(148,163,184,0.06)'
}

function privacyBorder(privacy: string): string {
  return PRIVACY_BORDER[privacy as keyof typeof PRIVACY_BORDER] ?? 'rgba(148,163,184,0.2)'
}

// ---------------------------------------------------------------------------
// Table styles
// ---------------------------------------------------------------------------

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  textAlign: 'left',
  borderBottom: '1px solid var(--border-subtle)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  verticalAlign: 'middle',
}

// ---------------------------------------------------------------------------
// Persona Switcher
// ---------------------------------------------------------------------------

const PERSONA_ACCESS: Record<string, { tag: string; color: string; bg: string; border: string }> = {
  alice: { tag: 'Ch.C Unauthorized', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  bob: { tag: 'Ch.C Unauthorized', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  carol: { tag: 'Ch.C Authorized', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
}

function PersonaSwitcher() {
  const { activePersona, selectPersona } = useAuthContext()

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {PERSONAS.map((p) => {
        const isActive = activePersona?.id === p.id
        const access = PERSONA_ACCESS[p.id]
        return (
          <button
            key={p.id}
            onClick={() => selectPersona(p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 13px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: isActive ? '700' : '500',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: isActive ? 'rgba(6,182,212,0.08)' : 'var(--bg-secondary)',
              border: isActive
                ? '1px solid rgba(6,182,212,0.35)'
                : '1px solid var(--border-subtle)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            {p.name}
            <span style={{ fontSize: '9px', fontWeight: '500', opacity: 0.65 }}>
              {p.role}
            </span>
            {access && (
              <span style={{
                fontSize: '8px', fontWeight: '600',
                color: access.color,
                background: access.bg,
                border: `1px solid ${access.border}`,
                padding: '1px 6px', borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}>
                {access.tag}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Read-only SQL display
// ---------------------------------------------------------------------------

const SQL_KEYWORDS = /\b(SELECT|FROM|INNER JOIN|LEFT JOIN|RIGHT JOIN|JOIN|WHERE|AND|OR|ON|ORDER BY|GROUP BY|AS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|IF NOT EXISTS|COUNT|DESC|ASC|LIMIT|DISTINCT)\b/gi

function highlightSql(sql: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const regex = new RegExp(SQL_KEYWORDS)
  let match: RegExpExecArray | null

  while ((match = regex.exec(sql)) !== null) {
    if (match.index > lastIndex) {
      // String literal check
      const before = sql.slice(lastIndex, match.index)
      parts.push(...highlightStrings(before, parts.length))
    }
    parts.push(
      <span key={`kw-${match.index}`} style={{ color: '#c792ea' }}>
        {match[0].toUpperCase()}
      </span>
    )
    lastIndex = regex.lastIndex
  }
  if (lastIndex < sql.length) {
    parts.push(...highlightStrings(sql.slice(lastIndex), parts.length))
  }
  return parts
}

function highlightStrings(text: string, keyOffset: number): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const strRegex = /'[^']*'/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = strRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<span key={`t-${keyOffset}-${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>)
    }
    parts.push(
      <span key={`s-${keyOffset}-${m.index}`} style={{ color: '#c3e88d' }}>{m[0]}</span>
    )
    lastIdx = strRegex.lastIndex
  }
  if (lastIdx < text.length) {
    parts.push(<span key={`t-${keyOffset}-${lastIdx}`}>{text.slice(lastIdx)}</span>)
  }
  return parts
}

function SqlDisplay({ sql }: { sql: string }) {
  return (
    <div style={{
      background: '#080810',
      border: '1px solid #1a1a2e',
      borderRadius: '8px',
      padding: '12px 16px',
    }}>
      <pre style={{
        margin: 0,
        color: '#9090b0',
        fontFamily: 'var(--font-mono, "JetBrains Mono", "Fira Code", monospace)',
        fontSize: '11px',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {highlightSql(sql)}
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Generic Results Table
// ---------------------------------------------------------------------------

function GenericTable({
  columns,
  values,
}: {
  columns: string[]
  values: (string | number | null)[][]
}) {
  const { t } = useTranslation()

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(59,130,246,0.04)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background =
                  i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)'
              }}
            >
              {columns.map((col, ci) => {
                const raw = row[ci]
                const val = raw === null ? '' : String(raw)

                // Privacy badge
                if (col === 'privacy') {
                  const pColor  = privacyColor(val)
                  const pBg     = privacyBg(val)
                  const pBorder = privacyBorder(val)
                  return (
                    <td key={col} style={tdStyle}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '9px',
                        fontWeight: '700',
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: pBg,
                        border: `1px solid ${pBorder}`,
                        color: pColor,
                        whiteSpace: 'nowrap',
                      }}>
                        {t(`privacy.${val as 'public' | 'private' | 'partial'}`)}
                      </span>
                    </td>
                  )
                }

                // Signature — truncate + link
                if (col === 'signature' && val.length > 20) {
                  return (
                    <td key={col} style={tdStyle}>
                      <a
                        href={`${EXPLORER_BASE}/${val}${EXPLORER_CLUSTER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--accent-cyan)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                      >
                        {truncSig(val)}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  )
                }

                // Use case — translate i18n key
                if (col === 'use_case' && val) {
                  const translated = t(val as Parameters<typeof t>[0])
                  return (
                    <td key={col} style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {translated}
                      </span>
                    </td>
                  )
                }

                // Amount — USDC
                if (col === 'amount' && raw !== null) {
                  return (
                    <td key={col} style={tdStyle}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                        {Number(raw).toFixed(2)} USDC
                      </span>
                    </td>
                  )
                }

                // Default cell
                return (
                  <td key={col} style={{ ...tdStyle, fontFamily: col === 'id' || col === 'timestamp' ? 'var(--font-mono)' : undefined }}>
                    {val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DBExplorer() {
  const { activePersona } = useAuthContext()
  const { init, hasData, execRaw } = useDemoTx()
  const { t } = useTranslation()

  const [queryResult, setQueryResult] = useState<{ columns: string[]; values: (string | number | null)[][] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Init SQLite on mount
  useEffect(() => {
    init().catch(console.error)
  }, [init])

  const pubkey = activePersona?.pubkey ?? ''
  const sql = buildQuery(pubkey)

  // Run query for current persona
  function runQuery() {
    try {
      const results = execRaw(sql)
      if (results.length > 0) {
        setQueryResult(results[0])
      } else {
        setQueryResult({ columns: [], values: [] })
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed')
      setQueryResult(null)
    }
  }

  // Auto-run when persona changes or data becomes available
  const prevPubkey = useRef(pubkey)
  const prevHasData = useRef(hasData)
  useEffect(() => {
    const personaChanged = prevPubkey.current !== pubkey
    const dataJustArrived = hasData && !prevHasData.current
    prevPubkey.current = pubkey
    prevHasData.current = hasData
    if (hasData && (personaChanged || dataJustArrived)) {
      runQuery()
    } else if (!hasData) {
      setQueryResult(null)
      setError(null)
    }
  }, [pubkey, hasData]) // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Database size={15} color="var(--text-muted)" />
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            letterSpacing: '-0.01em',
            margin: 0,
          }}>
            {t('db.title')}
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {t('query.subtitle')}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 24px 24px' }}>
        {/* Persona Switcher */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            {t('mode.selectPersona')}
          </div>
          <PersonaSwitcher />
        </div>

        {/* SQL Query */}
        <div style={{ marginBottom: '16px' }}>
          <SqlDisplay sql={sql} />
        </div>

        {/* Results area */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: hasData ? undefined : '120px',
        }}>
          {!hasData ? (
            <div style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Play size={28} color="var(--text-muted)" style={{ opacity: 0.25 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                {t('db.runDemoFirst')}
              </span>
            </div>
          ) : error ? (
            <div style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#f87171',
              }}>
                Query Error
              </span>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                color: '#f87171',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'rgba(248,113,113,0.06)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: '6px',
                padding: '10px 14px',
              }}>
                {error}
              </pre>
            </div>
          ) : queryResult && queryResult.columns.length > 0 ? (
            <GenericTable columns={queryResult.columns} values={queryResult.values} />
          ) : (
            <div style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Lock size={28} color="var(--text-muted)" style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                No results returned
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
