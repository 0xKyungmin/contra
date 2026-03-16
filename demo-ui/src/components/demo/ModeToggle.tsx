import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useAuthContext, PERSONAS, type Persona } from '../../lib/authContext'
import { useTranslation } from '../../lib/i18n'

function truncatePubkey(pubkey: string, chars = 4): string {
  if (pubkey.length <= chars * 2 + 3) return pubkey
  return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`
}

function PersonaAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: `${color}22`,
        border: `1.5px solid ${color}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '14px',
        fontWeight: '700',
        color,
        letterSpacing: '-0.01em',
      }}
    >
      {name[0]}
    </div>
  )
}

function PersonaCard({
  persona,
  isActive,
  onClick,
}: {
  persona: Persona
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? `${persona.color}0d` : 'var(--bg-secondary)',
        border: isActive
          ? `1px solid ${persona.color}55`
          : '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '12px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isActive ? `0 0 16px ${persona.color}18` : 'none',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = `${persona.color}33`
          e.currentTarget.style.background = `${persona.color}08`
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.background = 'var(--bg-secondary)'
        }
      }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${persona.color}, ${persona.color}88)`,
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PersonaAvatar name={persona.name} color={persona.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                letterSpacing: '-0.01em',
              }}
            >
              {persona.name}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: isActive ? persona.color : 'var(--text-muted)',
                background: isActive ? `${persona.color}18` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? persona.color + '33' : 'var(--border-subtle)'}`,
                borderRadius: '3px',
                padding: '1px 5px',
              }}
            >
              {persona.role}
            </span>
          </div>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}
          >
            {truncatePubkey(persona.pubkey)}
          </div>
        </div>
        {isActive && (
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: persona.color,
              boxShadow: `0 0 6px ${persona.color}`,
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </button>
  )
}

function AdminToggle({
  isAdmin,
  onToggle,
}: {
  isAdmin: boolean
  onToggle: (active: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <button
      onClick={() => onToggle(!isAdmin)}
      style={{
        background: isAdmin ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)',
        border: isAdmin
          ? '1px solid rgba(139, 92, 246, 0.4)'
          : '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '9px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        transition: 'all 0.15s ease',
        boxShadow: isAdmin ? '0 0 12px rgba(139, 92, 246, 0.12)' : 'none',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: isAdmin ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isAdmin ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-accent)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M6.5 1L8.5 3.5H11L9 6l1 3.5-3.5-1.5L3 9.5l1-3.5L2 3.5h2.5L6.5 1z"
            stroke={isAdmin ? '#8b5cf6' : 'var(--text-muted)'}
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill={isAdmin ? 'rgba(139,92,246,0.3)' : 'none'}
          />
        </svg>
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isAdmin ? '#a78bfa' : 'var(--text-secondary)',
            letterSpacing: '-0.01em',
          }}
        >
          {t('mode.adminView')}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {isAdmin ? t('mode.adminViewingAll') : t('mode.adminSeeAll')}
        </div>
      </div>
      <div
        style={{
          width: '32px',
          height: '18px',
          borderRadius: '9px',
          background: isAdmin ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isAdmin ? 'rgba(139, 92, 246, 0.6)' : 'var(--border-subtle)'}`,
          position: 'relative',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: isAdmin ? '15px' : '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isAdmin ? '#a78bfa' : 'var(--text-muted)',
            transition: 'left 0.2s ease',
          }}
        />
      </div>
    </button>
  )
}

function PhantomModePanel() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { setWalletPubkey } = useAuthContext()
  const { t } = useTranslation()

  useEffect(() => {
    if (connected && publicKey) {
      setWalletPubkey(publicKey.toBase58())
    } else {
      setWalletPubkey(null)
    }
  }, [connected, publicKey, setWalletPubkey])

  if (connected && publicKey) {
    const addr = publicKey.toBase58()
    return (
      <div
        style={{
          background: 'rgba(139, 92, 246, 0.06)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '10px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1.5px solid rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1H3V5z" fill="rgba(139,92,246,0.5)" />
              <rect x="3" y="7" width="14" height="10" rx="1.5" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
              <circle cx="7" cy="12" r="1.5" fill="#a78bfa" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#a78bfa',
                marginBottom: '2px',
              }}
            >
              {t('mode.phantomConnected')}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
                letterSpacing: '0.02em',
              }}
            >
              {truncatePubkey(addr, 6)}
            </div>
          </div>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 6px #4ade80',
              flexShrink: 0,
            }}
          />
        </div>
        <button
          onClick={() => disconnect()}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '7px',
            padding: '7px 14px',
            fontSize: '12px',
            color: '#f87171',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {t('mode.disconnect')}
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '28px 20px',
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
          <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1H3V5z" fill="rgba(139,92,246,0.4)" />
          <rect x="3" y="7" width="14" height="10" rx="1.5" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
          <circle cx="7" cy="12" r="1.5" fill="#8b5cf6" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          {t('mode.connectPhantom')}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}
        >
          {t('mode.connectPhantomDesc')}
          {typeof window !== 'undefined' && !(window as unknown as { solana?: unknown }).solana && (
            <span style={{ display: 'block', marginTop: '4px', color: '#f87171' }}>
              {t('mode.phantomNotDetected')}
            </span>
          )}
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={() => setVisible(true)}
        style={{ padding: '9px 24px', fontSize: '13px' }}
      >
        {t('mode.connectWallet')}
      </button>
    </div>
  )
}

export default function ModeToggle() {
  const { mode, setMode, activePersona, selectPersona, isAdmin, setAdminMode } = useAuthContext()
  const { t } = useTranslation()

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Mode selector tabs */}
      <div
        style={{
          display: 'inline-flex',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '3px',
          marginBottom: '20px',
        }}
      >
        {(['demo', 'phantom'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m
                ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'
                : 'transparent',
              border: 'none',
              borderRadius: '7px',
              padding: '7px 20px',
              fontSize: '13px',
              fontWeight: '600',
              color: mode === m ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
          >
            {m === 'demo' ? t('mode.demoMode') : t('mode.phantomWallet')}
          </button>
        ))}
      </div>

      {mode === 'demo' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '2px',
            }}
          >
            {t('mode.selectPersona')}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {PERSONAS.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                isActive={!isAdmin && activePersona?.id === persona.id}
                onClick={() => selectPersona(persona)}
              />
            ))}
          </div>
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
              marginTop: '2px',
            }}
          >
            <AdminToggle isAdmin={isAdmin} onToggle={setAdminMode} />
          </div>
        </div>
      ) : (
        <PhantomModePanel />
      )}
    </div>
  )
}
