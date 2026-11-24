# 03. 跨平台兼容与远程机器人主机方案

## 1. 平台能力分层
| 能力域 | macOS / Windows 本机 | `linux/x86_64`（本机或 SSH 远端） |
| :--- | :--- | :--- |
| 环境体检、配置管理、缓存与模型校验 | 完整支持（平台项提示 `warn`） | 完整支持（参考平台 `pass`） |
| PAOS Registry 搜索、版本查询、技能包下载与文档阅读 | 完整支持 | 完整支持 |
| 节点仓库检索与固定 commit 源码读取（`forge_node_source`） | 完整支持 | 完整支持 |
| 本地技能包校验、Profile 编辑、确定性打包、Portable 导出 | 完整支持 | 完整支持 |
| Python 源码态数据流运行 | 按本机 Python / Dora 环境支持 | 完整支持 |
| 锁定 `linux/x86_64` 的预编译仿真/真机节点运行 | 需通过 SSH `environment_id` 委派至 Linux | **原生完整支持** |

## 2. Kimi SSH 远程环境（`environment_id`）标准拓扑
Kimi Code 内核支持在 `~/.kimi-code/config.toml` 配置 `[environments.<id>]`（`type = "ssh"`），并在 `mcp.json` 的 stdio server 上设置 `"environment_id": "<id>"`。此时：
- `forge-mcp.mjs` 子进程直接在远端 `linux/x86_64` 机器人/GPU 主机启动；
- `PATH`、`HOME`、隔离目录 `~/.kimi-code/forge`、Dora 守护进程及 `127.0.0.1` Gateway 均位于远端主机，Mac/Windows 桌面端零端口转发即可安全交互。

## 3. 大容量模型权重目录只读复用
运行时状态（`runtime/state.json`）必须按宿主隔离，但数十 GB 的本地模型权重（带 `receipt.json` SHA256 校验）为只读资产。用户可通过 `forge_config_write` 设置 `models.root`（或环境变量 `KIMI_FORGE_MODELS` / `DSH_FORGE_MODELS`）指向共享模型盘。


## 4. 可复现配置与验收边界

完整的执行器准备、脚本部署、`config.toml`、`mcp.json` 及本机服务禁用步骤见[中文使用手册](../usage_zh.md#3-跨平台说明与-ssh-连接远端-linux-机器人主机)。环境连接不代表目标已具备 Dora、技能、图形或硬件依赖；逐项结果记录在[验收清单](../acceptance_zh.md)。

共享模型根（包括默认模型目录的符号链接）不由初始化管理；所需缓存留在隔离 runtime。Windows POSIX 权限测试的跳过不代表用户目录 ACL 已验收。

## 5. 二期 HTTP MCP

当前入口仅提供 stdio，不接受 `--http`，不附带监听公网的 Gateway 或反向代理。
未来如加入 Streamable HTTP，应独立设计认证、TLS、网络边界、会话所有权和物理动作审批；本期不以未实现的接口宣称支持纯云端 Kimi Web。
