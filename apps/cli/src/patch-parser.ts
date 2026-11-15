import * as yaml from "js-yaml";

const jsExpr = new yaml.Type("tag:yaml.org,2002:js", {
    kind: "scalar",
    resolve: (data) => typeof data === "string",
    construct: (data) => ({
        __jsExpr: data
    })
});

const patchSchema = yaml.JSON_SCHEMA.extend(jsExpr);

export function parsePatchList(
    sourcePath: string,
    content: string
): Record<string, unknown>[] {
    let parsed: unknown;

    try {
        parsed = yaml.load(content, {
            schema: patchSchema
        });
    } catch (error) {
        throw new Error(
            `dsh: failed to parse patch ${sourcePath}: ${String(error)}`
        );
    }

    if (!Array.isArray(parsed)) {
        throw new Error(
            `dsh: patch ${sourcePath} must be a YAML array`
        );
    }

    for (const [index, entry] of parsed.entries()) {
        if (
            entry === null ||
            typeof entry !== "object" ||
            Array.isArray(entry)
        ) {
            throw new Error(
                `dsh: patch entry ${index + 1} in ${sourcePath} must be an object`
            );
        }
    }

    return parsed as Record<string, unknown>[];
}