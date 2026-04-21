/**
 * HalalYield — RWA Pool Registry
 *
 * Each pool entry represents a Shariah-screened RWA yield source.
 * In production, pool state (APY, TVL, compliance status) is fetched
 * live from on-chain via getPoolState() in lib/algorand.js.
 *
 * Compliance structure reference:
 * - Murabaha: cost-plus financing (no Riba)
 * - Musharakah: profit/loss sharing partnership
 * - Ijarah: lease-based income
 * - Sukuk: asset-backed Islamic bond
 */

export const POOLS = [
  {
    id: 'centrifuge-trade-finance',
    name: 'Centrifuge — Trade Finance',
    protocol: 'Centrifuge',
    description: 'Real-world invoice financing pools. Businesses sell invoices at a discount; investors earn the spread. Murabaha-compatible structure.',
    apy: 0.084,
    tvl: 42_000_000,
    minDeposit: 10,
    lockupDays: 0,         // liquid
    riskLevel: 'medium',
    shariahStructure: 'Murabaha',
    shariahAuditor: 'AAOIFI-certified (pending)',
    assetClass: 'trade_finance',
    assetId: null,         // testnet ASA ID — to be deployed
    appId: null,           // testnet app ID — to be deployed
    complianceAppId: null,
    verified: true,
    tags: ['liquid', 'trade-finance', 'centrifuge'],
    chain: 'algorand',
  },
  {
    id: 'ondo-tbills',
    name: 'Ondo — US Treasury Bills',
    protocol: 'Ondo Finance',
    description: 'Tokenized short-term US government T-bills. Yield from sovereign debt instruments. Structured as asset-backed certificates (Ijarah-adjacent).',
    apy: 0.051,
    tvl: 380_000_000,
    minDeposit: 100,
    lockupDays: 1,
    riskLevel: 'low',
    shariahStructure: 'Ijarah (asset-backed)',
    shariahAuditor: 'Under review',
    assetClass: 'government_securities',
    assetId: null,
    appId: null,
    complianceAppId: null,
    verified: true,
    tags: ['low-risk', 'tbills', 'ondo', 'stable'],
    chain: 'algorand',
  },
  {
    id: 'green-sukuk',
    name: 'Green Sukuk — ESG Bonds',
    protocol: 'HalalYield Vault',
    description: 'HalalYield-native tokenized ESG Islamic bonds. Dual impact: environmentally ethical + Shariah-compliant. First product of its kind on-chain.',
    apy: 0.068,
    tvl: 0,                // launching Q3 2026
    minDeposit: 50,
    lockupDays: 90,
    riskLevel: 'low',
    shariahStructure: 'Sukuk al-Ijara',
    shariahAuditor: 'Pending Shariah board appointment',
    assetClass: 'sukuk',
    assetId: null,
    appId: null,
    complianceAppId: null,
    verified: false,       // not live yet
    tags: ['esg', 'sukuk', 'green', 'halalyield-native'],
    chain: 'algorand',
    comingSoon: true,
  },
  {
    id: 'maple-institutional',
    name: 'Maple — Institutional Lending',
    protocol: 'Maple Finance',
    description: 'Institutional lending pools with credit-screened borrowers. Higher yield, higher risk. Musharakah profit-sharing structure.',
    apy: 0.112,
    tvl: 28_000_000,
    minDeposit: 500,
    lockupDays: 30,
    riskLevel: 'high',
    shariahStructure: 'Musharakah',
    shariahAuditor: 'Under review',
    assetClass: 'institutional_credit',
    assetId: null,
    appId: null,
    complianceAppId: null,
    verified: false,
    tags: ['high-yield', 'institutional', 'maple'],
    chain: 'algorand',
    comingSoon: true,
  },
]

export const POOL_BY_ID = Object.fromEntries(POOLS.map((p) => [p.id, p]))

export const RISK_COLORS = {
  low:    { bg: 'rgba(0,201,167,0.1)',    text: '#00C9A7',  border: 'rgba(0,201,167,0.25)' },
  medium: { bg: 'rgba(245,200,66,0.1)',   text: '#F5C842',  border: 'rgba(245,200,66,0.25)' },
  high:   { bg: 'rgba(255,107,107,0.1)',  text: '#FF6B6B',  border: 'rgba(255,107,107,0.25)' },
}

export function formatAPY(apy) {
  return (apy * 100).toFixed(1) + '%'
}

export function formatTVL(tvl) {
  if (tvl >= 1_000_000) return '$' + (tvl / 1_000_000).toFixed(1) + 'M'
  if (tvl >= 1_000) return '$' + (tvl / 1_000).toFixed(0) + 'K'
  return '$' + tvl
}
