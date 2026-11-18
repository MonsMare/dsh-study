/** Relevant upstream package-manifest public type contract (subset). */
export interface DshPackageManifest {
  name: string
  version: string
  description?: string
  private?: boolean
  dependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  engines?: DshEnginesManifest
  dsh?: DshManifest
}
export interface DshEnginesManifest {
  dsh?: string
  node?: string
  npm?: string
  [engine: string]: string | undefined
}
export interface DshManifest {
  manifestVersion?: 1
  bundle?: DshBundleManifest
  profile?: DshProfileManifest
}
export interface DshBundleManifest {
  platforms?: string[]
  patch: string | string[]
  listedByDefault?: boolean
}
export interface DshProfileManifest { bundles?: string[] }
