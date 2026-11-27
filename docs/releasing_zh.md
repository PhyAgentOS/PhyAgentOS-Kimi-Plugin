[English](releasing_en.md) | 简体中文 · [首页](../README_zh.md)

# 版本发布与 Kimi 公开市场提审指南

## 1. 升级 DSH 组合包与重打包流程

1. 在个人 fork 创建 `feature/<topic>` 或 `fix/<topic>` 分支，不在上游仓库直接推送开发分支。
2. 升级前核查已发布的 DSH 组合包及其传递依赖 Core，再按下文使用 `sync:dsh`。同步会维护 `package.json` 和 `mcp/package.json` 中的组合包版本、两套锁文件、`dsh-upstream.json`、兼容补丁及摘要和 MCP 构建产物；人工审核各本地补丁应重放还是移除。同步更新 `package.json` 与 `kimi.plugin.json` 的插件版本。此流程只发布 Kimi 插件，无需新发布 npm 包。
3. 重新生成外部 Core 适配层及启动器并运行全量门禁：
   ```sh
   pnpm install
   pnpm test
   pnpm run build:check
   ```
4. 推送源分支及创建 PR 前，执行 `gh api user --jq .login` 核对当前认证账号与 Git 作者身份一致。
5. 合入 `main` 后创建不可变 GitHub Release tag（例如 `v0.2.0`）——Kimi `/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` 在存在 Release 时默认拉取最新 Release。

## 2. 手动同步 DSH 发布依赖链

在 Forge 系列包中，开发与运行时清单只直接依赖 `@x-era/dsh-forge`。Core 通过 `@x-era/dsh-forge → @x-era/dsh-forge-skill → @x-era/forge-core` 传递引入，当前锁定链为 `0.2.2 → 0.2.2 → 0.2.2`；`undici` 仍是单独的直接依赖。Core 升级跟随该组合包依赖链，不单独选择版本。

仓库不定时查询上游，也不自动创建升级 PR。维护者需要升级时，在系统终端的仓库根目录手动运行下列命令。需要 Node.js、npm、`package.json` 指定的 pnpm `12.18.0`、Git 和 tar。默认跟随 npm `latest`，也可指定精确稳定的 DSH 组合包版本；不接受版本范围或预发布版本，并拒绝降级。

本地命令契约：

```sh
pnpm install --frozen-lockfile
pnpm run sync:dsh -- --check
pnpm run sync:dsh
# 可选：检查和执行均可指定某个已发布的稳定版本。
pnpm run sync:dsh -- --check --version 0.2.2
pnpm run sync:dsh -- --version 0.2.2
# 可选：为该组合包解析出的 Core 提供已审核的替换补丁。
pnpm run sync:dsh -- --version 0.2.2 --patch /path/to/reviewed.patch
```

`--check` 输出 JSON 字段 `updateAvailable`、`coreChanged`、`applied`、`previous` 和 `target`，不写文件；包版本位于 `target.packages`。`--version` 选择 DSH 组合包，不单独选择 Core。以 JSON 输出和跟踪文件确认实际选中的版本；除非检查和执行均指定相同的精确 `--version`，否则它们是两次独立的 npm 查询。

同步会维护两份清单中的组合包直接依赖、`pnpm-lock.yaml`、`mcp/package-lock.json` 和 `dsh-upstream.json`，包括 Core 不变的组合包或 Skill 更新；同时维护解析出的传递依赖 Core 对应的补丁及映射、兼容摘要和 MCP 构建产物，不会添加 Core 直接依赖。先在临时副本安装依赖并通过完整 `pnpm test` 和 `pnpm run build:check`，再写回改动；验证失败不会写回候选升级。版本未变且未提供替换补丁时不写文件。即使包版本未变，提供已审核的替换补丁也可触发重建。

升级成功后，由维护者检查 `git diff`，执行 `pnpm install --frozen-lockfile` 更新本地依赖，提交升级 PR，并确认普通 CI 的各平台检查通过。无需配置自动同步专用令牌或 Actions PR 写权限。

合入前审核 DSH/Core 实际版本、补丁迁移、两套锁文件、兼容摘要和生成 MCP 产物。文档中的 Core 版本引用**不会自动更新**；维护者需人工更新、决定插件版本号调整并完成人工验收，之后按前述流程合入和发布。

## 3. 提交至 Kimi 官方公开市场流程

根据 Kimi 官方发布规范：
1. 先在 **Kimi Work 桌面端** 通过 `Plugin Builder` / `+ Custom plugin` 导入本仓库，在「个人（Custom）」页签完成安装与冒烟验证。
2. 打开 **PhyAgentOS Forge** 插件详情页，点击右上角 **`✉️`** 按钮。
3. 在反馈表单中选择 **「申请发布到官方市场」**，填写维护团队联系邮箱并附上如下测试说明：
   - **适用宿主声明**：桌面端（`Kimi Work` / `Kimi Code Desktop`）与命令行（`Kimi Code CLI`），基于本地 `stdio` MCP（需 `Node.js >=22`），适用于 `macos` / `linux` / `windows` 本地或 SSH 远端环境（非纯网页云沙箱）。
   - **零真机 3 分钟官方审核员验收步骤（任意装有 Node >=22 的 Mac/Win/Linux 均可复现）**：
     1. 输入 `/phyagentos:env`：验证 `forge_environment_check` 正常返回报告且数据目录隔离在 `~/.kimi-code/forge`。
     2. 输入 `/phyagentos:skills`：验证免 Token 访问公共注册表 `https://paos-resource-platform.dev.x-era.com/v1/skills` 列出可用机器人/仿真技能。
     3. 输入「搜索与 mujoco 相关的 Forge 节点仓库并查看详情」：验证 `forge_repo_search` 与 `forge_repo_info` 正常工作。


## 4. 安全补丁、验收和发版证据

升级前阅读[Core 补丁维护说明及 npm 核查](core-patches.md)，保留或明确移除每个补丁。Core 保持外部依赖，从已发布 npm 制品安装；兼容副本不得修改 npm 原包。
提交内容必须包含补丁、workspace 配置、两套锁文件、兼容摘要、源码、测试和新构建产物。验收需覆盖 Node >=22 与 npm 的首次准备、后续无网络复用和不携带 `node_modules` 的托管副本。完整构建、校验与各平台 CI 通过后，按[人工验收表](acceptance_zh.md)记录客户端、SSH 和真实仿真结果。

审核员还应从 Registry 查询得到真实节点制品 ID，通过 `forge_node_info` / `forge_node_source` 检查固定版本源码；不要只用静态仓库查询代替源码获取验收。
公开 Release、市场申请和审核结果分别记录，不能以一份发布指南代替已发布证据。当前文档不声称这些外部动作已完成。
