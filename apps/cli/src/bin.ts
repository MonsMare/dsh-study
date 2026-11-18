/** CLI dispatcher derived from pinned upstream apps/cli/src/bin.ts. */
import { parseDshArgs } from './args.ts'
export async function runCli(): Promise<void> {
  const invocation = parseDshArgs(process.argv.slice(2), '0.0.0-study')
  switch (invocation.mode) {
    case 'profile': {
      const { runProfile } = await import('./profile-boot.ts')
      await runProfile({profile: invocation.profile, patchFiles: invocation.patches, args: invocation.args})
      break
    }
    case 'dump-config': {
      const { runDumpConfig } = await import('./dump-config.ts')
      runDumpConfig(invocation.profile, invocation.defaultOnly, invocation.patches, invocation.fromDefaultProfile)
      break
    }
    case 'dump-config-schema':
      throw new Error('dsh: --dump-config-schema requires the unimplemented native schema exporter')
    case 'plugin':
      throw new Error('dsh: plugin management via pnpm is not yet reconstructed')
    default:
      invocation satisfies never
      throw new Error('dsh: unhandled CLI invocation')
  }
}
if (import.meta.main) await runCli()
