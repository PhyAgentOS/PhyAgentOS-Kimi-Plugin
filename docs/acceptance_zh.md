[English](acceptance_en.md) | 简体中文

# 宿主、仿真与发布验收清单

自动化测试使用合成技能、模拟 Dora 和 loopback Gateway。它们验证协议、实例刷新、权限和异步调用，不代表真实 Kimi、Dora、MuJoCo 或硬件已经验收。

## 1. 自动化门禁

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:check
pnpm run benchmark:startup
```

- Core 回归：缓存摘要/大小、远端元数据、共享模型盘只读、运行文件权限与链接边界。
- 托管副本：无 `node_modules` 启动、41 个工具 schema 与文档映射一致、配置/路径隔离、打包/安装/导出。
- 合成运行：`write_config: false` 安装后同会话启动；Query、Action、unknown 对账不重发；错误码；停止。
- 后台任务：下载持锁时配置变更等待，任务仍可取消；刷新和恢复后保留任务状态。
- CI 配置：Linux、macOS、Windows 的 Node 22，以及 Linux Node 24。Windows 跳过依赖 POSIX shebang、权限和 symlink 的测试；这些跳过不能视为运行或 ACL 验收通过。以实际 CI 结果为准。

启动基准输出 Node/平台、每次测量、p50/p95 与 50ms 目标是否达成。它衡量空用户目录下从创建进程到 `initialize` 响应的时间，可能使用已热的 OS 文件缓存，不含 Registry 网络和已有运行实例的状态对账。不要跨机器宣传固定冷启动数值。

## 2. 人工验收矩阵

以下项目未在本次源码修复中执行，状态统一为**待执行**。执行后记录客户端/系统/Node/Core 版本、提交 SHA、日期、工具返回和脱敏日志路径，不能只记录“能连接”。

| 目标 | 前提 | 验收步骤 | 通过标准 | 当前状态 |
|---|---|---|---|---|
| Kimi Work macOS | Node >=22、本地插件导入 | Custom plugin 导入 → 新会话 → `/mcp` → `/phyagentos:env` → `/phyagentos:skills` | 服务就绪、指令/命令可用、目录为 Kimi 独立目录 | 待执行 |
| Kimi Work Windows | Node >=22、私有用户目录 ACL | 同上，并检查实例目录只能由预期用户访问 | 非 Linux 预编译节点限制清晰；检索、配置和导出可用；ACL 合格 | 待执行 |
| Kimi Code CLI Linux | Node >=22、独立 KIMI_CODE_HOME | 本地/仓库安装 → `/reload` → 体检、配置备份/恢复、导出用户 Skill | 41 工具就绪，用户 Skill 被发现，DSH 未改动 | 待执行 |
| 桌面 + SSH Linux | 兼容远端执行器、Node、脚本已部署 | 按使用手册配置 `forge-remote`；禁用本机 Forge MCP；核对远端平台/目录；再检索技能 | 执行位置正确，本机无误启动，Gateway 仍为远端 loopback | 待执行 |
| Linux MuJoCo 闭环 | 真实 Dora、适配平台、可用图形环境、用户明确授权 | 安装 `robot-control-sim` 并轮询 → inspect/doctor → 授权启动 `mujoco-piper` → context → `sim.get_robot_info` → 授权停止 | 真实进程健康、返回机器人信息、停止后进程/端口释放 | 待执行 |
| 首装热刷新 | 无已安装 Dora 的独立环境 | 预览并授权安装 → 不 reload → 授权启动匹配世代的数据流 | 首次会话直接启动，运行记录指向隔离 bin | 待执行 |
| Forge 2 Python 流 | 兼容 Python 节点与 Dora1 | 检查 `forge_version: 2` → 用 `mode: run` 授权启动、查询、停止 | 不混用 Dora 世代，流程完整 | 待执行 |
| 失败与 unknown 阻断 | 使用仿真/合成目标，不使用运动中的真机做故障注入 | 制造可控错误或 unknown → 检查模型后续行为 | 错误即停；无自动启停/重试；unknown 仅在无失败时查询终态，不重发动作 | 待执行 |

任何一次失败都报告准确 `FORGE_*` 码和已采集证据并结束该轮。后续诊断由用户在下一轮明确要求。授权停止已启动的测试实例应作为独立操作进行。

## 3. 无硬件审核步骤

1. 在 Kimi 中导入插件并新建会话，确认 `/mcp` 连接。
2. `/phyagentos:env`：检查平台、Node、隔离目录；缺少 Dora 可作为明确警告，不自动安装。
3. `/phyagentos:skills robot`：验证匿名 Registry 检索和本地列表。
4. 查询节点仓库信息；从检索结果取得真实 `artifact_id`，调用 `forge_node_info` 和 `forge_node_source` 读取固定版本源码，核对返回的 commit 信息。不要猜制品 ID。
5. 如需完整仿真，另执行上表 Linux MuJoCo 行；无硬件检索通过不能替代这一行。

网络速度不属于固定验收时长保证；Registry/源码站不可达时保留失败证据，不自动换源。

## 4. 发布记录

| 项目 | 要记录的证据 | 状态 |
|---|---|---|
| 自动化 | 本次提交对应的完整 CI 链接及各平台结果 | 待推送后核实 |
| 宿主验收 | 上表逐项结果和脱敏日志 | 待执行 |
| Release | 与通过验收的提交一致的不可变 tag、Release URL、版本号 | 待维护者发布 |
| 市场申请 | 维护者联系方式、desktop/cli 平台范围、复现步骤、申请回执 | 待维护者提交 |
| 市场审核 | 官方审核结果或上架条目 | 未确认 |

二期 HTTP MCP、托管公网 Gateway 和上游功能 PR 不属于当前首期必交付项。
