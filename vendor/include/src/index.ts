/** Pinned upstream Include's patch export and YAML scalar tag semantics.
 * The actual Include plugin lifecycle/HMR is not part of this reconstructed slice.
 */
import * as yaml from 'js-yaml'
import { isJsExpr } from '@study/cordis-plugin-loader'
export { applyPatches as applyEntryPatches } from './patch.ts'
export type { PatchOptions, Warn } from './patch.ts'

const JsExpr = new yaml.Type('tag:yaml.org,2002:js', {
  kind: 'scalar',
  resolve: (data) => typeof data === 'string',
  construct: (data) => ({ __jsExpr: data }),
  predicate: isJsExpr,
  represent: (data) => (data as { __jsExpr: string }).__jsExpr,
})
export const entryListSchema = yaml.JSON_SCHEMA.extend(JsExpr)
