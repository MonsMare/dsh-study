# Mini DSH · Source-Guided Code Learning Rules

> This repository is a source-guided reconstruction of DeepSeek Harness, not a new independently designed harness.
> Authoritative upstream: https://github.com/deepseek-ai/deepseek-harness
> Pinned baseline: `fcc0ad462172522aaf5c93a7b2e01f6b9f0b0159`.
> Study progress and outstanding gaps: `docs/progress.md`.

## Hard requirements — learner-confirmed 2026-11-18

1. **Source first.** Before starting or continuing ANY implementation lesson, inspect `docs/progress.md`, relevant study files, recent study commits, and the matching upstream files at the PINNED commit. Do not rely on recollection or current upstream main.
2. **Reconstruct, do not invent.** The goal is to learn why the actual DSH uses its architecture, APIs, dependencies, configuration semantics, and runtime mechanisms, then manually reconstruct them. Do not replace a real upstream module or algorithm with a bespoke "simplified equivalent" and present it as the implementation.
3. **Respect ownership and boundaries.** Match upstream package/module responsibilities (`apps/cli`, `packages/boot/app-boot`, `vendor/include`, `vendor/loader`, etc.) and dependency direction for the subset being reconstructed. Never put a reimplementation of a shared framework mechanism into CLI for convenience.
4. **Explicit source evidence BEFORE code.** Each lesson must identify the actual upstream path, entry/contract, role in the call chain, key algorithm, dependencies and essential semantics; explain the problem and design rationale FIRST. Compare the existing study implementation to those facts. Only then provide manually implementable code.
5. **Scope reduction is allowed; semantic replacement is not.** Do not import the entire upstream repo into the study. Temporarily omitted features must be listed as missing, with reasons and follow-up acceptance gates. A learning experiment must be explicitly identified as disposable and must not silently become the canonical engine. Do not invent CLI flags/interfaces as substitutes for official contracts.
6. **Parity tests are the gate.** For each implemented feature, check signature, module ownership, error behavior, ordering and side effects against upstream, using fixture-based tests (prefer identical inputs / expected outputs) before marking it completed. A passing TypeScript check or toy test is insufficient evidence of parity.
7. **No blind copying or syntax quizzes.** Learner manually types and runs code; tutor explains why each file/change exists, gives accurate minimal code with source citation, verifies what is actually committed and separately records unobserved local test results. Teach TS/Node as needed for real engineering, not as a detour.
8. **Stop on drift.** If a discrepancy is found, stop new feature development. Record the exact mismatch, upstream evidence and restoration plan in `docs/progress.md`; repair/verify before proceeding. Do not rationalize it as "simpler", "more practical", or "basically equivalent" without explicit learner approval.
9. **Safe Git and filesystem.** Do not modify real `~/.dsh` during exercises. Verify branch, status/diffs and remote history; do not overwrite user work, force-push, or assume tests were run. AI may maintain `docs/progress.md` as the established workflow, but the learner owns implementation unless explicitly authorized.
10. **Do not declare completed prematurely.** Distinguish source committed on GitHub, learner-reported tests, actual tool-verified tests, upstream-aligned behavior, and features not implemented.

## Required alignment checklist for every later lesson

- Upstream exact file + pinned commit + function/contract:
- Why upstream designed it this way; relevant dependency path:
- Existing study path/code and precise gap:
- Scope: faithful reconstruction / explicitly temporary experiment / deferred:
- Change list and what is intentionally NOT changed:
- Verification: types + runtime cases + upstream parity and regression:
- Only when verified: update `docs/progress.md` with evidence and next lesson.

## Current work gate

**STOP new features.** Audit and restore the existing CLI → Profile → Bundle → YAML Patch → Entry composition chain to upstream ownership and semantics before introducing Cordis runtime functionality. Treat the study-only `--preview-config` as a diagnostic experiment, not upstream `--dump-config`.
