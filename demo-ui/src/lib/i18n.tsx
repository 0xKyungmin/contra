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
    'query.label': 'Data Isolation',
    'query.title': 'DB Viewer',
    'query.subtitle': 'Switch accounts to see how transaction visibility changes per user.',
    'query.isolated': 'isolated view',

    // ModeToggle
    'mode.demoMode': 'Demo Mode',
    'mode.phantomWallet': 'Phantom Wallet',
    'mode.selectPersona': 'Switch Account',
    'mode.adminView': 'Admin View',
    'mode.adminViewingAll': 'Viewing all user data',
    'mode.adminSeeAll': 'See all transactions across users',
    'mode.phantomConnected': 'Phantom Connected',
    'mode.connectPhantom': 'Connect Phantom Wallet',
    'mode.connectPhantomDesc': 'Sign transactions directly with your wallet.',
    'mode.phantomNotDetected': 'Phantom not detected — install the extension first.',
    'mode.connectWallet': 'Connect Wallet',
    'mode.disconnect': 'Disconnect',

    // ScenarioPanel
    'scenario.title': 'Send Payments',
    'scenario.subtitle': 'USDC transfers through public, private, and partially visible channels on Solana devnet.',
    'scenario.runAll': 'Send',
    'scenario.running': 'Sending',
    'scenario.allComplete': 'Done',
    'scenario.rerun': 'Re-run Demo',
    'scenario.reset': 'Reset',
    'scenario.totalTime': 'Total Time',
    'scenario.txCount': 'Completed',
    'scenario.privacyNotice': 'All payments settled on L2 -- switch accounts below to check who can see what.',
    'scenario.case.merchant': 'Store Payment',
    'scenario.case.salary': 'Salary Transfer',
    'scenario.case.otc': 'P2P Trade',
    'scenario.case.audit': 'Audit Report',
    'scenario.partialHint': 'Visible with permission',
    'scenario.noContra': 'Direct (No Contra)',
    'scenario.withContra': 'Contra',
    'scenario.allExposed': 'Visible to everyone',
    'scenario.hiddenFromOthers': 'Unauthorized',
    'scenario.permissionRequired': 'Authorized',
    'scenario.step.purchase': 'Order',
    'scenario.step.receipt': 'Paid',
    'scenario.step.payroll': 'Send',
    'scenario.step.processed': 'Received',
    'scenario.step.agreement': 'Agree',
    'scenario.step.confirmed': 'Settled',
    'scenario.isolation.title': 'Access Control',
    'scenario.isolation.desc': 'Click an account to see which payments are visible. Each user can only see transactions they are involved in.',
    'scenario.role.depositor': 'Buyer',
    'scenario.role.recipient': 'Seller',
    'scenario.role.observer': 'Third Party',

    // Transaction flow visualization
    'flow.title': 'Payment Flow',
    'flow.sender': 'Sender',
    'flow.complete': 'Complete',
    'flow.failed': 'Failed',
    'flow.txComplete': 'Payment Complete',
    'flow.signature': 'Signature',
    'flow.totalTime': 'Total Time',
    'flow.privateNotice': 'Private — not visible on Solana L1',
    'flow.error': 'Transaction failed during processing.',
    'flow.stage.gateway': 'Gateway',
    'flow.stage.sigverify': 'Sig Verify',
    'flow.stage.sequencer': 'Sequencer',
    'flow.stage.executor': 'Executor',
    'flow.stage.settler': 'Settler',

    // Pipeline node labels
    'pipeline.wallet': 'Wallet',
    'pipeline.gateway': 'Gateway',
    'pipeline.sigverify': 'Sig Verify',
    'pipeline.sequencer': 'Sequencer',
    'pipeline.executor': 'Executor',
    'pipeline.settler': 'Settler',

    // BalancePanel
    'balance.title': 'Balance Checker',
    'balance.subtitle': 'Query SOL balance for any account',
    'balance.accountPubkey': 'Account Pubkey',
    'balance.checking': 'Checking...',
    'balance.checkBalance': 'Check Balance',
    'balance.balanceLamports': 'Balance (lamports)',
    'balance.sol': 'SOL',
    'balance.currentSlot': 'Current Slot',
    'balance.noWallet': 'No wallet',

    // DBExplorer
    'db.title': 'DB Viewer',
    'db.tenantScoped': 'Per-user data',
    'db.lastUpdated': 'Last updated',
    'db.refresh': 'Refresh',
    'db.loading': 'Loading...',
    'db.running': 'Running...',
    'db.runQuery': 'Query',
    'db.runDemoFirst': 'Run the demo above to generate payment data',
    'db.generatedSql': 'Executed SQL',
    'db.copy': 'Copy',
    'db.copied': 'Copied',
    'db.adminView': 'Admin -- showing all user data',
    'db.viewingAs': 'Account:',
    'db.pubkey': 'pubkey',
    'db.pubkeys': 'pubkeys',
    'db.noWalletConnected': 'No wallet connected',
    'db.noTransactions': 'No transactions visible for this account',
    'db.noTransactionsDesc': 'has no matching records. Data is isolated per user -- other users\' transactions are not visible here.',
    'db.page': 'Page',
    'db.of': 'of',
    'db.prev': 'Prev',
    'db.next': 'Next',
    'db.col.signature': 'Signature',
    'db.col.type': 'Type',
    'db.col.mint': 'Mint',
    'db.col.amount': 'Amount',
    'db.col.status': 'Status',
    'db.col.created': 'Created',
    'db.param.mintAddress': 'Mint Address',
    'db.param.recipientAddress': 'Recipient Address',
    'db.param.limit': 'Limit',
    'db.param.status': 'Status',
    'db.param.minAmount': 'Min Amount',
    'db.preset.myTransactions': 'My Transactions',
    'db.preset.myDeposits': 'My Deposits',
    'db.preset.myWithdrawals': 'My Withdrawals',
    'db.preset.byMint': 'By Mint',
    'db.preset.byRecipient': 'By Recipient',
    'db.preset.recent': 'Recent',
    'db.preset.byStatus': 'By Status',
    'db.preset.largeTransfers': 'Large Transfers',

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
    'intro.subheadline': 'Solana의 글로벌 자본 시장에 접근 가능한 프라이빗 결제 채널. 통제된 환경에서 즉각적인 완결성을 제공합니다.',
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
    'query.label': '데이터 격리',
    'query.title': 'DB 조회',
    'query.subtitle': '계정을 전환하여 사용자별 거래 조회 범위가 어떻게 달라지는지 확인하세요.',
    'query.isolated': '격리된 조회',

    // ModeToggle
    'mode.demoMode': '데모 모드',
    'mode.phantomWallet': 'Phantom 지갑',
    'mode.selectPersona': '계정 전환',
    'mode.adminView': '관리자',
    'mode.adminViewingAll': '전체 사용자 데이터 조회 중',
    'mode.adminSeeAll': '모든 사용자의 거래 조회',
    'mode.phantomConnected': 'Phantom 연결됨',
    'mode.connectPhantom': 'Phantom 지갑 연결',
    'mode.connectPhantomDesc': '지갑으로 직접 트랜잭션에 서명하세요.',
    'mode.phantomNotDetected': 'Phantom이 감지되지 않았습니다 — 먼저 확장 프로그램을 설치하세요.',
    'mode.connectWallet': '지갑 연결',
    'mode.disconnect': '연결 해제',

    // ScenarioPanel
    'scenario.title': '결제 전송',
    'scenario.subtitle': '공개, 비공개, 부분 공개 채널을 통해 Solana 데브넷에서 USDC를 전송합니다.',
    'scenario.runAll': '전송',
    'scenario.running': '전송 중',
    'scenario.allComplete': '완료',
    'scenario.rerun': '데모 재실행',
    'scenario.reset': '초기화',
    'scenario.totalTime': '총 소요 시간',
    'scenario.txCount': '완료',
    'scenario.privacyNotice': '모든 결제가 L2에서 정산되었습니다 -- 아래에서 계정을 전환하여 누가 무엇을 볼 수 있는지 확인하세요.',
    'scenario.case.merchant': '매장 결제',
    'scenario.case.salary': '급여 이체',
    'scenario.case.otc': '개인간 거래',
    'scenario.case.audit': '감사 보고',
    'scenario.partialHint': '권한 보유시 조회 가능',
    'scenario.noContra': '직접 전송 (Contra 없음)',
    'scenario.withContra': 'Contra',
    'scenario.allExposed': '모두에게 노출',
    'scenario.hiddenFromOthers': '권한 미보유자',
    'scenario.permissionRequired': '권한 보유자',
    'scenario.step.purchase': '주문',
    'scenario.step.receipt': '결제됨',
    'scenario.step.payroll': '전송',
    'scenario.step.processed': '수신됨',
    'scenario.step.agreement': '합의',
    'scenario.step.confirmed': '정산됨',
    'scenario.isolation.title': '접근 제어',
    'scenario.isolation.desc': '계정을 클릭하여 어떤 결제가 보이는지 확인하세요. 각 사용자는 자신이 관여한 거래만 볼 수 있습니다.',
    'scenario.role.depositor': '구매자',
    'scenario.role.recipient': '판매자',
    'scenario.role.observer': '제3자',

    // Transaction flow visualization
    'flow.title': '결제 흐름',
    'flow.sender': '보내는 사람',
    'flow.complete': '완료',
    'flow.failed': '실패',
    'flow.txComplete': '결제 완료',
    'flow.signature': '서명',
    'flow.totalTime': '총 소요 시간',
    'flow.privateNotice': 'Private — Solana L1에 표시되지 않음',
    'flow.error': '처리 중 트랜잭션이 실패했습니다.',
    'flow.stage.gateway': 'Gateway',
    'flow.stage.sigverify': 'Sig Verify',
    'flow.stage.sequencer': 'Sequencer',
    'flow.stage.executor': 'Executor',
    'flow.stage.settler': 'Settler',

    // Pipeline node labels
    'pipeline.wallet': 'Wallet',
    'pipeline.gateway': 'Gateway',
    'pipeline.sigverify': 'Sig Verify',
    'pipeline.sequencer': 'Sequencer',
    'pipeline.executor': 'Executor',
    'pipeline.settler': 'Settler',

    // BalancePanel
    'balance.title': '잔액 조회',
    'balance.subtitle': '임의 계정의 SOL 잔액 조회',
    'balance.accountPubkey': '계정 공개키',
    'balance.checking': '조회 중...',
    'balance.checkBalance': '잔액 확인',
    'balance.balanceLamports': '잔액 (lamports)',
    'balance.sol': 'SOL',
    'balance.currentSlot': '현재 슬롯',
    'balance.noWallet': '지갑 없음',

    // DBExplorer
    'db.title': 'DB 조회',
    'db.tenantScoped': '사용자별 데이터',
    'db.lastUpdated': '마지막 업데이트',
    'db.refresh': '새로고침',
    'db.loading': '로딩 중...',
    'db.running': '실행 중...',
    'db.runQuery': '조회',
    'db.runDemoFirst': '위 데모를 실행하여 거래 데이터를 생성하세요',
    'db.generatedSql': '실행된 SQL',
    'db.copy': '복사',
    'db.copied': '복사됨',
    'db.adminView': '관리자 -- 전체 사용자 데이터 표시 중',
    'db.viewingAs': '현재 계정:',
    'db.pubkey': '공개키',
    'db.pubkeys': '공개키',
    'db.noWalletConnected': '지갑 미연결',
    'db.noTransactions': '이 계정으로 조회 가능한 거래가 없습니다',
    'db.noTransactionsDesc': '에 일치하는 거래가 없습니다. 데이터는 사용자별로 격리됩니다 -- 다른 사용자의 거래는 보이지 않습니다.',
    'db.page': '페이지',
    'db.of': '/',
    'db.prev': '이전',
    'db.next': '다음',
    'db.col.signature': '서명',
    'db.col.type': '유형',
    'db.col.mint': '민트',
    'db.col.amount': '수량',
    'db.col.status': '상태',
    'db.col.created': '생성일',
    'db.param.mintAddress': '민트 주소',
    'db.param.recipientAddress': '수신자 주소',
    'db.param.limit': '제한',
    'db.param.status': '상태',
    'db.param.minAmount': '최소 수량',
    'db.preset.myTransactions': '내 트랜잭션',
    'db.preset.myDeposits': '내 입금',
    'db.preset.myWithdrawals': '내 출금',
    'db.preset.byMint': '민트별',
    'db.preset.byRecipient': '수신자별',
    'db.preset.recent': '최근',
    'db.preset.byStatus': '상태별',
    'db.preset.largeTransfers': '대량 전송',

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
