---
name: forge-skill-development
description: Develop, package and debug PhyAgentOS Forge skill bundles: architecture, upstream repository map, dataflow/gateway contracts, locks and troubleshooting matrix.
type: prompt
whenToUse: Use when creating, modifying, validating, packaging or debugging a Forge skill bundle, or tracing which layer owns a Forge runtime/gateway failure.
---

# forge-skill-development (Kimi Edition)

Use this guide when authoring, modifying, packaging or debugging a Forge skill bundle, or diagnosing which layer owns a runtime/tool failure.

## 0. Execution Architecture

```text
Kimi Agent (Kimi Work / Kimi Code)
  │ calls forge_* MCP tools (stdio local or SSH environment_id)
  ▼
phyagentos-kimi-mcp (@x-era/forge-core)   home: ~/.kimi-code/forge
  │ registry: GET /v1/skills, /v1/forge-nodes
  │ runtime:  dora up + dora start --detach (Forge 1) | dora1 run (Forge 2)
  ▼
Skill Runtime (isolated per skill+profile) runtime/env/<skill>/<profile>/<hash>/
  │ Preflight → NodeStore → materialize → Dora flow → Gateway readiness
  ▼
Gateway node (HTTP Tool API)               e.g. 127.0.0.1:19002
  │ POST /tools/{tool_id}:invoke | /tools/{endpoint}/{operation}:invoke
  │ GET  /tools, /tools/{id}/context, /invocations/{id}[/result|/cancel|/stop]
  ▼
Provider nodes (Endpoint + operation)      motion_action_policy, sim_control_policy, …
  │ Endpoint Wire: forge.tool.endpoint/v1alpha1 JSON in Arrow ToolMessage
  ▼
Data plane (Dora + Arrow RecordBatch)      JointCommand / JointState / Image / trajectories
  ▼
Hardware adapters or MuJoCo simulator
```

Keep the four identities distinct: **skill** (versioned bundle), **profile** (deployment choice inside the bundle), **flow** (one Dora execution), **gateway** (HTTP endpoint). One active skill owns one gateway port at a time.

## 1. Upstream Repository Lookup

Core framework: `github.com/PhyAgentOS/forge` (`interfaces/forge_msgs/`, `interfaces/forge_tool/PROTOCOL.md`, `packages/{tool,robot,policy}/`).

Use the built-in provenance tools instead of guessing source layouts:
- `forge_repo_search { query?, category? }` — search `framework | adapter | operator | benchmark` repositories.
- `forge_repo_info { id_or_node }` — inspect key source paths and exposed endpoints/operations.
- `forge_node_info { artifact_id }` — inspect registry metadata and source pinning for a locked node binary.
- `forge_node_source { artifact_id, file?, refresh? }` — read files (default `README.md`) from the exact pinned commit cached under `runtime/sources/`.

## 2. Bundle Anatomy & `skill.yaml`

```text
<name>/
  SKILL.md                  # authored workflow text (no frontmatter required inside raw bundle)
  skill.yaml                # manifest v2
  profiles/<id>/            # dataflow.yaml, gateway.yaml, node YAML configs
  assets/                   # URDF / MJCF / meshes
  docs/                     # optional bundle docs (read via forge_skill_docs)
  archive-manifest.json     # written by forge_skill_package
```

Key manifest rules:
- `name` is kebab-case matching the folder name; `gateway_url` is declared at skill level.
- `forge_version: "1" | "2"` selects the Dora generation (`"1"` → `dora` 0.4.1; `"2"` → `dora1` >=1.0.1,<2, launched with `mode: "run"`). Never mix Dora 0.4 and 1.x nodes in one dataflow.
- `artifacts.nodes.<id>` pins `artifact_id`, `version`, `platform`, `arch` (`x86_64` / `aarch64`), `artifact_type` (`executable_tar_gz` | `directory_tar_gz`), `entrypoint`, and `sha256`.

## 3. Local Bundle Development Loop

```text
1. Validate directory:   forge_skill_validate { path }
2. Package archive:      forge_skill_package { name }  (or copy into ~/.kimi-code/forge/skills/<name>/)
3. Install archive:      forge_skill_install_local { path }
4. Inspect & preflight:  forge_skill_inspect { name } → forge_skill_doctor { name, profile }
5. Authorized smoke run: forge_runtime_start → forge_tool_context → forge_tool_call → forge_invocation_read → forge_runtime_stop
6. Optional Kimi skill:  forge_skill_export { name, kimi_skills: true }  (exports to ~/.kimi-code/skills/<name>)
```

For local-only node binaries not downloaded from the registry, unpack into `~/.kimi-code/forge/runtime/nodes/<artifact_id>/` alongside `.artifact.json` (`artifactId`, `version`, `sha256`, `verifiedAt`).

## 4. Troubleshooting Matrix

| Symptom / Code | Owning Layer | Diagnostic Evidence / Next Check |
|---|---|---|
| `FORGE_ENV_PLATFORM_UNSUPPORTED` | Host OS/arch | Precompiled nodes usually lock `linux/x86_64`; use Linux Kimi Code CLI or Kimi SSH `environment_id` |
| `FORGE_ENV_DORA_MISSING` / `DORA1_MISSING` | Base runtime | Run `forge_environment_setup` to install isolated CLIs under `~/.kimi-code/forge/support/bin/` |
| `FORGE_NODE_MISSING` | NodeStore | Run `forge_skill_install` with `nodes: true` or verify platform/arch match |
| `FORGE_NODE_INTEGRITY` | Artifact verify | SHA256 mismatch; clear the corrupted node via cache/reinstall |
| `FORGE_PORT_CONFLICT` | Gateway port | Another runtime owns `gateway_url`; inspect `forge_skill_list` / `forge_environment_check` |
| `/tools` unreachable after start | Dataflow / nodes | Read `forge_runtime_logs { name }` and `<home>/runtime/logs/<flow>.log` |
| `readiness: false` in `forge_tool_context` | Provider / sensor | Check `gateway_readiness` (`proprio_state`, `images`, `clients`) and node logs |
| `MOTION_INVALID_GOAL` / `INVALID_JOINTS` | Tool arguments | Compare joint count/order/units with `get_robot_info` and `forge_tool_context` |
| Action stays `pending` or `unknown` | Invocation | Call `forge_invocation_read`; **never** auto-resend an unknown physical action |
| `FORGE_ARCHIVE_UNSAFE` | Bundle archive | Archive contains `..`, absolute paths, or links; rebuild cleanly |

Diagnostic files under `~/.kimi-code/forge/runtime/`: `logs/events.jsonl`, `logs/<flow>.log`, `jobs/<id>.json`, and `reports/doctor-*.json`.
