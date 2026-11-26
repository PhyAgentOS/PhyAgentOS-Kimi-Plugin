English | [简体中文](usage_zh.md) · [Home](../README.md)

# User Guide

## 1. Installation

### Kimi Work Desktop
1. Ensure **Node.js `>=22`** is installed on your machine (`node --version`).
2. Open Kimi Desktop, switch to **Work**, open **Plugins**, and click **+ Custom plugin** (or type `/` in chat to invoke **Plugin Builder**).
3. Provide the repository URL `https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` (or local path).
4. In **Plugins → Custom**, install **PhyAgentOS Forge** and open a new conversation.

### Kimi Code CLI / Desktop / VS Code
```sh
/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin
/reload
```
Verify status with `/plugins info phyagentos` and `/mcp`.

## 2. Environment Check & Runtime Bootstrap

Run `/phyagentos:env` in a new chat:
1. `forge_environment_check` inspects OS/architecture, Node.js, Python, Forge 1 `dora` (`0.4.1`), Forge 2 `dora1` (`1.0.1`), disk space, isolated home (`~/.kimi-code/forge`), PAOS Registry reachability, and gateway ports.
2. When `dora` or `dora1` is missing, run `forge_environment_setup` (`dry_run: true` first, then `write_config: true` after approval; pass `index_url` if a PyPI mirror is needed). Binaries are installed under `~/.kimi-code/forge/support/bin/` and take effect immediately in the active session without restarting Kimi.

## 3. Running `linux/x86_64` Robot & MuJoCo Skills from macOS / Windows via SSH

Most precompiled node binaries in the PAOS Registry lock `linux/x86_64`. You have two ways to run full simulation or hardware flows:

1. **Direct on Linux:** Install Kimi Code CLI on your `linux/x86_64` workstation/robot PC and install this plugin directly.
2. **Remote SSH from Kimi Desktop (macOS / Windows):**
   Configure a non-interactive `robot-box` SSH alias first. The target needs Node.js >=22 and a compatible Kimi Code remote executor; Kimi does not install the executor automatically. Set `remoteBin` to its actual location. Installing the executor does not install Dora or skills.

   Copy the prebuilt, self-contained server (adapt these example paths):

   ```sh
   ssh robot-box 'mkdir -p /home/ubuntu/phyagentos-kimi/mcp'
   scp mcp/forge-mcp.mjs robot-box:/home/ubuntu/phyagentos-kimi/mcp/forge-mcp.mjs
   ssh robot-box 'node --version'
   ```

   Local `~/.kimi-code/config.toml`:

   ```toml
   [environments.robot-box]
   type = "ssh"
   host = "robot-box"
   remoteBin = "/home/ubuntu/.kimi-code/bin/kimi"
   defaultCwd = "/home/ubuntu"
   ```

   Merge into local `~/.kimi-code/mcp.json`, retaining other servers:

   ```json
   {
     "mcpServers": {
       "forge-remote": {
         "command": "node",
         "args": ["/home/ubuntu/phyagentos-kimi/mcp/forge-mcp.mjs"],
         "environment_id": "robot-box",
         "startupTimeoutMs": 60000,
         "toolTimeoutMs": 180000,
         "env": { "KIMI_FORGE_HOME": "/home/ubuntu/.kimi-code/forge" }
       }
     }
   }
   ```

   Keep the plugin's instruction components, disable its local server with `/plugins mcp disable phyagentos forge`, then `/reload` or open a new session. Confirm `forge-remote` in `/mcp`.

   First call `forge_config_read` and `forge_environment_check` on the remote service and verify the returned platform and paths. Install dependencies/skills and start simulation only as instructed. HOME, PATH, Dora and loopback Gateway all belong to the target; local files are not automatically synchronized. No public Gateway port is needed.

   Troubleshoot SSH login, executor path/version, remote Node and server path, MCP connection, then environment readiness. A failed Forge call ends that turn; further diagnostics require the user's subsequent instruction. SSH connectivity alone does not certify a simulation or robot.

## 4. Configuration & Shared Model Weights

Kimi Forge settings live in `~/.kimi-code/forge/config.json`:

```json
{
  "registry": {
    "url": "https://paos-resource-platform.dev.x-era.com",
    "tokenEnv": "DSH_FORGE_REGISTRY_TOKEN"
  },
  "models": {
    "root": "/data/shared-forge-models"
  },
  "runtime": {
    "dora": "/Users/you/.kimi-code/forge/support/bin/dora",
    "dora1": "/Users/you/.kimi-code/forge/support/bin/dora1",
    "startTimeoutMs": 120000
  },
  "gateway": {
    "callTimeoutMs": 15000
  }
}
```

Use a non-default `models.root` for shared read-only weights. Bootstrap never creates that root or files inside it; managed caches stay under the isolated runtime. A missing shared root is reported by model checks rather than created.

Always update settings through `forge_config_write` (which validates keys, writes atomically with `0600` permissions, saves a `.bak-*` backup, and reloads the live MCP session).

### Download proxies

At MCP startup, `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` and `NO_PROXY` are read, including lowercase variants (lowercase wins). Protocol-specific settings take priority over `ALL_PROXY`; HTTPS falls back to the HTTP proxy if unset. HTTP, HTTPS and SOCKS5 proxies are supported; `socks5h://` uses SOCKS5 proxy-side DNS.

For example, start Kimi Code from a shell with your Clash proxy configured:

```sh
export ALL_PROXY=socks5://127.0.0.1:7890
kimi
```

Use the actual Clash port. Desktop apps may not inherit shell variables; set them in the MCP launch environment. Restart the MCP service after upgrading or changing these variables. Existing downloads are unaffected. With SSH, the proxy address belongs to the remote machine, not your desktop's loopback interface.

The policy covers Registry, source and artifact requests. `NO_PROXY` supports domains, ports and `*`; localhost and loopback IPs always bypass the proxy to keep local robot Gateways direct. Proxy failures do not silently fall back to a direct connection. pip/uv proxy configuration remains separate.

## 5. Exporting Robot Bundles as Native Kimi Skills

After installing any Forge bundle (e.g. `robot-control-sim`), run:
```text
/phyagentos:export-skill robot-control-sim
```
This calls `forge_skill_export` with `kimi_skills: true`, writing `~/.kimi-code/skills/robot-control-sim/SKILL.md`. Kimi automatically hot-reloads `~/.kimi-code/skills/` so `/skill:robot-control-sim` becomes immediately available.

## 6. Physical Execution Safety Rules

- `forge_tool_call` on an Action or Session returns HTTP acceptance (`invocation_id`), **not** physical completion. Always check `forge_invocation_read`.
- Never blind-retry a timed-out or `unknown` physical action; reconcile robot/simulator state first.
- Keep Kimi Work permissions in **Default** or **Manual Approval** mode when connected to physical robot hardware (avoid unattended full-auto/YOLO mode).

## 7. Integrity, Permissions and Acceptance

Remote skill/node artifacts require a pinned SHA256 and byte length. Cached skill archives are rechecked; mismatch fails without automatic redownload. Explicit local archives receive structural and safe-extraction checks, not a trusted remote-digest guarantee.

New POSIX runtime instances use private `0700` directories, `0600` regular files, and `0700` owner-executable files. Windows relies on private-profile ACLs and needs host acceptance. Upgrading does not restart or alter existing instances; a user-authorized stop/start creates a new protected instance.

See the [acceptance checklist](acceptance_en.md) and [core patch notes](core-patches.md). Synthetic Dora/Gateway tests do not certify real Kimi, MuJoCo or hardware execution.
