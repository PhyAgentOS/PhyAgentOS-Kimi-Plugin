---
name: forge-usage
description: Manage PhyAgentOS Forge robot and simulation skills in Kimi: environment setup, install, inspect, run, invoke Gateway tools, tune profiles and diagnose issues.
type: prompt
whenToUse: Use when the user asks about PhyAgentOS or Forge skills, robot simulation/hardware profiles, Dora runtimes, local models, or Gateway tool calls.
---

# forge-usage (Kimi Edition)

Forge manages versioned robot and simulation *skills* (`SKILL.md` + `skill.yaml` + `profiles/`) inside Kimi's isolated data root (`~/.kimi-code/forge` by default, or `$KIMI_FORGE_HOME` / `$DSH_FORGE_HOME`) and runs one HTTP Gateway per active skill. Always use the `forge_*` MCP tools instead of editing managed files directly.

## Pick the tool by intent

| The user wants to… | Use |
|---|---|
| check if this machine is ready for Forge | `forge_environment_check` |
| install pinned Dora 0.4.1 & 1.0.1 runtimes | `forge_environment_setup` (supports `dry_run`, `index_url`, `write_config`) |
| view or update Kimi Forge config (`config.json`) | `forge_config_read` → `forge_config_write` / `forge_config_restore` |
| see installed skills and runtime state | `forge_skill_list` |
| search downloadable skills in the registry | `forge_skill_search`, `forge_skill_versions` |
| inspect one skill (profiles, locks, checks) | `forge_skill_inspect` |
| read a skill's authored instructions or docs | `forge_skill_read`, `forge_skill_docs` |
| install or update a skill from registry | `forge_skill_install` / `forge_skill_update` → poll `forge_install_status` |
| cancel an active download | `forge_install_cancel` |
| validate / package / install a local bundle | `forge_skill_validate` → `forge_skill_package` → `forge_skill_install_local` |
| start a skill deployment (user-authorized) | `forge_runtime_start` (`name`, `profile`, `mode`) |
| check or tail a running skill | `forge_runtime_status`, `forge_runtime_logs` |
| stop a running skill (user-authorized) | `forge_runtime_stop` |
| inspect tool schema, readiness, frames & units | `forge_tool_context` |
| invoke a robot/simulation Query, Action or Session | `forge_tool_call` |
| reconcile an asynchronous Action/Session | `forge_invocation_read` |
| tune profile parameters (`control_hz`, poses…) | `forge_profile_files` → `forge_profile_read` → `forge_profile_write` |
| diagnose startup or runtime failures | `forge_skill_doctor`, `forge_doctor_report` |
| inspect or verify local model weights | `forge_model_search`, `forge_model_info`, `forge_model_verify` |
| export a bundle into Kimi's `/skill:` menu | `forge_skill_export` with `kimi_skills: true` |
| inspect or reclaim node artifact cache | `forge_cache_summary` → `forge_cache_gc` |
| remove an installed skill | `forge_skill_remove` (stop runtime first) |

## Operating Rules

1. **Look before acting.** Call `forge_skill_list` / `forge_skill_inspect` rather than guessing skill names or profile IDs (e.g. `mujoco-piper`).
2. **Isolated home & shared models.** Kimi stores state in `~/.kimi-code/forge` so it never conflicts with DSH (`~/.dsh/forge`). To reuse an existing multi-GB model directory read-only, set `models.root` via `forge_config_write`.
3. **Cross-platform awareness.** Precompiled node artifacts in the registry primarily target `linux/x86_64`. On macOS/Windows desktops, catalog/search/source/profile tools work locally; to run `linux/x86_64` MuJoCo or robot nodes from Kimi Desktop, attach Kimi's SSH `environment_id` to a Linux host or run Kimi Code CLI on Linux.
4. **Installs are asynchronous jobs.** `forge_skill_install` returns a `job_id`; poll `forge_install_status` until `state` is no longer `running`.
5. **Read before writing a profile.** `forge_profile_write` replaces the entire file, creates a backup, and returns a `diff` plus `restartRequired: true`. Ask before restarting an active runtime.
6. **Actions are asynchronous and physical.** `forge_tool_call` on an Action/Session returns an `invocation_id`; check `forge_invocation_read`. Never blind-retry a timeout or `unknown` outcome — real profiles move physical hardware.
7. **Diagnose with `FORGE_*` codes.** When a call fails, stop, run `forge_skill_doctor` if diagnostic read-only evidence is needed, and report the exact `FORGE_*` code and hint without auto-repairing.

## Typical Sequences

**First-time machine check & bootstrap**
```text
forge_environment_check()
→ forge_environment_setup(dry_run: true)
→ (after user confirmation) forge_environment_setup(write_config: true)
```

**Install and run a simulation (on `linux/x86_64` or SSH remote environment)**
```text
forge_skill_search(query: "robot")
→ forge_skill_install(name: "robot-control-sim")
→ forge_install_status(job_id) until succeeded
→ forge_skill_doctor(name: "robot-control-sim", profile: "mujoco-piper")
→ (with user instruction) forge_runtime_start(name: "robot-control-sim", profile: "mujoco-piper")
→ forge_tool_context(name: "robot-control-sim", tool_id: "sim.get_robot_info")
→ forge_tool_call(name: "robot-control-sim", tool_id: "sim.get_robot_info", arguments: {})
→ (with user instruction) forge_runtime_stop(name: "robot-control-sim")
```
