# HalalYield — Architecture

## Overview

HalalYield is a non-custodial RWA yield wallet with compliance enforced at the protocol level using Algorand's native primitives. The architecture is designed so that **it is structurally impossible to invest in a non-Shariah-compliant asset** — not via UI guardrails, but via on-chain atomic transaction logic.

---

## Core Architecture Principle: Atomic Compliance

Every investment is a 2-transaction Atomic Transfer group:

```
┌─────────────────────────────────────────────────────────────┐
│                     ATOMIC TRANSFER GROUP                    │
│                                                              │
│  Tx[0]: ShariahComplianceChecker.checkCompliance()          │
│         ├─ Is pool in Shariah registry? ✓                   │
│         ├─ Is pool not suspended? ✓                         │
│         ├─ Is audit < 90 days old? ✓                        │
│         ├─ Does caller have valid KYC? ✓                    │
│         └─ Is caller's jurisdiction permitted? ✓            │
│                                                              │
│  Tx[1]: RwaYieldVault.deposit()                             │
│         ├─ Verifies it is tx[1] in a 2-tx group             │
│         ├─ Verifies tx[0] called the compliance app         │
│         └─ Accepts the ASA transfer                         │
│                                                              │
│  Both succeed or BOTH FAIL atomically.                      │
│  A non-compliant deposit cannot occur.                      │
└─────────────────────────────────────────────────────────────┘
```

This is the key architectural guarantee. UIs can be bypassed. Smart contract logic cannot.

---

## Component Map

```
Frontend (React/Vite)
│
├── useWalletStore (Zustand)      — auth, positions, XP state
├── lib/algorand.js               — algosdk wrapper, atomic group builder
├── lib/pools.js                  — pool registry (on-chain + config)
└── lib/gamification.js           — XP, levels, badges
        │
        ▼
Algorand (Testnet → Mainnet)
│
├── ShariahComplianceChecker      — pool registry, KYC oracle, compliance gate
│   └── BoxMap: poolCompliance, kycVerified, poolStructure
│
├── RwaYieldVault (per pool)      — deposit, withdraw, yield claim
│   ├── Enforces atomic group structure
│   └── LocalState: userDeposit, userDepositTime
│
└── ASA (USDC or ALGO)            — deposit currency
        │
        ▼
RWA Protocol Layer (off-chain)
│
├── Centrifuge                    — trade finance pools
├── Ondo Finance                  — tokenized T-bills
└── HalalYield Green Sukuk        — native ESG Islamic bonds (Q3 2026)
```

---

## Account Model: Social Login via Rekeying

Algorand Rekeying allows an address to delegate its signing authority to another key. HalalYield uses this for social login:

1. User authenticates with Google/Apple via Web3Auth (or equivalent)
2. A spending key is derived from the social auth session
3. The user's Algorand address is rekeyed so the social key controls it
4. If the user loses access to their social account, recovery is via the same social provider
5. **The user never sees or manages a seed phrase**

```
User's Algorand address:  UMAIR...XYZ   (permanent, on-chain)
                              ↑
                         rekeyed to
                              ↓
Social login derived key: [Web3Auth key]  (controlled by user's Google/Apple)
```

---

## ZK-KYC Flow

```
User submits KYC documents (off-chain, to KYC provider)
         │
         ▼
KYC provider generates ZK proof:
  - "This address is NOT on OFAC sanctions list"
  - "This address's jurisdiction is US"
  - "Personal data NOT revealed on-chain"
         │
         ▼
KYC oracle submits recordKyc(userAddress, jurisdictionCode) to
ShariahComplianceChecker on-chain
         │
         ▼
User can now call checkCompliance() — KYC check passes
```

In production: use Privado ID, Polygon ID, or a custom Algorand ZK circuit.

---

## Gamification Layer

The gamification system is entirely frontend-side (Zustand + localStorage) in v0.1. In production, XP and badges should be anchored on-chain as ASAs or app state to prevent manipulation.

```
Action                XP     Badge
────────────────────────────────────
First deposit        +500    🌱 First deposit
Deposit $100+        +100    —
Deposit $500+        +200    —
Deposit $1,000+      +400    —
7-day streak         +250    🔥 7-day streak
30-day streak       +1000    🏆 30-day streak
Complete lesson      +150    📚 DeFi learner
2nd pool             +300    ⚖️ Diversified
Portfolio > $5K         —    💎 $5K investor
Green Sukuk deposit     —    🌍 Green investor
```

---

## Deployment

| Environment | Network      | Status          |
|-------------|--------------|-----------------|
| Local dev   | Algorand localnet (algokit sandbox) | Active |
| Testing     | Algorand testnet | Planned Q2 2026 |
| Production  | Algorand mainnet | Q3 2026 MVP     |

---

## Security Considerations

1. **Smart contracts are unaudited** — do not use with real funds until professional audit is complete
2. **KYC oracle is centralized** in v0.1 — roadmap item to decentralize via DAO governance
3. **Shariah board** appointment is pending — compliance checker admin is currently the founder multisig
4. **Yield oracle** (APY updates) is centralized in v0.1 — will be replaced with on-chain verified rate feed
5. **Frontend is a prototype** — production app requires security hardening, CSP headers, etc.
