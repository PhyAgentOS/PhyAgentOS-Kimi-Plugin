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

## 2. Manually Upgrade Core or Sync DSH Releases

### Select a Core Version Directly

Run in a system terminal at the repository root after committing tracked changes. Replace the example with an exact published stable Core version:

```sh
pnpm upgrade:core 0.2.3
# If the old patch conflicts, review and rebase it before retrying
pnpm upgrade:core 0.2.3 /path/to/rebased.patch
```

Requires Node.js, npm, the specified pnpm version, Git, and tar. The script exports the current Git commit to a temporary copy, updates development and runtime dependencies, both lockfiles, patches and mappings, compatibility metadata, and the complete MCP payload, then runs `pnpm test` and `pnpm run build:check`. Results are copied back only after validation and checks that the commit, tracked checkout, and target files have not changed. Temporary files are always cleaned up. Downgrades are rejected; rebuilding the same version requires a replacement patch.

This entry point does not require DSH to adopt the selected Core and leaves the last synchronized dependency chain in `dsh-upstream.json` unchanged. Review the diff, run `pnpm install --frozen-lockfile` to refresh local dependencies, update plugin and documentation versions, complete manual acceptance, and commit and publish. A later `sync:dsh` invocation refuses to downgrade a manually selected Core to an older DSH Core.

### Follow the DSH Release Dependency Chain

The repository does not schedule upstream checks or automatically create upgrade PRs. Maintainers explicitly run the commands below when an upgrade is needed. The default target is npm `latest`; an exact stable DSH bundle version can also be selected. Version ranges, prereleases, and downgrades are rejected.

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

After a successful upgrade, maintainers review the diff, submit an upgrade PR, and confirm that normal CI passes on all supported platforms. No sync-specific token or Actions PR write permission is required.

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
