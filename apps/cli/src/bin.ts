import {parseDshArgs} from "./args.ts";

export async function runCli(): Promise<void> {
    const invocation = parseDshArgs(process.argv.slice(2));

    switch (invocation.mode) {
        case "profile": {
            const { runProfile } = await import("./profile-boot.ts");

            runProfile({
                profile: invocation.profile,
                args: invocation.args
            });

            break;
        }

        case "dump-config": {
            const { runDumpConfig } = await import("./dump-config.ts");

            runDumpConfig( invocation.profile, invocation.defaultOnly );

            break;
        }
    }
}

if (import.meta.main) {
    await runCli();
}
