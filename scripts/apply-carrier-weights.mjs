import { readFileSync, writeFileSync } from 'fs'

/** @type {Record<string, { co: number, pi: number, note?: string }>} */
const WEIGHTS = {
  // North America — US majors: no official limit; 18.1 kg (40 lb) de facto liftability ceiling
  american: { co: 18.1, pi: 18.1, note: 'No official limit; 40 lb operational ceiling' },
  delta: { co: 18.1, pi: 18.1, note: 'No official limit; 40 lb operational ceiling' },
  united: { co: 18.1, pi: 18.1, note: 'No official limit; 40 lb operational ceiling' },
  southwest: { co: 18.1, pi: 18.1, note: 'No official limit; 40 lb operational ceiling' },
  jetblue: { co: 18.1, pi: 18.1, note: 'Official: no weight restriction' },
  alaska: { co: 18.1, pi: 18.1, note: 'No official limit; 40 lb operational ceiling' },
  'air-canada': { co: 18.1, pi: 18.1, note: 'Official: no weight limit, must be liftable' },
  westjet: { co: 18.1, pi: 18.1, note: 'No numeric limit; must be liftable unaided' },
  spirit: { co: 18.1, pi: 18.1, note: 'Size-only policy; 40 lb de facto ceiling' },
  frontier: { co: 15.9, pi: 15.9, note: 'Official carry-on max 35 lb (15.9 kg)' },
  hawaiian: { co: 18.1, pi: 18.1, note: 'No official limit; 40 lb operational ceiling' },

  // Europe
  'british-airways': { co: 23, pi: 23, note: 'Combined hand baggage max 23 kg' },
  lufthansa: { co: 8, pi: 8, note: 'Carry-on max 8 kg; personal item additional, same per-piece max' },
  'air-france': { co: 12, pi: 12, note: 'Combined hand baggage max 12 kg' },
  klm: { co: 12, pi: 12, note: 'Combined hand baggage max 12 kg' },
  ryanair: { co: 10, pi: 10, note: '10 kg Priority cabin bag; small bag same allowance' },
  easyjet: { co: 15, pi: 15, note: 'Official: 15 kg per cabin bag and per under-seat bag' },
  iberia: { co: 10, pi: 10 },
  swiss: { co: 8, pi: 8 },
  finnair: { co: 8, pi: 8 },
  sas: { co: 8, pi: 8 },
  norwegian: { co: 10, pi: 10 },
  vueling: { co: 10, pi: 10 },
  wizz: { co: 10, pi: 10 },
  'virgin-atlantic': { co: 23, pi: 23, note: 'Economy hand baggage combined max 23 kg' },
  aegean: { co: 8, pi: 8 },
  austrian: { co: 8, pi: 8 },
  tap: { co: 10, pi: 10 },

  // Middle East
  turkish: { co: 8, pi: 8 },
  emirates: { co: 7, pi: 7 },
  qatar: { co: 7, pi: 7, note: 'Economy combined max 7 kg' },
  etihad: { co: 7, pi: 7 },
  saudia: { co: 7, pi: 7 },
  'el-al': { co: 8, pi: 8 },

  // Asia Pacific
  singapore: { co: 7, pi: 7, note: 'Economy combined max 7 kg' },
  cathay: { co: 7, pi: 7, note: 'Economy combined max 7 kg' },
  ana: { co: 10, pi: 10, note: 'International economy combined max 10 kg' },
  jal: { co: 10, pi: 10, note: 'International economy combined max 10 kg' },
  korean: { co: 12, pi: 12 },
  qantas: { co: 10, pi: 10, note: 'International economy standard piece max 10 kg' },
  'air-india': { co: 7, pi: 7 },
  indigo: { co: 7, pi: 7 },
  airasia: { co: 7, pi: 7 },
  cebu: { co: 7, pi: 7 },
  'china-eastern': { co: 8, pi: 8 },
  'china-southern': { co: 5, pi: 5 },
  'virgin-australia': { co: 7, pi: 7 },
  'air-new-zealand': { co: 7, pi: 7 },

  // Latin America
  latam: { co: 12, pi: 12 },
  avianca: { co: 10, pi: 10 },
  copa: { co: 10, pi: 10 },
  aeromexico: { co: 10, pi: 10 },

  // Africa
  ethiopian: { co: 7, pi: 7 },
  kenya: { co: 12, pi: 12 },
  'south-african': { co: 8, pi: 8 },
  egyptair: { co: 8, pi: 8 },
}

const path = 'public/data/carriers.json'
const bundle = JSON.parse(readFileSync(path, 'utf8'))

for (const carrier of bundle.carriers) {
  const w = WEIGHTS[carrier.id]
  if (!w) {
    console.error('Missing weights for', carrier.id)
    process.exit(1)
  }
  carrier.carryOn.weightKg = w.co
  if (carrier.personalItem) {
    carrier.personalItem.weightKg = w.pi
  }
}

bundle.version = '1.1.0'
bundle.updatedAt = '2026-06-25'

writeFileSync(path, JSON.stringify(bundle, null, 2) + '\n')

const manifest = {
  version: bundle.version,
  updatedAt: bundle.updatedAt,
  carrierCount: bundle.carriers.length,
}
writeFileSync('public/data/manifest.json', JSON.stringify(manifest, null, 2) + '\n')

const missing = bundle.carriers.filter(
  (c) =>
    c.carryOn.weightKg == null ||
    (c.personalItem && c.personalItem.weightKg == null),
)
console.log('Updated', bundle.carriers.length, 'carriers')
console.log('Still missing weight:', missing.length)