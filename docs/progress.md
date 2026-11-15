# DSH Study — Learning Progress

> Maintainer: AI study tutor. Record confirmed facts separately from unverified tests.
> Last reviewed: 2026-11-15 (cross-conversation handoff).

## Upstream
- Repository: deepseek-ai/deepseek-harness
- Pinned baseline: fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159
- Study repository: MonsMare/dsh-study

## Completed (source confirmed on GitHub main)
- M0: Monorepo and pnpm Workspace; TypeScript CLI and type checking; ESM modules and CLI argument parsing; Discriminated Union and typed dispatch.
- M1-01: Extract dump-config handler — 19fc092.
- M1-02: Introduce async dispatch and dynamic import — 24a774b.
- M1-03: Export runCli and guard entry with import.meta.main — 8754524.
- M1-04: Extract profile-boot.ts entry with RunProfileOptions — dfa851a.
- M1-05: Resolve profile directory from a logical profile name and reject basic invalid names — 0a20a2a. Learner confirmed implementation and understanding.
- M1-06: Read a JSON profile manifest as `Record<string, unknown>`, checking that the top-level value is a non-array object — 73061df (remote commit verified, learner confirms rebase and push succeeded).
- M1-07 (partial): Official Profile templates (224dada), manifest initializer (034f9c0), typed manifest and corrected dependencies (747db28), and initializer for user patch file (cdf4d01). All source commits confirmed on GitHub; local test output not independently verified.

These are confirmed as committed source; local TypeScript and runtime test outputs are not independently available to the tutor.

## Current
- M1-07: Correct filename mismatch in apps/cli/src/profile-boot.ts (`PROFILE_PATCH_FILENAME` is currently `cordis.patch.yaml`, but pinned upstream uses `cordis.patch.yml`); verify initialization in a temporary directory, then add pnpm-workspace.yaml and missing-profile logic.
- Status: in progress; patch-file initializer code is committed but contains a filename mismatch. Do not mark complete until fixed and validated.
- Scope: avoid modifying real ~/.dsh, mounting bundles, or treating teaching code as full DSH startup.

## Source evidence
- Study: apps/cli/src/args.ts, bin.ts, dump-config.ts, profile-boot.ts.
- Upstream: packages/boot/app-boot/src/profile.ts, especially resolveProfileDir, readProfileManifest, initProfile, loadProfile; apps/cli/src/profile-boot.ts.
- Note: current study resolveProfileDir omits DSH_HOME override contract, intentionally simplified.

## Git and validation
- Branch inspected: main.
- Latest confirmed study code commit: cdf4d01abe71999e3b2309f8220af8829427447e.
- Learner confirmed an interrupted rebase was completed and subsequent push succeeded (2026-11-12). Remote code verified.
- Local working-tree state and test outputs: unknown.
- This progress update is a separate remote docs commit. Before the next local code commit, check `git status -sb` then synchronize remote main (`git pull --ff-only`) only if working tree is clean; never force push or guess through an unfinished rebase.

## Development Rules
- Follow pinned DSH source, explain problems and choices before reference code; learner manually implements.
- Engineering habit: express known data contracts at boundaries; rely on inference for simple local values; validate untrusted file input at runtime. A TypeScript assertion is not a runtime validator.
- Validate code and existing behavior before each meaningful code commit.
- Favor small changes and avoid unrelated modifications.
- Teach safe Git habits as part of every lesson: inspect status and diffs, check staged diff, explain fetch/ff-only/rebase/merge only as necessary, commit scoped changes, and avoid `--force`, `reset --hard`, or unsafe conflict resolution. Coordinate AI-authored progress commits to avoid surprising remote divergence.
