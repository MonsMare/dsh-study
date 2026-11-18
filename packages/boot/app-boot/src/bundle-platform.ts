/** Pinned upstream app-boot/src/bundle-platform.ts: Host platform admission. */
const NODE_PLATFORMS: readonly string[] = Object.freeze([
  'aix', 'android', 'darwin', 'freebsd', 'haiku', 'linux', 'openbsd', 'sunos', 'win32', 'cygwin', 'netbsd',
] satisfies NodeJS.Platform[])
export class UnsupportedBundlePlatformError extends Error {
  constructor(platforms: readonly string[], platform: string) {
    super(`Bundle supports Host platforms ${platforms.join(', ')}; the DSH Host is running ${platform}`)
    this.name = 'UnsupportedBundlePlatformError'
  }
}
export function assertBundlePlatform(platforms: unknown, platform: string): void {
  if (platforms === undefined) return
  if (!Array.isArray(platforms) || platforms.length === 0 ||
    !platforms.every((value): value is string => typeof value === 'string' && NODE_PLATFORMS.includes(value))) {
    throw new Error('dsh.bundle.platforms must be a nonempty list of Node platform names')
  }
  if (!platforms.includes(platform)) throw new UnsupportedBundlePlatformError(platforms, platform)
}
