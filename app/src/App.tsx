import { useState } from 'react'
import { useConfig } from './lib/useConfig'
import { Nav, type Screen } from './components/Nav'
import { Home } from './screens/Home'
import { Insights } from './screens/Insights'
import { Settings } from './screens/Settings'

export default function App() {
  const [cfg, update] = useConfig()
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <>
      <main className="veil-screen">
        {screen === 'home' && <Home cfg={cfg} update={update} />}
        {screen === 'insights' && <Insights key="insights" onBack={() => setScreen('home')} />}
        {screen === 'settings' && (
          <Settings key="settings" cfg={cfg} onBack={() => setScreen('home')} />
        )}
      </main>
      <Nav current={screen} onNavigate={setScreen} />
    </>
  )
}
