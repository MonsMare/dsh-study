import {parseDshArgs} from "./args.ts";
import {runDumpConfig} from "./dump-config.ts";

const invocation = parseDshArgs(process.argv.slice(2));

switch (invocation.mode) {
    case "profile": {
        console.log("Starting profile:", invocation.profile);
        console.log("Arguments:", invocation.args);
        break;
    }

    case "dump-config": {
        runDumpConfig(
            invocation.profile, 
            invocation.defaultOnly
        );
        break;
    }
}
