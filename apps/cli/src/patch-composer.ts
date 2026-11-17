
export type MiniEntry = Record<string, unknown> & {
    id?: string;
    name?: string;
    group?: boolean;
    config?: unknown;
};

export interface Composition {
    entries: MiniEntry[];
    warnings: string[];
}

export function composeEntries(
    patches: readonly Record<string, unknown>[]
): Composition {
    const entries: MiniEntry[] = [];
    const byId = new Map<string, MiniEntry>();
    const warnings: string[] = [];

    function register(items: MiniEntry[]): void {
        for (const entry of items) {
            if (typeof entry.id === "string") {
                byId.set(entry.id, entry);
            }

            if (entry.group && Array.isArray(entry.config)) {
                register(entry.config as MiniEntry[]);
            }
        }
    }

    for (const patch of patches) {
        const { id, insert, name, ...overrides } = patch;

        if (insert !== undefined) {
            if (
                !Array.isArray(insert) ||
                !insert.every(
                    item => item !== null &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                )
            ) {
                warnings.push("patch insert must be an array of entries");
                continue;
            }

            const added = structuredClone(insert) as MiniEntry[];

            if (id === undefined) {
                entries.push(...added);
            } else {
                const parent =
                    typeof id === "string" ? byId.get(id) : undefined;

                if (!parent || !parent.group) {
                    warnings.push(`patch insert: group ${String(id)} not found`);
                    continue;
                }

                if (!Array.isArray(parent.config)) {
                    parent.config = [];
                }

                (parent.config as MiniEntry[]).push(...added);
            }

            register(added);
            continue;
        }

        if (typeof id !== "string") {
            warnings.push("patch: id is required");
            continue;
        }

        const target = byId.get(id);

        if (!target) {
            warnings.push(`patch: entry ${id} not found`);
            continue;
        }

        if (typeof name === "string" && name && name !== target.name) {
            warnings.push(`patch: name mismatch for ${id}`);
            continue;
        }

        Object.assign(target, overrides);
    }

    return { entries, warnings };
}
