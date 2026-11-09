import {parseDshArgs} from "./args.ts";

const invocation = parseDshArgs(process.argv.slice(2));

switch (invocation.mode) {
    case "profile": {
        console.log("Starting profile:", invocation.profile);
        console.log("Arguments:", invocation.args);
        break;
    }

    case "dump-config": {
        console.log("Config dump requested");
        console.log("Profile:", invocation.profile);
        console.log("Default only:", invocation.defaultOnly);
        break;
    }
}
