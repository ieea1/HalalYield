# HalalYield 🌙

**The first Shariah-compliant RWA yield wallet — built on Algorand.**

> Halal · Effortless · Institutional-Grade

---

## What is HalalYield?

HalalYield is the simplest way for Muslim investors to earn Halal yield on real-world assets — starting with Centrifuge trade finance and Ondo T-bills on Algorand.

**The problem:** Every major yield protocol — Aave, Compound, Ondo (standard) — pays Riba (interest), which is forbidden in Islamic finance. At the same time, accessing RWA protocols requires deep technical knowledge, multi-platform KYC, and gas management that eliminates retail users entirely.

**The wedge:** A one-tap interface for Shariah-compliant RWA yield on Algorand. Starting with one asset class (trade finance + T-bills), one user segment (Muslim retail investors), one chain. Everything else — looping strategies, AI optimization, cross-chain aggregation — is roadmap after we nail this.

---

## Why Algorand?

| Feature | Why it matters for HalalYield |
|---|---|
| 0.001 ALGO fees | Small-position yield math actually works for emerging-market users |
| Atomic Transfers | Compliance checks and trades execute simultaneously or not at all |
| ASA role-based controls | Native protocol-level geofencing — no custom smart contract risk |
| Instant finality | Aligns with Islamic finance's requirement for settlement certainty |
| Algorand Rekeying | Social login recovery without seed phrases |

---

## Repository Structure

```
halalyield/
├── app/                    # Frontend wallet application
│   ├── src/
│   │   ├── screens/        # Individual app screens
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Algorand + wallet hooks
│   │   ├── lib/            # Algorand SDK integration
│   │   └── styles/         # Design tokens + global styles
│   ├── public/
│   └── package.json
├── contracts/              # TealScript / PyTEAL smart contracts
│   ├── compliance/         # Shariah compliance checker
│   ├── vault/              # RWA yield vault contracts
│   └── tests/
├── landing/                # Marketing landing page
│   └── index.html
├── docs/                   # Technical documentation
│   ├── architecture.md
│   ├── shariah-compliance.md
│   ├── algorand-integration.md
│   └── rwa-protocols.md
├── scripts/                # Deployment + utility scripts
└── .github/workflows/      # CI/CD
```

---

## RWA Protocols Integrated (Roadmap)

- [x] **Centrifuge** — Trade finance pools (Ambassador: @UmairDeFi)
- [ ] **Ondo Finance** — Tokenized US T-bills (USDY)
- [ ] **Maple Finance** — Institutional lending pools
- [ ] **Goldfinch** — Emerging market credit
- [ ] **Green Sukuk** — HalalYield-native ESG Islamic bonds

---

## Shariah Compliance Framework

All integrated pools undergo multi-stage screening:

1. **Asset screening** — No Riba (interest), no Gharar (excessive uncertainty), no Maisir (gambling)
2. **Structure verification** — Murabaha, Musharakah, or Ijarah structures only
3. **Scholar audit** — Certified Shariah board review
4. **On-chain enforcement** — TealScript smart signatures block non-compliant trades atomically

---

## Getting Started

### Prerequisites
- Node.js 18+
- Algorand sandbox (for local development)
- AlgoKit CLI

### Install

```bash
git clone https://github.com/UmairDeFi/halalyield.git
cd halalyield
npm install
```

### Run the demo app

```bash
cd app
npm install
npm run dev
# Open http://localhost:5173
```

### Run contracts locally

```bash
cd contracts
npm install
npx algokit sandbox start
npx algokit deploy --network localnet
```

---

## Demo

Open `app/demo/index.html` in a browser to run the interactive prototype — no install needed.

[Live demo →](https://umairdefi.github.io/halalyield)

---

## Roadmap

| Phase | Timeline | Milestone |
|---|---|---|
| Validation | Now | DeFi mastery, 10-user concierge test, protocol partner outreach |
| MVP Mainnet | Q3 2026 | Core Shariah RWA pools, social login, Centrifuge + Ondo integrations |
| Scale | Q4 2026 | ZK-KYC depth, multi-jurisdiction rollout, looping strategy builder |
| Expand | 2027 | Green Sukuk launch, cross-chain RWA aggregation, AI auto-rebalance v2 |

---

## Founder

**Umair Qutubuddin** — Founder & Builder

- Active Centrifuge Ambassador (the RWA protocol HalalYield integrates first)
- BD & ecosystem roles at Gelato, VaultCraft, Contrax — 30+ protocol partnerships built
- M.S. Neuroscience, UIUC
- Crypto-native operator since 2021 across DeFi, RWA, DAO governance, institutional BD

[@UmairDeFi](https://x.com/UmairDeFi) · [LinkedIn](https://linkedin.com/in/umair-qutubuddin-7a820832) · umair.qutubuddin@gmail.com

---

## Contributing

HalalYield is seeking:
- **Technical co-founder** with Algorand/AVM (TealScript) experience
- **Shariah finance advisor** with Islamic finance certification
- **RWA protocol partnerships** — especially Algorand-native issuers

Open an issue or reach out directly.

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built on Algorand. Powered by conviction. Designed for the next billion.*
