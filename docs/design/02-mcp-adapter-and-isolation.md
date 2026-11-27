# 02. MCP 薄适配层与隔离数据目录设计

## 1. 隔离数据目录解析优先级（`src/paths.mjs`）
`resolveKimiForgeHome()` 按以下顺序解析并展开 `~`：
1. `KIMI_FORGE_HOME`
2. `DSH_FORGE_HOME`
3. `$KIMI_CODE_HOME/forge`（未设置 `KIMI_CODE_HOME` 时为 `~/.kimi-code/forge`）

同时向 `new ForgeOperations(...)` 显式传入 `profilesRoot: join(home, 'profiles')`，并在 `forge_environment_setup` 中固定 `writeProfileConfig: false`，确保任何调用路径都**零触碰 `~/.dsh/`**。

## 2. 宿主无关配置存储（`src/config-store.mjs`）
替代 DSH 专属的 `cordis.patch.yml`，使用 `<home>/config.json` 存储宿主配置：
- 直接复用 `@x-era/forge-core` 导出的 `validateConfig`、`mergeForgeRowConfig`、`diffValues`、`withLock` 与 `ForgeError`；
- 通过 `runtime/forge.lock` 跨进程加锁，采用 `config.json.tmp-<pid>` + `0600` 权限原子 `rename`，每次覆盖前生成 `config.json.bak-<stamp>`；
- 若磁盘上已有损坏的 `config.json`，`read()` 显式抛出 `FORGE_CONFIG_INVALID`，拒绝静默合并覆盖导致配置丢失。

## 3. 同会话热刷新机制（免 `/reload`）
`@x-era/forge-core@0.2.0` 的 `SkillRuntimeManager` 在构造函数中静态缓存 `<home>/support/bin/{dora,dora1}` 是否存在。`src/forge-mcp.mjs` 在 `forge_environment_setup`（非 `dry_run`）、`forge_config_write` 与 `forge_config_restore` 成功后调用 `reloadOperations()`：
- 基于最新 `config.json` 与磁盘状态重建 `ForgeOperations` 并执行 `runtime.load()`；
- 继承原有的 `operations.jobs`（`JobRunner` 实例），保证后台进行中的下载任务及其 `AbortController` 不中断。

## 4. 41 个 MCP 工具契约与 stdio 协议保护
- 继承 `@x-era/forge-mcp@0.2.0` 的 39 个工具，并补齐 `forge_skill_package` 与 `forge_skill_install_local`，共 41 个工具；
- 所有文件路径入参统一经 `expandUserPath()` 展开前导 `~`；
- 启动时将 `console.log` / `console.info` / `console.warn` 重定向至 `stderr`，保证 `stdout` 仅输出纯净的按行 JSON-RPC 2.0 报文；支持 `2024-11-05` 至 `2025-11-25` MCP 协议版本握手协商。

## 5. 配置结构与错误行为

`config.json` 的字段白名单由 Core `validateConfig` 校验。典型配置如下；`home` 只能通过环境变量控制，不能写入 JSON：

```json
{
  "skills": { "roots": ["/data/forge-skills"] },
  "models": { "root": "/data/shared-models" },
  "registry": { "url": "https://paos-resource-platform.dev.x-era.com", "tokenEnv": "FORGE_REGISTRY_TOKEN", "timeoutMs": 20000 },
  "runtime": { "dora": "/opt/forge/dora", "dora1": "/opt/forge/dora1", "startTimeoutMs": 120000 },
  "gateway": { "callTimeoutMs": 15000 }
}
```

同步工具异常返回 MCP `isError: true`，正文含 `ok: false`、`code` 和原始 `message`。
诊断报告中的失败检查、初始化报告的 `ok: false`、安装任务的 `state: failed` 也应视为失败，不能仅检查 MCP 标志。
`forge_skill_install` 返回任务的 `id`，随后作为 `job_id` 查询或取消。
安装和配置修改共用写锁，因此配置刷新可能等待下载完成或用户取消；刷新保留任务对象和历史状态，不自动取消任务。

## 6. 全部 MCP 工具映射

除配置工具外，下面的方法均属于 `ForgeOperations`。路径参数在适配层展开；Gateway 工具按名称调用，不复制成静态 MCP 工具。

| MCP 工具 | 实际入口 |
|---|---|
| `forge_skill_list` | `list()` |
| `forge_skill_search` | `search(query)` |
| `forge_skill_inspect` | `inspect(name)` |
| `forge_skill_read` | `read(name)` |
| `forge_skill_install` | `install(name, nodes, version)` |
| `forge_skill_install_local` | `installLocal(path)` |
| `forge_skill_package` | `packageSkill(name, options)` |
| `forge_skill_versions` | `listSkillVersions(name)` |
| `forge_install_status` | `jobStatus(job_id)` / `jobList(10)` |
| `forge_install_cancel` | `cancelJob(job_id)` |
| `forge_skill_update` | `update(name, apply, version)` |
| `forge_skill_remove` | `remove(name)` |
| `forge_profile_files` | `profileTree()`，按技能过滤 |
| `forge_profile_read` | `profileRead(name, profile, file)` |
| `forge_profile_write` | `profileWrite(name, profile, file, content)` |
| `forge_repo_search` | `listRepositories(query, category)` |
| `forge_repo_info` | `repository(id_or_node)` |
| `forge_node_source` | `nodeSource(artifact_id, file, refresh)` |
| `forge_skill_docs` | `skillDocs(name)` / `readSkillDoc(name, file)` |
| `forge_skill_validate` | `validateLocalBundle(path)` |
| `forge_node_info` | `nodeInfo(artifact_id)` |
| `forge_skill_doctor` | `doctor(name, profile)` |
| `forge_doctor_report` | `doctorReport(name)` |
| `forge_environment_check` | `environmentCheck(options)` |
| `forge_environment_setup` | `environmentSetup(options)`，成功后刷新实例 |
| `forge_config_read` | `KimiConfigStore.read()` |
| `forge_config_write` | `KimiConfigStore.write(config, options)`，随后刷新 |
| `forge_config_restore` | `KimiConfigStore.restore(backup)`，随后刷新 |
| `forge_runtime_start` | `runtimeStart(name, profile, mode)` |
| `forge_runtime_status` | `runtimeStatus(name)` |
| `forge_runtime_stop` | `runtimeStop(name, force)` |
| `forge_runtime_logs` | `runtimeLogs(name, lines)` |
| `forge_tool_context` | `toolContext(name, tool_id)` |
| `forge_tool_call` | `toolCall(name, tool_id, arguments)` |
| `forge_invocation_read` | `invocationRead(name, invocation_id)` |
| `forge_cache_summary` | `cacheSummary()` |
| `forge_cache_gc` | `cacheGc(dry_run)` |
| `forge_model_search` | `modelSearch(query)` |
| `forge_model_info` | `modelInfo(id, revision)` |
| `forge_model_verify` | `modelVerify(id, revision)` |
| `forge_skill_export` | `exportPortable(name, outDir)` |

## 7. 构建与本地补丁

esbuild 目标为 Node 22 ESM，仅打包 Kimi 适配逻辑到 `mcp/adapter.mjs`，Core 标记为 external。
`mcp/forge-mcp.mjs` 首次启动根据 `mcp/package-lock.json` 安装公共 npm 依赖到隔离运行目录，生成 `compat-core/`，并将运行副本的适配层导入定向到兼容副本；npm 安装原包不变。
开发测试仍通过 `pnpm-workspace.yaml` 使用同一补丁；发布启动器对七个补丁文件的输入、输出 SHA256 做精确校验。
补丁、`mcp/compatibility.json`、两套锁文件与产物须一并维护。`pnpm run build:check` 检查生成文件漂移；不要手改生成产物。详见[维护说明](../core-patches.md)。
