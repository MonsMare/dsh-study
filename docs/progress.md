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
- **M1-18 static configuration alignment — GitHub CI PASS; learner-reported local typecheck and alignment tests PASS (2026-11-18).** Fix branch `fix/m1-18-source-alignment` / PR #1 restored upstream-like ownership for CLI args, app-boot Profile and YAML dumping, Include Patch algorithm, Loader entry contract, Home Paths / Manifest / Bundle metadata, and generated `pnpm-lock.yaml`.
- GitHub Actions [run 44258022953](https://github.com/MonsMare/dsh-study/actions/runs/44258022953) completed **SUCCESS** on Node 24 and pnpm 11.28.5: frozen install, CLI TS typecheck, source-chain behavior tests, and six pinned upstream `applyPatches` parity fixtures.
- **Not implemented:** live Cordis loader/agent loop, runtime plugin lifecycle, HMR/journal, native schema dump, plugin management, full profile compatibility and legacy migration, and `--from-default-profile`. These remain explicitly blocked or deferred, never represented as supported.
- Learner confirmed the corrected code was synced locally and the previously supplied local checks completed without errors (2026-11-18). Treat this as user-reported Windows-local validation, not independently captured logs; whether the optional local `test:parity` was run is unspecified (CI parity PASS). Current lesson: compare pre- and post-alignment source to bridge the conceptual gap before new feature development.
- Source-first requirement: before any next module, read root `SKILL.md`, current progress, recent commits and pinned upstream exact implementations.

## Source-alignment audit (2026-11-18; remediated in PR #1 static-slice scope)

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
- **Status:** Historical discrepancies below refer to pre-M1-18 code. The PR #1 correction removed CLI-local substitutes, restored source-backed static modules and tests. Node24/pnpm11 GitHub Actions [run 44258022953](https://github.com/MonsMare/dsh-study/actions/runs/44258022953) **PASS**; local Windows and unimplemented runtime/compatibility scope remain separate.

## Source evidence
- Study: apps/cli/src/args.ts, bin.ts, dump-config.ts, profile-boot.ts.
- Upstream: packages/boot/app-boot/src/profile.ts, especially resolveProfileDir, readProfileManifest, initProfile, loadProfile; apps/cli/src/profile-boot.ts.
- Note: current study resolveProfileDir omits DSH_HOME override contract, intentionally simplified.

## Git and validation
- M1-18 PR #1 source-aligned branch verified via Actions run 44258022953: frozen pnpm lockfile, TS, runtime fixture and exact upstream patch-function parity all succeeded. Cross-platform learner-local tests not observed.
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
