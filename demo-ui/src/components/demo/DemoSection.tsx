import WalletProvider from './WalletProvider'
import { AuthProvider } from '../../lib/authContext'
import { DemoTxProvider } from '../../lib/demoTxContext'
import { useTranslation } from '../../lib/i18n'
import ScenarioPanel from './ScenarioPanel'
import QuerySection from '../QuerySection'

function DemoInner() {
  const { t } = useTranslation()

  return (
    <>
      <section
        id="demo"
        style={{
          padding: '72px 24px 60px',
          borderTop: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          {/* Section header */}
          <div style={{ marginBottom: '32px' }}>
            <p className="section-label" style={{ marginBottom: '10px' }}>
              {t('demo.label')}
            </p>
            <h2 style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: '700', letterSpacing: '-0.025em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            }}>
              {t('demo.title')}
            </h2>
          </div>

          <ScenarioPanel />
        </div>
      </section>

      {/* Query section */}
      <QuerySection />
    </>
  )
}

export default function DemoSection() {
  return (
    <AuthProvider>
      <DemoTxProvider>
        <WalletProvider>
          <DemoInner />
        </WalletProvider>
      </DemoTxProvider>
    </AuthProvider>
  )
}
