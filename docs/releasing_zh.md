[English](releasing_en.md) | 简体中文 · [首页](../README_zh.md)

# 版本发布与 Kimi 公开市场提审指南

## 1. 升级 `@x-era/forge-core` 与重打包流程

1. 在个人 fork 创建 `feature/<topic>` 或 `fix/<topic>` 分支，不在上游仓库直接推送开发分支。
2. 升级前核查已发布 Core，保持 `package.json`、`mcp/package.json`、`mcp/package-lock.json` 与兼容文件摘要一致，明确重放或移除本地补丁；同步更新 `package.json` 与 `kimi.plugin.json` 的插件版本。此流程只发布 Kimi 插件，无需新发布 npm 包。
3. 重新生成外部 Core 适配层及启动器并运行全量门禁：
   ```sh
   pnpm install
   pnpm test
   pnpm run build:check
   ```
4. 推送源分支及创建 PR 前，执行 `gh api user --jq .login` 核对当前认证账号与 Git 作者身份一致。
5. 合入 `main` 后创建不可变 GitHub Release tag（例如 `v0.2.0`）——Kimi `/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` 在存在 Release 时默认拉取最新 Release。

## 2. 自动跟随已发布 DSH 版本

`.github/workflows/sync-dsh.yml` 每天 UTC 04:23 检查已发布的 `@x-era/dsh-forge`，也可在 **Actions → Sync DSH upstream → Run workflow** 手动运行。两个 job 均使用默认分支的已验证修订；手动选择其他 workflow ref 不会改变代码检出的目标。`version` 留空跟随 npm `latest`，或输入 `0.2.2` 这样的精确稳定版本；不接受版本范围、标签或预发布版本。

本地命令契约：

```sh
pnpm install --frozen-lockfile
pnpm run sync:dsh -- --check
pnpm run sync:dsh
# 可选：检查和执行均可指定某个已发布的稳定版本。
pnpm run sync:dsh -- --check --version 0.2.2
pnpm run sync:dsh -- --version 0.2.2
```

`--check` 输出 JSON 字段 `updateAvailable`、`coreChanged`、`applied`、`previous` 和 `target`，不写文件；包版本位于 `target.packages`。执行命令默认查询 npm `latest`，更新根目录 `dsh-upstream.json`；先在临时副本安装依赖并通过完整 `pnpm test` 和 `pnpm run build:check`，再写回改动。初始跟踪记录将 bundle、skill、Core 均精确固定为 `0.2.2`。无更新则不写文件。以 JSON 输出和跟踪文件确认实际选中的版本；未指定 `--version` 时，检查和执行是两次独立的 npm 查询。人工审核后可通过 `pnpm run sync:dsh -- --version X.Y.Z --patch /path/to/reviewed.patch` 重置补丁；即使上游版本未变，指定替换补丁也可能需要重建。

工作流将代码执行与 PR 写入分开：

- `verify` job 只有 `contents: read` 权限，使用 Node 22、pnpm 12.18.0，不持久化 checkout 凭证。安装依赖和执行候选包脚本仅在此处发生，不提供写令牌或 `DSH_SYNC_TOKEN`。安装、升级或任一门禁失败都会使工作流失败，不会创建 PR。
- 仅在升级成功且存在改动时上传只含变更文件的 Git 补丁。允许改动根目录 package/workspace manifests、锁文件、`dsh-upstream.json`、`patches/` 和 `mcp/`（含其 manifest、锁文件、兼容摘要及生成产物）；出现其他路径则失败。无更新不上传 artifact，也不创建 PR。
- 独立 runner 上的 `pull-request` job 拥有 `contents: write` 和 `pull-requests: write`，检出已验证的 base SHA，下载、应用补丁并再次检查允许路径，通过 `peter-evans/create-pull-request@v7` 创建或更新 `automation/sync-dsh` 到默认分支的 PR。此 job 不运行 npm、pnpm 或候选代码。工作流不会自动合并、打 tag、创建 Release 或提交市场审核。

启用 Actions，并按组织策略允许 **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**。默认使用 `GITHUB_TOKEN` 创建 PR。GitHub 当前会为此令牌产生的 `opened`、`synchronize`、`reopened` 事件创建需要批准的 PR 工作流运行，具有仓库写权限的维护者须在 PR 合并框选择 **Approve workflows to run**，不能假定各平台 CI 矩阵自动执行。如运行缺失或受仓库策略限制，可使用维护者身份更新 PR 分支以触发 CI；当前仓库 CI 没有 `workflow_dispatch` 入口。参见 [GitHub 令牌触发规则](https://docs.github.com/en/actions/concepts/security/github_token)。

可选配置仓库 Actions secret `DSH_SYNC_TOKEN`：使用仅限本仓库的 fine-grained token，授予 **Contents: read and write** 和 **Pull requests: read and write**。它仅传入创建 PR 的 action，使 PR 可按仓库策略正常触发 CI。仍须保留分支保护和必需检查；Ubuntu 同步门禁不代替完整平台矩阵。

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
