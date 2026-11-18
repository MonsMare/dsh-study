# M1-18 — Source-aligned reconstruction (pending verification)

Pinned upstream: `deepseek-ai/deepseek-harness@fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159`.

This branch is an **implementation**, not an assertion that the complete DSH runtime has been reproduced.

## Restored ownership

- `vendor/loader`: entry options and JS expression types (the real loader remains unimplemented).
- `vendor/include`: official Include `applyPatches` core behavior and YAML entry-list tag.
- `packages/boot/app-boot`: Profile, bundle loading, overlays, path anchoring, and provenance-labeled YAML dumping.
- `packages/util`: profile templates, Home location, manifest fields.
- `apps/cli`: Commander invocation and command-mode dispatch; nonimplemented actions fail rather than pretend success.

Removed the study-only `--preview-config` and CLI-local substitutes. Existing real `~/.dsh` is never accessed in tests.

## Explicit omissions

Cordis runtime mounting, Loader lifecycle, HMR/journal, plugin manager, schema dump, full bundle version compatibility and exemptions, legacy projection migration, and destructive `--from-default-profile` recovery are **NOT implemented**. Those operations are blocked instead of silently approximated. `EntryOptions.inject` remains the documented type placeholder until Cordis is integrated.

## Verification and safety

1. `pnpm install --no-frozen-lockfile` (required to update `pnpm-lock.yaml` after workspace changes).
2. `pnpm --filter @study/dsh-cli exec tsc --noEmit`.
3. `pnpm run test:alignment`.
4. `DSH_REFERENCE_DIR=path/to/upstream-commit pnpm run test:parity`.
5. Review `git diff`, dependency lock file, and GitHub Actions workflow before merge.

**Verification status:** Source files are prepared for review. Full dependency-backed tests and updated lockfile must pass before merge into main; do not mark M1-18 complete prematurely.
