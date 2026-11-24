# `PhyAgentOS-Kimi-Plugin` 方案设计文档目录

本目录存放 `PhyAgentOS-Kimi-Plugin` 的架构与工程设计规范，与仓库实际代码一一对齐：

| 文档 | 主题与职责边界 |
| :--- | :--- |
| [00-overview-and-scope.md](00-overview-and-scope.md) | 背景目标、三大锁定架构决策（ADR）、宿主能力兼容矩阵与首期非目标 |
| [01-plugin-architecture-and-manifest.md](01-plugin-architecture-and-manifest.md) | `kimi.plugin.json` 规范、免编译托管副本机制、多语言 `locales`、Skills/Commands/`SYSTEM.md` 设计 |
| [02-mcp-adapter-and-isolation.md](02-mcp-adapter-and-isolation.md) | `~/.kimi-code/forge` 隔离目录解析链、`<home>/config.json` 原子存储、同会话热刷新与 41 个 MCP 工具契约 |
| [03-cross-platform-and-remote-robot.md](03-cross-platform-and-remote-robot.md) | Mac/Win 桌面端与 `linux/x86_64` 节点制品边界、Kimi SSH `environment_id` 远端连接与模型盘只读复用 |
| [04-security-and-physical-safety.md](04-security-and-physical-safety.md) | 物理动作三阶段分离、`unknown` 禁重发红线、路径沙箱、`0600` 凭据权限与宿主权限档位建议 |
| [05-testing-release-and-marketplace.md](05-testing-release-and-marketplace.md) | 自动化测试矩阵、无 `node_modules` 托管副本冒烟、上游联动发版及 Kimi 公开市场提审验收脚本 |

前期调研与总体规划存档：
- [phyagentos_kimi_plugin_feasibility.md](../phyagentos_kimi_plugin_feasibility.md)
- [phyagentos_kimi_plugin_plan.md](../phyagentos_kimi_plugin_plan.md)
