# 01. 插件包结构与 Manifest 规范设计

## 1. 托管副本与 npm 依赖准备
插件发布内容不携带 `node_modules`，也不内联 Core：
- `scripts/build-mcp.mjs` 仅将 Kimi 适配代码构建为 `mcp/adapter.mjs`，`@x-era/forge-core` 保持外部依赖。
- `mcp/forge-mcp.mjs` 是 Node 内置模块实现的启动器。首次使用时，根据同目录 `package-lock.json` 执行 `npm ci --omit=dev --ignore-scripts`，安装到 `<home>/plugin-runtime/<内容标识>/`。
- 依赖来自已发布的 npm 包；当前固定 Core `0.2.0`。已发布 `0.2.2` 尚未包含全部兼容补丁，因此在 `compat-core/` 创建私有兼容副本，npm 原包不变；见[核查与补丁说明](../core-patches.md)。
- 后续启动验证并复用缓存；运行环境需要 Node >=22，首次安装需要 npm 和制品网络。准备日志仅写 stderr，可通过 `--prepare-only` 预安装。
- 清单仍引用插件目录内的启动器；启动器不依赖安装宿主自动执行 npm。

## 2. `kimi.plugin.json` 关键字段映射
- `name`: `"phyagentos"`（插件唯一 ID，命令与技能自动归入 `phyagentos:*` 命名空间）。
- `systemPromptPath`: `"./SYSTEM.md"`（控制在 ~2 KB，远低于单文件 32 KB 与总计 64 KB 上限）。
- `skills`: `"./skills/"`（包含 `forge-usage` 与 `forge-skill-development` 两个目录型技能，名称均满足 `[a-z0-9_-]{1,25}`）。
- `commands`: `"./commands/"`（提供 `env`、`skills`、`doctor`、`export-skill` 四个斜杠命令）。
- `interface`: 默认 `zh-CN`，挂载 `./locales/{zh-CN,en-US}.json`，提供 `mcpOverrides.forge` 与 `skillOverrides` 市场展示文案。
- `mcpServers.forge`: `command: "node"`, `args: ["./mcp/forge-mcp.mjs"]`, `startupTimeoutMs: 300000`, `toolTimeoutMs: 180000`。

## 3. 动态机器人技能发现与热加载衔接
Kimi 托管插件目录为静态快照。对于用户在运行期新安装的机器人技能包（如 `robot-control-sim`）：
1. 默认通过 `forge_skill_list` → `forge_skill_read` / `forge_skill_docs` 按需读取说明并通过 `forge_tool_call` 调用；
2. 用户执行 `/phyagentos:export-skill <name>`（即 `forge_skill_export` 设置 `kimi_skills: true`）即可将带 frontmatter 的 `SKILL.md` 导出至 `~/.kimi-code/skills/<name>/`，触发 Kimi 用户级技能目录的自动热刷新。
