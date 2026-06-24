import { useEffect, useState } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { useSettings } from '../hooks/useSettings'
import { downloadAiModel, getAiLoadState, isAiReady, setAiEnabled } from '../lib/ai'
import { getLocalDataInfo, syncCarriers } from '../lib/carriers'
import { useOnline } from '../hooks/useOnline'

interface SettingsPageProps {
  onCarriersChange?: () => void
}

export function SettingsPage({ onCarriersChange }: SettingsPageProps) {
  const { settings, setUnits, setAiEnabled: setAiSetting } = useSettings()
  const online = useOnline()
  const [aiProgress, setAiProgress] = useState<number | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiReady, setAiReady] = useState(isAiReady())
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [dataInfo, setDataInfo] = useState<Awaited<ReturnType<typeof getLocalDataInfo>> | null>(null)

  useEffect(() => {
    getLocalDataInfo().then(setDataInfo)
  }, [syncMessage])

  async function handleRefreshCarriers() {
    setSyncing(true)
    setSyncMessage(null)
    const result = await syncCarriers(true)
    setSyncMessage(result.message)
    setSyncing(false)
    if (result.status === 'success') {
      onCarriersChange?.()
      setDataInfo(await getLocalDataInfo())
    }
  }

  async function handleAiToggle(enabled: boolean) {
    setAiSetting(enabled)
    setAiEnabled(enabled)
    if (!enabled) {
      setAiReady(false)
      setAiProgress(null)
      setAiError(null)
    }
  }

  async function handleDownloadModel() {
    setAiError(null)
    setAiProgress(0)
    try {
      await downloadAiModel((pct) => setAiProgress(pct))
      setAiReady(true)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Download failed')
      const { error } = getAiLoadState()
      if (error) setAiError(error)
    } finally {
      setAiProgress(null)
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <header>
        <BrandLogo size="sm" />
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {dataInfo?.downloaded
              ? `${dataInfo.count} · v${dataInfo.version}`
              : 'No data'}
          </p>
          <button
            type="button"
            onClick={handleRefreshCarriers}
            disabled={syncing || !online}
            className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent disabled:opacity-40"
          >
            {syncing ? '…' : online ? 'Refresh' : 'Offline'}
          </button>
        </div>
        {syncMessage && <p className="text-xs text-muted">{syncMessage}</p>}
      </section>

      <section>
        <div className="flex gap-2">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnits(u)}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${
                settings.units === u
                  ? 'border-accent/50 bg-accent/10 text-accent'
                  : 'border-border bg-surface-overlay text-muted'
              }`}
            >
              {u === 'metric' ? 'cm / kg' : 'in / lb'}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <label className="flex items-center justify-between gap-4 rounded-lg bg-surface-overlay/60 px-3 py-2.5">
          <span className="text-sm text-slate-300">AI lookup</span>
          <input
            type="checkbox"
            checked={settings.aiEnabled}
            onChange={(e) => handleAiToggle(e.target.checked)}
            className="size-5 rounded accent-accent"
          />
        </label>

        {settings.aiEnabled && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDownloadModel}
              disabled={!online || aiProgress !== null}
              className="w-full rounded-lg border border-border py-2.5 text-sm text-slate-300 disabled:opacity-40"
            >
              {aiProgress !== null
                ? `${aiProgress}%`
                : aiReady
                  ? 'Re-download model'
                  : 'Download model'}
            </button>
            {aiReady && <p className="text-xs text-success">Ready</p>}
            {aiError && <p className="text-xs text-danger">{aiError}</p>}
          </div>
        )}
      </section>

      <p className="text-xs text-muted">v1.0.0</p>
    </div>
  )
}