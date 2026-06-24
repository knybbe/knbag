import type { CarrierCompatibility, CarrierFitGroup } from '../lib/carrierMatch'
import { GROUP_LABELS } from '../lib/carrierMatch'
import { formatCarrierLimits } from '../lib/formatLimits'
import type { UnitSystem } from '../types'

interface CarrierCompatibilityListProps {
  ranked: CarrierCompatibility[]
  carriersCached: boolean
  units: UnitSystem
}

function FitCell({ fits }: { fits: boolean | null }) {
  if (fits === null) {
    return <span className="text-muted">—</span>
  }
  if (fits === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-success/20 text-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-danger/15 text-danger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    </span>
  )
}

const GROUP_STYLES: Record<CarrierFitGroup, string> = {
  both: 'text-success',
  'carry-on-only': 'text-accent',
  none: 'text-muted',
}

export function CarrierCompatibilityList({
  ranked,
  carriersCached,
  units,
}: CarrierCompatibilityListProps) {
  const groups = (['both', 'carry-on-only', 'none'] as CarrierFitGroup[]).map((group) => ({
    group,
    items: ranked.filter((r) => r.group === group),
  }))

  const fitCount = ranked.filter((r) => r.group !== 'none').length

  return (
    <section className="glass-card p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-100">Compatible airlines</h2>
        {carriersCached && (
          <p className="mt-1 text-sm text-muted">
            {fitCount} of {ranked.length} carriers accept your bag as carry-on or personal item
          </p>
        )}
        {!carriersCached && (
          <p className="mt-1 text-sm text-muted">
            Carrier data loading… refresh in Settings if needed.
          </p>
        )}
      </div>

      {ranked.length > 0 && (
        <>
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-x-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <span>Airline</span>
            <span className="text-center">C/O</span>
            <span className="text-center">Pers.</span>
          </div>

          <div className="space-y-5">
            {groups.map(({ group, items }) =>
              items.length === 0 ? null : (
                <div key={group}>
                  <h3 className={`mb-2 text-xs font-bold uppercase tracking-wide ${GROUP_STYLES[group]}`}>
                    {GROUP_LABELS[group]}
                    <span className="ml-1.5 font-medium text-muted">({items.length})</span>
                  </h3>
                  <ul className="space-y-0.5">
                    {items.map((entry) => (
                      <li
                        key={entry.carrier.id}
                        className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-x-2 items-start rounded-lg px-1 py-2 transition hover:bg-surface-overlay/60"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-200">
                            {entry.carrier.airline}
                          </p>
                          <p className="mt-0.5 text-xs leading-snug text-muted">
                            {formatCarrierLimits(entry.carrier, units)}
                          </p>
                        </div>
                        <div className="flex justify-center pt-0.5">
                          <FitCell fits={entry.carryOnFits} />
                        </div>
                        <div className="flex justify-center pt-0.5">
                          <FitCell fits={entry.personalFits} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </>
      )}
    </section>
  )
}