[English](usage_en.md) | 简体中文 · [首页](../README_zh.md)

# 使用手册

## 1. 安装插件

### Kimi Work 桌面端
1. 确认运行 MCP 的机器已安装 **Node.js `>=22`**（`node --version`）。
2. 打开 Kimi 桌面客户端，切换到 **Work** 模式，进入 **插件（Plugins）** 点击右上角 **+ Custom plugin**（或在输入框输入 `/` 唤起内置 **Plugin Builder**）。
3. 发送仓库地址 `https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin`（或本地文件夹路径）。
4. 进入 **插件 → 个人（Custom）** 页签，点击安装 **PhyAgentOS Forge**，新建会话即可生效。

### Kimi Code CLI / Desktop / VS Code
```sh
/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin
/reload
```
可通过 `/plugins info phyagentos` 与 `/mcp` 查看插件和 MCP 服务连接状态。

## 2. 首次环境体检与 Dora 初始化

在新会话中输入 `/phyagentos:env`：
1. `forge_environment_check` 会检查当前系统架构、Node.js、Python、Forge 1 `dora`（`0.4.1`）、Forge 2 `dora1`（`1.0.1`）、磁盘余量、隔离目录（`~/.kimi-code/forge`）、PAOS Registry 连通性及网关端口。
2. 如缺少 `dora` 或 `dora1`，可让模型先以 `dry_run: true` 预览计划，确认后执行 `forge_environment_setup(write_config: true)`（国内网络可附带 `index_url: "https://pypi.tuna.tsinghua.edu.cn/simple"`）。二进制会隔离安装到 `~/.kimi-code/forge/support/bin/`，并**在当前会话内自动热刷新生效，无需重启 Kimi**。

## 3. 跨平台说明与 SSH 连接远端 Linux 机器人主机

PAOS Registry 中的多数预编译节点制品（如 `robot-control-sim`）锁定 `linux/x86_64`。运行完整仿真或真机控制有两种标准方式：

1. **Linux 原生运行**：直接在 `linux/x86_64` 工作站或机器人上位机使用 Kimi Code CLI / VS Code 安装本插件。
2. **macOS / Windows 桌面端通过 SSH 操控远端 Linux 主机**：
   在 `~/.kimi-code/config.toml` 中声明远端 SSH 环境：
   ```toml
   [environments.robot-box]
   type = "ssh"
   host = "ubuntu@192.168.1.50"
   defaultCwd = "/home/ubuntu"
   ```
   确保远端主机装有 Node `>=22`，在 `~/.kimi-code/mcp.json` 中为 `forge` 指定 `"environment_id": "robot-box"` 并指向远端插件脚本，即可在 Mac/Windows 桌面端用自然语言直接驱动远端 Linux 上的 Dora、MuJoCo 与真机节点。

## 4. 隔离配置与本地大模型权重共享

本插件的配置存储在 `~/.kimi-code/forge/config.json`，绝不读写 `~/.dsh/`：

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

请通过 `forge_config_write` 修改配置（自动校验字段、以 `0600` 权限原子落盘、保留 `.bak-*` 备份并立即刷新当前 MCP 会话）。

## 5. 导出机器人技能到 Kimi `/skill:` 菜单

安装任意机器人技能包（例如 `robot-control-sim`）后，可执行：
```text
/phyagentos:export-skill robot-control-sim
```
该命令调用 `forge_skill_export(..., kimi_skills: true)` 将合成好 YAML frontmatter 的 `SKILL.md` 导出至 `~/.kimi-code/skills/robot-control-sim/`。Kimi 会自动监听并热刷新该目录，立即可通过 `/skill:robot-control-sim` 调用。

## 6. 物理动作安全准则

- 对 Action / Session 调用 `forge_tool_call` 返回 `invocation_id` 仅代表网关已受理，**不代表物理动作已完成**，必须通过 `forge_invocation_read` 查询终态。
- 遇到超时或 `unknown` 结果时，严禁盲目重发动作，须先核实机器人/仿真器状态。
- 连接真实机械臂或移动底盘时，请将 Kimi Work 权限模式保持在 **「默认」** 或 **「手动允许」**，切勿开启无人值守全自动（YOLO）模式。
