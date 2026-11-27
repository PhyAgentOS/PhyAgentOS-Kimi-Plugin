# 05. 测试验证、发版联动与公开市场提审方案

## 1. 四层验证门禁
1. **静态与清单校验（`pnpm run build:check` & `pnpm run validate`）**：验证 `mcp/forge-mcp.mjs` 构建零漂移、`kimi.plugin.json` 字段合法、无越界软链、`SYSTEM.md` 字节预算、Skill 命名规则与双语 `README` 顶部互链。
2. **隔离与存储单测（`tests/isolation-and-paths.test.mjs`, `tests/config-store.test.mjs`）**：验证隔离目录解析优先级、`config.json` 原子写入/`0600` 权限/损坏保护/备份回滚，以及对模拟 `~/.dsh` 目录的零触碰。
3. **托管副本端到端 MCP 集成测试（`tests/mcp-stdio.test.mjs`）**：将不携带 `node_modules` 的插件拷贝至临时目录，由启动器首次安装锁定 npm 依赖并创建兼容副本，再通过真实 stdio JSON-RPC 验证握手、41 个工具 schema、离线环境体检、配置热刷新、首装 `support/bin/dora` 同会话自动识别及 portable/Kimi 技能导出。
4. **宿主实机与提审验收**：在 Kimi Work / Kimi Code 中完成导入与对话冒烟。

## 2. 公开市场提审材料清单
通过 Kimi 插件详情页右上角 `✉️` → **「申请发布到官方市场」** 提交时附带：
- 宿主范围说明：支持 `desktop`（Kimi Work / Kimi Code Desktop）与 `cli`（Kimi Code CLI），依赖本机或 SSH 远端 `Node.js >=22`；
- 零真机 3 分钟审核员验收脚本：`/phyagentos:env`（离线/在线环境体检）→ `/phyagentos:skills`（公网免鉴权 Registry 检索）→ `forge_repo_search`（节点仓库检索）。


## 3. 新增回归与实机验收记录

- `tests/core-hardening.test.mjs`：缓存校验、必需完整性元数据、只读模型盘、POSIX 权限和符号链接边界。
- `tests/mcp-runtime.test.mjs`：模拟 Dora/Gateway 的真实子进程启动、Query/Action/unknown 对账、持锁下载取消与刷新后任务保留。
- `scripts/run-tests.mjs`：跨平台枚举测试文件，避免 Windows shell 通配符差异。
- CI 增加 macOS/Windows Node 22、Linux Node 24；POSIX 专属场景在 Windows 明确跳过，实际结果以本次提交的 CI 为准。
- `tests/runtime-bootstrap.test.mjs`：首次 npm 安装、并发互斥、无网络缓存复用、损坏缓存保留与重建、失败重试及 npm 原包保持不变。
- `pnpm run benchmark:startup` 分别记录首次依赖准备与缓存已准备后的 initialize 耗时，不将网络安装混称为离线冷启动。

完整人工验收矩阵及证据要求见[验收清单](../acceptance_zh.md)。文件存在或模拟测试通过不等于 Kimi Work、SSH、MuJoCo 已实测；未执行行保持待执行。
源码修复不自动创建 Release 或发送市场申请；发布维护者须附上该提交的门禁、实机日志及申请回执。
