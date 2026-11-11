# DSH Study — Learning Progress

> Maintainer: AI study tutor. Record confirmed facts separately from unverified tests.
> Last reviewed: 2026-11-12.

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

These are confirmed as committed source; local TypeScript and runtime test outputs are not independently available to the tutor.

## Current
- M1-07: Define missing-profile behavior for official templates versus custom profiles, then implement minimal initialization in an isolated test root.
- Status: not started.
- Scope: avoid modifying real ~/.dsh, mounting bundles, or treating teaching code as full DSH startup.

## Source evidence
- Study: apps/cli/src/args.ts, bin.ts, dump-config.ts, profile-boot.ts.
- Upstream: packages/boot/app-boot/src/profile.ts, especially resolveProfileDir, readProfileManifest, initProfile, loadProfile; apps/cli/src/profile-boot.ts.
- Note: current study resolveProfileDir omits DSH_HOME override contract, intentionally simplified.

## Git and validation
- Branch inspected: main.
- Latest confirmed study code commit: 73061dfc189a3431f92d2069cdcefcf90336b849.
- Learner confirmed an interrupted rebase was completed and subsequent push succeeded (2026-11-12). Remote code verified.
- Local working-tree state and test outputs: unknown.
- This progress update is a separate remote docs commit. Before the next local commit, synchronize the remote branch when the local working tree is clean (`git pull --ff-only`), to prevent another non-fast-forward push rejection.

## Development Rules
- Follow pinned DSH source, explain problems and choices before reference code; learner manually implements.
- Validate code and existing behavior before each meaningful code commit.
- Favor small changes and avoid unrelated modifications.
