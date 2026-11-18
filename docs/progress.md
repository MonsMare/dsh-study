# DSH Study — Learning Progress

> Maintainer: AI study tutor. Record confirmed facts separately from unverified tests.
> Last reviewed: 2026-11-18 (source-alignment audit and hard learning gate).

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
- M1-14: `apps/cli/src/profile-boot.ts` now imports `parsePatchList`, stores parsed `patches` per successful Bundle layer and the optional user Patch, and collects per-bundle parse failures in `skippedBundles` while propagating user Patch errors. Code commit efda9a6c663ad2ef49f3fddfe7cc7395fb7e339c verified on GitHub `main`; learner moved on, but local test output not independently observed.
- M1-15: `apps/cli/src/patch-composer.ts` implements teaching subset of official Cordis Include patch application: root/group insertion, by-id tracking, overriding fields with `Object.assign`, warnings for invalid/missing targets and cloned inserted entries. GitHub `main` commit a36196381d242a3187878910efe811498d7a5ff4 verified. Learner confirmed understanding of the reason for Patch vs Entry and asked to continue; exact local test output not independently observed.
- M1-16: `apps/cli/src/profile-composition.ts` now exports `composeProfile` and `ProfileComposition`, composing ordered Bundle patch arrays before the user patch and returning entries, warnings, loaded/skipped Bundles, and directory. GitHub `main` commit 47563d2af08b78ca5b79b510b855c50653168712 verified; local test output not independently observed.
- M1-17: `apps/cli/src/args.ts` added a study-only `--preview-config` diagnostic mode; `bin.ts` dispatches it to `runPreviewConfig()` in `dump-config.ts`, which prints composed JSON. GitHub `main` commit 56e2ae2fb90a7579a4f1bc1c1271abf889a90870 verified. This is not official `--dump-config`; local type-check/CLI E2E output not independently verified.

These are confirmed as committed source; local TypeScript and runtime test outputs are not independently available to the tutor.

## Current
- **M1-18 (SOURCE ALIGNMENT / STOP NEW FEATURES, learner-confirmed 2026-11-18):** Restore implemented CLI → Profile → Bundle → YAML Patch → Entries chain to pinned upstream architecture and behavioral contracts. The learner explicitly rejects self-invented substitutes and demands source explanation and parity before continuing. No feature lessons or Cordis runtime work until this audit and remediation pass the gate. See root `SKILL.md` for mandatory source-first rules.
- **First remediation:** Explain and restore ownership of configuration algorithms: upstream `vendor/include/src/patch.ts` (applyPatches/export as applyEntryPatches), its `entryListSchema` in `vendor/include/src/index.ts`, and upstream `packages/boot/app-boot/src/profile.ts` caller. Introduce matching package boundaries in the study before porting real semantics. Do not rewrite unrelated code or claim functionality completed without verification.
- Next repair groups (in source dependency order): correct Include schema/roundtrip and relative inserted plugin path anchoring; align Profile manifest/Bundle loading and compatibility/deferred behavior; align CLI Commander and argument passthrough; replace placeholder dump with upstream YAML dump semantics and source attribution. Validate with matching fixtures and clear deferred-scope flags.
- Learner manually implements corrections after rationale and exact upstream references; tutor maintains progress and evidence. GitHub-only verification cannot establish local tests or working-tree state.
- Learner had requested faster functional slices, but source fidelity takes priority: do not accelerate by inventing parallel implementations or omitting upstream contract review.
- Git `diff` literacy remains deferred by learner request until a future real code-change review; teach `git diff` and `git diff --cached` during subsequent commits, without adding a separate exercise. Full patch composition and Harness boot remain deferred.
- Scope: avoid modifying real ~/.dsh, mounting bundles, or treating teaching code as full DSH startup.

## Source-alignment audit (2026-11-18; code corrections NOT YET APPLIED)

| Current study path | Official pinned source | Verified divergence / remediation |
| --- | --- | --- |
| `apps/cli/src/args.ts` | `apps/cli/src/args.ts` | Official Commander parser handles `--profile`, `--patch`, plugin/dump modes and passthrough args; study uses minimal homemade parser plus a study-only `--preview-config`. Restore official contract when revisiting CLI. |
| `apps/cli/src/profile-boot.ts` + `profile-composition.ts` | `packages/boot/app-boot/src/profile.ts` and `apps/cli/src/profile-boot.ts` | Shared profile/Bundle reading and composition belong to app-boot, not directly inside CLI. Study also omits official platform/compatibility gates, runtime resolution and multiple patch layers; these are missing/deferred and must never be labeled implemented. |
| `apps/cli/src/patch-parser.ts` | `vendor/include/src/index.ts`, `packages/boot/app-boot/src/index.ts` | Local YAML schema reproduces `resolve`/`construct` but omits `predicate`/`represent` required for official `!!js` round-trip; profile parser also omits official `anchorInsertedPluginNames` relative file anchoring. |
| `apps/cli/src/patch-composer.ts` | `vendor/include/src/patch.ts` + exported `applyEntryPatches` | Homemade partial algorithm differs in API (no base `EntryOptions[]` or warning callback), ownership (CLI vs Include), validation and cases. Official dump/boot share this exact algorithm. Replace ad hoc canonical composer via faithful source-guided reconstruction and parity tests. |
| `apps/cli/src/dump-config.ts` | `apps/cli/src/dump-config.ts`, `packages/boot/app-boot/src/index.ts` | Official `--dump-config` renders provenance-labeled YAML, supports default-only mode and additional layers; study `--dump-config` is a placeholder, `--preview-config` prints JSON as a teaching diagnostic. |

- **Package hierarchy:** Upstream workspace includes `vendor/*`, `packages/*/*`, `apps/*`; study currently includes only `apps/*`, `packages/*/*`. Align ownership and dependencies before implementing shared Include / Loader logic.
- **Classification policy:** Mark items as upstream-aligned only when corresponding source, module owner, signature/contract, key behavior, and tests are verified; label experiments, omitted features, and known drift explicitly. Passing local tests on a mock is not upstream parity.
- **First gate acceptance:** map upstream official `vendor/include/src/patch.ts` behavior to the current custom composer; establish real source-aligned package owner and a test suite for base-entry preservation, root/group insert, id-targeted override, config replacement, warning semantics and input preservation; only then migrate callers. Do not silently replace the implementation without explaining the upstream rationale.
- **Status:** Repo source inspected; study code committed through `56e2ae2`. No corrective implementation edits or parity tests verified yet. The only changes from this audit are the project rules and study documentation.

## Source evidence
- Study: apps/cli/src/args.ts, bin.ts, dump-config.ts, profile-boot.ts.
- Upstream: packages/boot/app-boot/src/profile.ts, especially resolveProfileDir, readProfileManifest, initProfile, loadProfile; apps/cli/src/profile-boot.ts.
- Note: current study resolveProfileDir omits DSH_HOME override contract, intentionally simplified.

## Git and validation
- Branch inspected: main.
- Latest confirmed study **feature code** commit before this docs update: 56e2ae2fb90a7579a4f1bc1c1271abf889a90870. Project root SKILL.md policy commit: f8a42cf4aba8b1978f09e8609ca07b030f5d8e66.
- Learner confirmed an interrupted rebase was completed and subsequent push succeeded (2026-11-12). Remote code verified.
- Local working-tree state: unknown (GitHub read cannot inspect local files). M1-17 source code is committed remotely; local tests/type checks, source parity, and corrective changes have not been independently verified.
- This progress update is a separate remote docs commit on `main`; learners must `git fetch origin` and inspect ahead/behind before making or pushing the next code change. Only fast-forward when safe; never force push or guess through an unfinished rebase.

## Development Rules
- Follow pinned DSH source, explain problems and choices before reference code; learner manually implements.
- **Core learning priority (learner-confirmed, 2026-11-15):** 我们的学习目标是掌握如何构建 Harness，而不是先成为所有 TypeScript 语法的专家。很多语言机制可以在反复参与真实工程的过程中逐渐内化。以实际 Harness 功能链路驱动教学；只深讲当前正确实现所必需的 TS/Node 机制；其他疑问留待相关源码和可运行行为出现时再研究，不把语言知识的穷尽作为进入下一工程环节的前置条件。
- Engineering habit: express known data contracts at boundaries; rely on inference for simple local values; validate untrusted file input at runtime. A TypeScript assertion is not a runtime validator.
- Validate code and existing behavior before each meaningful code commit.
- Favor small changes and avoid unrelated modifications.
- Teach safe Git habits as part of every lesson: inspect status and diffs, check staged diff, explain fetch/ff-only/rebase/merge only as necessary, commit scoped changes, and avoid `--force`, `reset --hard`, or unsafe conflict resolution. Coordinate AI-authored progress commits to avoid surprising remote divergence.
