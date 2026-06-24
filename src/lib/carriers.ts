import type { CarrierBundle, DataManifest } from '../types'
import { getSyncMeta, hasCarrierData, replaceCarriers } from './db'

const DATA_BASE = import.meta.env.BASE_URL

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline'

export interface SyncResult {
  status: SyncStatus
  message: string
  manifest?: DataManifest
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}data/${path}`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function ensureCarrierData(): Promise<void> {
  if (await hasCarrierData()) return
  await syncCarriers(false)
}

export async function syncCarriers(requireNetwork = true): Promise<SyncResult> {
  if (requireNetwork && !navigator.onLine) {
    return { status: 'offline', message: 'No network connection' }
  }

  try {
    const [manifest, bundle] = await Promise.all([
      fetchJson<DataManifest>('manifest.json'),
      fetchJson<CarrierBundle>('carriers.json'),
    ])

    await replaceCarriers(bundle.carriers, {
      version: manifest.version,
      updatedAt: manifest.updatedAt,
    })

    return {
      status: 'success',
      message: `Updated ${bundle.carriers.length} carriers`,
      manifest,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    return { status: 'error', message }
  }
}

export async function getLocalDataInfo(): Promise<{
  downloaded: boolean
  version?: string
  updatedAt?: string
  syncedAt?: string
  count: number
}> {
  const meta = await getSyncMeta()
  const downloaded = await hasCarrierData()
  return {
    downloaded,
    version: meta?.version,
    updatedAt: meta?.updatedAt,
    syncedAt: meta?.syncedAt,
    count: meta?.carrierCount ?? 0,
  }
}

export const REGION_LABELS: Record<string, string> = {
  'north-america': 'North America',
  europe: 'Europe',
  'asia-pacific': 'Asia Pacific',
  'middle-east': 'Middle East',
  africa: 'Africa',
  'latin-america': 'Latin America',
  global: 'Global',
}