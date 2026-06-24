import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { CheckPage } from './pages/CheckPage'
import { SettingsPage } from './pages/SettingsPage'
import { ensureCarrierData, getLocalDataInfo } from './lib/carriers'

export default function App() {
  const [dataInfo, setDataInfo] = useState({
    carriersCached: false,
    carrierCount: 0,
    syncedAt: '',
  })

  const refreshDataInfo = useCallback(async () => {
    const info = await getLocalDataInfo()
    setDataInfo({
      carriersCached: info.downloaded,
      carrierCount: info.count,
      syncedAt: info.syncedAt ?? '',
    })
  }, [])

  useEffect(() => {
    ensureCarrierData().then(refreshDataInfo)
  }, [refreshDataInfo])

  return (
    <HashRouter>
      <div className="mx-auto min-h-dvh max-w-lg px-4 pt-6">
        <Routes>
          <Route
            path="/"
            element={
              <CheckPage
                carriersCached={dataInfo.carriersCached}
                carrierCount={dataInfo.carrierCount}
                dataVersion={dataInfo.syncedAt}
              />
            }
          />
          <Route
            path="/settings"
            element={<SettingsPage onCarriersChange={refreshDataInfo} />}
          />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  )
}