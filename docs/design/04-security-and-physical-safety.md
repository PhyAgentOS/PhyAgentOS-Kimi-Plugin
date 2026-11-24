# 04. 安全模型与物理执行红线设计

## 1. 物理动作治理红线（`SYSTEM.md` 强制注入）
1. **三阶段严格区分**：Gateway HTTP `202` 受理（返回 `invocation_id`）、Action 终态（`phase=completed`）与物理任务成功（残差收敛/`reached_goal`/`rehomed`）互不等价。
2. **未知结果禁重发**：超时或 `unknown` 状态仅作为诊断证据，必须先调用 `forge_invocation_read` 对账，严禁自动重发物理动作指令。
3. **失败即停禁自修**：任何 `forge_*` 调用失败均为当前轮次终态，禁止擅自停止/重启 runtime、杀进程、改端口或静默调参重试。
4. **显式启停授权**：`forge_runtime_start` 与 `forge_runtime_stop` 必须有用户的明确指令。

## 2. 路径、归档与凭据边界
- 插件自身通过 `scripts/validate-plugin.mjs` 强制校验无越界路径与外部软链接；
- 技能包与节点归档继续由 `@x-era/forge-core` 拦截绝对路径、`..` 与符号链接/硬链接，并强制核验字节长度与 SHA256；
- `<home>/config.json` 与实例化运行环境均采用 `0600` 权限；私有 Registry 认证优先使用 `registry.tokenEnv` 引用环境变量名而非明文落盘。

## 3. Kimi 宿主权限档位建议
在连接真实机械臂或底盘硬件时，推荐在 Kimi Work / Kimi Code 中保持 **默认（敏感操作确认）** 或 **手动审批** 模式，不建议对 `mcp__forge__forge_tool_call` 或 `mcp__forge__forge_runtime_*` 开启全自动免审（YOLO）放行。
