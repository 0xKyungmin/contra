import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../lib/api'
import { useAuthContext, PERSONAS } from '../../lib/authContext'
import { useTranslation } from '../../lib/i18n'

interface Permission {
  tenant?: string
  grantee?: string
  pubkey?: string
  granted_at?: string
  [key: string]: unknown
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '7px',
  padding: '9px 12px',
  fontSize: '12px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'monospace',
  width: '100%',
  transition: 'border-color 0.15s ease',
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '600',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
}

export default function PermissionPanel() {
  const { isAdmin } = useAuthContext()
  const { t } = useTranslation()

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Grant form
  const [grantTenant, setGrantTenant] = useState('')
  const [grantPubkeys, setGrantPubkeys] = useState('')
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantResult, setGrantResult] = useState<string | null>(null)
  const [grantError, setGrantError] = useState<string | null>(null)

  // Revoke form
  const [revokeTenant, setRevokeTenant] = useState('')
  const [revokePubkey, setRevokePubkey] = useState('')
  const [revokeLoading, setRevokeLoading] = useState(false)
  const [revokeResult, setRevokeResult] = useState<string | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/admin/permissions')
      setPermissions(Array.isArray(data) ? data : data?.data ?? data?.permissions ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) fetchPermissions()
  }, [isAdmin, fetchPermissions])

  async function handleGrant() {
    if (!grantTenant.trim() || !grantPubkeys.trim()) return
    setGrantLoading(true)
    setGrantError(null)
    setGrantResult(null)
    try {
      const pubkeys = grantPubkeys
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const data = await apiFetch('/admin/permissions/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: grantTenant.trim(), pubkeys }),
      })
      setGrantResult(
        typeof data === 'string' ? data : data?.message ?? `Granted access to ${pubkeys.length} pubkey(s)`
      )
      fetchPermissions()
    } catch (e: unknown) {
      setGrantError(e instanceof Error ? e.message : 'Grant failed')
    } finally {
      setGrantLoading(false)
    }
  }

  async function handleRevoke() {
    if (!revokeTenant.trim() || !revokePubkey.trim()) return
    setRevokeLoading(true)
    setRevokeError(null)
    setRevokeResult(null)
    try {
      const data = await apiFetch('/admin/permissions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: revokeTenant.trim(), pubkey: revokePubkey.trim() }),
      })
      setRevokeResult(
        typeof data === 'string' ? data : data?.message ?? 'Access revoked'
      )
      fetchPermissions()
    } catch (e: unknown) {
      setRevokeError(e instanceof Error ? e.message : 'Revoke failed')
    } finally {
      setRevokeLoading(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
        boxShadow: '0 0 24px rgba(139, 92, 246, 0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
          background: 'rgba(139, 92, 246, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1L8.5 3.5H11L9 6l1 3.5-3.5-1.5L3 9.5l1-3.5L2 3.5h2.5L6.5 1z"
              stroke="#a78bfa"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="rgba(139,92,246,0.3)"
            />
          </svg>
        </div>
        <div>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#c4b5fd',
              letterSpacing: '-0.01em',
              marginBottom: '1px',
            }}
          >
            {t('perm.title')}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {t('perm.subtitle')}
          </p>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#a78bfa',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '4px',
            padding: '2px 7px',
          }}
        >
          {t('perm.adminBadge')}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '0',
        }}
      >
        {/* Grant Access */}
        <div
          style={{
            padding: '20px 24px',
            borderRight: '1px solid rgba(139, 92, 246, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#4ade80',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#4ade80" strokeWidth="1.2" />
              <path d="M4 6h4M6 4v4" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {t('perm.grantAccess')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={labelStyle}>{t('perm.targetTenant')}</label>
              <select
                value={grantTenant}
                onChange={(e) => setGrantTenant(e.target.value)}
                style={{
                  ...inputStyle,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <option value="">{t('perm.selectTenant')}</option>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={labelStyle}>{t('perm.pubkeysToGrant')}</label>
              <textarea
                value={grantPubkeys}
                onChange={(e) => setGrantPubkeys(e.target.value)}
                placeholder="Pubkey1...&#10;Pubkey2..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  lineHeight: '1.5',
                  fontSize: '11px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              />
            </div>
            <button
              onClick={handleGrant}
              disabled={grantLoading || !grantTenant || !grantPubkeys.trim()}
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: '7px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#4ade80',
                cursor: grantLoading || !grantTenant || !grantPubkeys.trim() ? 'not-allowed' : 'pointer',
                opacity: grantLoading || !grantTenant || !grantPubkeys.trim() ? 0.5 : 1,
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!grantLoading && grantTenant && grantPubkeys.trim()) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.18)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)'
              }}
            >
              {grantLoading ? t('perm.granting') : t('perm.grantAccess')}
            </button>
            {grantResult && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#4ade80',
                  background: 'rgba(34, 197, 94, 0.07)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                }}
              >
                {grantResult}
              </div>
            )}
            {grantError && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.07)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                }}
              >
                {grantError}
              </div>
            )}
          </div>
        </div>

        {/* Revoke Access */}
        <div style={{ padding: '20px 24px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#f87171',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#f87171" strokeWidth="1.2" />
              <path d="M4 6h4" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {t('perm.revokeAccess')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={labelStyle}>{t('perm.targetTenant')}</label>
              <select
                value={revokeTenant}
                onChange={(e) => setRevokeTenant(e.target.value)}
                style={{
                  ...inputStyle,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <option value="">{t('perm.selectTenant')}</option>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={labelStyle}>{t('perm.pubkeyToRevoke')}</label>
              <input
                type="text"
                value={revokePubkey}
                onChange={(e) => setRevokePubkey(e.target.value)}
                placeholder="Pubkey to remove..."
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              />
            </div>
            <button
              onClick={handleRevoke}
              disabled={revokeLoading || !revokeTenant || !revokePubkey.trim()}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '7px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#f87171',
                cursor: revokeLoading || !revokeTenant || !revokePubkey.trim() ? 'not-allowed' : 'pointer',
                opacity: revokeLoading || !revokeTenant || !revokePubkey.trim() ? 0.5 : 1,
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!revokeLoading && revokeTenant && revokePubkey.trim()) {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
            >
              {revokeLoading ? t('perm.revoking') : t('perm.revokeAccess')}
            </button>
            {revokeResult && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#4ade80',
                  background: 'rgba(34, 197, 94, 0.07)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                }}
              >
                {revokeResult}
              </div>
            )}
            {revokeError && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.07)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                }}
              >
                {revokeError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current permissions list */}
      <div
        style={{
          borderTop: '1px solid rgba(139, 92, 246, 0.12)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{t('perm.currentPermissions')}</span>
          {loading && (
            <span style={{ color: 'var(--accent-blue)', fontWeight: '400' }}>{t('db.loading')}</span>
          )}
        </div>
        {error ? (
          <div
            style={{
              fontSize: '12px',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.07)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            {error}
          </div>
        ) : permissions.length === 0 ? (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              padding: '16px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {t('perm.noPermissions')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[t('perm.col.tenant'), t('perm.col.grantee'), t('perm.col.grantedAt')].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        textAlign: 'left',
                        borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(139, 92, 246, 0.02)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        'rgba(139, 92, 246, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        i % 2 === 0 ? 'transparent' : 'rgba(139, 92, 246, 0.02)'
                    }}
                  >
                    <td
                      style={{
                        padding: '9px 12px',
                        fontSize: '12px',
                        color: '#c4b5fd',
                        fontWeight: '500',
                      }}
                    >
                      {perm.tenant ?? '-'}
                    </td>
                    <td
                      style={{
                        padding: '9px 12px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {perm.grantee ?? perm.pubkey ?? '-'}
                    </td>
                    <td
                      style={{
                        padding: '9px 12px',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {perm.granted_at ? new Date(perm.granted_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
