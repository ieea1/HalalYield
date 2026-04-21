/**
 * HalalYield — Gamification Engine
 *
 * XP, levels, streaks, and badges that reward healthy financial behavior.
 * The goal: make building wealth as habitual as checking Instagram.
 */

export const XP_ACTIONS = {
  FIRST_DEPOSIT:        { xp: 500,  label: 'First deposit',         once: true  },
  DEPOSIT:              { xp: 50,   label: 'Made a deposit',         once: false },
  DEPOSIT_100:          { xp: 100,  label: 'Invested $100+',         once: false },
  DEPOSIT_500:          { xp: 200,  label: 'Invested $500+',         once: false },
  DEPOSIT_1000:         { xp: 400,  label: 'Invested $1,000+',       once: false },
  DAILY_CHECK:          { xp: 10,   label: 'Daily portfolio check',  once: false },
  STREAK_7:             { xp: 250,  label: '7-day streak',           once: false },
  STREAK_30:            { xp: 1000, label: '30-day streak',          once: false },
  LEARN_COMPLETE:       { xp: 150,  label: 'Completed a lesson',     once: false },
  ETHICS_SET:           { xp: 100,  label: 'Set ethics preferences', once: true  },
  SECOND_POOL:          { xp: 300,  label: 'Diversified to 2 pools', once: true  },
}

export const BADGES = [
  { id: 'first_deposit',   icon: '🌱', name: 'First deposit',     desc: 'Made your first Halal investment',        xpRequired: 0   },
  { id: 'streak_7',        icon: '🔥', name: '7-day streak',      desc: 'Checked in 7 days in a row',              xpRequired: 0   },
  { id: 'defi_learner',    icon: '📚', name: 'DeFi learner',       desc: 'Completed your first learn module',       xpRequired: 0   },
  { id: 'diversified',     icon: '⚖️', name: 'Diversified',        desc: 'Invested in 2 or more pools',             xpRequired: 0   },
  { id: 'investor_500',    icon: '💰', name: '$500 investor',      desc: 'Total portfolio value exceeded $500',     xpRequired: 0   },
  { id: 'investor_5k',     icon: '💎', name: '$5K investor',       desc: 'Total portfolio value exceeded $5,000',  xpRequired: 0   },
  { id: 'streak_30',       icon: '🏆', name: '30-day streak',      desc: 'Unstoppable — 30 days in a row',          xpRequired: 0   },
  { id: 'green_investor',  icon: '🌍', name: 'Green investor',     desc: 'Invested in a Green Sukuk pool',          xpRequired: 0   },
]

export const LEVELS = [
  { level: 1,  name: 'Saver',       xpRequired: 0     },
  { level: 2,  name: 'Investor',    xpRequired: 500   },
  { level: 3,  name: 'Strategist',  xpRequired: 1500  },
  { level: 4,  name: 'Optimizer',   xpRequired: 3500  },
  { level: 5,  name: 'Yield Master',xpRequired: 7500  },
]

export function getLevelFromXP(xp) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl
  }
  return current
}

export function getXPProgress(xp) {
  const level = getLevelFromXP(xp)
  const levelIndex = LEVELS.indexOf(level)
  const nextLevel = LEVELS[levelIndex + 1]
  if (!nextLevel) return { pct: 100, current: xp, needed: 0 }
  const intoLevel = xp - level.xpRequired
  const levelSpan = nextLevel.xpRequired - level.xpRequired
  return {
    pct: Math.round((intoLevel / levelSpan) * 100),
    current: intoLevel,
    needed: levelSpan,
    nextLevelName: nextLevel.name,
  }
}

export function calculateXPForDeposit(amount) {
  let xp = XP_ACTIONS.DEPOSIT.xp
  if (amount >= 1000) xp += XP_ACTIONS.DEPOSIT_1000.xp
  else if (amount >= 500) xp += XP_ACTIONS.DEPOSIT_500.xp
  else if (amount >= 100) xp += XP_ACTIONS.DEPOSIT_100.xp
  return xp
}
