import type { BagLimit, FitFailure, FitResult, ItemInput } from '../types'

function sortedSides(d: { lengthCm: number; widthCm: number; heightCm: number }): [number, number, number] {
  return [d.lengthCm, d.widthCm, d.heightCm].sort((a, b) => b - a) as [number, number, number]
}

const SIDE_FIELDS = ['side1', 'side2', 'side3'] as const

export function checkFit(item: ItemInput, bag: BagLimit): FitResult {
  const failures: FitFailure[] = []
  const itemSides = sortedSides(item)
  const bagSides = sortedSides(bag)

  SIDE_FIELDS.forEach((field, i) => {
    const itemValue = itemSides[i]
    const limitValue = bagSides[i]
    if (itemValue > limitValue) {
      failures.push({
        field,
        itemValue,
        limitValue,
        overBy: itemValue - limitValue,
      })
    }
  })

  const limitKg = bag.weightKg ?? 0
  if (item.weightKg > limitKg) {
    failures.push({
      field: 'weight',
      itemValue: item.weightKg,
      limitValue: limitKg,
      overBy: item.weightKg - limitKg,
    })
  }

  return { fits: failures.length === 0, failures }
}

export function fitIndicator(result: FitResult): boolean {
  return result.fits
}