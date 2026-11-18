import { composeProfile } from "./profile-composition.ts";

export function runDumpConfig(
    profile: string,
    defaultOnly: boolean
): void {
    console.log("Config dump requested");
    console.log("Profile:", profile);
    console.log("Default only:", defaultOnly);  
}

export function runPreviewConfig(
    profile: string,
    home: string,
    installAnchor: string
): void {
    const result = composeProfile(
        profile,
        home,
        installAnchor
    );

    process.stdout.write(
        JSON.stringify(result, null, 2) + "\n"
    );
}