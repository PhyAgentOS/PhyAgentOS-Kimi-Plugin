# 00. 总体方案与范围边界（Overview & Scope）

## 1. 背景与目标
在不修改任何外部上游仓库（`PhyAgentOS-DSH-Plugin`、`forge`、`PhyAgentOS-core`）的前提下，复用已公开发布至 npm 的 `@x-era/forge-core@0.2.0` 宿主无关核心层，构建面向 Kimi 生态的原生插件 `PhyAgentOS-Kimi-Plugin`，支持个人快速导入与官方公开市场提审。

## 2. 锁定架构决策记录（ADR）
1. **ADR-01 独立单插件仓库**：采用独立仓库 `PhyAgentOS/PhyAgentOS-Kimi-Plugin`，根级放置 `kimi.plugin.json`，适配 Kimi Work `Plugin Builder` 与 Kimi Code `/plugins install <github-url>` 免配置识别。
2. **ADR-02 宿主隔离数据目录**：默认数据根采用 `$KIMI_CODE_HOME/forge`（即 `~/.kimi-code/forge`），不共用 DSH 的 `~/.dsh/forge`，避免单写者 `runtime/state.json`、`runtime/forge.lock` 与网关生命周期冲突。
3. **ADR-03 本地内核宿主聚焦**：首期面向基于 Kimi Code 本地 Agent 内核的 **Kimi Work 桌面端（macOS / Windows）** 与 **Kimi Code（CLI / Desktop / VS Code）**，通过本地 `stdio` MCP 或原生 SSH `environment_id` 驱动仿真与真机。

## 3. 宿主兼容矩阵

| Kimi 宿主端 | `mcpServers` (`stdio`) | `skills` & `commands` | `systemPromptPath` | SSH `environment_id` | 本插件支持结论 |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Kimi Work 桌面端 | 支持 | 支持 | 支持 | 支持 | **首期核心支持** |
| Kimi Code CLI / Desktop / VS Code | 支持 | 支持 | 支持 | 支持 | **首期核心支持** |
| Kimi Web 纯云端沙箱 | 不支持本机进程 | 仅支持云端静态文本 | 受限 | 不支持直连内网硬件 | **首期不包含**（需二期远程 HTTP MCP） |

## 4. 首期非目标（Non-Goals）
- 不修改 `@x-era/forge-core` 或其他外部仓库代码；
- 不自建公网反向代理或托管式云端机器人 Gateway；
- 不重复开发独立 WebUI 配置台（所有配置通过 `forge_config_*` MCP 工具完成）。
