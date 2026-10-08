#!/usr/bin/env node
/**
 * @file scripts/release.js
 * @description Cut a release for this single-package library repository.
 *
 * Mirrors the flow of the core monorepo's scripts/release.js, scaled down:
 *
 *   1. preflight — clean tree, valid version, tag v<version> not taken
 *   2. version   — write the package.json version and stamp CHANGELOG.md
 *                  `[Unreleased]` -> `[<version>]` with the release date
 *                  (only when the Unreleased segment has content)
 *   3. commit    — one `Release v<version>` commit; skipped when the stamp
 *                  and version already happened (nothing to commit)
 *   4. tag       — `v<version>`
 *   5. push      — branch + tag (skip with --no-push)
 *
 * npm publishing is intentionally NOT part of this script: the first
 * publish of each @noflo/* package is manual (npm OIDC trusted publishing
 * cannot create packages), and later versions publish from the v* tag via
 * the publish workflow, which skips versions that already exist on the
 * registry.
 *
 * Usage: node scripts/release.js <version> [--date YYYY-MM-DD] [--no-push] [--dry-run]
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

/** @param {string[]} args */
const parseArgs = (args) => {
  const [version] = args.filter((a) => !a.startsWith("--"));
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  return { version, dryRun: flags.has("--dry-run"), noPush: flags.has("--no-push") };
};

const run = (cmd, dryRun) => {
  console.log(`  $ ${cmd}`);
  if (!dryRun) execSync(cmd, { cwd: root, stdio: "inherit" });
};

const git = (cmd) => execSync(`git ${cmd}`, { cwd: root }).toString().trim();

const main = () => {
  const { version, dryRun, noPush } = parseArgs(process.argv.slice(2));
  if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
    throw new Error(`Invalid version "${version ?? ""}" (expected x.y.z[-prerelease])`);
  }
  const date = new Date().toISOString().slice(0, 10);

  if (git("status --porcelain") !== "") {
    throw new Error("Working tree is dirty. Commit or stash before releasing.");
  }
  const tag = `v${version}`;
  const tags = git("tag --list");
  if (tags.split("\n").includes(tag)) {
    throw new Error(`Tag ${tag} already exists`);
  }

  console.log(`Release ${version} (${date})${dryRun ? "  [DRY-RUN]" : ""}\n`);

  // Version + changelog stamp; skipped when already applied
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const changelogPath = resolve(root, "CHANGELOG.md");
  let changes = false;
  if (packageJson.version !== version) {
    packageJson.version = version;
    if (!dryRun) {
      writeFileSync(resolve(root, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
    }
    changes = true;
  }
  const changelog = readFileSync(changelogPath, "utf8");
  const unreleased = /## Unreleased\n\n([\s\S]*?)(?=\n## \[|$)/;
  const body = changelog.match(unreleased)?.[1]?.trim();
  if (body) {
    const stamped = changelog.replace(
      unreleased,
      `## Unreleased\n\n## [${version}] - ${date}\n\n${body}\n`,
    );
    if (!dryRun) writeFileSync(changelogPath, stamped);
    changes = true;
  }

  if (changes) {
    run(`git add -A && git commit -m "Release v${version}"`, dryRun);
  } else {
    console.log("Version and changelog already at target; no release commit needed");
  }

  run(`git tag ${tag}`, dryRun);
  if (!noPush) {
    run("git push origin HEAD", dryRun);
    run(`git push origin ${tag}`, dryRun);
  }
  console.log(`\nRelease ${tag} done. The publish workflow publishes it unless the version already exists on the registry.`);
};

main();
