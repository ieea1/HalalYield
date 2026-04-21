import { Routes, Route, Navigate } from 'react-router-dom'
import WelcomeScreen from './screens/WelcomeScreen.jsx'
import OnboardingScreen from './screens/OnboardingScreen.jsx'
import EthicsScreen from './screens/EthicsScreen.jsx'
import ComplianceScreen from './screens/ComplianceScreen.jsx'
import DiscoverScreen from './screens/DiscoverScreen.jsx'
import InvestScreen from './screens/InvestScreen.jsx'
import DashboardScreen from './screens/DashboardScreen.jsx'
import SuccessScreen from './screens/SuccessScreen.jsx'
import { useWalletStore } from './store/walletStore.js'

export default function App() {
  const { isOnboarded } = useWalletStore()

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/onboard" element={<OnboardingScreen />} />
        <Route path="/ethics" element={<EthicsScreen />} />
        <Route path="/compliance" element={<ComplianceScreen />} />
        <Route path="/discover" element={<DiscoverScreen />} />
        <Route path="/invest/:poolId" element={<InvestScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
