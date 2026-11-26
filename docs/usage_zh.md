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
   - 先配置 `~/.ssh/config` 中的 `robot-box`，确保能免交互连接。
   - 远端需要 Node.js `>=22`，以及与本机版本兼容的 Kimi Code 远程执行器。Kimi 不会自动安装执行器；`remoteBin` 应指向实际安装位置。执行器连接不等于已安装 Dora 或机器人技能。
   - 将本仓库构建好的单文件复制到远端。下列命令中的用户名和目录为示例，按自己的主机修改：

   ```sh
   ssh robot-box 'mkdir -p /home/ubuntu/phyagentos-kimi/mcp'
   scp mcp/forge-mcp.mjs robot-box:/home/ubuntu/phyagentos-kimi/mcp/forge-mcp.mjs
   ssh robot-box 'node --version'
   ```

   本机 `~/.kimi-code/config.toml`：

   ```toml
   [environments.robot-box]
   type = "ssh"
   host = "robot-box"
   remoteBin = "/home/ubuntu/.kimi-code/bin/kimi"
   defaultCwd = "/home/ubuntu"
   ```

   本机 `~/.kimi-code/mcp.json` 中合并以下配置（保留已有其他服务）：

   ```json
   {
     "mcpServers": {
       "forge-remote": {
         "command": "node",
         "args": ["/home/ubuntu/phyagentos-kimi/mcp/forge-mcp.mjs"],
         "environment_id": "robot-box",
         "startupTimeoutMs": 60000,
         "toolTimeoutMs": 180000,
         "env": { "KIMI_FORGE_HOME": "/home/ubuntu/.kimi-code/forge" }
       }
     }
   }
   ```

   为避免误用本机服务，保留插件的指令组件，但运行 `/plugins mcp disable phyagentos forge` 禁用其本机 MCP，再 `/reload` 或新建会话。在 `/mcp` 确认 `forge-remote` 已连接。

   先让远端服务执行 `forge_config_read` 和 `forge_environment_check`，核对返回的平台和目录确为 Linux 远端；再按用户指令安装依赖、技能和启动仿真。`HOME`、PATH、技能、Dora 和 Gateway 均位于远端，本机目录不会自动同步。网关保持远端 loopback，无需开放公网端口。

   排查顺序：SSH 登录 → 远端执行器路径/版本 → 远端 Node 与脚本绝对路径 → `/mcp` 状态 → 环境体检。若 Forge 调用失败，本轮停止，下一轮获得用户诊断指令后再执行后续检查。不要因 SSH 连接成功就认定仿真或硬件验收通过。

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

显式指定的共享 `models.root` 应使用默认 `<home>/models` 之外的路径；初始化不会向该目录创建文件，缓存保留在隔离运行目录。模型库不存在时也不会替用户创建；相关模型缺失会由体检/预检报告。

请通过 `forge_config_write` 修改配置（自动校验字段、以 `0600` 权限原子落盘、保留 `.bak-*` 备份并立即刷新当前 MCP 会话）。

### 下载代理

MCP 启动时读取 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 和 `NO_PROXY`，也支持小写形式（同名时小写优先）。HTTP/HTTPS 专用变量优先于 `ALL_PROXY`；HTTPS 未配置时回退到 HTTP 代理。支持 HTTP、HTTPS 和 SOCKS5 代理，`socks5h://` 使用 SOCKS5 的代理端域名解析。

例如，在启动 Kimi Code 的同一终端设置 Clash 代理：

```sh
export ALL_PROXY=socks5://127.0.0.1:7890
kimi
```

端口以 Clash 实际配置为准。桌面客户端不一定继承终端环境变量，应在实际 MCP 启动环境中配置。更新插件或修改代理环境变量后，需要重启对应 MCP 服务；不会改变已经运行的下载任务。SSH 模式中的代理地址指向远端机器，不能直接使用本机 Clash 的 loopback 地址。

代理覆盖 Registry、源码读取和制品下载。`NO_PROXY` 支持域名、端口和 `*`；localhost 和 loopback IP 始终直连，避免将本地机器人 Gateway 请求送入代理。代理不可用时请求失败，不自动回退直连。此设置不替代 pip/uv 自身的代理配置。

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

## 7. 完整性、权限与验收边界

远端技能包和节点制品必须提供 SHA256 与字节长度；命中技能归档缓存仍复核二者，不匹配即失败，不自动重下。用户明确指定的本地归档只做结构和安全解包校验，不声称具备可信远端摘要。

新建运行实例在 POSIX 上采用私有目录 `0700`、普通文件 `0600`，可执行文件保留所有者执行权限 `0700`。Windows 的隐私边界依赖用户目录 ACL，应单独实机检查。已有运行实例不会因升级而自动重启或更改权限；需要在用户授权停止/启动后生成新的私有实例。

参见[人工验收清单](acceptance_zh.md)与[Core 补丁说明](core-patches.md)。自动化使用模拟 Dora/Gateway，不代表真实 Kimi、MuJoCo 或硬件已验收。
