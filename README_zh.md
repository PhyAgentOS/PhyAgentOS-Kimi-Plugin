[English](README.md) | 简体中文

# PhyAgentOS-Kimi-Plugin

面向 **Kimi Work 桌面端** 与 **Kimi Code**（CLI / Desktop / VS Code）的 [PhyAgentOS Forge](https://github.com/PhyAgentOS/forge) 插件，用于检索、安装、诊断和运行机器人与物理仿真技能包（Dora 数据流、节点制品、MuJoCo 仿真与 Gateway Tool API）。

[使用手册](docs/usage_zh.md) · [方案设计文档](docs/design/README.md) · [发版与市场上架指南](docs/releasing_zh.md) · [上游 Forge 核心仓库](https://github.com/PhyAgentOS/PhyAgentOS-DSH-Plugin)


开发维护补充：[Core 安全补丁及 npm 核查](docs/core-patches.md) · [人工验收清单](docs/acceptance_zh.md)。只发布 Kimi 插件；首次启动通过 npm 安装已发布的 Core 及锁定依赖，再在私有目录生成兼容副本。npm 原包保持不变，共享模型盘保持只读；Windows ACL 和真实仿真需分别实机验收。

## 核心特性

- **仅发布插件、复用公共 npm 包**：`mcp/forge-mcp.mjs` 为启动器，`mcp/adapter.mjs` 仅包含 Kimi 适配逻辑，Core 不再内联。首次启动自动以 `npm ci --omit=dev --ignore-scripts` 安装锁定的 `@x-era/forge-core@0.2.2` 及依赖到 `<home>/plugin-runtime/<内容标识>/`，应用兼容层后启动；后续复用本地缓存，无需用户手动构建或发布额外 npm 包。
- **严格的宿主目录隔离**：默认数据根采用 `~/.kimi-code/forge`（自动跟随 `$KIMI_CODE_HOME/forge`），将单写者 `runtime/state.json`、`runtime/forge.lock`、技能目录与隔离 Dora 运行时与 DSH 的 `~/.dsh/forge` 完全物理隔离，互不干扰。
- **完整暴露 41 个 Forge 工具**：涵盖本机环境体检、Dora 0.4.1 / 1.0.1 一键隔离安装、PAOS Registry 搜索与后台安装、本地技能包校验与打包、节点源码版本追溯、本地模型 SHA256 校验、Dora 运行时启停及 Gateway 异步动作对账。
- **内置物理安全红线与工作流**：随插件注入 `SYSTEM.md` 物理执行安全规则、2 个专业技能（`/skill:phyagentos:forge-usage`、`/skill:phyagentos:forge-skill-development`）以及 4 个快捷斜杠命令（`/phyagentos:env`、`/phyagentos:skills`、`/phyagentos:doctor`、`/phyagentos:export-skill`）。

## 环境前提

- **Node.js `>=22` 与 npm**：运行 MCP 服务的机器需可执行 `node --version` 和 `npm --version`。首次启动需访问锁文件指定的 npm 制品地址；依赖准备后可离线启动。安装日志写入 stderr；失败可重试，首次启动超时配置为 300 秒。npm 首次安装阶段使用 npm 自身的代理配置；依赖准备完成后，MCP 在加载 Core 前读取代理环境变量并设置全局请求调度器，补齐 DSH 宿主提供的代理初始化。
- **支持的 Kimi 宿主范围**：
  - **Kimi Work 桌面端**（macOS / Windows）
  - **Kimi Code**（CLI、Desktop 及 VS Code 扩展，支持 Linux / macOS / Windows）
  - *说明*：纯云端 **Kimi Web（网页 `Chat` 沙箱）** 不支持在用户机器拉起本地 `stdio` MCP 子进程，也无法访问本机 `127.0.0.1` 网关或硬件设备。
- **预编译机器人节点的平台说明**：当前注册表中的预编译二进制节点（如 `robot-control-sim`）主要锁定 `linux/x86_64`。在 macOS / Windows 桌面本机可直接运行注册表检索、源码查看、配置编辑、包校验与 Python 源码流；如需从桌面端操控 `linux/x86_64` MuJoCo 仿真或真机硬件，可通过 Kimi 原生 SSH `environment_id` 绑定远端 Linux 主机（详见 [使用手册](docs/usage_zh.md)）。

## 快速开始

### 新机器首次部署：检查并准备依赖

先安装 **Node.js `>=22` 与 npm**，确保启动 Kimi 的环境能找到 `node` 和 `npm`。在插件根目录（包含 `kimi.plugin.json` 和 `mcp/` 的目录）打开终端，依次执行：

```sh
node --version
npm --version
node ./mcp/forge-mcp.mjs --prepare-only
```

前两条命令检查 Node.js 版本及 npm 是否可用，不会安装它们。第三条命令只准备插件的 npm 依赖和 Core 兼容副本，不启动 MCP 会话，也不安装 Dora、机器人技能或模型。首次准备需要锁文件指定的 npm 制品可达或已缓存；成功后会在 stderr 输出 `Runtime ready: ...`，默认缓存目录为 `~/.kimi-code/forge/plugin-runtime/<内容标识>/`。

该预准备步骤可选；跳过时会在首次启动 MCP 时自动执行。普通用户无需安装 pnpm、执行源码构建或复制旧机器的 `node_modules`。准备完成后，按以下任一方式安装插件。

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

### 代理配置

可在启动 Kimi 前设置代理环境变量，也可写入 `$KIMI_CODE_HOME/.env`（默认 `~/.kimi-code/.env`，Windows 默认 `%USERPROFILE%\.kimi-code\.env`），随后完全重启 Kimi/MCP。文件内容示例：

```dotenv
HTTP_PROXY=http://127.0.0.1:你的HTTP或Mixed端口
HTTPS_PROXY=http://127.0.0.1:你的HTTP或Mixed端口
NO_PROXY=localhost,127.0.0.1,::1,192.168.0.0/16,10.0.0.0/8
```

请将占位文字替换成代理软件实际监听的端口；插件不固定端口、不扫描 Clash、不读取系统代理。代理必须能从运行 MCP 的机器/容器访问，`127.0.0.1` 指该运行环境本身。`.env` 只读取代理变量，不读取项目目录 `.env` 或 DSH 的配置文件，也不执行文件中的命令。

同一配置项以启动进程传入的非空值为准，其次读取用户 `.env`；每个来源内小写优先于大写，空值视为未设置。HTTP 选择 `HTTP_PROXY → ALL_PROXY → 直连`，HTTPS 选择 `HTTPS_PROXY → ALL_PROXY → HTTP_PROXY → 直连`。明确配置了无效地址或不支持的协议时，输出不含地址/认证信息的警告，对应请求直连，不继续回退。有效代理连接失败仍报错，不自动直连。

运行时支持 HTTP/HTTPS、SOCKS5 和 `socks5h://`，保留比参考 DSH 逻辑更多的 SOCKS 兼容能力。本机 loopback Gateway 强制直连，重定向后也重新判断；`NO_PROXY` 支持域名及 IP CIDR（仅判断 URL 中的 IP 字面量，不进行额外 DNS 查询）。没有代理配置时保留宿主调度器。

首次 npm 安装前也会读取上述 `.env`，并将 HTTP/HTTPS 代理选择结果传给 npm；显式 `npm_config_proxy` / `npm_config_https_proxy` 配置优先。npm 安装请使用 HTTP/Mixed 端口；只有 SOCKS 配置时会提示其不适用于此安装桥接，可另设 npm HTTP 代理。`undici@7.30.2` 仍从 npm 安装，其 SOCKS5 实现会输出实验性功能提示。配置保存在机器的用户目录中，插件代码和清单不携带本机端口或凭据。

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

## npm 依赖与更新方式

### 依赖关系

本插件直接依赖公共 npm 包 **`@x-era/forge-core`**，由 Kimi 专用 MCP 适配层调用。**`@x-era/dsh-forge` 是跟随更新的上游发布入口，不是本插件的直接运行时依赖**；它是 DSH 的安装组合包，通过 `@x-era/dsh-forge-skill` 依赖公共 Core：

```text
上游 npm 发布依赖链：
@x-era/dsh-forge → @x-era/dsh-forge-skill → @x-era/forge-core

Kimi 运行调用链：
Kimi → 本插件的 MCP 适配层 → @x-era/forge-core
```

已跟随的三个包版本记录在 [`dsh-upstream.json`](dsh-upstream.json)，实际 Core 版本精确锁定在 `package.json`、`mcp/package.json` 和对应锁文件中。首次启动按锁文件安装，后续复用缓存；不会在每次启动时自动安装 npm 最新版本。

### 维护者：自动同步上游发布

[同步工作流](.github/workflows/sync-dsh.yml) 合入默认分支并启用 Actions、允许 Actions 创建 PR 后，按每天 **UTC 04:23（北京时间 12:23）** 的计划检查 npm。也可在 **Actions → Sync DSH upstream → Run workflow** 手动触发。

1. 查询 `@x-era/dsh-forge` 的 `latest` 标签，即 npm 默认安装版本，再沿其依赖声明解析 Skill 和 Core 的实际版本；不假设三个包的版本号相同。仅支持精确稳定版本，并拒绝降级。
2. 与 `dsh-upstream.json` 比较；无变化不修改文件、不创建 PR。只提交 DSH 源码、发布未设为 `latest` 的测试版，或单独发布未被组合包引用的 Core，不会触发这套跟随升级。
3. 有更新时，在临时副本中同步版本记录；Core 变化时还更新依赖声明、两套锁文件、兼容补丁及映射、SHA256 摘要和 MCP 构建产物。执行 `pnpm test` 和 `pnpm run build:check`，通过后才写回；补丁冲突或验证失败则终止。
4. 成功且有改动时，创建或更新 `automation/sync-dsh` 升级 PR。维护者确认平台 CI、审核合并、调整插件版本并发布；工作流不自动合并或发布。PR 的 CI 可能需要人工批准，令牌和权限配置见[发布指南](docs/releasing_zh.md#2-自动跟随已发布-dsh-版本)。

本地维护命令（需安装仓库指定版本的 pnpm）：

```sh
pnpm install --frozen-lockfile
# 只检查，输出版本比较 JSON，不修改文件
pnpm run sync:dsh -- --check
# 执行同步升级和完整验证
pnpm run sync:dsh
# 可选：指定 DSH 组合包的精确稳定版本，仍禁止降级
pnpm run sync:dsh -- --version 0.2.2
```

若 Core 不变，只同步上游版本记录并执行验证。DSH 专属界面、工具注册、提示词及 Kimi 新工具适配代码不会自动迁移；插件版本号和文档版本引用仍需人工维护。同步不会修改用户已安装的技能、模型、配置或运行数据。

### 使用者：获取插件更新

维护者发布新版后，通过原安装渠道更新 Kimi 插件；启动器会根据新版插件携带的锁文件准备对应运行时。普通用户无需运行上述维护命令，也无需手动执行 `npm update`。

#### 从本地目录安装后的更新

Kimi 运行的是安装时复制到托管目录的插件副本。修改原始仓库后，**仅执行 `/reload` 不会复制新代码，需要重新安装**。

1. 确认本地插件目录已有最新代码；若改动已直接写入该目录，无需再次拉取。示例路径为 `/home/gx/X-era/PhyAgentOS-Kimi-Plugin`，其他机器请替换。
2. 如有正在运行的仿真，先在 Kimi 对话框输入以下提示，确认停止后再更新：

   ```text
   停止 robot-control-sim 的运行实例，并查询运行状态，确认已经停止。
   ```

3. 在 **Kimi 对话框**逐条输入，重新安装并激活：

   ```text
   /plugins install /home/gx/X-era/PhyAgentOS-Kimi-Plugin
   ```

   ```text
   /reload
   ```

4. 逐条检查插件与 MCP 状态：

   ```text
   /plugins info phyagentos
   ```

   ```text
   /mcp
   ```

   确认插件已启用、`forge` MCP 连接成功。如仍加载旧代码，完全退出并重新启动 Kimi，再检查。连接失败时保留完整错误信息，暂停后续功能测试。

#### 从 GitHub 安装后的更新

在 Kimi 输入 `/plugins`，进入 **Installed**，选择本插件；有更新时按 **Enter** 安装，完成后执行 `/reload`，再通过 `/plugins info phyagentos` 和 `/mcp` 检查。更新前同样先停止运行中的仿真。

普通 GitHub 仓库地址默认安装最新 Release，无 Release 时回落到默认分支；因此仅推送分支代码不一定能通过原仓库地址获取更新。显式指定分支、tag 或 commit 的安装源应按该来源更新；若要改用另一个引用，使用对应地址重新安装。

插件管理与托管副本机制见 [Kimi Code 官方插件文档](https://www.kimi.com/code/docs/kimi-code-cli/customization/plugins)。

## 本地开发与校验

```sh
pnpm install --frozen-lockfile
pnpm test
```

`pnpm test` 会构建外部 Core 适配层及启动器、校验插件清单/技能/命令/路径边界与双语文档规范，并运行全套自动化测试。托管副本不携带 `node_modules`，测试首次 npm 安装、缓存复用、兼容副本、41 个工具及 `~/.dsh` 零触碰隔离；首次安装测试需要 npm 制品可达或已缓存。

## Kimi 本地手动验收

以下步骤在 **Kimi 对话框**中逐条输入，不是在系统终端执行。示例针对 Linux x86_64、本地仓库 `/home/gx/X-era/PhyAgentOS-Kimi-Plugin`，以及未覆盖数据根路径的新环境；其他机器请替换仓库路径，数据根以实际配置为准。以下为待执行的验收步骤，不代表本机已通过测试。

### 1. 安装插件并确认 MCP 连接

逐条输入：

```text
/plugins install /home/gx/X-era/PhyAgentOS-Kimi-Plugin
```

```text
/reload
```

```text
/plugins info phyagentos
```

```text
/mcp
```

**通过标准**：插件已启用，`forge` MCP 连接成功。首次连接需要联网下载 Core 等锁定依赖（已缓存时可复用），清单配置的启动超时为 300 秒。如果失败，保留完整错误信息，不继续后面的测试。

### 2. 检查环境和注册表访问

输入：

```text
/phyagentos:env
```

**预期**：在上述示例环境中，平台为 Linux x86_64，Forge 根目录为 `/home/gx/.kimi-code/forge`。检查结果可能识别到全局 Dora，并报告缺少 `dora1`，以实际输出为准；首次启动时创建或重新生成 Forge 目录属于正常现象。

然后输入：

```text
/phyagentos:skills robot
```

**通过标准**：全新数据目录中的本地技能列表为空，注册表搜索能够返回结果。已有环境可能列出已安装技能；不要为了满足空列表而删除数据。注册表连通性由这一步实际确认。

### 3. 测试技能安装、诊断和仿真

输入：

```text
安装 robot-control-sim，并通过 forge_install_status 轮询到终态。
成功后列出技能的可用 profile；失败则报告错误并停止，不启动仿真。
```

若返回的 profile 包含 `mujoco-piper`，继续；不包含则记录实际列表，停止本项仿真测试：

```text
/phyagentos:doctor robot-control-sim mujoco-piper
```

诊断无阻断项后输入：

```text
启动 robot-control-sim 的 mujoco-piper profile。
等待 Gateway 就绪，再调用 sim.get_robot_info 查询信息。
本次只验证仿真和状态查询，不执行运动动作。
```

**通过标准**：安装任务成功、诊断无阻断项、Gateway 就绪，查询返回机器人信息。仅返回进程 PID 不算仿真启动验证完成；失败时保留错误，不继续执行后续功能测试。

### 4. 停止实例并确认清理

测试结束后输入；若启动验证失败但已创建进程，也执行此清理步骤：

```text
停止 robot-control-sim 的运行实例，并查询运行状态，确认已经停止。
```

**通过标准**：运行状态确认实例已经停止。

## 许可

MIT，详见 [LICENSE](LICENSE)。
