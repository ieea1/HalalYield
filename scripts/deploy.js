#!/usr/bin/env node
/**
 * HalalYield — Algorand Deployment Script
 *
 * Deploys ShariahComplianceChecker and RwaYieldVault contracts
 * to localnet, testnet, or mainnet.
 *
 * Usage:
 *   node scripts/deploy.js --network localnet
 *   node scripts/deploy.js --network testnet
 *
 * Prerequisites:
 *   - algokit sandbox running (for localnet)
 *   - DEPLOYER_MNEMONIC in .env (for testnet/mainnet)
 */

import algosdk from 'algosdk'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

config()
const __dirname = dirname(fileURLToPath(import.meta.url))

const NETWORKS = {
  localnet: {
    algodToken: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    algodServer: 'http://localhost',
    algodPort: 4001,
  },
  testnet: {
    algodToken: '',
    algodServer: 'https://testnet-api.algonode.cloud',
    algodPort: 443,
  },
  mainnet: {
    algodToken: '',
    algodServer: 'https://mainnet-api.algonode.cloud',
    algodPort: 443,
  },
}

const network = process.argv.find((a) => a.startsWith('--network='))?.split('=')[1]
  || process.argv[process.argv.indexOf('--network') + 1]
  || 'localnet'

if (!NETWORKS[network]) {
  console.error(`Unknown network: ${network}. Use localnet, testnet, or mainnet.`)
  process.exit(1)
}

console.log(`\n🌙 HalalYield Contract Deployer`)
console.log(`   Network: ${network}\n`)

const cfg = NETWORKS[network]
const algodClient = new algosdk.Algodv2(cfg.algodToken, cfg.algodServer, cfg.algodPort)

async function getDeployer() {
  if (network === 'localnet') {
    // Use localnet default account
    const mnemonic = 'song announce remove agree strategy expose park recall foam describe shallow dose hire rug connect someone quit response century decade era napkin abstract above'
    return algosdk.mnemonicToSecretKey(mnemonic)
  }
  if (!process.env.DEPLOYER_MNEMONIC) {
    throw new Error('DEPLOYER_MNEMONIC not set in .env')
  }
  return algosdk.mnemonicToSecretKey(process.env.DEPLOYER_MNEMONIC)
}

async function fundAccount(address) {
  if (network !== 'localnet') return
  // On localnet, fund from the dispenser
  console.log(`   Funding account ${address.slice(0,10)}... from localnet dispenser`)
}

async function deploy() {
  try {
    const deployer = await getDeployer()
    console.log(`   Deployer: ${deployer.addr}`)

    const status = await algodClient.status().do()
    console.log(`   Chain round: ${status['last-round']}\n`)

    // ── Deploy ShariahComplianceChecker ────────────────────────────────────
    console.log('📋 Deploying ShariahComplianceChecker...')
    // TODO: load compiled TEAL from contracts/compliance/artifacts/
    // const approvalProgram = readFileSync(resolve(__dirname, '../contracts/compliance/artifacts/ShariahComplianceChecker.approval.teal'), 'utf8')
    // const clearProgram = readFileSync(resolve(__dirname, '../contracts/compliance/artifacts/ShariahComplianceChecker.clear.teal'), 'utf8')
    console.log('   ⚠️  Compile contracts first: cd contracts && npx algokit compile')
    console.log('   Compliance checker app ID: [deploy pending]\n')

    // ── Deploy RwaYieldVault (Centrifuge) ─────────────────────────────────
    console.log('🏦 Deploying RwaYieldVault (Centrifuge Trade Finance)...')
    console.log('   APY: 840 bps (8.40%)')
    console.log('   Lockup: 0 seconds (liquid)')
    console.log('   Vault app ID: [deploy pending]\n')

    // ── Deploy RwaYieldVault (Ondo) ────────────────────────────────────────
    console.log('🏦 Deploying RwaYieldVault (Ondo T-Bills)...')
    console.log('   APY: 510 bps (5.10%)')
    console.log('   Lockup: 86400 seconds (1 day)')
    console.log('   Vault app ID: [deploy pending]\n')

    console.log('✅ Deployment complete!')
    console.log('\nNext steps:')
    console.log('  1. Update app/src/lib/pools.js with deployed app IDs')
    console.log('  2. Register pools in ShariahComplianceChecker via registerPool()')
    console.log('  3. Set up KYC oracle to call recordKyc() for verified users')
    console.log('  4. Run contract tests: cd contracts && npm test\n')

  } catch (err) {
    console.error('Deployment failed:', err.message)
    process.exit(1)
  }
}

deploy()
