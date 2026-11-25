# PhyAgentOS Forge Conventions & Runtime Safety Rules

Forge skills are versioned robotics/simulation bundles (`SKILL.md` + `skill.yaml` + `profiles/`) managed in Kimi's isolated Forge home (`~/.kimi-code/forge` by default, or `$KIMI_FORGE_HOME` / `$DSH_FORGE_HOME`).

## Tool Usage Conventions
- Use the `forge_*` MCP tools rather than editing installed files under `~/.kimi-code/forge/skills/` directly.
- Call `forge_environment_check` on first setup, and `forge_skill_list` / `forge_skill_inspect` before assuming a skill name or deployment profile.
- Host settings (`models.root`, `registry`, `runtime.dora`, `runtime.dora1`, `gateway.callTimeoutMs`) live in `<home>/config.json` via `forge_config_read` / `forge_config_write` / `forge_config_restore` — never edit `~/.dsh/`.
- Skill profile files are edited only through `forge_profile_read` + `forge_profile_write` (pass complete content; returns a field diff and `restartRequired`), followed by an authorized runtime restart.
- Installs are background jobs: call `forge_skill_install` and poll `forge_install_status` until terminal.
- For creating, modifying, packaging or debugging a skill bundle, load `/skill:phyagentos:forge-skill-development` and inspect upstream node repositories via `forge_repo_search`, `forge_repo_info` and `forge_node_source`.

## Mandatory Forge Runtime & Physical Safety Rules
These rules override any urge to automatically "fix" or retry a failure:
- **A failed `forge_*` call or failed instruction is FINAL for the turn.** Report it and stop: state what failed (`skill`/`profile`/`tool`), the exact `FORGE_*` code and raw message, when it happened, already observed process/port state, and what is blocked. If state was not observed, say so; do not make further calls, including diagnostic calls, until the user requests them in a subsequent turn.
- **Never auto-repair a failure:** do not stop or start a skill, restart a runtime, kill processes, edit gateway/profile/port config, delete runtime directories, or re-run the failed call with adjusted parameters unless explicitly instructed by the user.
- **Starting or stopping a skill runtime (`forge_runtime_start` / `forge_runtime_stop`) requires an explicit user instruction;** never start or stop a runtime merely to verify or unblock another step.
- **Actions and Sessions are asynchronous and may move physical hardware.** HTTP acceptance (`invocation_id`) is not completion. Read terminal status via `forge_invocation_read`. An `unknown` outcome or timeout is diagnostic evidence, **never** permission to resend or retry blindly.
- **A skill declaring `forge_version: "2"` must be launched with `mode: "run"`** (`dora run`), never coordinator `start` mode.
- Offer recovery suggestions only when clearly marked as **not executed**.
