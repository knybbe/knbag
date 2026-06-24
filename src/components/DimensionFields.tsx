import type { UnitSystem } from '../types'
import { lengthLabel, weightLabel } from '../lib/units'

export interface ItemDimensionValues {
  d1: string
  d2: string
  d3: string
  weight: string
}

interface DimensionFieldsProps {
  units: UnitSystem
  values: ItemDimensionValues
  onChange: (field: keyof ItemDimensionValues, value: string) => void
}

const inputClass =
  'min-w-0 w-full rounded-lg border border-border bg-surface-overlay px-2 py-3 text-center text-base text-slate-100 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20'

export function DimensionFields({ units, values, onChange }: DimensionFieldsProps) {
  const dimUnit = lengthLabel(units)
  const wUnit = weightLabel(units)

  const dims: (keyof Pick<ItemDimensionValues, 'd1' | 'd2' | 'd3'>)[] = ['d1', 'd2', 'd3']

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-muted">
      {dims.map((key, i) => (
        <span key={key} className="contents">
          {i > 0 && <span className="text-slate-500 font-medium select-none">×</span>}
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={values[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder="0"
            aria-label={`Dimension ${i + 1}`}
            className={`${inputClass} max-w-[4.5rem] flex-1`}
          />
        </span>
      ))}
      <span className="text-slate-400 font-medium select-none">{dimUnit}</span>
      <span className="text-slate-500 font-medium select-none">·</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        value={values.weight}
        onChange={(e) => onChange('weight', e.target.value)}
        placeholder="0"
        aria-label="Weight"
        className={`${inputClass} max-w-[4.5rem] flex-[1.2]`}
      />
      <span className="text-slate-400 font-medium select-none">{wUnit}</span>
    </div>
  )
}