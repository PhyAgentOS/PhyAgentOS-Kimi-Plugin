# 01. 插件包结构与 Manifest 规范设计

## 1. 托管副本与免编译直装约束
Kimi 安装插件时会将仓库快照拷贝至 `$KIMI_CODE_HOME/plugins/managed/phyagentos/`，期间**不会运行 `npm install`**，且安全模型要求所有 `./` 引用解析软链接后仍位于插件根目录内。因此：
- 构建期通过 `scripts/build-mcp.mjs`（`esbuild`）将 `src/forge-mcp.mjs` 与 锁定版本且应用本地补丁的 `@x-era/forge-core`（及其纯 JS 依赖 `yaml`、`tar`）打包为单文件 `./mcp/forge-mcp.mjs` 提交入库；
- 运行期仅依赖宿主机器上的 `node`（`>=22`），无冷启动网络下载开销。

## 2. `kimi.plugin.json` 关键字段映射
- `name`: `"phyagentos"`（插件唯一 ID，命令与技能自动归入 `phyagentos:*` 命名空间）。
- `systemPromptPath`: `"./SYSTEM.md"`（控制在 ~2 KB，远低于单文件 32 KB 与总计 64 KB 上限）。
- `skills`: `"./skills/"`（包含 `forge-usage` 与 `forge-skill-development` 两个目录型技能，名称均满足 `[a-z0-9_-]{1,25}`）。
- `commands`: `"./commands/"`（提供 `env`、`skills`、`doctor`、`export-skill` 四个斜杠命令）。
- `interface`: 默认 `zh-CN`，挂载 `./locales/{zh-CN,en-US}.json`，提供 `mcpOverrides.forge` 与 `skillOverrides` 市场展示文案。
- `mcpServers.forge`: `command: "node"`, `args: ["./mcp/forge-mcp.mjs"]`, `startupTimeoutMs: 60000`, `toolTimeoutMs: 960000`（覆盖 profile 的 900 秒等待及启动开销）。

## 3. 动态机器人技能发现与热加载衔接
Kimi 托管插件目录为静态快照。对于用户在运行期新安装的机器人技能包（如 `robot-control-sim`）：
1. 默认通过 `forge_skill_list` → `forge_skill_read` / `forge_skill_docs` 按需读取说明并通过 `forge_tool_call` 调用；
2. 用户执行 `/phyagentos:export-skill <name>`（即 `forge_skill_export` 设置 `kimi_skills: true`）即可将带 frontmatter 的 `SKILL.md` 导出至 `~/.kimi-code/skills/<name>/`，触发 Kimi 用户级技能目录的自动热刷新。
