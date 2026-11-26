English | [简体中文](README_zh.md)

# PhyAgentOS-Kimi-Plugin

Kimi plugin for installing, inspecting, diagnosing, and running [PhyAgentOS Forge](https://github.com/PhyAgentOS/forge) robot and physics-simulation skills (Dora dataflows, node artifacts, MuJoCo simulation, and Gateway Tool API) in **Kimi Work Desktop** and **Kimi Code** (CLI / Desktop / VS Code).

[User Guide](docs/usage_en.md) · [Design Docs](docs/design/README.md) · [Release & Marketplace Guide](docs/releasing_en.md) · [Upstream Forge Core](https://github.com/PhyAgentOS/PhyAgentOS-DSH-Plugin)


Maintenance: [Core compatibility and npm audit](docs/core-patches.md) · [Acceptance checklist](docs/acceptance_en.md). Publish only the Kimi plugin. First startup installs the published, locked Core dependency and creates a private compatibility copy without modifying npm-installed originals. Shared model roots remain read-only. Windows ACLs and real simulation require separate host acceptance.

## Highlights

- **Plugin-only Releases, Published npm Dependencies:** `mcp/forge-mcp.mjs` bootstraps the Kimi-only `mcp/adapter.mjs`; Core is external. First startup runs `npm ci --omit=dev --ignore-scripts` for locked `@x-era/forge-core@0.2.0` and its dependencies under `<home>/plugin-runtime/<content-id>/`, prepares compatibility files, and starts MCP. Later starts reuse the local runtime; no additional npm package publication or user compilation is required.
- **Strict Host Isolation:** Defaults its data root to `~/.kimi-code/forge` (following `$KIMI_CODE_HOME/forge`), keeping `runtime/state.json`, `runtime/forge.lock`, skills, and pinned Dora binaries completely isolated from `~/.dsh/forge`.
- **Full 41-Tool Forge Surface:** Covers environment checks & Dora 0.4.1 / 1.0.1 bootstrap, PAOS Registry discovery, background bundle installation, local bundle validation/packaging, node source provenance, shared model verification, Dora runtime control, and asynchronous Gateway invocation reconciliation.
- **Built-in Physical Safety Guardrails:** Injects mandatory `SYSTEM.md` runtime safety rules plus two on-demand skills (`/skill:phyagentos:forge-usage`, `/skill:phyagentos:forge-skill-development`) and four slash commands (`/phyagentos:env`, `/phyagentos:skills`, `/phyagentos:doctor`, `/phyagentos:export-skill`).

## Prerequisites

- **Node.js `>=22` and npm** on the MCP machine (`node --version`, `npm --version`). First startup needs the npm tarball locations in the lockfile to be reachable or cached; prepared runtimes support offline startup. Installation logs go to stderr, failures can be retried, and MCP startup allows 300 seconds. npm preparation uses npm's own proxy configuration. After preparation, MCP initializes its global dispatcher from proxy environment variables before loading Core, supplying the proxy setup performed by the DSH host.
- Optionally run `node ./mcp/forge-mcp.mjs --prepare-only` from the installed plugin directory to prepare dependencies before opening a session.
- **Supported Kimi Hosts:**
  - **Kimi Work Desktop** (macOS / Windows)
  - **Kimi Code** (CLI, Desktop, and VS Code extension on Linux, macOS, and Windows)
  - *Note:* Pure cloud **Kimi Web (`Chat` sandbox)** cannot spawn local `stdio` MCP processes or access local robot/simulation gateways (`127.0.0.1`).
- **Platform Note for Precompiled Robot Nodes:** Registry-published binary node artifacts (such as `robot-control-sim`) primarily target `linux/x86_64`. On macOS/Windows desktops, discovery, inspection, source lookup, bundle packaging, and Python source flows run locally; to run `linux/x86_64` MuJoCo or real robot hardware from Kimi Desktop, bind the MCP server's `environment_id` to a Linux SSH host (see [User Guide](docs/usage_en.md)).

## Quick Start

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

Set environment variables before launching Kimi and restart the MCP session after updating:

```sh
export ALL_PROXY=socks5://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1,::1,192.168.0.0/16,10.0.0.0/8
```

Lowercase names take precedence. HTTP selects HTTP_PROXY then ALL_PROXY; HTTPS selects HTTPS_PROXY, ALL_PROXY, then HTTP_PROXY, matching DSH's selection order. Unlike the inspected DSH host, Kimi also accepts SOCKS5/socks5h for desktop environments that supply only ALL_PROXY. Loopback Gateways always bypass proxies, including redirects. NO_PROXY supports domain rules and CIDR for literal IP origins, without extra DNS lookups. Failed proxies do not silently fall back to direct connections; absent proxy variables leave host routing untouched.
`undici@7.30.2` remains an external npm dependency; its SOCKS5 support emits an experimental warning. Status logs omit proxy URLs and credentials. This does not read OS/Clash settings or change npm's first-install proxy handling.

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

## Development & Verification

```sh
pnpm install --frozen-lockfile
pnpm test
```

`pnpm test` builds the external-Core adapter and bootstrap, validates the manifest, skills, commands, locales and containment, and runs the suite. Managed copies ship without `node_modules`; tests exercise npm preparation, cache reuse, the compatibility copy, all 41 tools, and `~/.dsh` isolation. First-install tests need reachable or cached npm tarballs.

## License

MIT, see [LICENSE](LICENSE).
