import { useTranslation } from '../lib/i18n'
import PermissionPanel from './demo/PermissionPanel'
import DBExplorer from './demo/DBExplorer'


export default function QuerySection() {
  const { t } = useTranslation()

  return (
    <section
      id="query"
      className="section-query"
      style={{
        padding: '80px 24px 100px',
        borderTop: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background:
            'radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        {/* Section header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '10px', fontWeight: '600', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--accent-cyan)',
            fontFamily: 'var(--font-mono)', marginBottom: '10px',
          }}>
            {t('db.sectionLabel')}
          </p>
          <h2 style={{
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            fontWeight: '700', letterSpacing: '-0.025em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          }}>
            {t('db.sectionTitle')}
          </h2>
        </div>

        {/* Permission panel (admin only - renders null for non-admin) */}
        <PermissionPanel />

        {/* DB Explorer */}
        <DBExplorer />
      </div>
    </section>
  )
}
