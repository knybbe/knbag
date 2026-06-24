import { useEffect, useState } from 'react'
import type { BagType, Carrier, SelectedBag, UnitSystem } from '../types'
import { searchCarriers } from '../lib/db'
import { displayLength, displayWeight } from '../lib/units'
import { lookupBagByName } from '../lib/ai'
import { REGION_LABELS } from '../lib/carriers'

interface CarrierPickerProps {
  units: UnitSystem
  selected: SelectedBag | null
  onSelect: (bag: SelectedBag | null) => void
  aiEnabled: boolean
}

export function CarrierPicker({ units, selected, onSelect, aiEnabled }: CarrierPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Carrier[]>([])
  const [bagType, setBagType] = useState<BagType>('carry-on')
  const [searching, setSearching] = useState(false)
  const [aiMessage, setAiMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    searchCarriers(query).then((list) => {
      if (!cancelled) setResults(list.slice(0, 20))
    })
    return () => {
      cancelled = true
    }
  }, [query])

  function pickCarrier(carrier: Carrier, type: BagType = bagType) {
    const limits = type === 'personal-item' ? carrier.personalItem : carrier.carryOn
    if (!limits) return
    onSelect({
      carrierId: carrier.id,
      airline: carrier.airline,
      bagType: type,
      limits,
    })
    setAiMessage(null)
  }

  async function handleAiLookup() {
    if (!query.trim()) return
    setSearching(true)
    setAiMessage(null)
    try {
      const suggestion = await lookupBagByName(query)
      if (!suggestion) {
        setAiMessage('No match found. Try a carrier name or enable AI in Settings.')
        return
      }
      if (suggestion.carrierId) {
        const carrier = results.find((c) => c.id === suggestion.carrierId) ??
          (await searchCarriers(suggestion.airline)).find((c) => c.id === suggestion.carrierId)
        if (carrier) {
          pickCarrier(carrier, suggestion.bagType)
          setAiMessage(`${suggestion.reasoning} (${suggestion.confidence} confidence)`)
          return
        }
      }
      setAiMessage(suggestion.reasoning)
    } finally {
      setSearching(false)
    }
  }

  const limits = selected?.limits

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search airline… e.g. Delta, BA"
          className="flex-1 rounded-xl border border-border bg-surface-overlay px-4 py-3 text-base outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={handleAiLookup}
          disabled={searching || !query.trim()}
          title={aiEnabled ? 'AI-assisted lookup' : 'Fuzzy search'}
          className="shrink-0 rounded-xl kn-gradient-bg px-4 py-3 text-sm font-semibold text-surface disabled:opacity-40"
        >
          {searching ? '…' : 'Find'}
        </button>
      </div>

      <div className="flex gap-2">
        {(['carry-on', 'personal-item'] as BagType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setBagType(type)
              if (selected) {
                const carrier = results.find((c) => c.id === selected.carrierId)
                if (carrier) pickCarrier(carrier, type)
              }
            }}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
              bagType === type
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-border bg-surface-overlay text-muted'
            }`}
          >
            {type === 'carry-on' ? 'Carry-on' : 'Personal item'}
          </button>
        ))}
      </div>

      {aiMessage && (
        <p className="rounded-xl bg-surface-overlay px-3 py-2 text-xs text-muted">{aiMessage}</p>
      )}

      {selected && limits && (
        <div className="glass-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-100">{selected.airline}</p>
              <p className="text-xs text-muted capitalize">{selected.bagType.replace('-', ' ')}</p>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-xs text-muted hover:text-slate-200"
            >
              Clear
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {displayLength(limits.lengthCm, units)} × {displayLength(limits.widthCm, units)} ×{' '}
            {displayLength(limits.heightCm, units)}
            {limits.weightKg != null && ` · max ${displayWeight(limits.weightKg, units)}`}
          </p>
        </div>
      )}

      {!selected && results.length > 0 && (
        <ul className="max-h-48 space-y-1 overflow-y-auto">
          {results.map((carrier) => (
            <li key={carrier.id}>
              <button
                type="button"
                onClick={() => pickCarrier(carrier)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-overlay"
              >
                <span className="font-medium text-slate-200">{carrier.airline}</span>
                <span className="text-xs text-muted">
                  {carrier.iata} · {REGION_LABELS[carrier.region]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}