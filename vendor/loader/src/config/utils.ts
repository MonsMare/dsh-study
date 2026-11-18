/** From pinned upstream vendor/loader/src/config/utils.ts. */
export interface JsExpr { __jsExpr: string }
export function isJsExpr(value: any): value is JsExpr {
  return value instanceof Object && '__jsExpr' in value
}
