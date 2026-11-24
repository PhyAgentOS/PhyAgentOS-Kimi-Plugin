[English](releasing_en.md) | 简体中文 · [首页](../README_zh.md)

# 版本发布与 Kimi 公开市场提审指南

## 1. 升级 `@x-era/forge-core` 与重打包流程

1. 在个人 fork 创建 `feature/<topic>` 或 `fix/<topic>` 分支，不在上游仓库直接推送开发分支。
2. 同步更新 `package.json` 中的 `@x-era/forge-core` 依赖版本，以及 `package.json` 与 `kimi.plugin.json` 的 `version`。
3. 重新生成单文件 MCP 产物并运行全量门禁：
   ```sh
   pnpm install
   pnpm test
   pnpm run build:check
   ```
4. 推送源分支及创建 PR 前，执行 `gh api user --jq .login` 核对当前认证账号与 Git 作者身份一致。
5. 合入 `main` 后创建不可变 GitHub Release tag（例如 `v0.2.0`）——Kimi `/plugins install https://github.com/PhyAgentOS/PhyAgentOS-Kimi-Plugin` 在存在 Release 时默认拉取最新 Release。

## 2. 提交至 Kimi 官方公开市场流程

根据 Kimi 官方发布规范：
1. 先在 **Kimi Work 桌面端** 通过 `Plugin Builder` / `+ Custom plugin` 导入本仓库，在「个人（Custom）」页签完成安装与冒烟验证。
2. 打开 **PhyAgentOS Forge** 插件详情页，点击右上角 **`✉️`** 按钮。
3. 在反馈表单中选择 **「申请发布到官方市场」**，填写维护团队联系邮箱并附上如下测试说明：
   - **适用宿主声明**：桌面端（`Kimi Work` / `Kimi Code Desktop`）与命令行（`Kimi Code CLI`），基于本地 `stdio` MCP（需 `Node.js >=22`），适用于 `macos` / `linux` / `windows` 本地或 SSH 远端环境（非纯网页云沙箱）。
   - **零真机 3 分钟官方审核员验收步骤（任意装有 Node >=22 的 Mac/Win/Linux 均可复现）**：
     1. 输入 `/phyagentos:env`：验证 `forge_environment_check` 正常返回报告且数据目录隔离在 `~/.kimi-code/forge`。
     2. 输入 `/phyagentos:skills`：验证免 Token 访问公共注册表 `https://paos-resource-platform.dev.x-era.com/v1/skills` 列出可用机器人/仿真技能。
     3. 输入「搜索与 mujoco 相关的 Forge 节点仓库并查看详情」：验证 `forge_repo_search` 与 `forge_repo_info` 正常工作。
