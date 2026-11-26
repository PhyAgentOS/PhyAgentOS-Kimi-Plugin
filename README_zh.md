[English](README.md) | 简体中文

# PhyAgentOS-Kimi-Plugin

面向 **Kimi Work 桌面端** 与 **Kimi Code**（CLI / Desktop / VS Code）的 [PhyAgentOS Forge](https://github.com/PhyAgentOS/forge) 插件，用于检索、安装、诊断和运行机器人与物理仿真技能包（Dora 数据流、节点制品、MuJoCo 仿真与 Gateway Tool API）。

[使用手册](docs/usage_zh.md) · [方案设计文档](docs/design/README.md) · [发版与市场上架指南](docs/releasing_zh.md) · [上游 Forge 核心仓库](https://github.com/PhyAgentOS/PhyAgentOS-DSH-Plugin)


开发维护补充：[Core 安全补丁](docs/core-patches.md) · [人工验收清单](docs/acceptance_zh.md)。开发依赖须通过 pnpm 安装以应用锁定补丁；GitHub 用户仍直接运行已内联补丁的单文件 MCP。共享模型盘保持只读；Windows ACL 和真实仿真需分别实机验收。

## 核心特性

- **GitHub 免编译直装**：内置确定性打包的单文件 ESM MCP 服务（`./mcp/forge-mcp.mjs`，内联 [依赖清单](package.json) 锁定并打过补丁的 Forge Core），通过 Kimi `Plugin Builder` 或 `/plugins install` 拉取仓库后无需执行 `npm install`，毫秒级冷启动。
- **严格的宿主目录隔离**：默认数据根采用 `~/.kimi-code/forge`（自动跟随 `$KIMI_CODE_HOME/forge`），将单写者 `runtime/state.json`、`runtime/forge.lock`、技能目录与隔离 Dora 运行时与 DSH 的 `~/.dsh/forge` 完全物理隔离，互不干扰。
- **完整暴露 41 个 Forge 工具**：涵盖本机环境体检、Dora 0.4.1 / 1.0.1 一键隔离安装、PAOS Registry 搜索与后台安装、本地技能包校验与打包、节点源码版本追溯、本地模型 SHA256 校验、Dora 运行时启停及 Gateway 异步动作对账。
- **内置物理安全红线与工作流**：随插件注入 `SYSTEM.md` 物理执行安全规则、2 个专业技能（`/skill:phyagentos:forge-usage`、`/skill:phyagentos:forge-skill-development`）以及 4 个快捷斜杠命令（`/phyagentos:env`、`/phyagentos:skills`、`/phyagentos:doctor`、`/phyagentos:export-skill`）。

## 环境前提

- **Node.js `>=22`**：运行 MCP 服务的机器需安装 Node.js 22 或更高版本（`node --version`）。
- **支持的 Kimi 宿主范围**：
  - **Kimi Work 桌面端**（macOS / Windows）
  - **Kimi Code**（CLI、Desktop 及 VS Code 扩展，支持 Linux / macOS / Windows）
  - *说明*：纯云端 **Kimi Web（网页 `Chat` 沙箱）** 不支持在用户机器拉起本地 `stdio` MCP 子进程，也无法访问本机 `127.0.0.1` 网关或硬件设备。
- **预编译机器人节点的平台说明**：当前注册表中的预编译二进制节点（如 `robot-control-sim`）主要锁定 `linux/x86_64`。在 macOS / Windows 桌面本机可直接运行注册表检索、源码查看、配置编辑、包校验与 Python 源码流；如需从桌面端操控 `linux/x86_64` MuJoCo 仿真或真机硬件，可通过 Kimi 原生 SSH `environment_id` 绑定远端 Linux 主机（详见 [使用手册](docs/usage_zh.md)）。

## 快速开始

### 方式一：Kimi Work 桌面端（`+ Custom plugin`）

1. 打开最新版 **Kimi** 桌面客户端，切至 **Work** 模式（或进入 **Plugins → + Custom plugin**）。
2. 将仓库地址 `https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin`（或本地目录路径）发送给 **Plugin Builder**。
3. 在 **插件 → 个人（Custom）** 页签找到 **PhyAgentOS Forge**，点击安装并开启新会话即可使用。

### 方式二：Kimi Code CLI / Desktop

```sh
# 从 GitHub 仓库或本地目录安装
/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin
# 或：/plugins install /path/to/PhyAgentOS-Kimi-Plugin

# 刷新当前会话加载插件
/reload
```

### 首次对话示例

直接输入快捷命令或自然语言：

| 目标 | 推荐命令 / 提问示例 | 主要调用工具 |
| --- | --- | --- |
| 环境体检 | `/phyagentos:env` | `forge_environment_check`、`forge_config_read` |
| 初始化 Dora 运行时 | “先预览并在 `~/.kimi-code/forge/support/` 下安装 Forge 所需的 `dora 0.4.1` 和 `dora1 1.0.1`。” | `forge_environment_setup` |
| 查看与搜索技能 | `/phyagentos:skills robot` | `forge_skill_list`、`forge_skill_search` |
| 安装仿真技能 | “安装 `robot-control-sim` 并轮询安装进度直到完成。” | `forge_skill_install`、`forge_install_status` |
| 技能故障诊断 | `/phyagentos:doctor robot-control-sim mujoco-piper` | `forge_skill_inspect`、`forge_skill_doctor` |
| 启动并查询仿真 | “启动 `robot-control-sim` 的 `mujoco-piper` profile，就绪后调用 `sim.get_robot_info`。” | `forge_runtime_start`、`forge_tool_call` |
| 导出为 Kimi 原生技能 | `/phyagentos:export-skill robot-control-sim` | `forge_skill_export`（`kimi_skills: true`） |

## 隔离目录与配置说明

数据根目录解析优先级：
1. `KIMI_FORGE_HOME`
2. `DSH_FORGE_HOME`
3. `$KIMI_CODE_HOME/forge`（默认即 `~/.kimi-code/forge`）

宿主级配置保存在 `<home>/config.json`（通过 `forge_config_read` / `forge_config_write` / `forge_config_restore` 执行 `0600` 原子写入并自动保留 `.bak-*` 备份）。如果本机已有数十 GB 的共享模型权重目录，可在隔离运行时状态的同时只读复用模型盘：

```json
{
  "models": {
    "root": "/data/shared-forge-models"
  }
}
```

## 本地开发与校验

```sh
pnpm install --frozen-lockfile
pnpm test
```

`pnpm test` 会重新构建单文件 `mcp/forge-mcp.mjs`、校验插件清单/技能/命令/路径边界与双语文档规范，并运行全套自动化测试（包含无 `node_modules` 托管副本下的 MCP stdio 协议测试及零触碰 `~/.dsh` 隔离验证）。

## 许可

MIT，详见 [LICENSE](LICENSE)。
