---
description: 检查本机（或当前连接环境）的 PhyAgentOS Forge 运行环境与隔离目录状态
---

请调用 `forge_environment_check` 检查当前环境的平台架构、Node.js、Python、`dora`（Forge 1）与 `dora1`（Forge 2）、隔离数据目录（默认 `~/.kimi-code/forge`）、磁盘空间、PAOS Registry 连通性以及端口占用情况；同时调用 `forge_config_read` 查看当前自定义配置。

附加说明：$ARGUMENTS

请按【通过项 / 警告项 / 失败项】清晰汇总结果：
- 如果缺少 `dora` 或 `dora1`，先使用 `forge_environment_setup` 的 `dry_run: true` 展示预计安装计划，待我确认后再实际执行安装，不要未经确认直接修改环境。
- 如果当前机器是非 `linux/x86_64`（如 macOS / Windows），请客观说明哪些能力本机直接可用，以及如何通过 Kimi SSH `environment_id` 连接 Linux 机器人/仿真主机。
