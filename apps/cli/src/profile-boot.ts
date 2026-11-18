/** App-owned profile boot boundary, matching upstream role. Runtime not yet built. */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadProfile, reportSkippedBundles, type Profile } from '@study/dsh-app-boot'

const NAME = 'dsh'
export const INSTALL_ANCHOR = fileURLToPath(new URL('../package.json', import.meta.url))
export const PROFILE_ROOT_FILENAME = 'cordis.yml'
const PROFILE_ROOT_CONFIG = `# dsh profile root — an empty entry list. The tree is composed as patches:
# each bundle in package.json's dsh.profile.bundles, then cordis.patch.yml, then any
# --patch overlays. Edit cordis.patch.yml, not this file.
[]
`
export function prepareProfile(name: string, userLayer = true, fromDefaultProfile?: string): Profile {
  if (fromDefaultProfile !== undefined) {
    throw new Error('dsh: --from-default-profile is not yet reconstructed; refusing to overwrite a profile')
  }
  const profile = loadProfile(NAME, name, INSTALL_ANCHOR, undefined, { userLayer })
  reportSkippedBundles(NAME, profile)
  writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG)
  return profile
}
export interface RunProfileOptions {
  profile: string
  args: readonly string[]
  patchFiles?: readonly string[]
}
export async function runProfile(options: RunProfileOptions): Promise<never> {
  throw new Error(`dsh: Cordis runtime boot is not implemented; refusing to claim profile ${JSON.stringify(options.profile)} started`)
}
