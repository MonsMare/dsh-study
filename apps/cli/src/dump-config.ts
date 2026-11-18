/** Study reconstruction of upstream apps/cli/src/dump-config.ts dump path. */
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { loadOptionalPatches, loadOverlayPatches, renderConfigDump, type ConfigDumpLayer, type Profile } from '@study/dsh-app-boot'
import { resolveDshHome } from '@study/dsh-home-paths'
import { prepareProfile, PROFILE_ROOT_FILENAME } from './profile-boot.ts'
const NAME = 'dsh'
export function homePatchPath(): string { return join(resolveDshHome(), 'cordis.patch.yml') }

export function runDumpConfig(
  profile: string, defaultOnly: boolean, patches: readonly string[], fromDefaultProfile?: string,
): void {
  const loaded = prepareProfile(profile, !defaultOnly, fromDefaultProfile)
  const layers = collectConfigDumpLayers(loaded, defaultOnly, patches)
  process.stdout.write(renderConfigDump(NAME, join(loaded.dir, PROFILE_ROOT_FILENAME), layers))
}
export function collectConfigDumpLayers(
  loaded: Profile, defaultOnly: boolean, patches: readonly string[],
): ConfigDumpLayer[] {
  const layers: ConfigDumpLayer[] = loaded.layers.map(layer => ({
    label: layer.packageName,
    patches: layer.patches,
  }))
  if (!defaultOnly) {
    if (existsSync(loaded.patchPath)) layers.push({ label: loaded.patchPath, patches: loaded.patches })
    const homePatchFile = homePatchPath()
    const homePatches = loadOptionalPatches(NAME, homePatchFile)
    if (homePatches !== undefined) layers.push({ label: homePatchFile, patches: homePatches })
    for (const file of patches) {
      const absolute = resolve(file)
      layers.push({ label: absolute, patches: loadOverlayPatches(NAME, absolute) })
    }
  }
  return layers
}
