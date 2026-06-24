import type { BagLimit, Carrier, UnitSystem } from '../types'
import { displayWeight, lengthLabel, toDisplayLength } from './units'

function formatDims(limit: BagLimit, units: UnitSystem): string {
  const u = lengthLabel(units)
  const sorted = [limit.lengthCm, limit.widthCm, limit.heightCm].sort((a, b) => b - a)
  return `${sorted.map((d) => toDisplayLength(d, units)).join('×')} ${u}`
}

export function formatCarrierLimits(carrier: Carrier, units: UnitSystem): string {
  const co = carrier.carryOn
  let line = `C/O ${formatDims(co, units)} · ${displayWeight(co.weightKg, units)}`

  if (carrier.personalItem) {
    const pi = carrier.personalItem
    line += ` · Pers ${formatDims(pi, units)} · ${displayWeight(pi.weightKg, units)}`
  }

  return line
}