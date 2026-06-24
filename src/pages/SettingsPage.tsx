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
        <BrandLogo size="sm" showTagline />
      </header>

      <section className="glass-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Carrier data</h2>
            <p className="mt-1 text-sm text-muted">
              {dataInfo?.downloaded
                ? `${dataInfo.count} carriers · v${dataInfo.version}`
                : 'Not downloaded yet'}
            </p>
            {dataInfo?.syncedAt && (
              <p className="text-xs text-muted">
                Last synced {new Date(dataInfo.syncedAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRefreshCarriers}
            disabled={syncing || !online}
            className="shrink-0 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-40"
          >
            {syncing ? 'Syncing…' : online ? 'Refresh' : 'Offline'}
          </button>
        </div>
        {syncMessage && (
          <p className="text-sm text-slate-300">{syncMessage}</p>
        )}
        <p className="text-xs text-muted leading-relaxed">
          Download or update airline limits for offline use. Always verify on the airline&apos;s website.
        </p>
      </section>

      <section className="glass-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-100">Units</h2>
        <div className="flex gap-2">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnits(u)}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold capitalize transition ${
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

      <section className="glass-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">AI lookup (optional)</h2>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            Gemma 4 E2B runs in your browser via WebGPU. Download only on Wi-Fi — roughly 1–2 GB.
          </p>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-overlay px-4 py-3">
          <span className="text-sm font-medium text-slate-200">Enable AI-assisted lookup</span>
          <input
            type="checkbox"
            checked={settings.aiEnabled}
            onChange={(e) => handleAiToggle(e.target.checked)}
            className="size-5 rounded accent-accent"
          />
        </label>

        {settings.aiEnabled && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDownloadModel}
              disabled={!online || aiProgress !== null}
              className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-slate-200 disabled:opacity-40"
            >
              {aiProgress !== null
                ? `Downloading model… ${aiProgress}%`
                : aiReady
                  ? 'Re-download AI model'
                  : 'Download AI model'}
            </button>
            {aiReady && (
              <p className="text-xs text-success">AI model ready for offline lookup.</p>
            )}
            {aiError && <p className="text-xs text-danger">{aiError}</p>}
            {!online && (
              <p className="text-xs text-muted">Connect to the internet to download the model.</p>
            )}
          </div>
        )}
      </section>

      <section className="glass-card p-5 space-y-2">
        <h2 className="text-base font-semibold text-slate-100">About</h2>
        <p className="text-sm text-muted leading-relaxed">
          KNbag checks whether your bag fits airline carry-on and personal-item limits worldwide.
          Carrier data is cached locally for offline use. Limits change — always confirm with your airline.
        </p>
        <p className="text-xs text-muted pt-2">v1.0.0 · PWA · GitHub Pages ready</p>
      </section>
    </div>
  )
}