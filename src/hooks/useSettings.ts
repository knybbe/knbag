import { useCallback, useSyncExternalStore } from 'react'
import type { AppSettings, UnitSystem } from '../types'

const STORAGE_KEY = 'knbag-settings'

const DEFAULT_SETTINGS: AppSettings = {
  units: 'metric',
  aiEnabled: false,
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

let settings = loadSettings()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function save(next: AppSettings) {
  settings = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

export function useSettings() {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => settings,
    () => DEFAULT_SETTINGS,
  )

  const setUnits = useCallback((units: UnitSystem) => {
    save({ ...settings, units })
  }, [])

  const setAiEnabled = useCallback((aiEnabled: boolean) => {
    save({ ...settings, aiEnabled })
    localStorage.setItem('knbag-ai-enabled', String(aiEnabled))
  }, [])

  return { settings: snapshot, setUnits, setAiEnabled }
}