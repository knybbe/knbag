import { useOnline } from '../hooks/useOnline'

interface StatusBarProps {
  carriersCached: boolean
  carrierCount: number
}

export function StatusBar({ carriersCached, carrierCount }: StatusBarProps) {
  const online = useOnline()

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
          online ? 'bg-success/15 text-success' : 'bg-surface-overlay text-muted'
        }`}
      >
        <span className={`size-1.5 rounded-full ${online ? 'bg-success' : 'bg-muted'}`} />
        {online ? 'Online' : 'Offline'}
      </span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
          carriersCached ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'
        }`}
      >
        {carriersCached ? `${carrierCount} carriers cached` : 'No carrier data'}
      </span>
    </div>
  )
}