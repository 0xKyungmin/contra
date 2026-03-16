import { useTranslation } from '../lib/i18n'
import { useTheme } from '../lib/theme'

function scrollTo(id: string, e: React.MouseEvent) {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Header() {
  const { t, lang, setLang } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { key: 'nav.intro' as const, targetId: 'intro' },
    { key: 'nav.demo' as const, targetId: 'demo' },
    { key: 'nav.query' as const, targetId: 'query' },
  ]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="header-inner"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo - official Contra mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M14 5L7 12L14 19" stroke="var(--bg-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 8L14 12L17 16" stroke="var(--bg-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            }}
          >
            Contra
          </span>
        </div>

        {/* Nav */}
        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={`#${item.targetId}`}
              onClick={(e) => scrollTo(item.targetId, e)}
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.color = 'var(--text-muted)'
              }}
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)'
              e.currentTarget.style.color = 'var(--accent-cyan)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            {theme === 'dark' ? (
              /* Sun icon for switching to light */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* Moon icon for switching to dark */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)'
              e.currentTarget.style.color = 'var(--accent-cyan)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            {lang === 'en' ? 'KO' : 'EN'}
          </button>

        </div>
      </div>
    </header>
  )
}
