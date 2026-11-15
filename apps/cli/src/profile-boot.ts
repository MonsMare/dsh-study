import { homedir } from "node:os";
import { basename,join } from "node:path";
import { 
    readFileSync,
    existsSync,
    mkdirSync,
    writeFileSync
} from "node:fs";
import { getProfileTemplate } from "./profile-templates.ts";
import { createRequire } from "node:module";

const PROFILE_PATCH_FILENAME = "cordis.patch.yml"

const PROFILE_PATCH_TEMPLATE = `# Profile-specific changes applied after bundle layers
[]
`;

const PROFILE_PNPM_WORKSPACE = `packages:
    - .

nodeLinker: hoisted
autoInstallPeers: false
`;

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

    const patchPath = join(dir, PROFILE_PATCH_FILENAME);

    if (!existsSync(patchPath)) {
        writeFileSync(
            patchPath,
            PROFILE_PATCH_TEMPLATE,
            "utf-8"
        );
    }

    const workspacePath = join(dir, "pnpm-workspace.yaml");

    if (!existsSync(workspacePath)) {
        writeFileSync(
            workspacePath,
            PROFILE_PNPM_WORKSPACE,
            "utf-8"
        );
    }

}

export function ensureProfileInitialized(
    name: string,
    home: string
): string {
    const dir = resolveProfileDir(name, home);
    const manifestPath = join(dir, "package.json");

    if (!existsSync(manifestPath)) {
        const template = getProfileTemplate(name);

        if (template === undefined) {
            throw new Error(
                `dsh: profile ${JSON.stringify(name)} does not exist`
            );
        }

        initProfile(dir, template.bundles);
    }

    return dir;
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

export function loadProfileManifest(
    name: string,
    home: string
): {
    dir: string;
    manifest: Record<string, unknown>;
    bundles: readonly string[];
} {
    const dir = ensureProfileInitialized(name, home);
    const manifest = readProfileManifest(dir);
    const bundles = readProfileBundles(manifest);

    return {
        dir,
        manifest,
        bundles
    };
}

export function readProfileBundles(
    manifest: Record<string, unknown>
):readonly string[] {
    const dsh = manifest["dsh"];

    if(dsh === undefined ){
        return [];
    }

    if(!isRecord(dsh)){
        throw new Error("dsh: manifest.dsh must be an object"); 
    }

    const profile = dsh["profile"];
    
    if (profile === undefined) {
        return [];
    }

    if (!isRecord(profile)) {
        throw new Error("dsh: manifest.dsh.profile must be an object");
    }

    const bundles = profile["bundles"];

    if (bundles === undefined) {
        return [];
    }

    if (!isStringArray(bundles)) {
        throw new Error("dsh: manifest.dsh.profile.bundles must be an array of strings");
    }

    return bundles;
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

function isRecord(
    value: unknown
): value is Record<string, unknown> {
    return value !== null &&
        typeof value === "object" &&
        !Array.isArray(value);
}

function isStringArray(
    value: unknown  
): value is string[] {
    return Array.isArray(value) &&
        value.every(
            (item: unknown) => typeof item === "string"
        );
}

function packageDirFromAnchor(
    anchor: string,
    packageName: string
): string | undefined {
    const searchPaths =
        createRequire(anchor).resolve.paths(packageName) ?? [];

    for (const searchPath of searchPaths) {
        const candidate = join(searchPath, packageName);

        if(existsSync(join(candidate, "package.json"))){
            return candidate;
        }
    }

    return undefined;
}

export function resolveBundleDir(
    binName: string,
    packageName: string,
    installAnchor: string,
    profileDir: string
): string {
    const anchors =  [
        installAnchor,
        join(profileDir, "package.json"),
    ];

    for (const anchor of anchors) {
        const dir = packageDirFromAnchor(anchor, packageName);

        if (dir !== undefined) {
            return dir;
        }
    }

    throw new Error(
        `${binName}: cannot resolve profile bundle ` +
        `${JSON.stringify(packageName)} from the dsh installation ` +
        `or ${profileDir}`
    );
}

export function resolveBundlePatchPaths(
    packageName: string,
    installAnchor: string,
    profileDir: string
): string[]{
     const packageDir = resolveBundleDir(
        "dsh",
        packageName,
        installAnchor,
        profileDir
    );

    const manifest = readProfileManifest(packageDir);
    const dsh = manifest["dsh"];

    if(!isRecord(dsh) || !isRecord(dsh["bundle"])) {
        throw new Error(
            `dsh: bundle ${packageName} does not declare dsh.bundle`
        );
    }

    const declared = dsh["bundle"]["patch"];

    const files =  
        typeof declared === "string"?[declared]:declared

    if (!isStringArray(files)) {
        throw new Error(
            "dsh.bundle.patch must be a file path or an array of paths"
        );
    }

    return files.map(file => join(packageDir, file));
}