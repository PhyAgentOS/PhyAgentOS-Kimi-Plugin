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
