import { useTranslation } from '../../lib/i18n'

export type StageStatus = 'waiting' | 'active' | 'done' | 'error'

export interface FlowStage {
  id: string
  nameKey: string
  status: StageStatus
  timestamp?: number
}

function truncateSig(sig: string, chars = 8): string {
  if (sig.length <= chars * 2 + 3) return sig
  return `${sig.slice(0, chars)}...${sig.slice(-chars)}`
}

function StageNode({
  stage,
  index,
}: {
  stage: FlowStage
  index: number
}) {
  const { t } = useTranslation()
  const isWaiting = stage.status === 'waiting'
  const isActive = stage.status === 'active'
  const isDone = stage.status === 'done'
  const isError = stage.status === 'error'

  const borderColor = isActive
    ? 'var(--accent-cyan)'
    : isDone
    ? 'rgba(74, 222, 128, 0.5)'
    : isError
    ? 'rgba(248, 113, 113, 0.5)'
    : 'var(--border-subtle)'

  const bgColor = isActive
    ? 'rgba(6, 182, 212, 0.06)'
    : isDone
    ? 'rgba(34, 197, 94, 0.04)'
    : isError
    ? 'rgba(239, 68, 68, 0.06)'
    : 'var(--bg-card)'

  const labelColor = isActive
    ? 'var(--accent-cyan)'
    : isDone
    ? '#4ade80'
    : isError
    ? '#f87171'
    : 'var(--text-muted)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        flex: '0 0 auto',
        position: 'relative',
      }}
    >
      {/* Node box */}
      <div
        style={{
          width: '72px',
          height: '64px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          background: bgColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
          boxShadow: isActive
            ? '0 0 16px rgba(6, 182, 212, 0.15)'
            : isDone
            ? '0 0 8px rgba(34, 197, 94, 0.08)'
            : 'none',
          animation: isActive ? 'stagePulse 1.6s ease-in-out infinite' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Active scanline top bar */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
              animation: 'borderGlow 1.6s ease-in-out infinite',
            }}
          />
        )}

        {/* Status icon */}
        <div style={{ width: '18px', height: '18px', flexShrink: 0 }}>
          {isDone && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#4ade80" strokeWidth="1.2" />
              <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isError && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#f87171" strokeWidth="1.2" />
              <path d="M6 6l6 6M12 6l-6 6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {isActive && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin 1.2s linear infinite' }}>
              <path d="M16 9A7 7 0 1 1 9 2" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {isWaiting && (
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--border-accent)',
                margin: '0 auto',
              }}
            />
          )}
        </div>

        {/* Stage number */}
        <div
          style={{
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            color: isWaiting ? 'var(--text-muted)' : labelColor,
            opacity: isWaiting ? 0.5 : 1,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '9px',
          fontWeight: '600',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: labelColor,
          textAlign: 'center',
          transition: 'color 0.3s ease',
          maxWidth: '72px',
          lineHeight: '1.3',
        }}
      >
        {t(stage.nameKey as Parameters<typeof t>[0])}
      </div>

      {/* Timestamp */}
      {stage.timestamp && (isDone || isError) && (
        <div
          style={{
            fontSize: '8px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.02em',
          }}
        >
          +{stage.timestamp}ms
        </div>
      )}
    </div>
  )
}

function Connector({ fromStatus }: { fromStatus: StageStatus }) {
  const isActive = fromStatus === 'active'
  const isDone = fromStatus === 'done'
  const isError = fromStatus === 'error'

  const lineColor = isDone
    ? 'rgba(74, 222, 128, 0.35)'
    : isError
    ? 'rgba(248, 113, 113, 0.35)'
    : 'var(--border-subtle)'

  return (
    <div
      style={{
        flex: '1 1 0',
        height: '2px',
        background: lineColor,
        position: 'relative',
        alignSelf: 'center',
        marginBottom: '30px',
        marginTop: '2px',
        transition: 'background 0.4s ease',
        minWidth: '16px',
      }}
    >
      {/* Flowing pulse dot */}
      {(isActive || isDone) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isDone ? '#4ade80' : 'var(--accent-cyan)',
            boxShadow: isDone
              ? '0 0 6px rgba(74, 222, 128, 0.8)'
              : '0 0 8px rgba(6, 182, 212, 0.9)',
            animation: 'flowPulse 0.9s linear infinite',
          }}
        />
      )}
    </div>
  )
}

interface TransactionFlowProps {
  stages: FlowStage[]
  signature: string | null
  totalMs: number | null
  isVisible: boolean
}

export default function TransactionFlow({
  stages,
  signature,
  totalMs,
  isVisible,
}: TransactionFlowProps) {
  const { t } = useTranslation()

  if (!isVisible) return null

  const allDone = stages.every((s) => s.status === 'done')
  const hasError = stages.some((s) => s.status === 'error')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {t('flow.title')}
      </div>

      {/* Pipeline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {/* Sender origin node */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            flex: '0 0 auto',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '64px',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="var(--accent-blue)" strokeWidth="1.2" />
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="var(--accent-blue)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--accent-blue)' }}>
              TX
            </div>
          </div>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>
            {t('flow.sender')}
          </div>
        </div>

        {/* Connector from sender */}
        <Connector fromStatus={stages.length > 0 ? stages[0].status !== 'waiting' ? 'done' : 'waiting' : 'waiting'} />

        {/* Pipeline stages with connectors */}
        {stages.map((stage, i) => (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-start', flex: i < stages.length - 1 ? '1' : '0 0 auto' }}>
            <StageNode stage={stage} index={i} />
            {i < stages.length - 1 && (
              <Connector fromStatus={stage.status} />
            )}
          </div>
        ))}

        {/* Final connector to complete */}
        {stages.length > 0 && (
          <Connector fromStatus={stages[stages.length - 1].status} />
        )}

        {/* Complete node */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            flex: '0 0 auto',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '64px',
              borderRadius: '8px',
              border: allDone
                ? '1px solid rgba(74, 222, 128, 0.5)'
                : hasError
                ? '1px solid rgba(248, 113, 113, 0.4)'
                : '1px solid var(--border-subtle)',
              background: allDone
                ? 'rgba(34, 197, 94, 0.06)'
                : hasError
                ? 'rgba(239, 68, 68, 0.05)'
                : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.4s ease',
              boxShadow: allDone ? '0 0 16px rgba(34, 197, 94, 0.1)' : 'none',
            }}
          >
            {allDone ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#4ade80" strokeWidth="1.2" />
                <path d="M6 10l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : hasError ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#f87171" strokeWidth="1.2" />
                <path d="M6 6l6 6M12 6l-6 6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-accent)' }} />
            )}
          </div>
          <div
            style={{
              fontSize: '9px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: allDone ? '#4ade80' : hasError ? '#f87171' : 'var(--text-muted)',
              transition: 'color 0.4s ease',
            }}
          >
            {hasError ? t('flow.failed') : t('flow.complete')}
          </div>
        </div>
      </div>

      {/* Result card - shown when done */}
      {allDone && signature && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.04)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fade-in-up 0.4s ease forwards',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#4ade80',
                  marginBottom: '2px',
                }}
              >
                {t('flow.txComplete')}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginBottom: '2px',
                }}
              >
                {t('flow.signature')}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  wordBreak: 'break-all',
                  lineHeight: '1.5',
                }}
              >
                {truncateSig(signature)}
              </div>
            </div>
            {totalMs !== null && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '2px',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t('flow.totalTime')}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--accent-cyan)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {totalMs}ms
                </div>
              </div>
            )}
          </div>

          {/* Privacy badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '4px',
              background: 'rgba(139, 92, 246, 0.07)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              alignSelf: 'flex-start',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 1L8.5 2.5V5C8.5 7 5 9 5 9C5 9 1.5 7 1.5 5V2.5L5 1Z"
                stroke="#a78bfa"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '500', letterSpacing: '0.02em' }}>
              {t('flow.privateNotice')}
            </span>
          </div>
        </div>
      )}

      {/* Error result */}
      {hasError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#f87171',
            animation: 'fade-in-up 0.3s ease forwards',
          }}
        >
          {t('flow.error')}
        </div>
      )}
    </div>
  )
}
