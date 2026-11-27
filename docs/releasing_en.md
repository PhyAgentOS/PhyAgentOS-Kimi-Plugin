English | [简体中文](releasing_zh.md) · [Home](../README.md)

# Release & Kimi Marketplace Guide

## 1. Updating `@x-era/forge-core` and Rebuilding the Bundle

1. Create a `feature/<topic>` or `fix/<topic>` branch in your personal fork, never directly on upstream `main`.
2. Audit the already-published Core before upgrading. Keep `package.json`, `mcp/package.json`, `mcp/package-lock.json` and compatibility hashes consistent; rebase or remove the plugin patch explicitly. Bump plugin versions in `package.json` and `kimi.plugin.json`. Only the Kimi plugin needs releasing; no extra npm package is published by this workflow.
3. Rebuild and run all gates:
   ```sh
   pnpm install
   pnpm test
   pnpm run build:check
   ```
4. Verify `gh api user --jq .login` before pushing your fork branch and opening a PR to `PhyAgentOS/PhyAgentOS-Kimi-Plugin`.
5. After merging to `main`, create an immutable GitHub Release tag (e.g. `v0.2.0`) — Kimi `/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` installs the latest GitHub Release when present.

## 2. Following Published DSH Releases

`.github/workflows/sync-dsh.yml` checks published `@x-era/dsh-forge` releases daily at 04:23 UTC and supports **Actions → Sync DSH upstream → Run workflow**. Both jobs check out the default branch's verified revision, even when the manual run selects another workflow ref. Leave `version` empty to follow npm `latest`, or enter an exact stable version such as `0.2.2`; ranges, tags and prereleases are rejected.

The local interface is:

```sh
pnpm install --frozen-lockfile
pnpm run sync:dsh -- --check
pnpm run sync:dsh
# Optional: select a specific published stable release for either command.
pnpm run sync:dsh -- --check --version 0.2.2
pnpm run sync:dsh -- --version 0.2.2
```

`--check` reports JSON fields `updateAvailable`, `coreChanged`, `applied`, `previous` and `target` without writing files; package versions are under `target.packages`. The upgrade command defaults to npm `latest`, updates root `dsh-upstream.json` and validates a temporary candidate with dependency installation, the complete `pnpm test` and `pnpm run build:check` before copying changes back. The initial tracking record pins bundle, skill and Core to `0.2.2`. An unchanged upstream is a no-op and writes no files. Review the JSON output and tracking file for the release actually selected; the check and upgrade are separate npm lookups unless `--version` is supplied. To replace a patch after manual review, run `pnpm run sync:dsh -- --version X.Y.Z --patch /path/to/reviewed.patch`; patch replacement can require rebuilding even without an upstream version change.

The workflow separates execution from publishing:

- The `verify` job has only `contents: read`, uses Node 22 and pnpm 12.18.0, and does not persist checkout credentials. Dependency installation and candidate package scripts run only here, without a write token or `DSH_SYNC_TOKEN`. A failed install, upgrade or gate fails the workflow and prevents PR creation.
- Only a successful update uploads a changed-file Git patch. Allowed changes are root package/workspace manifests and lockfile, `dsh-upstream.json`, `patches/` and `mcp/` (including its manifest, lockfile, compatibility data and generated payload). Unexpected changes fail the run. No update means no artifact and no PR.
- A fresh `pull-request` job has `contents: write` and `pull-requests: write`. It checks out the verified base SHA, downloads and applies the patch, checks allowed paths again, and uses `peter-evans/create-pull-request@v7` to create or update `automation/sync-dsh` against the default branch. It does not run npm, pnpm or candidate code. No automatic merge, tag, Release or marketplace submission occurs.

Enable Actions and **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**, subject to organization policy. The default PR credential is `GITHUB_TOKEN`. GitHub currently creates approval-required PR workflow runs for `opened`, `synchronize` and `reopened` events from this token: a repository writer must choose **Approve workflows to run** in the PR merge box. Do not assume the platform CI matrix runs automatically. If a run is absent or blocked by repository policy, a maintainer can trigger CI with a maintainer-authenticated branch update; this repository's current CI has no `workflow_dispatch` trigger. See [GitHub's token-trigger rules](https://docs.github.com/en/actions/concepts/security/github_token).

Optionally set the repository Actions secret `DSH_SYNC_TOKEN` to a fine-grained token limited to this repository with **Contents: read and write** and **Pull requests: read and write**. It is passed only to the PR action, allowing normal PR-triggered CI subject to repository policy. Keep branch protection and required checks enabled; the Ubuntu sync gates do not replace the full platform matrix.

Before merging, review the selected DSH/Core versions, patch migration, both lockfiles, compatibility hashes and generated MCP payload. Documentation references to Core versions are **not** updated automatically; maintainers must update them, decide any plugin version bump and complete manual acceptance. Merge and publish through the existing release process above.

## 3. Submitting to the Public Kimi Marketplace

Per Kimi's official marketplace workflow:
1. Import and install `PhyAgentOS-Kimi-Plugin` in **Kimi Work Desktop** (`Plugins → Custom`) and complete smoke testing.
2. Open the **PhyAgentOS Forge** plugin details page in Kimi.
3. Click the **`✉️`** button in the top-right corner, choose **Apply to Publish to Official Marketplace** (*申请发布到官方市场*), and provide a maintainer contact email.
4. Recommended scope notes for the review team:
   - **Target clients/platforms:** Desktop (`Kimi Work` / `Kimi Code Desktop`) and CLI (`Kimi Code CLI`), local `stdio` MCP (`Node.js >=22`), non-cloud (`macos`, `linux`, `windows`).
   - **Zero-hardware 3-minute reviewer smoke test (works on any Mac/Windows/Linux with Node >=22):**
     1. Run `/phyagentos:env` → verifies `forge_environment_check` and isolated `~/.kimi-code/forge` path.
     2. Run `/phyagentos:skills` → verifies live anonymous query against `https://paos-resource-platform.dev.x-era.com/v1/skills`.
     3. Ask *"Search Forge node repositories for mujoco and read its repository info"* → verifies `forge_repo_search` and `forge_repo_info`.


## 4. Patch, Acceptance and Release Evidence

Read the [core patch maintenance notes](core-patches.md) before upgrading. Core stays external and is fetched from published npm tarballs. Commit patches, workspace config, both lockfiles, compatibility metadata, source, tests and generated MCP payload together. Verify first-use preparation with Node >=22 and npm, cache reuse without network, and a managed plugin copy without bundled `node_modules`. npm-installed originals must remain unchanged.

After full gates and the platform CI matrix pass, complete the [manual acceptance matrix](acceptance_en.md). Reviewers should obtain an actual node artifact ID and exercise `forge_node_info` / `forge_node_source`, not just the static repository catalog.

Record the immutable Release, marketplace submission receipt and official decision separately. These instructions do not assert that publication or approval has occurred.
