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
   Declare your Linux robot/GPU machine in `~/.kimi-code/config.toml`:
   ```toml
   [environments.robot-box]
   type = "ssh"
   host = "ubuntu@192.168.1.50"
   defaultCwd = "/home/ubuntu"
   ```
   Copy or install the plugin onto the remote host (or override `mcpServers.forge` in `~/.kimi-code/mcp.json` with `"environment_id": "robot-box"` and Node `>=22` on the remote machine). Kimi Desktop will execute `forge-mcp.mjs`, Dora, MuJoCo, and hardware adapters directly on `robot-box`.

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

Always update settings through `forge_config_write` (which validates keys, writes atomically with `0600` permissions, saves a `.bak-*` backup, and reloads the live MCP session).

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
