import { homedir } from "node:os";
import { join } from "node:path";

export interface RunProfileOptions {
    profile: string;
    args: readonly string[];
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