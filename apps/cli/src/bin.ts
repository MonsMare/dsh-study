import {parseDshArgs} from "./args.ts";

async function runCli(): Promise<void> {
    const invocation = parseDshArgs(process.argv.slice(2));

    switch (invocation.mode) {
        case "profile": {
            console.log("Starting profile:", invocation.profile);
            console.log("Arguments:", invocation.args);
            break;
        }

        case "dump-config": {
            const { runDumpConfig } = await import("./dump-config.ts");

            runDumpConfig( invocation.profile, invocation.defaultOnly );

            break;
        }
    }
}

await runCli();
