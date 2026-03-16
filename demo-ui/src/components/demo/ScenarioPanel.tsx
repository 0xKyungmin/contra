import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from '../../lib/i18n'
import { Wallet, Play, RotateCcw, CheckCircle2, Loader2, Landmark, Store, Building2, ArrowLeftRight } from 'lucide-react'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, transfer as splTransfer } from '@solana/spl-token'
import { PERSONAS } from '../../lib/authContext'
import { useDemoTx, type InsertTx } from '../../lib/demoTxContext'

type Phase = 'idle' | 'running' | 'done' | 'error'
type Privacy = 'public' | 'private' | 'partial'

const DEVNET_RPC = 'https://api.devnet.solana.com'
const connection = new Connection(DEVNET_RPC, 'confirmed')

// Devnet USDC mint (Circle official)
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')

// Fixed demo payer (devnet only)
// Address: A31PhfTHHEFrWsSpf7ecyCKWx1CA2dSVSSdSVzWMveW9
// Fund with SOL: faucet.solana.com
// Fund with USDC: faucet.circle.com
const DEMO_PAYER = Keypair.fromSecretKey(Uint8Array.from([
  178,47,254,58,235,79,139,49,158,249,184,82,178,15,168,45,
  240,93,89,40,39,211,87,18,21,75,126,86,34,49,115,120,
  134,60,201,88,192,91,146,181,251,30,252,58,57,226,69,61,
  109,144,207,240,162,85,85,115,152,251,118,141,111,181,38,182,
]))

interface Channel {
  id: string
  privacy: Privacy
  amount: number  // USDC amount (human readable, 6 decimals)
  toAddress: string
  toName: string
  caseKey: string
  icon: 'store' | 'building' | 'exchange'
  stepRight: string
}

const USDC_DECIMALS = 6

const CHANNELS: Channel[] = [
  { id: 'A', privacy: 'public', amount: 0.01, toAddress: PERSONAS[0].pubkey, toName: PERSONAS[0].name, caseKey: 'scenario.case.merchant', icon: 'store', stepRight: 'scenario.step.receipt' },
  { id: 'B', privacy: 'private', amount: 0.01, toAddress: PERSONAS[1].pubkey, toName: PERSONAS[1].name, caseKey: 'scenario.case.salary', icon: 'building', stepRight: 'scenario.step.processed' },
  { id: 'C', privacy: 'partial', amount: 0.01, toAddress: PERSONAS[2].pubkey, toName: PERSONAS[2].name, caseKey: 'scenario.case.otc', icon: 'exchange', stepRight: 'scenario.step.confirmed' },
]

const TICK_MS = 30
const TOTAL_STEPS = 120

const EXPLORER_BASE = 'https://explorer.solana.com/tx'
const EXPLORER_CLUSTER = '?cluster=devnet'

const NODE_COLOR = '#94a3b8'

const S: Record<Privacy, {
  line: string; lineAlpha: number; dashed: boolean
  badge: string; badgeBg: string; badgeBorder: string
  blur: number; alpha: number; node: string
}> = {
  public: {
    line: '#475569', lineAlpha: 0.3, dashed: true,
    badge: '#94a3b8', badgeBg: 'rgba(148,163,184,0.08)', badgeBorder: 'rgba(148,163,184,0.2)',
    blur: 0, alpha: 1, node: NODE_COLOR,
  },
  private: {
    line: '#475569', lineAlpha: 0.3, dashed: true,
    badge: '#94a3b8', badgeBg: 'rgba(148,163,184,0.08)', badgeBorder: 'rgba(148,163,184,0.2)',
    blur: 6, alpha: 0.1, node: NODE_COLOR,
  },
  partial: {
    line: '#475569', lineAlpha: 0.3, dashed: true,
    badge: '#94a3b8', badgeBg: 'rgba(148,163,184,0.08)', badgeBorder: 'rgba(148,163,184,0.2)',
    blur: 0, alpha: 1, node: NODE_COLOR,
  },
}

function truncSig(sig: string, n = 8): string {
  if (sig.length <= n * 2 + 3) return sig
  return `${sig.slice(0, n)}...${sig.slice(-n)}`
}

function amountLabel(ch: Channel): string {
  if (ch.privacy === 'public') return `${ch.amount} USDC`
  if (ch.privacy === 'private') return '??? USDC'
  return `**** USDC`
}

const CHANNEL_ICONS = {
  store: Store,
  building: Building2,
  exchange: ArrowLeftRight,
}


export default function ScenarioPanel() {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(-1)
  const [results, setResults] = useState<Record<string, { sig?: string; error?: string }>>({})
  const { saveDemoResults } = useDemoTx()
  const intervalRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => cleanup, [cleanup])

  async function run() {
    if (phase === 'running') return
    cleanup()
    setPhase('running')
    setProgress(0)
    setResults({})

    const payer = DEMO_PAYER

    // 1. Get or create sender's USDC token account
    let senderAta: PublicKey
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, payer, USDC_MINT, payer.publicKey)
      senderAta = ata.address
    } catch (e) {
      setPhase('error')
      const msg = e instanceof Error ? e.message : 'Failed to get token account'
      setResults(Object.fromEntries(CHANNELS.map(ch => [ch.id, { error: msg }])))
      return
    }

    // Start animation
    const animDone = new Promise<void>((resolve) => {
      let step = 0
      intervalRef.current = window.setInterval(() => {
        step++
        const pct = Math.min(Math.round((step / TOTAL_STEPS) * 100), 100)
        setProgress(pct)
        if (pct >= 100) { cleanup(); resolve() }
      }, TICK_MS)
    })

    // 2. Send real USDC transfers in parallel
    const txDone = Promise.allSettled(
      CHANNELS.map(async (ch) => {
        const recipientPubkey = new PublicKey(ch.toAddress)
        const recipientAta = await getOrCreateAssociatedTokenAccount(connection, payer, USDC_MINT, recipientPubkey)
        const sig = await splTransfer(
          connection, payer, senderAta, recipientAta.address, payer, ch.amount * 10 ** USDC_DECIMALS
        )
        return sig
      })
    )

    const [, txResults] = await Promise.all([animDone, txDone])
    const r: Record<string, { sig?: string; error?: string }> = {}
    let ok = true
    CHANNELS.forEach((ch, i) => {
      const res = txResults[i]
      if (res.status === 'fulfilled') {
        r[ch.id] = { sig: res.value }
      } else {
        r[ch.id] = { error: res.reason?.message ?? 'Transfer failed' }
        ok = false
      }
    })
    setResults(r)
    setPhase(ok ? 'done' : 'error')

    // Save to SQLite DB for DB Explorer
    const demoTxs: InsertTx[] = CHANNELS.filter((ch) => r[ch.id]?.sig).map((ch) => ({
      channelId: ch.id,
      privacy: ch.privacy,
      amount: ch.amount,
      senderPubkey: payer.publicKey.toBase58(),
      recipientPubkey: ch.toAddress,
      signature: r[ch.id].sig!,
      timestamp: Date.now(),
      useCase: ch.caseKey,
    }))
    await saveDemoResults(demoTxs)
  }

  function reset() {
    cleanup()
    setPhase('idle')
    setProgress(-1)
    setResults({})
  }

  const isRunning = phase === 'running'
  const isDone = phase === 'done' || phase === 'error'
  const pct = Math.max(0, Math.min(progress, 100))

  return (
    <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '4px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          }}>
            {t('scenario.title')}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {t('scenario.subtitle')}
          </p>
        </div>
      </div>

      {/* ===== Flow Visualization ===== */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        padding: '32px 20px',
        display: 'flex', alignItems: 'stretch',
      }}>
        {/* Source: Wallet + USDC */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          flexShrink: 0, width: '56px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'var(--bg-card)', border: '1.5px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <Wallet size={20} color="var(--accent-blue)" />
          </div>
          <img src="/usdc.svg" width={28} height={28} alt="USDC" style={{ borderRadius: '50%' }} />
          <span style={{
            fontSize: '7px', fontWeight: '700', color: 'var(--text-muted)',
            letterSpacing: '0.1em', fontFamily: 'var(--font-mono)',
          }}>
            SENDER
          </span>
        </div>

        {/* 3 Channel Lanes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          {CHANNELS.map((ch) => {
            const s = S[ch.privacy]
            const pastNode = pct > 50

            return (
              <div key={ch.id} style={{ display: 'flex', alignItems: 'center', minHeight: '80px' }}>
                {/* Channel label */}
                <div style={{
                  flexShrink: 0, width: '40px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 6,
                }}>
                  <span style={{
                    fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)',
                    letterSpacing: '-0.02em', lineHeight: '1',
                  }}>
                    Ch.{ch.id}
                  </span>
                </div>

                {/* Left line segment */}
                <div style={{
                  flex: 1, position: 'relative', height: '100%',
                  display: 'flex', alignItems: 'center',
                }}>
                  <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0, height: '2px',
                    background: `repeating-linear-gradient(90deg, ${s.line} 0, ${s.line} 8px, transparent 8px, transparent 14px)`,
                    opacity: s.lineAlpha,
                    transform: 'translateY(-50%)',
                  }} />
                  {progress >= 0 && pct <= 50 && (
                    <img
                      src="/usdc.svg" width={22} height={22} alt=""
                      style={{
                        position: 'absolute', top: '50%',
                        left: `calc(${pct * 2}% - 28px)`,
                        transform: 'translate(-50%, -50%)',
                        transition: `left ${TICK_MS}ms linear`,
                        zIndex: 5, borderRadius: '50%',
                        filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))',
                      }}
                    />
                  )}
                </div>

                {/* Channel Node (midpoint - use case) */}
                <div style={{
                  flexShrink: 0, width: '90px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  position: 'relative', zIndex: 6,
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--bg-card)',
                    border: `2px solid ${s.node}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 0 4px var(--bg-secondary), 0 2px 8px rgba(0,0,0,0.08)`,
                  }}>
                    {(() => { const Icon = CHANNEL_ICONS[ch.icon]; return <Icon size={18} color={s.node} /> })()}
                  </div>
                  <span style={{
                    fontSize: '9px', fontWeight: '700', color: s.node, whiteSpace: 'nowrap',
                    lineHeight: '1.2', textAlign: 'center',
                  }}>
                    {t(ch.caseKey as Parameters<typeof t>[0])}
                  </span>
                  <span style={{
                    fontSize: '7px', fontWeight: '600', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap', lineHeight: '1',
                  }}>
                    → {ch.toName}
                  </span>
                  <span style={{
                    fontSize: '7px', fontWeight: '700', letterSpacing: '0.06em',
                    padding: '2px 8px', borderRadius: '4px',
                    background: s.badgeBg, border: `1px solid ${s.badgeBorder}`,
                    color: s.badge, whiteSpace: 'nowrap',
                  }}>
                    {t(`privacy.${ch.privacy}` as Parameters<typeof t>[0])}
                  </span>
                </div>

                {/* Right side: Contra zone wraps B/C, plain for A */}
                {ch.privacy !== 'public' ? (
                  /* Contra zone wrapper */
                  <div style={{
                    flex: 1, position: 'relative',
                    display: 'flex', alignItems: 'center',
                    border: '1.5px dashed rgba(6,182,212,0.3)',
                    borderRadius: '12px',
                    background: 'rgba(6,182,212,0.02)',
                    padding: ch.privacy === 'partial' ? '6px 4px' : '0 4px',
                    minHeight: ch.privacy === 'partial' ? '72px' : undefined,
                    height: ch.privacy === 'partial' ? 'auto' : '100%',
                    margin: '4px 0',
                  }}>
                    {/* Contra label with official icon */}
                    <div style={{
                      position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '1px 8px', borderRadius: '4px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid rgba(6,182,212,0.25)',
                      zIndex: 8,
                    }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                        <path d="M14 5L7 12L14 19" stroke="var(--accent-cyan)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 8L14 12L17 16" stroke="var(--accent-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                      </svg>
                      <span style={{
                        fontSize: '7px', fontWeight: '800', letterSpacing: '0.08em',
                        color: 'var(--accent-cyan)',
                      }}>
                        CONTRA
                      </span>
                    </div>

                    {ch.privacy === 'private' ? (
                      /* B: single line, coin fully hidden */
                      <>
                        <div style={{
                          flex: 1, position: 'relative', height: '50px',
                          display: 'flex', alignItems: 'center',
                        }}>
                          <div style={{
                            position: 'absolute', top: '50%', left: 0, right: 0, height: '2px',
                            background: `repeating-linear-gradient(90deg, ${s.line} 0, ${s.line} 8px, transparent 8px, transparent 14px)`,
                            opacity: s.lineAlpha,
                            transform: 'translateY(-50%)',
                          }} />
                          {progress >= 0 && pct > 50 && (
                            <img
                              src="/usdc.svg" width={22} height={22} alt=""
                              style={{
                                position: 'absolute', top: '50%',
                                left: `${(pct - 50) * 2}%`,
                                transform: 'translate(-50%, -50%)',
                                transition: `left ${TICK_MS}ms linear, filter 0.4s ease, opacity 0.4s ease`,
                                filter: `blur(6px) drop-shadow(0 1px 3px rgba(0,0,0,0.15))`,
                                opacity: pastNode ? 0.1 : 1,
                                zIndex: 5, borderRadius: '50%',
                              }}
                            />
                          )}
                        </div>
                        <div style={{
                          flexShrink: 0, width: '66px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                          position: 'relative', zIndex: 6,
                        }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CheckCircle2 size={14} color={isDone ? '#4ade80' : 'var(--text-muted)'} />
                          </div>
                          <span style={{
                            fontSize: '7px', fontWeight: '600', color: isDone ? '#4ade80' : 'var(--text-muted)',
                            whiteSpace: 'nowrap', textAlign: 'center',
                          }}>
                            {t(ch.stepRight as Parameters<typeof t>[0])}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* C: split view - authorized vs unauthorized */
                      <>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {/* Authorized path */}
                          <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                            <span style={{
                              fontSize: '8px', fontWeight: '700', color: '#4ade80',
                              whiteSpace: 'nowrap', flexShrink: 0, width: '48px', textAlign: 'right',
                              paddingRight: '6px',
                            }}>
                              {t('scenario.permissionRequired' as Parameters<typeof t>[0])}
                            </span>
                            <div style={{
                              flex: 1, position: 'relative', height: '100%',
                              display: 'flex', alignItems: 'center',
                            }}>
                              <div style={{
                                position: 'absolute', top: '50%', left: 0, right: 0, height: '1.5px',
                                background: `repeating-linear-gradient(90deg, #4ade80 0, #4ade80 6px, transparent 6px, transparent 12px)`,
                                opacity: 0.4,
                                transform: 'translateY(-50%)',
                              }} />
                              {progress >= 0 && pct > 50 && (
                                <img
                                  src="/usdc.svg" width={16} height={16} alt=""
                                  style={{
                                    position: 'absolute', top: '50%',
                                    left: `${(pct - 50) * 2}%`,
                                    transform: 'translate(-50%, -50%)',
                                    transition: `left ${TICK_MS}ms linear`,
                                    zIndex: 5, borderRadius: '50%',
                                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          {/* Unauthorized path */}
                          <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                            <span style={{
                              fontSize: '8px', fontWeight: '700', color: '#ef4444',
                              whiteSpace: 'nowrap', flexShrink: 0, width: '48px', textAlign: 'right',
                              paddingRight: '6px',
                            }}>
                              {t('scenario.hiddenFromOthers' as Parameters<typeof t>[0])}
                            </span>
                            <div style={{
                              flex: 1, position: 'relative', height: '100%',
                              display: 'flex', alignItems: 'center',
                            }}>
                              <div style={{
                                position: 'absolute', top: '50%', left: 0, right: 0, height: '1.5px',
                                background: `repeating-linear-gradient(90deg, #ef4444 0, #ef4444 6px, transparent 6px, transparent 12px)`,
                                opacity: 0.2,
                                transform: 'translateY(-50%)',
                              }} />
                              {progress >= 0 && pct > 50 && (
                                <img
                                  src="/usdc.svg" width={16} height={16} alt=""
                                  style={{
                                    position: 'absolute', top: '50%',
                                    left: `${(pct - 50) * 2}%`,
                                    transform: 'translate(-50%, -50%)',
                                    transition: `left ${TICK_MS}ms linear, filter 0.4s ease, opacity 0.4s ease`,
                                    filter: 'blur(5px) drop-shadow(0 1px 3px rgba(0,0,0,0.15))',
                                    opacity: pastNode ? 0.1 : 1,
                                    zIndex: 5, borderRadius: '50%',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        {/* End step label - matching A/B layout */}
                        <div style={{
                          flexShrink: 0, width: '66px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                          position: 'relative', zIndex: 6,
                        }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CheckCircle2 size={14} color={isDone ? '#4ade80' : 'var(--text-muted)'} />
                          </div>
                          <span style={{
                            fontSize: '7px', fontWeight: '600', color: isDone ? '#4ade80' : 'var(--text-muted)',
                            whiteSpace: 'nowrap', textAlign: 'center',
                          }}>
                            {t(ch.stepRight as Parameters<typeof t>[0])}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Channel A: no Contra zone, matching wrapper height */
                  <div style={{
                    flex: 1, position: 'relative',
                    display: 'flex', alignItems: 'center',
                    border: '1.5px dashed transparent',
                    borderRadius: '12px',
                    padding: '0 4px',
                    margin: '4px 0',
                  }}>
                    <div style={{
                      flex: 1, position: 'relative', height: '50px',
                      display: 'flex', alignItems: 'center',
                    }}>
                      <div style={{
                        position: 'absolute', top: '50%', left: 0, right: 0, height: '2px',
                        background: `repeating-linear-gradient(90deg, ${s.line} 0, ${s.line} 8px, transparent 8px, transparent 14px)`,
                        opacity: s.lineAlpha,
                        transform: 'translateY(-50%)',
                      }} />
                      {progress >= 0 && pct > 50 && (
                        <img
                          src="/usdc.svg" width={22} height={22} alt=""
                          style={{
                            position: 'absolute', top: '50%',
                            left: `${(pct - 50) * 2}%`,
                            transform: 'translate(-50%, -50%)',
                            transition: `left ${TICK_MS}ms linear`,
                            zIndex: 5, borderRadius: '50%',
                            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))',
                          }}
                        />
                      )}
                    </div>

                    <div style={{
                      flexShrink: 0, width: '66px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      position: 'relative', zIndex: 6,
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle2 size={14} color={isDone ? '#4ade80' : 'var(--text-muted)'} />
                      </div>
                      <span style={{
                        fontSize: '7px', fontWeight: '600', color: isDone ? '#4ade80' : 'var(--text-muted)',
                        whiteSpace: 'nowrap', textAlign: 'center',
                      }}>
                        {t(ch.stepRight as Parameters<typeof t>[0])}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Destination: Settlement / L1 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          flexShrink: 0, width: '56px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'var(--bg-card)', border: '1.5px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <Landmark size={20} color="var(--accent-cyan)" />
          </div>
          <span style={{
            fontSize: '7px', fontWeight: '700', color: 'var(--text-muted)',
            letterSpacing: '0.1em', fontFamily: 'var(--font-mono)',
            textAlign: 'center', lineHeight: '1.5',
          }}>
            SETTLE{'\n'}L1
          </span>
        </div>
      </div>

      {/* ===== Tx Results ===== */}
      {isDone && Object.keys(results).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{
            fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px',
          }}>
            Transaction Results
          </span>
          {CHANNELS.map((ch) => {
            const r = results[ch.id]
            const s = S[ch.privacy]
            const sig = r?.sig
            return (
              <div key={ch.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px',
                background: r?.error ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)',
                border: `1px solid ${r?.error ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'}`,
              }}>
                {/* Channel badge */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: s.badgeBg, border: `1.5px solid ${s.badgeBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '700', color: s.node,
                  flexShrink: 0,
                }}>
                  {ch.id}
                </div>

                {/* Use case */}
                <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {t(ch.caseKey as Parameters<typeof t>[0])}
                </span>

                {/* Privacy badge */}
                <span style={{
                  fontSize: '7px', fontWeight: '700', letterSpacing: '0.08em',
                  padding: '2px 6px', borderRadius: '3px',
                  background: s.badgeBg, color: s.badge, flexShrink: 0,
                }}>
                  {t(`privacy.${ch.privacy}` as Parameters<typeof t>[0])}
                </span>

                {/* Signature */}
                <div style={{
                  flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {r?.error ? (
                    <span style={{ fontSize: '10px', color: '#f87171' }}>{r.error}</span>
                  ) : sig ? (
                    ch.privacy === 'public' ? (
                      <a
                        href={`${EXPLORER_BASE}/${sig}${EXPLORER_CLUSTER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '10px', fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-cyan)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          textDecoration: 'none',
                        }}
                      >
                        {truncSig(sig)}
                      </a>
                    ) : (
                      <>
                        <span style={{
                          fontSize: '10px', fontFamily: 'var(--font-mono)',
                          color: s.badge,
                          filter: 'blur(4px)',
                          userSelect: 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {truncSig(sig)}
                        </span>
                        {ch.privacy === 'partial' && (
                          <span style={{
                            fontSize: '9px', fontWeight: '600', color: 'var(--accent-cyan)',
                            whiteSpace: 'nowrap', flexShrink: 0,
                            background: 'rgba(6,182,212,0.08)',
                            padding: '2px 8px', borderRadius: '4px',
                            border: '1px solid rgba(6,182,212,0.2)',
                          }}>
                            {t('scenario.partialHint')}
                          </span>
                        )}
                      </>
                    )
                  ) : null}
                </div>

                {/* Amount */}
                <span style={{
                  fontSize: '10px', fontWeight: '700', fontFamily: 'var(--font-mono)',
                  color: s.badge, flexShrink: 0,
                }}>
                  {amountLabel(ch)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== Action bar ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn-primary"
          onClick={isDone ? () => { reset(); setTimeout(run, 100) } : run}
          disabled={isRunning}
          style={{
            opacity: isRunning ? 0.5 : 1,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: '700', padding: '10px 28px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              {t('scenario.running')}
            </>
          ) : isDone ? (
            <>
              <RotateCcw size={14} />
              {t('scenario.rerun')}
            </>
          ) : (
            <>
              <Play size={14} />
              {t('scenario.runAll')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
