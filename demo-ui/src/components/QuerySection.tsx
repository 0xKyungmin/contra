import { useTranslation } from '../lib/i18n'
import PermissionPanel from './demo/PermissionPanel'
import DBExplorer from './demo/DBExplorer'


export default function QuerySection() {
  const { t } = useTranslation()

  return (
    <section
      id="query"
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
        <div style={{ marginBottom: '40px' }}>
          <p className="section-label" style={{ marginBottom: '10px' }}>
            {t('query.label')}
          </p>
          <h2
            style={{
              fontSize: 'clamp(20px, 2.5vw, 30px)',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              marginBottom: '8px',
            }}
          >
            {t('query.title')}
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              maxWidth: '440px',
              lineHeight: '1.7',
              letterSpacing: '0.01em',
            }}
          >
            {t('query.subtitle')}
          </p>
        </div>

        {/* Permission panel (admin only - renders null for non-admin) */}
        <PermissionPanel />

        {/* DB Explorer */}
        <DBExplorer />
      </div>
    </section>
  )
}
