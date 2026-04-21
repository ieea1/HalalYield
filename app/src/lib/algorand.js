/**
 * HalalYield — Algorand Integration Layer
 *
 * Wraps algosdk for:
 * - Account creation via Rekeying (social login recovery)
 * - Atomic Transfer construction (compliance + trade in one tx)
 * - ASA pool interactions
 * - ZK-KYC proof verification (stub — to be integrated with Privado/Polygon ID)
 */

import algosdk from 'algosdk'

// ── CONFIG ────────────────────────────────────────────────────────────────────
const NETWORKS = {
  mainnet: {
    algodToken: '',
    algodServer: 'https://mainnet-api.algonode.cloud',
    algodPort: 443,
    indexerServer: 'https://mainnet-idx.algonode.cloud',
  },
  testnet: {
    algodToken: '',
    algodServer: 'https://testnet-api.algonode.cloud',
    algodPort: 443,
    indexerServer: 'https://testnet-idx.algonode.cloud',
  },
  localnet: {
    algodToken: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    algodServer: 'http://localhost',
    algodPort: 4001,
    indexerServer: 'http://localhost',
  },
}

const NETWORK = import.meta.env.VITE_ALGORAND_NETWORK || 'testnet'
const config = NETWORKS[NETWORK]

export const algodClient = new algosdk.Algodv2(
  config.algodToken,
  config.algodServer,
  config.algodPort
)

// ── ACCOUNT MANAGEMENT ───────────────────────────────────────────────────────

/**
 * Generate a new Algorand account.
 * In production: replaced by social login + Rekeying flow via Web3Auth or similar.
 */
export function generateAccount() {
  const account = algosdk.generateAccount()
  return {
    address: account.addr,
    mnemonic: algosdk.secretKeyToMnemonic(account.sk),
  }
}

/**
 * Rekey an account to a new auth address.
 * This is the mechanism behind "social login" — the spending key is held
 * by the social auth provider while the on-chain address stays the same.
 *
 * @param {string} fromAddress - The account being rekeyed
 * @param {string} newAuthAddress - The new auth address (from social provider)
 * @param {Uint8Array} sk - Current signing key
 */
export async function rekeyAccount(fromAddress, newAuthAddress, sk) {
  const suggestedParams = await algodClient.getTransactionParams().do()
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: fromAddress,
    to: fromAddress,
    amount: 0,
    rekeyTo: newAuthAddress,
    suggestedParams,
  })
  const signedTxn = txn.signTxn(sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return txId
}

// ── ATOMIC TRANSFER BUILDER ───────────────────────────────────────────────────

/**
 * Build an Atomic Transfer group that combines:
 * 1. Compliance check call (TealScript app call)
 * 2. ASA deposit into RWA pool
 *
 * If the compliance check fails, the entire group is rejected atomically.
 * This is the core guarantee: you can never invest in a non-compliant pool.
 *
 * @param {Object} params
 * @param {string} params.senderAddress
 * @param {number} params.poolAppId - The RWA vault app ID
 * @param {number} params.asaId - The stablecoin ASA to deposit
 * @param {number} params.amount - Amount in microunits
 * @param {number} params.complianceAppId - Shariah compliance checker app ID
 */
export async function buildInvestAtomicGroup({
  senderAddress,
  poolAppId,
  asaId,
  amount,
  complianceAppId,
}) {
  const suggestedParams = await algodClient.getTransactionParams().do()

  // Tx 1: Call compliance checker — verifies Shariah status + jurisdiction
  const complianceTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: complianceAppId,
    onCompletion: algosdk.OnApplicationComplete.NoOpOC,
    appArgs: [
      new TextEncoder().encode('check_compliance'),
      algosdk.encodeUint64(poolAppId),
      algosdk.encodeUint64(asaId),
    ],
    suggestedParams,
  })

  // Tx 2: ASA transfer to pool
  const depositTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: algosdk.getApplicationAddress(poolAppId),
    assetIndex: asaId,
    amount,
    suggestedParams,
  })

  // Group them atomically
  const group = [complianceTxn, depositTxn]
  algosdk.assignGroupID(group)

  return group
}

// ── POOL QUERIES ─────────────────────────────────────────────────────────────

/**
 * Fetch live pool state from on-chain global state.
 * Returns APY, TVL, compliance status, and lock-up info.
 */
export async function getPoolState(appId) {
  try {
    const appInfo = await algodClient.getApplicationByID(appId).do()
    const globalState = appInfo.params['global-state'] || []

    const state = {}
    for (const kv of globalState) {
      const key = Buffer.from(kv.key, 'base64').toString()
      state[key] = kv.value.type === 1
        ? Buffer.from(kv.value.bytes, 'base64').toString()
        : kv.value.uint
    }
    return state
  } catch (err) {
    console.error(`Failed to fetch pool state for app ${appId}:`, err)
    return null
  }
}

/**
 * Get user's position in a pool by checking their local state.
 */
export async function getUserPosition(address, appId) {
  try {
    const accountInfo = await algodClient.accountInformation(address).do()
    const appLocalState = accountInfo['apps-local-state'] || []
    const appState = appLocalState.find((a) => a.id === appId)
    if (!appState) return null

    const local = {}
    for (const kv of appState['key-value'] || []) {
      const key = Buffer.from(kv.key, 'base64').toString()
      local[key] = kv.value.type === 1
        ? Buffer.from(kv.value.bytes, 'base64').toString()
        : kv.value.uint
    }
    return local
  } catch {
    return null
  }
}

// ── ZK-KYC STUB ──────────────────────────────────────────────────────────────

/**
 * Verify ZK-KYC proof on-chain.
 * Stub — will integrate with Privado ID or similar ZK identity protocol.
 *
 * The proof attests:
 * - User is not on OFAC sanctions list
 * - User's jurisdiction permits access to this pool type
 * - User has passed Shariah ethics preference check
 * All without revealing personal data.
 */
export async function verifyZkKycProof(address, proof) {
  // TODO: integrate with ZK identity protocol
  // For now returns mock verification
  console.warn('ZK-KYC: using mock verification — replace with real integration')
  return {
    verified: true,
    jurisdiction: 'US',
    sanctionsClean: true,
    shariahEligible: true,
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

export const microAlgo = (algo) => Math.floor(algo * 1_000_000)
export const fromMicroAlgo = (micro) => micro / 1_000_000

export function shortenAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
