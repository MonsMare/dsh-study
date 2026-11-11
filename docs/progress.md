# DSH Study — Learning Progress

> Maintainer: AI study tutor. Record confirmed facts separately from unverified tests.
> Last reviewed: 2026-11-11.

## Upstream
- Repository: deepseek-ai/deepseek-harness
- Pinned baseline: fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159
- Study repository: MonsMare/dsh-study

## Completed (code confirmed on GitHub main)
- M0: Monorepo and pnpm Workspace; TypeScript CLI and type checking; ESM modules and CLI argument parsing; Discriminated Union and typed dispatch.
- M1-01: Extract dump-config handler — 19fc092.
- M1-02: Introduce async dispatch and dynamic import — 24a774b.
- M1-03: Export runCli and guard entry with import.meta.main — 8754524.
- M1-04: Extract profile-boot.ts entry with RunProfileOptions — dfa851a.
- M1-05: Resolve profile directory from a logical profile name and reject basic invalid names — 0a20a2a. Learner confirmed implementation and understanding.

These are confirmed as committed source. Local test and TypeScript check results are not independently available to the tutor; do not label them as tool-verified.

## Current
- M1-06: Read a Profile package.json manifest as JSON data with basic runtime object validation.
- Status: explained / awaiting manual implementation and verification.
- Scope: do not mount bundles, initialize real DSH_HOME, or modify user profiles.

## Next
- After M1-06 verification, decide how to recognize a valid DSH profile manifest and handle missing shipped/custom profiles based on the pinned upstream source.

## Source evidence
- Study: apps/cli/src/args.ts, bin.ts, dump-config.ts, profile-boot.ts.
- Upstream: packages/boot/app-boot/src/profile.ts (resolveProfileDir, initProfile, readProfileManifest, loadProfileDirectory, loadProfile), apps/cli/src/profile-boot.ts.
- Note: current study's resolveProfileDir is an intentionally simplified implementation and does not yet support the full DSH_HOME override contract.

## Git and validation
- Latest confirmed study code commit before this progress update: 0a20a2ac16fcd53d42e58c7d98f798ee65adf9e2.
- Branch inspected: main.
- Local working-tree state unknown; previously reported local removal of 'process.md' may or may not refer to docs/progress.md.

## Development Rules
- Follow the pinned DSH source architecture and distinguish official implementation from teaching simplifications.
- Explain engineering problems, alternatives, and constraints before giving code; learner types code manually.
- Validate functionality and types before submitting code.
- Prefer small, meaningful commits; do not include unrelated local changes.
