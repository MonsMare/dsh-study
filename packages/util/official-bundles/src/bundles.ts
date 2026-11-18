/** Pinned upstream packages/util/official-bundles/src/bundles.ts: profile-relevant exports. */
export interface ProfileTemplate { bundles: readonly string[] }
export const PROFILE_TEMPLATES: Record<string, ProfileTemplate> = {
  acp: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-acp-app'] },
  web: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'] },
  headless: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-headless'] },
  sdk: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-sdk-app'] },
  'sdk-minimal': { bundles: ['@deepseek-ai/dsh-sdk-minimal'] },
}
export const INSTALLATION_OWNED_PROFILE_TUPLES: Readonly<Record<string, readonly string[]>> = {
  headless: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', '@deepseek-ai/dsh-headless'],
}
export const RETIRED_BUNDLES: ReadonlySet<string> = new Set([
  '@deepseek-ai/dsh-experimental-schedule-bundle',
  '@deepseek-ai/dsh-experimental-agent-team-profile',
])
export const DEFAULT_PROFILE_BUNDLES: readonly string[] = ['@deepseek-ai/dsh-base']
