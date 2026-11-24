# 05. 测试验证、发版联动与公开市场提审方案

## 1. 四层验证门禁
1. **静态与清单校验（`pnpm run build:check` & `pnpm run validate`）**：验证 `mcp/forge-mcp.mjs` 构建零漂移、`kimi.plugin.json` 字段合法、无越界软链、`SYSTEM.md` 字节预算、Skill 命名规则与双语 `README` 顶部互链。
2. **隔离与存储单测（`tests/isolation-and-paths.test.mjs`, `tests/config-store.test.mjs`）**：验证隔离目录解析优先级、`config.json` 原子写入/`0600` 权限/损坏保护/备份回滚，以及对模拟 `~/.dsh` 目录的零触碰。
3. **托管副本端到端 MCP 集成测试（`tests/mcp-stdio.test.mjs`）**：模拟 Kimi 安装行为，将插件目录（**剔除 `node_modules`**）拷贝至临时目录启动 `node ./mcp/forge-mcp.mjs`，通过真实 stdio JSON-RPC 验证握手、41 个工具 schema、离线环境体检、配置热刷新、首装 `support/bin/dora` 同会话自动识别及 portable/Kimi 技能导出。
4. **宿主实机与提审验收**：在 Kimi Work / Kimi Code 中完成导入与对话冒烟。

## 2. 公开市场提审材料清单
通过 Kimi 插件详情页右上角 `✉️` → **「申请发布到官方市场」** 提交时附带：
- 宿主范围说明：支持 `desktop`（Kimi Work / Kimi Code Desktop）与 `cli`（Kimi Code CLI），依赖本机或 SSH 远端 `Node.js >=22`；
- 零真机 3 分钟审核员验收脚本：`/phyagentos:env`（离线/在线环境体检）→ `/phyagentos:skills`（公网免鉴权 Registry 检索）→ `forge_repo_search`（节点仓库检索）。
