---
description: 对指定 Forge 技能（及可选 profile）执行只读预检与故障诊断
---

诊断目标：$ARGUMENTS

请针对上述目标执行只读诊断（若未指定技能名，请先调用 `forge_skill_list` 查看已安装技能并对它们生成 `forge_doctor_report`；若指定了 `<skill> [profile]`，请调用 `forge_skill_inspect`、`forge_skill_doctor` 并在存在运行日志时读取 `forge_runtime_logs`）。

严格遵守安全红线：只做只读检查并报告准确的 `FORGE_*` 诊断码、原因与未执行的修复建议，绝不擅自重启、停止运行时或修改配置文件。
