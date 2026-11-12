import { homedir } from "node:os";
import { basename,join } from "node:path";
import { 
    readFileSync,
    existsSync,
    mkdirSync,
    writeFileSync
} from "node:fs";

//类型契约
interface InitialProfileManifest {
    name: string;
    private: boolean;
    dependencies: Record<string, string>;
    dsh: {
        profile: {
            bundles: string[];
        };
    };
}

export function initProfile(
    dir: string,
    bundles: readonly string[]
): void {
    mkdirSync(dir, { recursive: true });

    const manifestPath = join(dir, "package.json");

    if(!existsSync(manifestPath)){
        const manifest: InitialProfileManifest = {
            name: `dsh-profile-${basename(dir)}`,
            private: true,
            dependencies: {},
            dsh: {
                profile: {
                    bundles: [...bundles]
                }
            }
        };

        writeFileSync(
            manifestPath,
            JSON.stringify(manifest, null, 2) + "\n",   
            "utf-8"
        );
    }
}

export interface RunProfileOptions {
    profile: string;
    args: readonly string[];
}

export function readProfileManifest(
    dir: string
): Record<string, unknown> {
    const path = join(dir, "package.json");
    const source = readFileSync(path, "utf-8");

    const value: unknown = JSON.parse(source);

    if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
    ){
        throw new Error(
            `dsh: profile manifest ${path} must be a JSON object`
        );
    }

    return value as Record<string, unknown>;

}

export function resolveProfileDir(
    name: string,
    home: string = join(homedir(), ".dsh")
): string {
    if(
        name === "" ||
        name === "." ||
        name === ".." ||
        name === "node_modules" ||
        name.includes("/") ||
        name.includes("\\")
    ){
        throw new Error(
            `dsh: Invalid profile name ${JSON.stringify(name)}`
        );
    }

    return join(home, "profiles", name);
}

export function runProfile(options: RunProfileOptions): void {
    const profileDir = resolveProfileDir(options.profile);

    console.log("Starting profile:", options.profile);
    console.log("Arguments:", options.args);
    console.log("Profile directory:", profileDir);
}