# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [2.0.0-alpha.1] - 2026-10-08

### Changed

- Package renamed to `@noflo/core`; the version resets to the 2.x generation (2.0.0-alpha.1) for the fresh package name. Component addressing is unchanged — library IDs derive identically from the scoped name, so component and graph names stay the same. The old `noflo-core` will be deprecated with a pointer once 2.x reaches stable
- Migrated to NoFlo 2.x: components now depend on `@noflo/noflo` ^2.0.0 instead of the unscoped `noflo` 1.x package; components export a named `getComponent`
- Package is now plain ESM with no build step; supported runtime is Node.js >= 22 (components also run under Deno and Bun); indentation normalized to spaces per the repository EditorConfig
- Removed the `owl-deepcopy` dependency: `core/Copy` now uses the Web-standard `structuredClone`, passing non-cloneable values (e.g. functions) through by reference on clone failure
- `core/ReadGlobal` reads variables via `globalThis`, replacing the `isBrowser()` branch
- `core/Split`, `core/Merge`, and `core/Repeat` now rely on NoFlo 2.x automatic bracket forwarding instead of manually reading bracket IPs; bracket-only streams (groups without data) no longer produce output, matching 2.x actual-sends semantics
- `core/Drop` no longer uses the removed `IP.drop()` API and fixes a `datatypes` typo in its port definition
- `core/RunTimeout` fixes a bug where a fired timeout reset the whole per-scope timer map to `null`, crashing later starts
- Generator components (`RunInterval`, `RunTimeout`, `RepeatDelayed`, `DisconnectAfterPacket`) keep their timer/bracket state in the component closure instead of on the instance, with async `tearDown` cleanup
- `core/MakeFunction` drops an unreachable branch that sent the prepared function without evaluating it (the `function` port is a control port and never fires the process function)
- Test suite now runs with `@noflo/fbp-spec-runner` and `node:test` instead of Mocha with the webpack-inject setup; removed the empty `index.js` stub
