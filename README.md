English | [简体中文](README_zh.md)

# PhyAgentOS-Kimi-Plugin

Kimi plugin for installing, inspecting, diagnosing, and running [PhyAgentOS Forge](https://github.com/PhyAgentOS/forge) robot and physics-simulation skills (Dora dataflows, node artifacts, MuJoCo simulation, and Gateway Tool API) in **Kimi Work Desktop** and **Kimi Code** (CLI / Desktop / VS Code).

[User Guide](docs/usage_en.md) · [Design Docs](docs/design/README.md) · [Release & Marketplace Guide](docs/releasing_en.md) · [Upstream Forge Core](https://github.com/PhyAgentOS/PhyAgentOS-DSH-Plugin)


Maintenance: [Core compatibility and npm audit](docs/core-patches.md) · [Acceptance checklist](docs/acceptance_en.md). Publish only the Kimi plugin. First startup installs the published, locked Core dependency and creates a private compatibility copy without modifying npm-installed originals. Shared model roots remain read-only. Windows ACLs and real simulation require separate host acceptance.

## Highlights

- **Plugin-only Releases, Published npm Dependencies:** `mcp/forge-mcp.mjs` bootstraps the Kimi-only `mcp/adapter.mjs`; Core is external. First startup runs `npm ci --omit=dev --ignore-scripts` for locked `@x-era/dsh-forge@0.2.2`, its transitive `@x-era/forge-core@0.2.2`, and the other locked dependencies under `<home>/plugin-runtime/<content-id>/`, prepares compatibility files, and starts MCP. Later starts reuse the local runtime; no additional npm package publication or user compilation is required.
- **Strict Host Isolation:** Defaults its data root to `~/.kimi-code/forge` (following `$KIMI_CODE_HOME/forge`), keeping `runtime/state.json`, `runtime/forge.lock`, skills, and pinned Dora binaries completely isolated from `~/.dsh/forge`.
- **Full 41-Tool Forge Surface:** Covers environment checks & Dora 0.4.1 / 1.0.1 bootstrap, PAOS Registry discovery, background bundle installation, local bundle validation/packaging, node source provenance, shared model verification, Dora runtime control, and asynchronous Gateway invocation reconciliation.
- **Built-in Physical Safety Guardrails:** Injects mandatory `SYSTEM.md` runtime safety rules plus two on-demand skills (`/skill:phyagentos:forge-usage`, `/skill:phyagentos:forge-skill-development`) and four slash commands (`/phyagentos:env`, `/phyagentos:skills`, `/phyagentos:doctor`, `/phyagentos:export-skill`).

## Prerequisites

- **Node.js `>=22` and npm** on the MCP machine (`node --version`, `npm --version`). First startup needs the npm tarball locations in the lockfile to be reachable or cached; prepared runtimes support offline startup. Installation logs go to stderr, failures can be retried, and MCP startup allows 300 seconds. npm preparation uses npm's own proxy configuration. After preparation, MCP initializes its global dispatcher from proxy environment variables before loading Core, supplying the proxy setup performed by the DSH host.
- **Supported Kimi Hosts:**
  - **Kimi Work Desktop** (macOS / Windows)
  - **Kimi Code** (CLI, Desktop, and VS Code extension on Linux, macOS, and Windows)
  - *Note:* Pure cloud **Kimi Web (`Chat` sandbox)** cannot spawn local `stdio` MCP processes or access local robot/simulation gateways (`127.0.0.1`).
- **Platform Note for Precompiled Robot Nodes:** Registry-published binary node artifacts (such as `robot-control-sim`) primarily target `linux/x86_64`. On macOS/Windows desktops, discovery, inspection, source lookup, bundle packaging, and Python source flows run locally; to run `linux/x86_64` MuJoCo or real robot hardware from Kimi Desktop, bind the MCP server's `environment_id` to a Linux SSH host (see [User Guide](docs/usage_en.md)).

## Quick Start

### First Deployment on a New Machine: Check and Prepare Dependencies

Install **Node.js `>=22` and npm** first, and make sure both `node` and `npm` are available in the environment that launches Kimi. Open a terminal in the plugin root (the directory containing `kimi.plugin.json` and `mcp/`) and run:

```sh
node --version
npm --version
node ./mcp/forge-mcp.mjs --prepare-only
```

The first two commands check the Node.js version and npm availability; they do not install either program. The third prepares only the plugin's npm dependencies and Core compatibility copy. It does not start an MCP session or install Dora, robot skills, or models. Initial preparation needs the npm tarballs specified in the lockfile to be reachable or cached. On success, stderr reports `Runtime ready: ...`; the default cache directory is `~/.kimi-code/forge/plugin-runtime/<content-id>/`.

Preparation is optional: the first MCP startup performs it automatically if needed. Normal users do not need pnpm, a source build, or a copy of the old machine's `node_modules`. After preparation, install the plugin using either option below.

### Option A: Kimi Work Desktop (`+ Custom plugin`)

1. Open **Kimi** desktop client, switch to **Work** (or **Plugins** → **+ Custom plugin**).
2. Send the repository URL `https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` (or local path) to **Plugin Builder**.
3. Open **Plugins → Custom**, click **Install** on **PhyAgentOS Forge**, and start a new session.

### Option B: Kimi Code CLI / Desktop

```sh
# Install from GitHub or a local checkout
/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin
# or: /plugins install /path/to/PhyAgentOS-Kimi-Plugin

# Activate in the session
/reload
```

### Proxy configuration

Set proxy environment variables before launching Kimi, or place them in `$KIMI_CODE_HOME/.env` (default `~/.kimi-code/.env`; `%USERPROFILE%\.kimi-code\.env` on Windows), then fully restart Kimi/MCP:

```dotenv
HTTP_PROXY=http://127.0.0.1:YOUR_HTTP_OR_MIXED_PORT
HTTPS_PROXY=http://127.0.0.1:YOUR_HTTP_OR_MIXED_PORT
NO_PROXY=localhost,127.0.0.1,::1,192.168.0.0/16,10.0.0.0/8
```

Replace the placeholder with the actual listening port. No port is hardcoded or scanned; OS/Clash settings are not read. The proxy must be reachable from the MCP machine/container; loopback refers to that environment. Only proxy keys are loaded from the user file; project `.env` and DSH files are never read, and no shell commands are executed.

Nonempty inherited process settings take precedence over the user file, across uppercase/lowercase spellings. Within each source, lowercase wins and empty values are unset. HTTP selects HTTP_PROXY, ALL_PROXY, then direct; HTTPS selects HTTPS_PROXY, ALL_PROXY, HTTP_PROXY, then direct. An invalid address or unsupported protocol produces a sanitized warning and makes the corresponding requests direct without trying a lower-priority proxy. Connection failures of valid proxies still fail without direct fallback.

Runtime HTTP/HTTPS and SOCKS5/socks5h support is retained. Loopback Gateways always bypass proxies, including redirects. NO_PROXY supports domain rules and CIDR for literal IP origins without DNS lookups. Absent proxy settings preserve host routing.

The user file is also loaded before the first npm install, and selected HTTP(S) proxies are forwarded to npm. Explicit npm_config_proxy / npm_config_https_proxy settings win. Use an HTTP/Mixed port for npm bootstrap; SOCKS-only settings emit guidance to configure an npm HTTP proxy. `undici@7.30.2` remains an external npm dependency; SOCKS5 support emits an experimental warning. Logs omit proxy URLs and credentials. Machine-specific ports and credentials stay in the user directory rather than the portable plugin payload.

### First Conversation

Run `/phyagentos:env` or ask in natural language:

| Goal | Example Prompt / Command | Primary Tools |
| --- | --- | --- |
| Check environment | `/phyagentos:env` | `forge_environment_check`, `forge_config_read` |
| Bootstrap Dora 0.4.1 & 1.0.1 | "Preview and install Forge's pinned `dora` and `dora1` under `~/.kimi-code/forge/support/`." | `forge_environment_setup` |
| Browse skills | `/phyagentos:skills robot` | `forge_skill_list`, `forge_skill_search` |
| Install simulation skill | "Install `robot-control-sim` and track the download job until complete." | `forge_skill_install`, `forge_install_status` |
| Diagnose a skill | `/phyagentos:doctor robot-control-sim mujoco-piper` | `forge_skill_inspect`, `forge_skill_doctor` |
| Start & query simulation | "Start `robot-control-sim` with profile `mujoco-piper`, then call `sim.get_robot_info`." | `forge_runtime_start`, `forge_tool_call` |
| Export to Kimi `/skill:` | `/phyagentos:export-skill robot-control-sim` | `forge_skill_export` (`kimi_skills: true`) |

## Isolated Data Directory & Configuration

Data root resolution order:
1. `KIMI_FORGE_HOME`
2. `DSH_FORGE_HOME`
3. `$KIMI_CODE_HOME/forge` (defaults to `~/.kimi-code/forge`)

Host configuration lives in `<home>/config.json` (managed safely with `0600` atomic writes and `.bak-*` backups via `forge_config_read` / `forge_config_write` / `forge_config_restore`). To reuse an existing multi-GB model weights directory read-only without sharing runtime state, set `models.root`:

```json
{
  "models": {
    "root": "/data/shared-forge-models"
  }
}
```

## npm Dependencies & Updates

### Dependency Model

Among Forge packages, this plugin directly depends only on the npm bundle **`@x-era/dsh-forge@0.2.2`**. **`@x-era/forge-core`** is a transitive dependency through `@x-era/dsh-forge-skill`, not an independent entry in either development or runtime `dependencies`. The current locked chain is `@x-era/dsh-forge@0.2.2 → @x-era/dsh-forge-skill@0.2.2 → @x-era/forge-core@0.2.2`; `undici` remains a separate direct npm dependency. Installing the DSH package does not launch the DSH host; Kimi continues to call the shared Core through its own adapter:

```text
Upstream npm dependency chain:
@x-era/dsh-forge → @x-era/dsh-forge-skill → @x-era/forge-core

Kimi runtime call chain:
Kimi → this plugin's MCP adapter → @x-era/forge-core
```

The three tracked package versions are recorded in [`dsh-upstream.json`](dsh-upstream.json). `package.json` and `mcp/package.json` pin the DSH bundle; `pnpm-lock.yaml` and `mcp/package-lock.json` lock the resolved Skill and Core versions. The compatibility patch targets that transitive Core version. First startup installs the locked dependencies; later starts reuse the cache rather than fetching the newest npm release on every launch.

### Maintainers: Manually Sync Upstream Releases

The repository has no scheduled update checks or automatic upgrade PR workflow. To upgrade, maintainers explicitly run the local commands below. The script queries the npm `latest` release of `@x-era/dsh-forge`, follows its dependency chain to resolve exact stable Skill and Core versions, compares them with `dsh-upstream.json`, and rejects downgrades.

Updates are prepared in a temporary copy. Sync maintains the DSH bundle dependency in both manifests, both lockfiles, `dsh-upstream.json`, compatibility patches and mappings, compatibility hashes, and generated MCP payload for the resolved transitive Core. It does not add an independent Core dependency. Changes are copied back only after `pnpm test` and `pnpm run build:check` pass; failures stop the upgrade. With no version change or replacement patch, sync writes no files. Maintainers review the diff, submit a PR, adjust the plugin version, and publish. See the [release guide](docs/releasing_en.md).

Local maintenance commands (require **pnpm `12.18.0`**, matching the `packageManager` declaration in `package.json`):

```sh
pnpm install --frozen-lockfile
# Check only: print version comparison JSON without changing files
pnpm run sync:dsh -- --check
# Apply the sync and run full validation
pnpm run sync:dsh
# Optional: select an exact stable DSH bundle version; downgrades remain blocked
pnpm run sync:dsh -- --check --version 0.2.2
pnpm run sync:dsh -- --version 0.2.2
# Optional: use a reviewed replacement Core patch for that bundle's dependency chain
pnpm run sync:dsh -- --version 0.2.2 --patch /path/to/reviewed.patch
```

`--version` selects the DSH bundle, not Core independently; use it for both check and apply to keep the selected release fixed. A replacement patch can trigger a rebuild even when package versions are unchanged. After a successful sync, review `git diff` and run `pnpm install --frozen-lockfile` to refresh local development dependencies.

If Core is unchanged, the DSH bundle dependency, lockfiles, and tracking record are still updated and validated when the bundle or Skill changes. DSH-specific UI, tool registration, prompts, and Kimi adapter code for new tools are not migrated automatically. Plugin version bumps and documentation version references remain manual. Sync does not modify users' installed skills, models, configuration, or runtime data.

### Users: Get Plugin Updates

After maintainers publish a new version, update the Kimi plugin through the original installation channel. The bootstrap prepares the runtime specified by the new plugin's lockfile. Normal users do not need the maintenance commands above or a manual `npm update`.

#### Update a Local Directory Installation

Kimi runs a managed copy created during installation. After changing the original checkout, **`/reload` alone does not copy the new code; reinstall the plugin first**.

1. Make sure the local plugin directory contains the latest code. If the changes were made directly in that directory, no additional pull is needed. The example uses `/home/gx/X-era/PhyAgentOS-Kimi-Plugin`; replace it on other machines.
2. If a simulation is running, enter the following prompt in Kimi and confirm it has stopped before updating:

   ```text
   Stop the running robot-control-sim instance, then query its runtime status and confirm that it has stopped.
   ```

3. Enter these commands separately in the **Kimi conversation** to reinstall and activate:

   ```text
   /plugins install /home/gx/X-era/PhyAgentOS-Kimi-Plugin
   ```

   ```text
   /reload
   ```

4. Check the plugin and MCP status separately:

   ```text
   /plugins info phyagentos
   ```

   ```text
   /mcp
   ```

   Confirm that the plugin is enabled and the `forge` MCP server connects successfully. If old code is still loaded, fully exit and restart Kimi, then check again. On connection failure, keep the complete error and pause subsequent functional tests.

#### Update a GitHub Installation

Enter `/plugins` in Kimi, open **Installed**, and select this plugin. When an update is available, press **Enter** to install it, run `/reload`, and verify with `/plugins info phyagentos` and `/mcp`. Stop any running simulation before updating.

A plain GitHub repository URL defaults to the latest Release and falls back to the default branch when no Release exists. Pushing branch code alone may therefore not make an update available through the original URL. Installations using an explicit branch, tag, or commit follow that source; reinstall from the appropriate URL to switch references.

See the [official Kimi Code plugin documentation](https://www.kimi.com/code/docs/kimi-code-cli/customization/plugins) for plugin management and managed copies.

## Development & Verification

```sh
pnpm install --frozen-lockfile
pnpm test
```

`pnpm test` builds the external-Core adapter and bootstrap, validates the manifest, skills, commands, locales and containment, and runs the suite. Managed copies ship without `node_modules`; tests exercise npm preparation, cache reuse, the compatibility copy, all 41 tools, and `~/.dsh` isolation. First-install tests need reachable or cached npm tarballs.

## Manual Acceptance in Kimi

Enter the following commands and prompts one at a time in the **Kimi conversation**, not in a system terminal. The example assumes Linux x86_64, a local checkout at `/home/gx/X-era/PhyAgentOS-Kimi-Plugin`, and a fresh environment without a data-root override. Replace the checkout path on other machines; the data root follows your actual configuration. These are acceptance instructions, not a report of completed tests.

### 1. Install the Plugin and Confirm MCP Connectivity

Enter each command separately:

```text
/plugins install /home/gx/X-era/PhyAgentOS-Kimi-Plugin
```

```text
/reload
```

```text
/plugins info phyagentos
```

```text
/mcp
```

**Pass criteria:** The plugin is enabled and the `forge` MCP server connects successfully. The first connection needs network access to download Core and other locked dependencies unless cached. The manifest allows 300 seconds for startup. On failure, keep the complete error message and stop subsequent tests.

### 2. Check the Environment and Registry Access

Enter:

```text
/phyagentos:env
```

**Expected:** In the example environment, the platform is Linux x86_64 and the Forge root is `/home/gx/.kimi-code/forge`. The check may detect a global Dora installation and report a missing `dora1`; use the actual output. Creating or recreating the Forge directory on first startup is expected.

Then enter:

```text
/phyagentos:skills robot
```

**Pass criteria:** A fresh data directory has no locally installed skills, and registry search returns results. An existing environment may list installed skills; do not delete data to obtain an empty list. This step establishes actual registry connectivity.

### 3. Test Skill Installation, Diagnostics, and Simulation

Enter:

```text
Install robot-control-sim and poll forge_install_status until the task reaches a terminal state.
On success, list the skill's available profiles. On failure, report the error and stop without starting simulation.
```

If the returned profiles include `mujoco-piper`, continue. Otherwise, record the actual list and stop this simulation test:

```text
/phyagentos:doctor robot-control-sim mujoco-piper
```

Once diagnostics report no blocking issues, enter:

```text
Start the mujoco-piper profile of robot-control-sim.
Wait for the Gateway to become ready, then call sim.get_robot_info.
Only verify simulation and status queries; do not execute motion commands.
```

**Pass criteria:** Installation succeeds, diagnostics have no blocking issues, the Gateway is ready, and the query returns robot information. A process PID alone does not establish successful simulation startup. On failure, keep the error and stop further functional tests.

### 4. Stop the Instance and Confirm Cleanup

At the end of the test, enter the following. Also perform this cleanup if startup verification failed after creating a process:

```text
Stop the running robot-control-sim instance, then query its runtime status and confirm that it has stopped.
```

**Pass criteria:** Runtime status confirms that the instance has stopped.

## License

MIT, see [LICENSE](LICENSE).
