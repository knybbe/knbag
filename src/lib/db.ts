import Dexie, { type Table } from 'dexie'
import type { Carrier, SyncMeta } from '../types'

export class KNbagDB extends Dexie {
  carriers!: Table<Carrier, string>
  syncMeta!: Table<SyncMeta, string>

  constructor() {
    super('knbag')
    this.version(1).stores({
      carriers: 'id, airline, iata, region',
      syncMeta: 'key',
    })
  }
}

export const db = new KNbagDB()

export async function getAllCarriers(): Promise<Carrier[]> {
  return db.carriers.orderBy('airline').toArray()
}

export async function getCarrierById(id: string): Promise<Carrier | undefined> {
  return db.carriers.get(id)
}

export async function searchCarriers(query: string): Promise<Carrier[]> {
  const q = query.trim().toLowerCase()
  if (!q) return getAllCarriers()

  const all = await getAllCarriers()
  return all.filter(
    (c) =>
      c.airline.toLowerCase().includes(q) ||
      c.iata.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q),
  )
}

export async function replaceCarriers(
  carriers: Carrier[],
  meta: Pick<SyncMeta, 'version' | 'updatedAt'>,
): Promise<void> {
  await db.transaction('rw', db.carriers, db.syncMeta, async () => {
    await db.carriers.clear()
    await db.carriers.bulkPut(carriers)
    await db.syncMeta.put({
      key: 'main',
      version: meta.version,
      updatedAt: meta.updatedAt,
      syncedAt: new Date().toISOString(),
      carrierCount: carriers.length,
    })
  })
}

export async function getSyncMeta(): Promise<SyncMeta | undefined> {
  return db.syncMeta.get('main')
}

export async function hasCarrierData(): Promise<boolean> {
  const count = await db.carriers.count()
  return count > 0
}