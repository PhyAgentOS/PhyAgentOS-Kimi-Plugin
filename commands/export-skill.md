---
description: 将已安装的 Forge 机器人技能包导出为 Kimi 用户级 Skill（自动热加载）
---

导出目标技能名：$ARGUMENTS

如果上方未指定技能名，请先调用 `forge_skill_list` 列出当前已安装的 Forge 技能供我选择；如果已指定技能名，请调用 `forge_skill_export`（设置 `name` 为该技能名，`kimi_skills: true`）将其导出到 Kimi 用户级技能目录（`~/.kimi-code/skills/<name>`），并告知导出路径与 `/skill:<name>` 调用方式。
