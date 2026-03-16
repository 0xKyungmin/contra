import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { useAuthContext } from '../../lib/authContext'
import { useTranslation } from '../../lib/i18n'

export default function BalancePanel() {
  const { mode, activePersona, walletPubkey } = useAuthContext()
  const { t } = useTranslation()

  const [balance, setBalance] = useState<number | null>(null)
  const [slot, setSlot] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pubkey =
    mode === 'phantom'
      ? walletPubkey ?? ''
      : activePersona?.pubkey ?? ''

  const contextLabel =
    mode === 'phantom'
      ? walletPubkey
        ? `${walletPubkey.slice(0, 4)}...${walletPubkey.slice(-4)}`
        : t('balance.noWallet')
      : activePersona?.name ?? 'Unknown'

  const contextColor =
    mode === 'phantom' ? '#a78bfa' : activePersona?.color ?? 'var(--accent-blue)'

  async function fetchBalance(pk: string) {
    if (!pk) return
    setLoading(true)
    setError(null)
    setBalance(null)
    setSlot(null)
    try {
      const [balData, slotData] = await Promise.all([
        apiFetch(`/rpc/balance/${pk}`),
        apiFetch('/rpc/slot'),
      ])
      setBalance(balData.balance ?? 0)
      setSlot(slotData.slot ?? slotData.value ?? slotData)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when persona/wallet changes
  useEffect(() => {
    setBalance(null)
    setSlot(null)
    setError(null)
    if (pubkey) {
      fetchBalance(pubkey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activePersona, walletPubkey])

  return (
    <div
      className="card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.02em',
              marginBottom: '3px',
            }}
          >
            {t('balance.title')}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {t('balance.subtitle')}
          </p>
        </div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: contextColor,
            background: `${contextColor}18`,
            border: `1px solid ${contextColor}33`,
            borderRadius: '4px',
            padding: '3px 8px',
            flexShrink: 0,
          }}
        >
          {contextLabel}
        </div>
      </div>

      {/* Pubkey display (read-only) */}
      {pubkey && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.01em',
            wordBreak: 'break-all',
          }}
        >
          {pubkey}
        </div>
      )}

      {/* Refresh button */}
      <button
        className="btn-secondary"
        onClick={() => fetchBalance(pubkey)}
        disabled={loading || !pubkey}
        style={{
          opacity: loading || !pubkey ? 0.5 : 1,
          cursor: loading || !pubkey ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          padding: '7px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 13 13"
          fill="none"
          style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
        >
          <path
            d="M11.5 6.5A5 5 0 1 1 6.5 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6.5 1.5L9 4l-2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {loading ? t('balance.checking') : t('balance.checkBalance')}
      </button>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '11px',
            color: '#f87171',
            fontFamily: 'var(--font-mono)',
            wordBreak: 'break-all',
          }}
        >
          {error}
        </div>
      )}

      {balance !== null && (
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {t('balance.balanceLamports')}
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {Number(balance).toLocaleString()}
            </span>
          </div>
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('balance.sol')}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>
              {(Number(balance) / 1e9).toFixed(9)}
            </span>
          </div>
          {slot !== null && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('balance.currentSlot')}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '500',
                }}
              >
                {Number(slot).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
