/** Source-guided extraction from pinned app-boot/src/index.ts.
 * Contains the original loadOptionalPatches/loadOverlayPatches/parsePatchList,
 * plus renderConfigDump/groupedDump algorithm; NOT the Cordis boot runtime.
 */
import { readFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as yaml from 'js-yaml'
import { applyEntryPatches, entryListSchema, type PatchOptions } from '@study/cordis-plugin-include'
import type { EntryOptions } from '@study/cordis-plugin-loader'

const userPatchesSchema = entryListSchema

export function loadOptionalPatches(binName: string, file: string): PatchOptions[] | undefined {
  let content: string
  try { content = readFileSync(file, 'utf8') }
  catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code === 'ENOENT') return undefined
    throw new Error(`${binName}: failed to read patches ${file}: ${String(error)}`)
  }
  return parsePatchList(binName, file, content, 'patches')
}

export function loadOverlayPatches(binName: string, file: string): PatchOptions[] {
  let content: string
  try { content = readFileSync(file, 'utf8') }
  catch (error) { throw new Error(`${binName}: failed to read overlay ${file}: ${String(error)}`) }
  return parsePatchList(binName, file, content, 'overlay')
}

function anchorInsertedPluginNames(patches: PatchOptions[], file: string): PatchOptions[] {
  const base = dirname(resolve(file))
  const visit = (entry: EntryOptions): void => {
    if (typeof entry.name === 'string' && (isAbsolute(entry.name) || entry.name.startsWith('./') || entry.name.startsWith('../'))) {
      entry.name = pathToFileURL(resolve(base, entry.name)).href
    }
    if (entry.group && Array.isArray(entry.config)) entry.config.forEach(visit)
  }
  for (const patch of patches) patch.insert?.forEach(visit)
  return patches
}

function parsePatchList(binName: string, file: string, content: string, label: string): PatchOptions[] {
  let parsed: unknown
  try { parsed = yaml.load(content, { schema: userPatchesSchema }) }
  catch (error) { throw new Error(`${binName}: failed to parse ${label} ${file}: ${String(error)}`) }
  if (!Array.isArray(parsed)) {
    throw new Error(`${binName}: ${label} ${file} must be a top-level YAML array of loader patch entries`)
  }
  parsed.forEach((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new Error(`${binName}: ${label} entry ${index + 1} in ${file} must be a mapping (a loader patch entry)`)
    }
  })
  return anchorInsertedPluginNames(parsed as PatchOptions[], file)
}

export interface ConfigDumpLayer {
  label: string
  patches: PatchOptions[]
}

/** The same prefix-snapshot algorithm as pinned upstream renderConfigDump. */
export function renderConfigDump(
  binName: string,
  absoluteConfigPath: string,
  layers: ConfigDumpLayer[],
  warn: (line: string) => void = line => void process.stderr.write(`${line}\n`),
): string {
  let content: string
  try { content = readFileSync(absoluteConfigPath, 'utf8') }
  catch (error) { throw new Error(`${binName}: failed to read config ${absoluteConfigPath}: ${String(error)}`) }
  let parsed: unknown
  try { parsed = yaml.load(content, { schema: entryListSchema }) }
  catch (error) { throw new Error(`${binName}: failed to parse config ${absoluteConfigPath}: ${String(error)}`) }
  if (!Array.isArray(parsed)) {
    throw new Error(`${binName}: config ${absoluteConfigPath} must be a top-level YAML array of entries`)
  }
  const baseLabel = basename(absoluteConfigPath)
  const base = parsed as Parameters<typeof applyEntryPatches>[0]
  const snapshot = (count: number, warnings: string[]): ReturnType<typeof applyEntryPatches> => {
    const flattened = structuredClone(layers.slice(0, count).flatMap(layer => layer.patches))
    return applyEntryPatches(base, flattened, (message: string, ...args: unknown[]) => {
      let index = 0
      warnings.push(message.replace(/%C/g, () => JSON.stringify(args[index++])))
    })
  }
  let previous = base
  let previousWarnings: string[] = []
  const entryOrigins: { origin: string; patchedBy: string[] }[] = base.map(() => ({ origin: baseLabel, patchedBy: [] }))
  let composed = base
  for (let count = 1; count <= layers.length; count += 1) {
    const layer = layers[count - 1]
    if (layer === undefined) continue
    const warnings: string[] = []
    composed = snapshot(count, warnings)
    for (const line of warnings.slice(previousWarnings.length)) {
      warn(`${binName}: [${layer.label}] ${line}`)
    }
    const before = previous.map(entry => JSON.stringify(entry))
    for (let index = 0; index < composed.length; index += 1) {
      if (index >= before.length) entryOrigins.push({ origin: layer.label, patchedBy: [] })
      else if (JSON.stringify(composed[index]) !== before[index]) entryOrigins[index]?.patchedBy.push(layer.label)
    }
    previous = composed
    previousWarnings = warnings
  }
  return groupedDump(composed, entryOrigins)
}

function groupedDump(composed: readonly unknown[], entryOrigins: readonly { origin: string; patchedBy: string[] }[]): string {
  const lines: string[] = []
  let currentLabel: string | undefined
  let group: unknown[] = []
  const flush = (): void => {
    if (currentLabel === undefined || group.length === 0) return
    lines.push(`# == ${currentLabel}`)
    lines.push(yaml.dump(group, { schema: entryListSchema, noRefs: true }).trimEnd())
    group = []
  }
  for (let index = 0; index < composed.length; index += 1) {
    const record = entryOrigins[index]
    if (record === undefined) continue
    const label = record.patchedBy.length === 0 ? record.origin
      : `${record.origin}, patched by ${record.patchedBy.join(', ')}`
    if (label !== currentLabel) {
      flush()
      currentLabel = label
    }
    group.push(composed[index])
  }
  flush()
  return lines.join('\n') + '\n'
}

export {
  PROFILES_DIR, PROFILE_PATCH_FILENAME, bundlePatchFiles, bundlePatchPaths,
  initProfile, readProfileManifest, writeProfileManifest, resolveProfileDir,
  resolveBundleDir, loadProfileDirectory, loadProfile, composeEntries, reportSkippedBundles,
  type Profile, type ProfileLayer, type SkippedBundle, type ProfileManifest,
} from './profile.ts'
