export interface RunProfileOptions {
    profile: string;
    args: readonly string[];
}

export function runProfile(options: RunProfileOptions): void {
    console.log("Starting profile:", options.profile);
    console.log("Arguments:", options.args);
}