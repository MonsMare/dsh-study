interface ProfileInvocation {
    mode: "profile";
    profile: string;
    args: string[];
}

interface DumpConfigInvocation {
    mode: "dump-config";
    profile: string;
    defaultOnly: boolean;
}

export type DshInvocation = 
    | ProfileInvocation
    | DumpConfigInvocation;

export function parseDshArgs(
    argv: string[]
): DshInvocation {

    if (argv[0] === "--dump-config") {
        return {
            mode: "dump-config",
            profile: "headless",
            defaultOnly: false
        };
    }

    const profile = argv[0] ?? "headless";
    const args = argv.slice(1);

    return {
        mode: "profile",
        profile,
        args
    };
}   