/** Core application semantics transcribed from pinned upstream vendor/include/src/patch.ts.
 * The unrelated journal/HMR facilities in that file are NOT implemented here.
 */
import type { EntryOptions } from '@study/cordis-plugin-loader'

export interface PatchOptions {
  id?: string
  insert?: EntryOptions[]
  name?: string
  config?: any
  group?: boolean | null
  disabled?: boolean | null
  inject?: any
  intercept?: any
  isolate?: any
  [key: string]: any
}

export type Warn = (format: string, ...args: any[]) => void

/** Source algorithm: clone initial rows, index IDs, then apply each patch in order. */
export function applyPatches(
  data: EntryOptions[], patches: PatchOptions[] | undefined, warn: Warn,
): EntryOptions[] {
  data = structuredClone(data)
  if (!patches?.length) return data

  const entryMap = new Map<string, EntryOptions>()
  const buildMap = (entries: EntryOptions[]) => {
    for (const entry of entries) {
      if (entry.id) entryMap.set(entry.id, entry)
      if (entry.group && Array.isArray(entry.config)) buildMap(entry.config)
    }
  }
  buildMap(data)

  for (const patch of patches) {
    const { id, insert, name, ...overrides } = patch
    if (insert) {
      const clone = structuredClone(insert)
      if (id) {
        const target = entryMap.get(id)
        if (!target) {
          warn('patch insert: entry %C not found', id)
          continue
        }
        if (!target.group) {
          warn('patch insert: entry %C is not a group', id)
          continue
        }
        if (!Array.isArray(target.config)) target.config = []
        target.config.push(...clone)
      } else {
        data.push(...clone)
      }
      buildMap(clone)
      continue
    }
    if (!id) {
      warn('patch: id is required for non-insert patches')
      continue
    }
    const target = entryMap.get(id)
    if (!target) {
      warn('patch: entry %C not found', id)
      continue
    }
    if (name && name !== target.name) {
      warn('patch: name mismatch for %C (expected %C, got %C), skipping', id, target.name, name)
      continue
    }
    for (const [key, value] of Object.entries(overrides)) {
      if (key === 'id') continue
      ;(target as unknown as Record<string, any>)[key] = value
    }
  }
  return data
}
