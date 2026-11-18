/** Minimal selection of exact pathname rules from pinned upstream home-paths/src/index.ts. */
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
export const DSH_HOME_DIR_NAME = '.dsh'
export const DSH_HOME_ENV = 'DSH_HOME'
export function defaultDshHome(): string { return join(homedir(), DSH_HOME_DIR_NAME) }
export function expandHomePath(path: string): string {
  if (path === '~') return homedir()
  if (path.startsWith('~/') || path.startsWith('~\\')) return join(homedir(), path.slice(2))
  return path
}
export function resolveDshHome(configured?: string, env: Record<string, string | undefined> = process.env): string {
  const fromEnv = env[DSH_HOME_ENV]
  const selected = configured ?? (fromEnv !== undefined && fromEnv.trim().length > 0 ? fromEnv : defaultDshHome())
  return resolve(expandHomePath(selected))
}
