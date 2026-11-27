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

## 2. Submitting to the Public Kimi Marketplace

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


## 3. Patch, Acceptance and Release Evidence

Read the [core patch maintenance notes](core-patches.md) before upgrading. Core stays external and is fetched from published npm tarballs. Commit patches, workspace config, both lockfiles, compatibility metadata, source, tests and generated MCP payload together. Verify first-use preparation with Node >=22 and npm, cache reuse without network, and a managed plugin copy without bundled `node_modules`. npm-installed originals must remain unchanged.

After full gates and the platform CI matrix pass, complete the [manual acceptance matrix](acceptance_en.md). Reviewers should obtain an actual node artifact ID and exercise `forge_node_info` / `forge_node_source`, not just the static repository catalog.

Record the immutable Release, marketplace submission receipt and official decision separately. These instructions do not assert that publication or approval has occurred.
