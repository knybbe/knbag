import { useEffect, useMemo, useState } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { CarrierCompatibilityList } from '../components/CarrierCompatibilityList'
import { DimensionFields, type ItemDimensionValues } from '../components/DimensionFields'
import { StatusBar } from '../components/StatusBar'
import { useSettings } from '../hooks/useSettings'
import { rankCarriers } from '../lib/carrierMatch'
import { getAllCarriers } from '../lib/db'
import { parseLengthInput, parseWeightInput } from '../lib/units'
import type { Carrier, ItemInput } from '../types'

interface CheckPageProps {
  carriersCached: boolean
  carrierCount: number
  dataVersion?: string
}

const emptyDims: ItemDimensionValues = { d1: '', d2: '', d3: '', weight: '' }

function parseItem(dims: ItemDimensionValues, units: 'metric' | 'imperial'): ItemInput {
  const sides = [dims.d1, dims.d2, dims.d3].map((v) =>
    parseLengthInput(Math.max(0, parseFloat(v) || 0), units),
  )
  const wt = Math.max(0, parseFloat(dims.weight) || 0)

  return {
    lengthCm: sides[0],
    widthCm: sides[1],
    heightCm: sides[2],
    weightKg: parseWeightInput(wt, units),
  }
}

export function CheckPage({ carriersCached, carrierCount, dataVersion }: CheckPageProps) {
  const { settings } = useSettings()
  const [itemDims, setItemDims] = useState(emptyDims)
  const [carriers, setCarriers] = useState<Carrier[]>([])

  useEffect(() => {
    if (!carriersCached) {
      setCarriers([])
      return
    }
    getAllCarriers().then(setCarriers)
  }, [carriersCached, carrierCount, dataVersion])

  const item = useMemo(
    () => parseItem(itemDims, settings.units),
    [itemDims, settings.units],
  )

  const rankedCarriers = useMemo(() => {
    if (carriers.length === 0) return []
    return rankCarriers(item, carriers)
  }, [item, carriers])

  function updateItem(field: keyof ItemDimensionValues, value: string) {
    setItemDims((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 pb-28">
      <header className="space-y-4">
        <BrandLogo size="md" showTagline />
        <StatusBar carriersCached={carriersCached} carrierCount={carrierCount} />
      </header>

      <section className="glass-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-slate-100">Your item</h2>
        <p className="text-xs text-muted">Any order — we check all rotations.</p>
        <DimensionFields
          units={settings.units}
          values={itemDims}
          onChange={updateItem}
        />
      </section>

      <CarrierCompatibilityList
        ranked={rankedCarriers}
        carriersCached={carriersCached}
        units={settings.units}
      />
    </div>
  )
}