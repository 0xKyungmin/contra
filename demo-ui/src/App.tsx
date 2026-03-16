import { I18nProvider } from './lib/i18n'
import { ThemeProvider } from './lib/theme'
import Header from './components/Header'
import Intro from './components/Intro'
import DemoSection from './components/demo/DemoSection'

export default function App() {
  return (
    <ThemeProvider>
    <I18nProvider>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Header />
        <main>
          <Intro />
          <DemoSection />
        </main>
        <footer
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Contra — Private Settlement Infrastructure
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Built on{' '}
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
            >
              Solana
            </a>
          </span>
        </footer>
      </div>
    </I18nProvider>
    </ThemeProvider>
  )
}
