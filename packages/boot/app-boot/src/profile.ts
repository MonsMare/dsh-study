/** Pinned upstream app-boot/src/profile.ts — existing Profile/Bundle/dump contracts.
 * Deliberately excludes unimplemented runtime resolution, compatibility exemptions,
 * and legacy link-projection migrations. Unsupported compatibility declarations FAIL CLOSED.
 */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { EntryOptions } from '@study/cordis-plugin-loader'
import { applyEntryPatches, type PatchOptions } from '@study/cordis-plugin-include'
import { resolveDshHome } from '@study/dsh-home-paths'
import type { DshBundleManifest, DshPackageManifest } from '@study/dsh-package-manifest'
import { INSTALLATION_OWNED_PROFILE_TUPLES, PROFILE_TEMPLATES, RETIRED_BUNDLES } from '@study/dsh-official-bundles'
import { assertBundlePlatform } from './bundle-platform.ts'
import { loadOverlayPatches } from './index.ts'

export const PROFILES_DIR = 'profiles'
export const PROFILE_PATCH_FILENAME = 'cordis.patch.yml'
export type ProfileManifest = Partial<DshPackageManifest>

export function bundlePatchFiles(bundle: DshBundleManifest): string[] {
  const declared = typeof bundle.patch === 'string' ? [bundle.patch] : bundle.patch
  if (!Array.isArray(declared) || !declared.every(file => typeof file === 'string')) {
    throw new Error('dsh.bundle.patch must be a file path or a list of file paths')
  }
  return declared
}
export function bundlePatchPaths(packageDir: string, bundle: DshBundleManifest): string[] {
  return bundlePatchFiles(bundle).map(file => join(packageDir, file))
}
export interface ProfileLayer {
  packageName: string
  packageDir: string
  patchPaths: readonly string[]
  patches: PatchOptions[]
}
export interface SkippedBundle { packageName: string; reason: string }
export interface Profile {
  name: string
  dir: string
  layers: ProfileLayer[]
  patchPath: string
  patches: PatchOptions[]
  skippedBundles: SkippedBundle[]
}
export function reportSkippedBundles(binName: string, profile: Pick<Profile, 'skippedBundles'>): void {
  for (const { packageName, reason } of profile.skippedBundles) {
    process.stderr.write(`${binName}: skipping profile bundle ${JSON.stringify(packageName)}: ${reason}\n`)
  }
}

export function resolveProfileDir(name: string, home: string = resolveDshHome()): string {
  if (name === '' || name.includes('/') || name.includes('\\') || name === '.' || name === '..'
    || name === 'node_modules') {
    throw new Error(`dsh: invalid profile name ${JSON.stringify(name)}`)
  }
  return join(home, PROFILES_DIR, name)
}
const PROFILE_PATCH_TEMPLATE = `# Your patch layer for this dsh profile, applied after every bundle layer:
# a top-level YAML array of loader patch entries (id-targeted config
# overrides, disables, and insert lists; \`!!js\` expressions allowed).
[]
`
const PROFILE_PNPM_WORKSPACE = `packages:
  - .

nodeLinker: hoisted
autoInstallPeers: false
`
export function initProfile(dir: string, bundles: readonly string[]): void {
  mkdirSync(dir, { recursive: true })
  const manifestPath = join(dir, 'package.json')
  if (!existsSync(manifestPath)) {
    const manifest: ProfileManifest & { private: boolean } = {
      name: `dsh-profile-${basename(dir)}`,
      private: true,
      dependencies: {},
      dsh: { profile: { bundles: [...bundles] } },
    }
    writeFileSync(manifestPath, JSON.stringify(manifest, undefined, 2) + '\n')
  }
  const patchPath = join(dir, PROFILE_PATCH_FILENAME)
  if (!existsSync(patchPath)) writeFileSync(patchPath, PROFILE_PATCH_TEMPLATE)
  const workspacePath = join(dir, 'pnpm-workspace.yaml')
  if (!existsSync(workspacePath)) writeFileSync(workspacePath, PROFILE_PNPM_WORKSPACE)
}

export function readProfileManifest(binName: string, dir: string): ProfileManifest {
  const path = join(dir, 'package.json')
  let raw: string
  try { raw = readFileSync(path, 'utf8') }
  catch (error) { throw new Error(`${binName}: failed to read profile manifest ${path}: ${String(error)}`) }
  const parsed = JSON.parse(raw) as ProfileManifest | null
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${binName}: profile manifest ${path} must hold a JSON object`)
  }
  return parsed
}
export function writeProfileManifest(dir: string, manifest: ProfileManifest): void {
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, undefined, 2) + '\n')
}
function sameBundles(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}
function withBundles(manifest: ProfileManifest, bundles: readonly string[]): ProfileManifest {
  return {
    ...manifest,
    dsh: { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: [...bundles] } },
  }
}
function normalizeShippedProfile(name: string, dir: string, manifest: ProfileManifest): ProfileManifest {
  const installationOwned = INSTALLATION_OWNED_PROFILE_TUPLES[name]
  const template = PROFILE_TEMPLATES[name]
  const bundles = manifest.dsh?.profile?.bundles
  if (template === undefined || bundles === undefined) return manifest
  if (installationOwned === undefined || !sameBundles(bundles, installationOwned)) return manifest
  const normalized = withBundles(manifest, template.bundles)
  writeProfileManifest(dir, normalized)
  return normalized
}
function dropRetiredBundles(dir: string, manifest: ProfileManifest): ProfileManifest {
  const bundles = manifest.dsh?.profile?.bundles ?? []
  const kept = bundles.filter(bundle => !RETIRED_BUNDLES.has(bundle))
  if (kept.length === bundles.length) return manifest
  const normalized = withBundles(manifest, kept)
  writeProfileManifest(dir, normalized)
  return normalized
}
function packageDirFromAnchor(anchor: string, packageName: string): string | undefined {
  for (const searchPath of createRequire(anchor).resolve.paths(packageName) ?? []) {
    const candidate = join(searchPath, packageName)
    if (existsSync(join(candidate, 'package.json'))) return candidate
  }
  return undefined
}
export function resolveBundleDir(
  binName: string, packageName: string, installAnchor: string, profileDir: string,
): string {
  for (const anchor of [installAnchor, join(profileDir, 'package.json')]) {
    const dir = packageDirFromAnchor(anchor, packageName)
    if (dir !== undefined) return dir
  }
  throw new Error(
    `${binName}: cannot resolve profile bundle ${JSON.stringify(packageName)} from the dsh installation or ${profileDir}; `
    + `run 'dsh plugin --profile ${basename(profileDir)} install' if its dependency is not installed`,
  )
}

/** Same admission ordering as official. Compatibility layer NOT reconstructed.
 * For bundles declaring engines.dsh we fail closed instead of claiming admission.
 */
export function loadProfileDirectory(
  binName: string, dir: string, installAnchor: string, options: { userLayer?: boolean } = {},
): Profile {
  const manifest = dropRetiredBundles(dir, readProfileManifest(binName, dir))
  const bundles = manifest.dsh?.profile?.bundles ?? []
  const layers: ProfileLayer[] = []
  const skippedBundles: SkippedBundle[] = []
  for (const packageName of bundles) {
    try {
      const packageDir = resolveBundleDir(binName, packageName, installAnchor, dir)
      const bundleManifest = readProfileManifest(binName, packageDir)
      const bundle = bundleManifest.dsh?.bundle
      if (bundle === undefined) {
        throw new Error(`${binName}: profile bundle ${JSON.stringify(packageName)} declares no dsh.bundle in its package.json`)
      }
      assertBundlePlatform(bundle.platforms, process.platform)
      if (bundleManifest.engines?.dsh !== undefined) {
        throw new Error(`${binName}: bundle compatibility admission not yet reconstructed (${packageName})`)
      }
      const patchPaths = bundlePatchPaths(packageDir, bundle)
      const patches = patchPaths.flatMap(patchPath => loadOverlayPatches(binName, patchPath))
      layers.push({ packageName, packageDir, patchPaths, patches })
    } catch (error) { skippedBundles.push({ packageName, reason: String(error) }) }
  }
  const patchPath = join(dir, PROFILE_PATCH_FILENAME)
  const patches = options.userLayer !== false && existsSync(patchPath)
    ? loadOverlayPatches(binName, patchPath) : []
  return { name: basename(dir), dir, layers, patchPath, patches, skippedBundles }
}

export function loadProfile(
  binName: string, name: string, installAnchor: string, home: string = resolveDshHome(),
  options: { userLayer?: boolean } = {},
): Profile {
  const dir = resolveProfileDir(name, home)
  if (!existsSync(join(dir, 'package.json'))) {
    const template = PROFILE_TEMPLATES[name]
    if (template === undefined) {
      throw new Error(
        `${binName}: profile ${JSON.stringify(name)} does not exist; create it with 'dsh plugin --profile ${name} add <package>'`,
      )
    }
    initProfile(dir, template.bundles)
  }
  if (existsSync(join(dir, '.dsh-module-fallback'))) {
    throw new Error(`${binName}: old profile link projection cleanup is not yet reconstructed; do not ignore stale links`)
  }
  normalizeShippedProfile(name, dir, readProfileManifest(binName, dir))
  return loadProfileDirectory(binName, dir, installAnchor, options)
}

export function composeEntries(
  layers: readonly PatchOptions[][], warn: (message: string) => void = () => {},
): EntryOptions[] {
  return applyEntryPatches([], structuredClone(layers.flat()), (message: string, ...args: unknown[]) => {
    let index = 0
    warn(message.replace(/%C/g, () => JSON.stringify(args[index++])))
  })
}
