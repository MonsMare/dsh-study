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
- M1-07: Official Profile templates (224dada), manifest initializer (034f9c0), typed manifest and corrected dependencies (747db28), user patch initializer (cdf4d01), corrected `cordis.patch.yml` filename (666821b), per-profile `pnpm-workspace.yaml` initializer (061f344), and missing-profile decision via `ensureProfileInitialized` (63b39d2). Source commits confirmed on GitHub `main`; learner confirms implementations, local test output not independently observed.
- M1-08: `loadProfileManifest(name, home)` combines `ensureProfileInitialized` and `readProfileManifest`, and profile-templates import uses `.ts` for direct Node TypeScript execution — commit 8f9934b verified on GitHub `main`; learner confirms exercise done, local test output not independently observed.
- M1-09: `readProfileBundles()` with runtime guards `isRecord` / `isStringArray` and bundle list in `loadProfileManifest` — commit 42124bf verified on GitHub `main`; local runtime/type-check output not independently observed.
- M1-10: `packageDirFromAnchor` and exported installation-first `resolveBundleDir` were committed as c7dd78c3ffd688adcd58a4223aa0b0d1009352d1 on GitHub `main`. Learner continued, while noting remaining questions about resolution and requesting a faster learning pace; no local test output independently observed.
- M1-11: `resolveBundlePatchPaths()` combines two-anchor directory resolution, bundle `package.json` reading, `dsh.bundle.patch` string-or-array normalization, and path joining. GitHub `main` commit 1fca5ddeac42334edda913af43e7dd16fcae7073 verified; local validation output not independently observed.
- M1-12: `loadProfilePatchSource()` (singular, as implemented) collects UTF-8 bundle Patch sources in declared order, optional user Patch text and skipped Bundle diagnostics. GitHub `main` code commit a981ecce7923de896420652d17d4c40009156fa1 verified; user has not supplied exact local test outputs. This is text collection only, not YAML parsing, composition, or plugin mount.
- M1-13: `apps/cli/src/patch-parser.ts` introduced `parsePatchList()` with `js-yaml`, JSON_SCHEMA extension for `!!js` expression objects, top-level YAML array and mapping-entry checks; dependencies `js-yaml` and `@types/js-yaml` are present in CLI package. Code commit 69e900342d4419ab2900fa65a069274d9a19b43d verified on GitHub `main`. Learner confirms understanding of arrow functions and asks to continue; no local test output independently observed.

These are confirmed as committed source; local TypeScript and runtime test outputs are not independently available to the tutor.

## Current
- M1-14 (next): Wire `parsePatchList(file.path, file.content)` into existing `loadProfilePatchSource()`: add `patches` arrays on successful bundle layers and optional user patch; keep bundle parse errors in `skippedBundles` and propagate user patch errors. Preserve ordered parsing via `flatMap`, no real Cordis mount. Upstream basis: app-boot/src/profile.ts `loadProfileDirectory` and app-boot/src/index.ts `loadOverlayPatches` / `parsePatchList` at pinned commit. Note unimplemented source-path anchoring, loader-specific validation, and actual `applyEntryPatches`.
- Learner requested accelerated functional-slice teaching, minimizing repetitive syntax/excessive testing; defer non-blocking detail and revisit it when code makes the mechanism concrete.
- Git `diff` literacy remains deferred by learner request until a future real code-change review; teach `git diff` and `git diff --cached` during subsequent commits, without adding a separate exercise. Full patch composition and Harness boot remain deferred.
- Scope: avoid modifying real ~/.dsh, mounting bundles, or treating teaching code as full DSH startup.

## Source evidence
- Study: apps/cli/src/args.ts, bin.ts, dump-config.ts, profile-boot.ts.
- Upstream: packages/boot/app-boot/src/profile.ts, especially resolveProfileDir, readProfileManifest, initProfile, loadProfile; apps/cli/src/profile-boot.ts.
- Note: current study resolveProfileDir omits DSH_HOME override contract, intentionally simplified.

## Git and validation
- Branch inspected: main.
- Latest confirmed study code commit before this docs update: 69e900342d4419ab2900fa65a069274d9a19b43d.
- Learner confirmed an interrupted rebase was completed and subsequent push succeeded (2026-11-12). Remote code verified.
- Local working-tree state: unknown (GitHub read cannot inspect local files). M1-13 source code is committed remotely; local tests/type checks have not been independently verified.
- This progress update is a separate remote docs commit on `main`; learners must `git fetch origin` and inspect ahead/behind before making or pushing the next code change. Only fast-forward when safe; never force push or guess through an unfinished rebase.

## Development Rules
- Follow pinned DSH source, explain problems and choices before reference code; learner manually implements.
- **Core learning priority (learner-confirmed, 2026-11-15):** 我们的学习目标是掌握如何构建 Harness，而不是先成为所有 TypeScript 语法的专家。很多语言机制可以在反复参与真实工程的过程中逐渐内化。以实际 Harness 功能链路驱动教学；只深讲当前正确实现所必需的 TS/Node 机制；其他疑问留待相关源码和可运行行为出现时再研究，不把语言知识的穷尽作为进入下一工程环节的前置条件。
- Engineering habit: express known data contracts at boundaries; rely on inference for simple local values; validate untrusted file input at runtime. A TypeScript assertion is not a runtime validator.
- Validate code and existing behavior before each meaningful code commit.
- Favor small changes and avoid unrelated modifications.
- Teach safe Git habits as part of every lesson: inspect status and diffs, check staged diff, explain fetch/ff-only/rebase/merge only as necessary, commit scoped changes, and avoid `--force`, `reset --hard`, or unsafe conflict resolution. Coordinate AI-authored progress commits to avoid surprising remote divergence.
