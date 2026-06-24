import type { AiBagSuggestion, Carrier } from '../types'
import { searchCarriers } from './db'

const MODEL_ID = 'onnx-community/gemma-4-E2B-it-ONNX'
const AI_ENABLED_KEY = 'knbag-ai-enabled'
const AI_READY_KEY = 'knbag-ai-ready'

export type AiLoadState = 'idle' | 'loading' | 'ready' | 'error'

let loadState: AiLoadState = 'idle'
let loadError: string | null = null

export function isAiEnabled(): boolean {
  return localStorage.getItem(AI_ENABLED_KEY) === 'true'
}

export function setAiEnabled(enabled: boolean): void {
  localStorage.setItem(AI_ENABLED_KEY, String(enabled))
  if (!enabled) {
    localStorage.removeItem(AI_READY_KEY)
    loadState = 'idle'
  }
}

export function isAiReady(): boolean {
  return localStorage.getItem(AI_READY_KEY) === 'true' && loadState === 'ready'
}

export function getAiLoadState(): { state: AiLoadState; error: string | null } {
  return { state: loadState, error: loadError }
}

export async function downloadAiModel(
  onProgress?: (pct: number) => void,
): Promise<void> {
  if (!navigator.onLine) throw new Error('Connect to Wi-Fi to download the AI model')

  loadState = 'loading'
  loadError = null

  try {
    const { pipeline, env } = await import('@huggingface/transformers')
    env.allowLocalModels = false
    env.useBrowserCache = true

    await pipeline('text-generation', MODEL_ID, {
      dtype: 'q4f16',
      device: 'webgpu',
      progress_callback: (info: { status?: string; progress?: number }) => {
        if (info.status === 'progress' && typeof info.progress === 'number') {
          onProgress?.(Math.round(info.progress))
        }
      },
    })

    localStorage.setItem(AI_READY_KEY, 'true')
    loadState = 'ready'
  } catch (err) {
    loadState = 'error'
    const raw = err instanceof Error ? err.message : 'Model download failed'
    if (/failed to fetch dynamically imported module/i.test(raw)) {
      loadError = 'App update available — refresh the page and try again'
    } else {
      loadError = raw
    }
    throw new Error(loadError)
  }
}

function fuzzyMatchCarrier(query: string, carriers: Carrier[]): Carrier | null {
  const q = query.toLowerCase()
  const exact = carriers.find(
    (c) => c.airline.toLowerCase() === q || c.iata.toLowerCase() === q,
  )
  if (exact) return exact

  const partial = carriers.find(
    (c) =>
      c.airline.toLowerCase().includes(q) ||
      q.includes(c.airline.toLowerCase()) ||
      q.includes(c.iata.toLowerCase()),
  )
  return partial ?? null
}

export async function lookupBagByName(query: string): Promise<AiBagSuggestion | null> {
  const carriers = await searchCarriers(query)
  const match = fuzzyMatchCarrier(query, carriers.length ? carriers : await searchCarriers(''))

  if (match) {
    const isCarryOn = /personal|under.?seat|small bag/i.test(query) ? false : true
    return {
      carrierId: match.id,
      airline: match.airline,
      bagType: isCarryOn && /personal|under.?seat/i.test(query) ? 'personal-item' : 'carry-on',
      confidence: carriers.length === 1 ? 'high' : 'medium',
      reasoning: `Matched ${match.airline} (${match.iata}) from carrier database.`,
    }
  }

  if (!isAiEnabled() || !isAiReady()) return null

  const { pipeline } = await import('@huggingface/transformers')
  const generator = await pipeline('text-generation', MODEL_ID, {
    dtype: 'q4f16',
    device: 'webgpu',
  })

  const carrierList = (await searchCarriers(''))
    .slice(0, 40)
    .map((c) => `${c.airline} (${c.iata})`)
    .join(', ')

  const prompt = `You are an airline baggage assistant. Given the user query and carrier list, respond ONLY with JSON: {"airline":"...","bagType":"carry-on"|"personal-item","confidence":"high"|"medium"|"low","reasoning":"..."}
Carriers: ${carrierList}
Query: ${query}
JSON:`

  const output = await generator(prompt, { max_new_tokens: 120, do_sample: false })
  const text = Array.isArray(output) ? output[0]?.generated_text ?? '' : String(output)

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0]) as Omit<AiBagSuggestion, 'carrierId'>
    const carrier = fuzzyMatchCarrier(parsed.airline, await searchCarriers(parsed.airline))
    return { ...parsed, carrierId: carrier?.id ?? null }
  } catch {
    return null
  }
}