import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Lang = 'en' | 'ko'

const translations = {
  en: {
    // Header nav
    'nav.intro': 'Intro',
    'nav.demo': 'Demo',
    'nav.query': 'Query',
    'nav.launchApp': 'Launch App',

    // Intro section
    'intro.subheadline': 'A private payment channel with access to Solana\'s global capital markets. Instant finality within a controlled environment.',
    'intro.stat.dex': '2025 DEX Volume',
    'intro.stat.txCost': 'Median Tx Cost',
    'intro.stat.nasdaq': 'Nasdaq Daily Trades',
    'intro.stat.finality': 'Finality',
    'intro.feature.private.title': 'Private Operations',
    'intro.feature.private.desc': 'No public mempool, no front-running, no data leakage. You control who participates, what rules apply, and how data is accessed.',
    'intro.feature.regulatory.title': 'Regulatory Control',
    'intro.feature.regulatory.desc': 'Implement custom KYC/AML rules, jurisdiction-specific compliance requirements, and operational policies.',
    'intro.feature.liquidity.title': 'Global Liquidity Access',
    'intro.feature.liquidity.desc': 'Direct access to liquidity on Solana, including billions in stablecoins, institutional counterparties, and deep liquidity pools.',
    'intro.card.private': 'Private',
    'intro.card.privateDesc': 'Transactions by default are configured to be completely private.',
    'intro.card.instant': 'Instant',
    'intro.card.instantDesc': 'Up to thousands of TPS. 100ms settlement batches.',
    'intro.card.rules': 'Your Rules',
    'intro.card.rulesDesc': 'Set access controls, rate limits, compliance requirements.',
    'intro.card.fees': 'Zero Fees',
    'intro.card.feesDesc': 'No per-transaction costs inside the channel.',
    'intro.tryDemo': 'Try Demo',
    'intro.viewSource': 'View Source',

    // Demo section
    'demo.label': 'Live Demo',
    'demo.title': 'Payment Simulation',
    'demo.subtitle': 'Send real USDC on Solana devnet and see how each user only sees their own transactions.',

    // Query section
    'query.subtitle': 'Switch accounts to see how query scope changes by permission.',

    // Mode
    'mode.selectPersona': 'Switch Account',

    // ScenarioPanel
    'scenario.title': 'Stablecoin Transfer',
    'scenario.subtitle': 'USDC transfers through public, private, and partially visible channels on Solana devnet.',
    'scenario.runAll': 'Send',
    'scenario.running': 'Sending',
    'scenario.rerun': 'Re-run Demo',
    'scenario.case.merchant': 'Store Payment',
    'scenario.case.salary': 'Salary Transfer',
    'scenario.case.otc': 'P2P Trade',
    'scenario.partialHint': 'Visible with permission',
    'scenario.hiddenFromOthers': 'Unauthorized',
    'scenario.permissionRequired': 'Authorized',
    'scenario.step.purchase': 'Order',
    'scenario.step.receipt': 'Paid',
    'scenario.step.payroll': 'Send',
    'scenario.step.processed': 'Received',
    'scenario.step.agreement': 'Agree',
    'scenario.step.confirmed': 'Settled',

    // DBExplorer
    'db.sectionLabel': 'Data Isolation',
    'db.sectionTitle': 'Query Simulation',
    'db.title': 'DB Viewer',
    'db.runDemoFirst': 'Run the demo above to generate payment data',

    // Privacy levels
    'privacy.public': 'PUBLIC',
    'privacy.private': 'PRIVATE',
    'privacy.partial': 'PARTIAL',

    // PermissionPanel
    'perm.title': 'Permission Manager',
    'perm.subtitle': 'Admin-only — grant or revoke tenant data access (ref. issue #75)',
    'perm.adminBadge': 'Admin',
    'perm.grantAccess': 'Grant Access',
    'perm.revokeAccess': 'Revoke Access',
    'perm.targetTenant': 'Target Tenant',
    'perm.selectTenant': 'Select tenant...',
    'perm.pubkeysToGrant': 'Pubkeys to grant (comma or newline separated)',
    'perm.pubkeyToRevoke': 'Pubkey to revoke',
    'perm.granting': 'Granting...',
    'perm.revoking': 'Revoking...',
    'perm.currentPermissions': 'Current Permissions',
    'perm.noPermissions': 'No permissions configured',
    'perm.col.tenant': 'Tenant',
    'perm.col.grantee': 'Grantee / Pubkey',
    'perm.col.grantedAt': 'Granted At',
  },
  ko: {
    // Header nav
    'nav.intro': '소개',
    'nav.demo': '데모',
    'nav.query': '쿼리',
    'nav.launchApp': '앱 실행',

    // Intro section
    'intro.subheadline': 'Solana의 글로벌 자본 시장에 접근 가능한 프라이빗 결제 채널\n통제된 환경에서 즉각적인 완결성을 제공합니다.',
    'intro.stat.dex': '2025 DEX 거래량',
    'intro.stat.txCost': '중간 Tx 비용',
    'intro.stat.nasdaq': 'Nasdaq 일일 거래',
    'intro.stat.finality': '완결성',
    'intro.feature.private.title': '프라이빗 운영',
    'intro.feature.private.desc': '퍼블릭 멤풀 없음, 프런트러닝 없음, 데이터 유출 없음. 누가 참여하고 어떤 규칙이 적용되는지 직접 제어합니다.',
    'intro.feature.regulatory.title': '규제 준수',
    'intro.feature.regulatory.desc': '커스텀 KYC/AML 규칙, 관할권별 컴플라이언스 요구사항 및 운영 정책을 구현합니다.',
    'intro.feature.liquidity.title': '글로벌 유동성 접근',
    'intro.feature.liquidity.desc': 'Solana의 수십억 달러 규모 스테이블코인, 기관 거래상대방, 깊은 유동성 풀에 직접 접근합니다.',
    'intro.card.private': 'Private',
    'intro.card.privateDesc': '트랜잭션은 기본적으로 완전히 프라이빗하게 구성됩니다.',
    'intro.card.instant': 'Instant',
    'intro.card.instantDesc': '초당 수천 건의 TPS. 100ms 정산 배치.',
    'intro.card.rules': 'Your Rules',
    'intro.card.rulesDesc': '접근 제어, 속도 제한, 컴플라이언스 요구사항 설정.',
    'intro.card.fees': 'Zero Fees',
    'intro.card.feesDesc': '채널 내 트랜잭션당 비용 없음.',
    'intro.tryDemo': '데모 체험',
    'intro.viewSource': '소스 보기',

    // Demo section
    'demo.label': '라이브 데모',
    'demo.title': '결제 시뮬레이션',
    'demo.subtitle': 'Solana 데브넷에서 실제 USDC를 전송하고, 각 사용자가 자신의 거래만 볼 수 있는지 확인하세요.',

    // Query section
    'query.subtitle': '계정을 전환하여 권한별 조회 범위를 확인해보세요.',

    // Mode
    'mode.selectPersona': '계정 전환',

    // ScenarioPanel
    'scenario.title': '스테이블코인 전송',
    'scenario.subtitle': '공개, 비공개, 부분 공개 채널을 통해 Solana 데브넷에서 USDC를 전송합니다.',
    'scenario.runAll': '전송',
    'scenario.running': '전송 중',
    'scenario.rerun': '데모 재실행',
    'scenario.case.merchant': '매장 결제',
    'scenario.case.salary': '급여 이체',
    'scenario.case.otc': '개인간 거래',
    'scenario.partialHint': '권한 보유시 조회 가능',
    'scenario.hiddenFromOthers': '권한 미보유자',
    'scenario.permissionRequired': '권한 보유자',
    'scenario.step.purchase': '주문',
    'scenario.step.receipt': '결제됨',
    'scenario.step.payroll': '전송',
    'scenario.step.processed': '수신됨',
    'scenario.step.agreement': '합의',
    'scenario.step.confirmed': '정산됨',

    // DBExplorer
    'db.sectionLabel': '데이터 격리',
    'db.sectionTitle': '조회 시뮬레이션',
    'db.title': 'DB 조회',
    'db.runDemoFirst': '위 데모를 실행하여 거래 데이터를 생성하세요',

    // Privacy levels
    'privacy.public': '공개',
    'privacy.private': '비공개',
    'privacy.partial': '부분 공개',

    // PermissionPanel
    'perm.title': '권한 관리자',
    'perm.subtitle': '관리자 전용 — 테넌트 데이터 접근 권한 부여 또는 취소 (ref. issue #75)',
    'perm.adminBadge': '관리자',
    'perm.grantAccess': '접근 권한 부여',
    'perm.revokeAccess': '접근 권한 취소',
    'perm.targetTenant': '대상 테넌트',
    'perm.selectTenant': '테넌트 선택...',
    'perm.pubkeysToGrant': '부여할 공개키 (쉼표 또는 줄바꿈으로 구분)',
    'perm.pubkeyToRevoke': '취소할 공개키',
    'perm.granting': '부여 중...',
    'perm.revoking': '취소 중...',
    'perm.currentPermissions': '현재 권한',
    'perm.noPermissions': '설정된 권한 없음',
    'perm.col.tenant': '테넌트',
    'perm.col.grantee': '수신자 / 공개키',
    'perm.col.grantedAt': '부여일',
  },
} as const

type TranslationKey = keyof typeof translations.en

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem('contra-lang')
      if (stored === 'en' || stored === 'ko') return stored
    } catch {}
    return 'en'
  })

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem('contra-lang', next)
    } catch {}
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] ?? translations.en[key] ?? key
    },
    [lang]
  )

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
