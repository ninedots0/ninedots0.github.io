# 9dots 项目指令

## 开发与读取

- 维护可部署到 GitHub Pages 的静态 Astro 博客。除非任务明确要求变更，保留现有文章 URL、草稿发布规则和 Markdown 兼容性。
- 开始前用 `git status --short --branch` 确认分支和工作区。按任务从相关入口、配置和调用者定向读取，复用已读上下文，避免重复扫描整个仓库。
- 涉及架构、核心实现、构建或部署时，按需阅读 [ARCHITECTURE.md](docs/ARCHITECTURE.md) 的相关部分。涉及当前进度、既有决策或未完成工作时，按需阅读 [HANDOFF.md](docs/HANDOFF.md)。
- 以当前代码和配置为准。复用现有实现，遵循邻近代码风格，只改完成任务所需的文件。具体变更用 Git 历史查询。

## 验证与 Git 安全

- 按需用 `bun install --frozen-lockfile` 安装依赖。站点代码、内容或配置变更应运行 `bun run build`（含 Astro 检查）；仅需类型检查时可用 `bun run check`。涉及页面交互、公式或搜索时，用 `bun run preview` 验证受影响行为。
- 纯文档变更核对路径、命令和事实，再检查 Git diff。报告实际执行的验证与未验证事项。
- 保留已有暂存、未暂存和未跟踪的工作。修改前检查相关 diff，避免覆盖、回滚或混入用户改动。仅在用户明确授权时执行 commit、push、reset 或 clean。

## 随改动维护文档

- 项目级开发规则或工作流程变化时，同步更新本文件。
- 架构、依赖、路由、Markdown 处理或核心实现变化时，同步更新 `docs/ARCHITECTURE.md`。
- 完成重大任务、发现重要问题或形成需跨会话保留的决策时，更新 `docs/HANDOFF.md`。替换过时状态和已解决事项，保持简短。
- 普通 CSS 调整和小型修复仅在影响已记录信息时更新文档。相关文档与代码同次改动保持一致，避免重复 Git 历史或做无实质变化的编辑。
