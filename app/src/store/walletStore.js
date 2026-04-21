import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWalletStore = create(
  persist(
    (set, get) => ({
      // Auth
      isOnboarded: false,
      address: null,
      loginMethod: null,

      // Ethics profile
      ethicsPreferences: [],

      // Positions
      positions: [],

      // Gamification
      xp: 0,
      level: 1,
      streakDays: 0,
      badges: [],

      // Actions
      setAddress: (address, method) => set({ address, loginMethod: method, isOnboarded: true }),

      setEthicsPreferences: (prefs) => set({ ethicsPreferences: prefs }),

      addPosition: (position) => {
        const positions = [...get().positions, { ...position, id: Date.now(), openedAt: new Date().toISOString() }]
        const xpGained = Math.floor(position.amount / 10) + 100
        const newXp = get().xp + xpGained
        const newLevel = Math.floor(newXp / 1000) + 1
        const newBadges = [...get().badges]
        if (positions.length === 1 && !newBadges.includes('first_deposit')) {
          newBadges.push('first_deposit')
        }
        set({ positions, xp: newXp, level: newLevel, badges: newBadges })
        return xpGained
      },

      incrementStreak: () => set((s) => ({ streakDays: s.streakDays + 1 })),

      getTotalValue: () => get().positions.reduce((sum, p) => sum + p.amount, 0),

      getMonthlyYield: () =>
        get().positions.reduce((sum, p) => sum + (p.amount * p.apy) / 12, 0),

      reset: () => set({
        isOnboarded: false, address: null, loginMethod: null,
        ethicsPreferences: [], positions: [], xp: 0, level: 1,
        streakDays: 0, badges: []
      }),
    }),
    { name: 'halalyield-wallet' }
  )
)
