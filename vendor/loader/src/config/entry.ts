/** From pinned upstream vendor/loader/src/config/entry.ts: serialized options contract.
 * The real loader runtime is NOT implemented in this study package yet.
 */
export interface EntryOptions {
  id: string
  name: string
  config?: any
  group?: boolean | null
  disabled?: boolean | null
  inject?: unknown
}
