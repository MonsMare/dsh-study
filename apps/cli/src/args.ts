/** Pinned upstream apps/cli/src/args.ts CLI contract, Commander-based.
 * Modes missing actual handlers fail closed at dispatch; no invented preview command.
 */
import { Command, CommanderError, InvalidArgumentError } from 'commander'

interface ProfileInvocation {
  mode: 'profile'; profile: string; fromDefaultProfile?: string | undefined; patches: string[]; args: string[]
}
interface DumpConfigInvocation {
  mode: 'dump-config'; profile: string; fromDefaultProfile?: string | undefined;
  defaultOnly: boolean; patches: string[]
}
interface DumpConfigSchemaInvocation {
  mode: 'dump-config-schema'; profile: string; fromDefaultProfile?: string | undefined; patches: string[]
}
interface PluginInvocation { mode: 'plugin'; profile: string; args: string[] }
export type DshInvocation = ProfileInvocation | DumpConfigInvocation | DumpConfigSchemaInvocation | PluginInvocation
interface BootOptions {
  patch?: string[]; dumpConfig?: boolean; dumpDefaultConfig?: boolean
  dumpConfigSchema?: boolean; fromDefaultProfile?: string
}
const collect = (value: string, previous: string[] = []): string[] => [...previous, value]
function selectProfile(value: string, previous?: string): string {
  if (previous !== undefined) throw new InvalidArgumentError('select a profile only once')
  return value
}
function rejectElectronProfile(program: Command, profile: string): void {
  if (profile.toLowerCase() === 'desktop') {
    program.error('error: profile "desktop" is managed exclusively by the Electron application')
  }
}
function resolveBoot(program: Command, profile: string, options: BootOptions, args: string[]): DshInvocation {
  const patches = options.patch ?? []
  if (patches.includes('')) program.error('error: --patch needs a path')
  if (options.fromDefaultProfile === '') program.error('error: --from-default-profile needs a name')
  const dumps = [options.dumpConfig, options.dumpDefaultConfig, options.dumpConfigSchema].filter(Boolean)
  if (dumps.length === 0) {
    return { mode: 'profile', profile, fromDefaultProfile: options.fromDefaultProfile, patches, args }
  }
  if (dumps.length > 1) {
    program.error('error: --dump-config, --dump-default-config, and --dump-config-schema are mutually exclusive')
  }
  if (args.length > 0) {
    program.error(`error: config dumps take no app arguments, got ${args.map(argument => JSON.stringify(argument)).join(' ')}`)
  }
  if (options.dumpConfigSchema === true) {
    return { mode: 'dump-config-schema', profile, fromDefaultProfile: options.fromDefaultProfile, patches }
  }
  const defaultOnly = options.dumpDefaultConfig === true
  if (defaultOnly && patches.length > 0) {
    program.error('error: --dump-default-config prints the bundle layers and takes no --patch')
  }
  return { mode: 'dump-config', profile, fromDefaultProfile: options.fromDefaultProfile, defaultOnly, patches }
}

export function parseDshArgs(argv: readonly string[], version: string, manageDesktopProfile = false): DshInvocation {
  const first = argv[0]
  let resolved: DshInvocation | undefined
  const program: Command = new Command()
  program
    .name('dsh')
    .version(version, '-V, --version', 'output the version number')
    .usage('[--profile] <name> [options] [app-args...]\n       dsh plugin --profile <name> <pnpm-args...>')
    .description('dsh: boot a DeepSeek Harness profile — an ordered stack of plugin-bundle patch layers under your own overrides.')
    .exitOverride()
    .helpOption(false)
    .helpCommand(false)
    .allowUnknownOption()
    .passThroughOptions()
    .enablePositionalOptions()
    .argument('[args...]', 'arguments for the booted profile')
    .option('--profile <name>', 'the profile under $DSH_HOME/profiles to boot', selectProfile)
    .option('--from-default-profile <name>', 'replace a custom profile with a shipped template')
    .option('--patch <path>', 'extra patch-list overlay (repeatable)', collect)
    .option('--dump-config', 'print the composed profile tree and exit')
    .option('--dump-config-schema', 'print JSON Schema for profile entries and patches')
    .option('--dump-default-config', 'print bundle-only profile tree')
    .action((args: string[], options: BootOptions & { profile?: string }) => {
      if (options.profile === undefined) {
        if (args.some(arg => arg === '-h' || arg === '--help')) program.help()
        program.error('error: --profile <name> is required')
      }
      const profile = options.profile
      if (profile === '') program.error('error: --profile needs a name')
      rejectElectronProfile(program, profile)
      resolved = resolveBoot(program, profile, options, args)
    })

  if (first === 'plugin') {
    const plugin = program.command('plugin').description('manage a profile\'s plugins')
    plugin
      .helpOption('-h, --help', 'show this help')
      .passThroughOptions()
      .requiredOption('--profile <name>', 'profile whose plugins to manage', selectProfile)
      .allowUnknownOption()
      .argument('[args...]', 'pnpm arguments, forwarded verbatim')
      .action((args: string[], options: { profile: string }) => {
        if (options.profile === '') program.error('error: --profile needs a name')
        if (!manageDesktopProfile) rejectElectronProfile(plugin, options.profile)
        if (args.length === 0) program.error('error: plugin needs pnpm arguments to forward')
        resolved = { mode: 'plugin', profile: options.profile.toLowerCase() === 'desktop' ? 'desktop' : options.profile, args }
      })
  }
  try {
    const expanded = first !== undefined && !first.startsWith('-') && first !== 'plugin'
      ? ['--profile', ...argv] : argv
    program.parse(expanded, { from: 'user' })
  } catch (error) {
    return process.exit(error instanceof CommanderError ? error.exitCode : 1)
  }
  if (resolved === undefined) throw new Error('dsh: no invocation resolved')
  return resolved
}
