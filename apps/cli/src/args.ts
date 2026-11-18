import { isAbsolute } from "node:path";

interface ProfileInvocation {
    mode: "profile";
    profile: string;
    args: string[];
}

interface PreviewConfigInvocation {
    mode: "preview-config";
    profile: string;
    home: string;
    installAnchor: string;
}

interface DumpConfigInvocation {
    mode: "dump-config";
    profile: string;
    defaultOnly: boolean;
}

export type DshInvocation =
    | ProfileInvocation
    | DumpConfigInvocation
    | PreviewConfigInvocation;

export function parseDshArgs(
    argv: string[]
): DshInvocation {

    if (argv[0] === "--preview-config") {
        const [
            ,
            profile,
            homeFlag,
            home,
            anchorFlag,
            installAnchor
        ] = argv;

        if (
            argv.length !== 6 ||
            !profile ||
            homeFlag !== "--home" ||
            !home ||
            anchorFlag !== "--install-anchor" ||
            !installAnchor ||
            !isAbsolute(home) ||
            !isAbsolute(installAnchor)
        ) {
            throw new Error(
                "Usage: --preview-config <profile> " +
                "--home <absolute-path> " +
                "--install-anchor <absolute-path>"
            );
        }

        return {
            mode: "preview-config",
            profile,
            home,
            installAnchor
        };
    }

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