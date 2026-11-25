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

## 术语与职责边界

| 术语 | 本项目中的含义 | 负责层 |
|---|---|---|
| Kimi Plugin | 清单、指令、命令和 MCP 服务的安装单元 | 本仓库 |
| Kimi Skill | 指导模型操作的 `SKILL.md`，不直接执行机器人代码 | `skills/` 或用户技能目录 |
| Forge Skill Bundle | 包含 `skill.yaml`、说明、profiles 和资产的版本化机器人能力包 | Registry / 技能作者；Core 管理 |
| Profile | 一个技能包内的具体部署配置 | 技能包 |
| Flow | 一次实际的 Dora 数据流执行 | Dora / Core 运行管理器 |
| Gateway | 暴露工具 schema、调用和异步状态的 HTTP 节点 | 运行中的技能 |

本仓库维护 Kimi 清单、MCP 参数映射、独立配置、路径和操作指令；上游
`PhyAgentOS-DSH-Plugin` 中发布的 Core 负责资源与运行管理，`forge` 等节点仓库负责协议、策略、仿真和硬件节点。
当前锁定 Core 的三个安全/兼容性缺陷由[本地依赖补丁](../core-patches.md)修复；不修改外部上游仓库。
人工验证结果独立记录在[验收清单](../acceptance_zh.md)，未执行的项目不视为已通过。
