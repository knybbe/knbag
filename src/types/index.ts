export type Region =
  | 'north-america'
  | 'europe'
  | 'asia-pacific'
  | 'middle-east'
  | 'africa'
  | 'latin-america'
  | 'global'

export interface Dimensions {
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface WeightLimit {
  weightKg: number
}

export interface BagLimit extends Dimensions, WeightLimit {}

export interface Carrier {
  id: string
  airline: string
  iata: string
  region: Region
  carryOn: BagLimit
  personalItem?: BagLimit
  policyUrl?: string
}

export interface CarrierBundle {
  version: string
  updatedAt: string
  carriers: Carrier[]
}

export interface DataManifest {
  version: string
  updatedAt: string
  carrierCount: number
}

export type BagType = 'carry-on' | 'personal-item'

export interface SelectedBag {
  carrierId: string
  airline: string
  bagType: BagType
  limits: BagLimit
}

export interface ItemInput {
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
}

export interface FitFailure {
  field: 'side1' | 'side2' | 'side3' | 'weight'
  itemValue: number
  limitValue: number
  overBy: number
}

export interface FitResult {
  fits: boolean
  failures: FitFailure[]
}

export type UnitSystem = 'metric' | 'imperial'

export interface AppSettings {
  units: UnitSystem
  aiEnabled: boolean
}

export interface SyncMeta {
  key: 'main'
  version: string
  updatedAt: string
  syncedAt: string
  carrierCount: number
}

export interface AiBagSuggestion {
  carrierId: string | null
  airline: string
  bagType: BagType
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}