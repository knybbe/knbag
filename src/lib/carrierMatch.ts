import type { Carrier, ItemInput } from '../types'
import { checkFit, fitIndicator } from './fit'

export type CarrierFitGroup = 'both' | 'carry-on-only' | 'none'

export interface CarrierCompatibility {
  carrier: Carrier
  carryOnFits: boolean
  personalFits: boolean | null
  group: CarrierFitGroup
  combinedWeightKg: number
  carryOnWeightKg: number
}

function combinedWeight(carryOnKg: number, personalKg?: number): number {
  return carryOnKg + (personalKg ?? 0)
}

export function rankCarriers(item: ItemInput, carriers: Carrier[]): CarrierCompatibility[] {
  const ranked = carriers.map((carrier): CarrierCompatibility => {
    const carryOnResult = checkFit(item, carrier.carryOn)
    const personalResult = carrier.personalItem
      ? checkFit(item, carrier.personalItem)
      : null

    const carryOnConfirmed = carryOnResult.fits
    const personalConfirmed = personalResult?.fits ?? false
    const carryOnFits = fitIndicator(carryOnResult)
    const personalFits = personalResult ? fitIndicator(personalResult) : null

    let group: CarrierFitGroup
    if (carryOnConfirmed && personalConfirmed) {
      group = 'both'
    } else if (carryOnConfirmed) {
      group = 'carry-on-only'
    } else {
      group = 'none'
    }

    return {
      carrier,
      carryOnFits,
      personalFits,
      group,
      combinedWeightKg: combinedWeight(carrier.carryOn.weightKg, carrier.personalItem?.weightKg),
      carryOnWeightKg: carrier.carryOn.weightKg,
    }
  })

  const groupOrder: Record<CarrierFitGroup, number> = {
    both: 0,
    'carry-on-only': 1,
    none: 2,
  }

  return ranked.sort((a, b) => {
    const g = groupOrder[a.group] - groupOrder[b.group]
    if (g !== 0) return g

    if (a.group === 'both') {
      return b.combinedWeightKg - a.combinedWeightKg
    }
    if (a.group === 'carry-on-only') {
      return b.carryOnWeightKg - a.carryOnWeightKg
    }
    return a.carrier.airline.localeCompare(b.carrier.airline)
  })
}

export const GROUP_LABELS: Record<CarrierFitGroup, string> = {
  both: 'Fits carry-on & personal item',
  'carry-on-only': 'Carry-on only',
  none: 'Does not fit',
}

