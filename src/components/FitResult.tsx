import type { FitResult as FitResultType, UnitSystem } from '../types'
import { displayLength, displayWeight } from '../lib/units'

interface FitResultProps {
  result: FitResultType
  units: UnitSystem
}

const FIELD_LABELS: Record<string, string> = {
  side1: 'Largest side',
  side2: 'Middle side',
  side3: 'Smallest side',
  weight: 'Weight',
}

export function FitResultCard({ result, units }: FitResultProps) {
  if (result.fits) {
    return (
      <div className="glass-card border-success/30 bg-success/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/20 text-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-6">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-success">Fits!</p>
            <p className="text-sm text-slate-300">Your item meets size and weight limits.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card border-danger/30 bg-danger/10 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger/20 text-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-6">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-danger">Does not fit</p>
          <p className="text-sm text-slate-300">{result.failures.length} limit(s) exceeded</p>
        </div>
      </div>
      <ul className="space-y-2">
        {result.failures.map((f) => (
          <li
            key={f.field}
            className="rounded-xl bg-surface/60 px-3 py-2 text-sm text-slate-200"
          >
            <span className="font-medium">{FIELD_LABELS[f.field]}</span>
            {' — '}
            {f.field === 'weight'
              ? `over by ${displayWeight(f.overBy, units)}`
              : `over by ${displayLength(f.overBy, units)}`}
            <span className="block text-xs text-muted mt-0.5">
              Item: {f.field === 'weight' ? displayWeight(f.itemValue, units) : displayLength(f.itemValue, units)}
              {' · '}
              Limit: {f.field === 'weight' ? displayWeight(f.limitValue, units) : displayLength(f.limitValue, units)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}