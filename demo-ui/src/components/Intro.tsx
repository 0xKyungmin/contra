import { useTranslation } from '../lib/i18n'

// Official Solana logo mark with gradient
function SolanaLogo({ size = 20 }: { size?: number }) {
  const scale = size / 88
  const w = Math.round(101 * scale)
  return (
    <svg width={w} height={size} viewBox="0 0 101 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z" fill="url(#solana_grad)"/>
      <defs>
        <linearGradient id="solana_grad" x1="8.52558" y1="90.0973" x2="88.9933" y2="-3.01622" gradientUnits="userSpaceOnUse">
          <stop offset="0.08" stopColor="#9945FF"/>
          <stop offset="0.3" stopColor="#8752F3"/>
          <stop offset="0.5" stopColor="#5497D5"/>
          <stop offset="0.6" stopColor="#43B4CA"/>
          <stop offset="0.72" stopColor="#28E0B9"/>
          <stop offset="0.97" stopColor="#19FB9B"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// Contra logo mark
function ContraLogo({ size = 48 }: { size?: number }) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: `${size * 0.22}px`,
      background: 'var(--text-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path d="M14 5L7 12L14 19" stroke="var(--bg-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 8L14 12L17 16" stroke="var(--bg-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  )
}

// "How Contra Works" diagram - from PDF page 4
function HowItWorksDiagram() {
  const { t } = useTranslation()
  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      padding: '24px',
      background: 'var(--bg-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px',
      width: '100%',
    }}>
      {/* Mainnet header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SolanaLogo size={14} />
          <span style={{ fontSize: '13px', fontWeight: '700' }}>Mainnet</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
          $100B+ Liquidity
        </span>
      </div>

      {/* User Wallet */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px',
          border: '1px solid var(--border-accent)',
          borderRadius: '8px',
          background: 'var(--bg-card)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
          </svg>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            User Wallet
          </span>
        </div>
      </div>

      {/* Deposit / Withdraw arrows */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 2v6M2.5 5.5L5 8l2.5-2.5" stroke="var(--accent-cyan)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Deposit
        </div>
        <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 8V2M2.5 4.5L5 2l2.5 2.5" stroke="var(--accent-purple)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Withdraw
        </div>
      </div>

      {/* Contra Payment Channel box */}
      <div style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '16px',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.01em' }}>
          Contra Payment Channel
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { title: t('intro.card.private'), desc: t('intro.card.privateDesc') },
            { title: t('intro.card.instant'), desc: t('intro.card.instantDesc') },
            { title: t('intro.card.rules'), desc: t('intro.card.rulesDesc') },
            { title: t('intro.card.fees'), desc: t('intro.card.feesDesc') },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '3px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Intro() {
  const { t } = useTranslation()

  return (
    <section
      id="intro"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px 72px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Grid backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 60% 70% at 30% 20%, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 30% 20%, black 0%, transparent 70%)',
        opacity: 0.12, pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1100px', margin: '0 auto', position: 'relative',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '48px', flexWrap: 'wrap',
      }}>
        {/* Left: Text content */}
        <div style={{ flex: '1 1 440px', maxWidth: '560px' }}>
          {/* Solana official logo + wordmark */}
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '48px' }}>
            <SolanaLogo size={18} />
            <span style={{
              fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em',
              color: 'var(--text-primary)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            }}>
              SOLANA
            </span>
          </div>

          {/* Contra logo + name */}
          <div className="animate-fade-in-up delay-100" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <ContraLogo size={52} />
            <span style={{ fontSize: '28px', fontWeight: '400', letterSpacing: '-0.02em' }}>
              Contra
            </span>
          </div>

          {/* Main tagline */}
          <h1
            className="animate-fade-in-up delay-100"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 56px)',
              fontWeight: '700', lineHeight: '1.08',
              letterSpacing: '-0.035em', marginBottom: '24px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            }}
          >
            Public liquidity.
            <br />
            Private execution.
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up delay-200"
            style={{
              fontSize: '15px', lineHeight: '1.7',
              color: 'var(--text-secondary)', marginBottom: '40px',
              maxWidth: '480px',
            }}
          >
            {t('intro.subheadline')}
          </p>

          {/* Spacer */}
          <div style={{ height: '16px' }} />
        </div>

        {/* Right: How Contra Works diagram */}
        <div className="animate-fade-in-up delay-200" style={{ flex: '0 1 400px' }}>
          <HowItWorksDiagram />
        </div>
      </div>
    </section>
  )
}
