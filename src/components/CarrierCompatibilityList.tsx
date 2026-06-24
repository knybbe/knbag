import { useState } from 'react'
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

const GROUP_ORDER: CarrierFitGroup[] = ['both', 'carry-on-only', 'none']

export function CarrierCompatibilityList({
  ranked,
  carriersCached,
  units,
}: CarrierCompatibilityListProps) {
  const [openGroups, setOpenGroups] = useState<Record<CarrierFitGroup, boolean>>({
    both: true,
    'carry-on-only': false,
    none: false,
  })

  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: ranked.filter((r) => r.group === group),
  })).filter((g) => g.items.length > 0)

  if (!carriersCached || ranked.length === 0) {
    return null
  }

  function toggleGroup(group: CarrierFitGroup) {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-x-2 px-1 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted/80">
        <span />
        <span className="text-center">C/O</span>
        <span className="text-center">Pers.</span>
      </div>

      {groups.map(({ group, items }) => {
        const open = openGroups[group]
        return (
          <div key={group} className="border-b border-border/50 last:border-0">
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className={`flex w-full items-center gap-2 px-1 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${GROUP_STYLES[group]}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
              >
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex-1">{GROUP_LABELS[group]}</span>
              <span className="font-medium text-muted">{items.length}</span>
            </button>

            {open && (
              <ul className="space-y-0.5 pb-2">
                {items.map((entry) => (
                  <li
                    key={entry.carrier.id}
                    className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-x-2 items-start rounded-lg px-1 py-2 transition hover:bg-surface-overlay/40"
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
            )}
          </div>
        )
      })}
    </div>
  )
}