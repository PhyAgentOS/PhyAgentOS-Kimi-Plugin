English | [简体中文](releasing_zh.md) · [Home](../README.md)

# Release & Kimi Marketplace Guide

## 1. Updating the DSH Bundle and Rebuilding the Plugin

1. Create a `feature/<topic>` or `fix/<topic>` branch in your personal fork, never directly on upstream `main`.
2. Audit the published DSH bundle and its transitive Core before upgrading, then use `sync:dsh` as described below. Sync maintains the bundle pins in `package.json` and `mcp/package.json`, both lockfiles, `dsh-upstream.json`, compatibility patches and hashes, and generated MCP payload. Review whether each local patch should be rebased or removed. Bump plugin versions in `package.json` and `kimi.plugin.json`. Only the Kimi plugin needs releasing; no extra npm package is published by this workflow.
3. Rebuild and run all gates:
   ```sh
   pnpm install
   pnpm test
   pnpm run build:check
   ```
4. Verify `gh api user --jq .login` before pushing your fork branch and opening a PR to `PhyAgentOS/PhyAgentOS-Kimi-Plugin`.
5. After merging to `main`, create an immutable GitHub Release tag (e.g. `v0.2.0`) — Kimi `/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` installs the latest GitHub Release when present.

## 2. Manually Sync the DSH Release Dependency Chain

Among Forge packages, only `@x-era/dsh-forge` is a direct dependency in development and runtime manifests. Core comes through `@x-era/dsh-forge → @x-era/dsh-forge-skill → @x-era/forge-core`; the current locked chain is `0.2.2 → 0.2.2 → 0.2.2`. `undici` remains a separate direct dependency. Core is upgraded through this bundle chain rather than selected independently.

The repository does not schedule upstream checks or automatically create upgrade PRs. Maintainers explicitly run the commands below in a system terminal at the repository root when an upgrade is needed. Node.js, npm, pnpm `12.18.0` (as declared in `package.json`), Git, and tar are required. The default target is npm `latest`; an exact stable DSH bundle version can also be selected. Version ranges, prereleases, and downgrades are rejected.

The local interface is:

```sh
pnpm install --frozen-lockfile
pnpm run sync:dsh -- --check
pnpm run sync:dsh
# Optional: select a specific published stable release for either command.
pnpm run sync:dsh -- --check --version 0.2.2
pnpm run sync:dsh -- --version 0.2.2
# Optional: apply a reviewed replacement patch to the Core resolved by this bundle.
pnpm run sync:dsh -- --version 0.2.2 --patch /path/to/reviewed.patch
```

`--check` reports JSON fields `updateAvailable`, `coreChanged`, `applied`, `previous` and `target` without writing files; package versions are under `target.packages`. `--version` selects the DSH bundle, not Core independently. Review the JSON output and tracking file for the selected release; check and apply are separate npm lookups unless the same exact `--version` is supplied to both.

Sync maintains the direct bundle pin in both manifests, `pnpm-lock.yaml`, `mcp/package-lock.json`, and `dsh-upstream.json`, including bundle or Skill updates where Core is unchanged. It also maintains the resolved transitive Core's patch and mapping, compatibility hashes, and generated MCP payload without adding a direct Core dependency. A temporary candidate is installed and validated with the complete `pnpm test` and `pnpm run build:check` before changes are copied back; validation failures do not promote the candidate. With no version change or replacement patch, sync writes no files. A reviewed replacement patch can trigger rebuilding even when package versions are unchanged.

After a successful upgrade, maintainers review `git diff`, run `pnpm install --frozen-lockfile` to refresh local dependencies, submit an upgrade PR, and confirm that normal CI passes on all supported platforms. No sync-specific token or Actions PR write permission is required.

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
