import {
    loadProfilePatchSource,
    type ProfilePatchSources
} from "./profile-boot.ts";

import {
    composeEntries,
    type Composition
} from "./patch-composer.ts";

export interface ProfileComposition extends Composition {
    dir: string;
    loadedBundles: string[];
    skippedBundles: ProfilePatchSources["skippedBundles"];
}

export function composeProfile(
    name: string,
    home: string,
    installAnchor: string
): ProfileComposition {
    const sources = loadProfilePatchSource(
        name,
        home,
        installAnchor
    );

    const patches = [
        ...sources.bundleLayers.flatMap(layer => layer.patches),
        ...(sources.userPatch?.patches ?? [])
    ];

    const composition = composeEntries(patches);

    return {
        dir: sources.dir,
        loadedBundles: sources.bundleLayers.map(
            layer => layer.packageName
        ),
        skippedBundles: sources.skippedBundles,
        ...composition
    };
}