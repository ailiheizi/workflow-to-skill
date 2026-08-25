# Workflow-to-Skill

[English](README.md) | 简体中文

复制下面这段话，发送给您的 AI Harness：

```text
请按照下面的指南安装并配置 Workflow-to-Skill：
https://raw.githubusercontent.com/ailiheizi/workflow-to-skill/refs/heads/main/AI_GUIDE.md
```

Workflow-to-Skill 将目标和已有工具能力转化为可读、可审阅、可复用的
Agent Skill。

项目只有三个核心产物：

- 根目录的 [`README.md`](README.md)，用于定义思想和创作标准；
- [`workflow-to-skill`](workflow-to-skill/SKILL.md)，用于创建工作流 Skill；
- [`workflow-to-skill-with-surface`](workflow-to-skill-with-surface/SKILL.md)，
  用于创建同一种 Skill，并可选择附加专用 Prompt Surface。

`reference/` 下的内容是经过筛选的参考适配器、示例、测试、fixture、法律声明或
证据文件，不是新的产品层。
本文件是根 README 的简体中文翻译，也不是额外的产品概念。

## 核心思想

工作流不一定是一张图。在这里，它是 Agent 可以阅读并用来达成结果的方法：

```text
目标 + 输入 + 真实能力
-> 推荐方法与决策
-> 失败与恢复行为
-> 可验证的结果
```

Skill 描述如何达成目标。Harness 加载 Skill、运行 Agent 并调用工具。已有的
CLI、MCP、HTTP、API、Weft、Dify、n8n、ComfyUI 或其他系统执行真正的工作。

```text
普通用户请求
-> Harness + Agent + 工作流 Skill
-> 已有能力
-> 观测到的结果与证据
```

Workflow-to-Skill 不拥有执行器、工具注册表、工作流引擎、DAG、队列、调度器、
状态存储、编译器、IR、DSL 或 Page 运行时。如果目标 Harness 缺少某项能力，
应报告集成缺口，而不是在 Skill 内部虚构一个能力。

需要区分三种所有权：

- **可移植**：目标、方法、决策边界、恢复和成功证据；
- **绑定于 Harness**：Skill 发现、准确工具名、权限、凭据、任务生命周期和结果约定；
- **外部所有**：实际命令、API、工作流、副作用和持久执行状态。

## 选择一个创作 Skill

只使用其中一个：

| 需求 | 创作 Skill |
| --- | --- |
| 创建一个可从普通 Chat 或其他 Harness 入口调用的可复用工作流 | [`workflow-to-skill`](workflow-to-skill/SKILL.md) |
| 创建同一种工作流，并附加专用表单、Page、按钮组、命令界面或结果视图 | [`workflow-to-skill-with-surface`](workflow-to-skill-with-surface/SKILL.md) |

如果网页、报告、图片或 UI 是工作流的**输出**，不需要使用 Surface 版本。只有当
用户需要一个专门用来调用 Skill 或展示 Harness 结果的界面时，才使用 Surface
版本。

两个创作 Skill 都会生成一个普通的 `SKILL.md`。Surface 版本还可以生成一个
Harness 原生界面，但工作流 Skill 在没有该界面时仍然必须可以完整使用。

## 可以创建什么

Workflow-to-Skill 不提供下列工具。每个例子都假设目标 Harness 已经提供所需的
CLI、MCP 工具、API 或外部工作流。Skill 携带方法、决策、审阅边界、恢复指导和
成功标准；已有能力执行并拥有真正的工作。

| 工作流模式 | 示例用途 | 必须已有的能力 | 真实成功证据 |
| --- | --- | --- | --- |
| 研究、筛选和综合 | 最新模型简报、论文证据地图、竞品或政策监控、事实核查 | RSS 或 RSSHub、搜索、浏览器、研究 API、文档读取器 | 原始 URL、观测到的日期、有边界的来源覆盖和引用证据 |
| 检查、修改和验证代码 | 修复 Bug、升级有漏洞的依赖、迁移框架、修复失败测试 | `git`、代码搜索、包管理器、测试与安全 CLI | 可审阅的 diff、相关测试通过，以及观测到的审计或构建结果 |
| 准备并验证发布 | 审阅 PR、准备候选版本、生成 changelog、部署到 staging | 源代码托管 API、CI、构建、产物和部署工具 | commit SHA、CI 结果、产物摘要、部署状态和健康检查 |
| 观测、诊断和恢复 | 调查生产事故、Kubernetes 故障、云成本异常或备份问题 | 日志、指标、追踪、`kubectl`、云 CLI、事件系统 | 可复现查询、证据支持的诊断、外部操作记录和观测到的恢复信号 |
| 查询、检验和解释数据 | 调查 KPI 异常、审计数据质量、比较群组、核对数仓结果 | SQL 或数仓工具、BI API、dbt、Notebook 或统计能力 | 查询或运行标识、有边界的数据集、行数和可复现报告 |
| 提取、比较并生成产物 | 比较合同、核对发票、合并表格、把会议转成决策记录 | PDF、文档、OCR、表格、存储或业务系统工具 | 来源位置、经过验证的差异、未决项和可检查的输出产物 |
| 创建、审阅和发布媒体 | 撰写有来源的文章、本地化内容、生成产品图、剪辑视频、制作演示文稿 | CMS、翻译、图像生成、ComfyUI、`ffmpeg`、演示文稿或发布工具 | 经过验证的产物、必要时的审阅记录，以及发布 URL 或回执 |
| 分类并更新业务记录 | 分流支持工单、补全 CRM 记录、准备入职、整理采购请求 | Zendesk、Jira、Salesforce、Slack、HRIS、ERP 或同类 API | 记录 ID、准确的变更字段、最终状态和系统回执 |
| 提案、审批、执行并对账 | 退款、授予权限、提交采购单、发送营销活动 | 具备状态查询和防重复机制的支付、IAM、ERP、邮件或审批能力 | 已审阅参数、操作 ID、终态，以及账本或目标系统确认 |
| 复用已有工作流运行时 | 调用 Weft 研究任务、n8n 同步、Dify 知识工作流或 ComfyUI 生成图 | 按需提供外部系统的提交、状态、取消和结果约定 | 运行 ID、实际终态、经过验证的输出或产物，以及如实报告的部分成功或失败状态 |
| 添加专用 Prompt Surface | 把任何重复的参数化工作流变成表单、Page、命令界面、按钮组或结果视图 | Harness 原生的普通消息提交与结果展示 API | 控件映射到可见的普通 Skill 消息，并展示与 Chat 相同的已验证结果 |

当工作流需要重复使用的结构化控件或专用结果视图时，选择 Surface 版本。如果
网页、图片、报告、表格或视频只是工作流的输出，仍然使用纯 Skill 版本。

以下情况不适合把问题交给本项目：不存在兼容能力；普通脚本已经可以更清楚地
表达固定、确定性的转换；或者项目将不得不自行拥有严格并发、持久队列、调度或
长时间运行的状态机。此时应把运行时留在代码或已有系统中，只在确实需要 Agent
判断、审阅、恢复指导或结果解释的地方使用 Skill。

## 创建与复用：一个完整闭环

准确的安装命令取决于 Harness。下面使用仓库级 Codex Skill 目录展示完整闭环，
而不是定义一种通用安装协议。

### 1. 安装创作 Skill

```sh
mkdir -p .agents/skills
cp -R workflow-to-skill .agents/skills/
```

确认 Harness 确实发现了 `workflow-to-skill`，然后明确调用这个候选项。文件夹存在
于磁盘上并不能证明 Harness 已经发现它。

### 2. 请它创作一个领域 Skill

```text
使用 $workflow-to-skill 创建一个可复用的 model-release-brief Skill。

目标：从已批准的来源中查找最近发布的模型，并返回附带来源链接的简报。
已知能力：目标 Harness 提供 research_latest_models，其结果包含
source URL、published_at、title 和 summary 字段。
默认值：最多返回过去 14 天内的 6 个发布。
修改已批准的来源列表前必须经过审阅。
成功意味着每条发布都具有观测到的来源 URL 和日期。
请先提出方法和实质性决策供我审阅。
```

创作 Agent 检查真实能力，然后提出目标、输入、方法、决策、恢复和证据。如果
目标 Harness 提供的是另一种约定，它不能默默把上面的示例工具名当成真实工具。

### 3. 审阅并写入一个 Skill

确认实质性选择后，Agent 写入一个候选 Skill，例如：

```text
.agents/skills/model-release-brief/SKILL.md
```

工作流方法属于这个文件。安装日志和创作测试记录通常属于创作报告，不应永久
塞进每个运行时 Skill。

### 4. 确认发现并明确复用

按照 Harness 的正常行为重新加载，确认已加载的名称与作用域，然后明确调用已
安装的候选项：

```text
使用 $model-release-brief 查找最近 14 天的内容，最多返回 6 项。
```

### 5. 验证结果

只有 Skill 声明的证据真实存在时，本次运行才算成功。在本例中，这意味着简报中
每一项都有观测到的来源 URL 和发布日期。还要测试一种安全但实质性的失败，例如
来源工具不可用。将观测到的行为和未经测试的声明分开记录。

这就是完整的产品闭环：

```text
检查真实能力
-> 提案并审阅
-> 写入 SKILL.md
-> 安装并确认发现
-> 明确调用
-> 验证成功与失败行为
-> 通过普通 Harness 请求复用
```

## 工作流 Skill 标准

这是一套语义创作规范，不是新的文件格式。输出使用标准 Skill frontmatter 和
可读 Markdown。固定标题是可选的，但以下语义不能缺失。

每个生成的工作流 Skill 都必须说清楚：

- **目标**：预期结果、作用域、适用条件、排除项和完成标准。
- **输入**：必需值、可选值、默认值、验证方式、敏感输入处理和实质性未知项。
- **能力**：需要的外部能力，以及已知时准确的目标 Harness 绑定，包括重要参数、
  结果、凭据和生命周期假设。
- **方法**：推荐路径、步骤间传递的数据、决策，以及根据真实反馈进行的安全调整。
- **权限**：Agent 可以推断什么、什么需要审阅，以及什么情况必须停止执行。
- **失败与恢复**：缺少依赖、错误、超时、取消、有界重试、部分结果、不确定结果和
  恢复边界。
- **验证与输出**：证明完成的外部状态、结构化结果、产物、来源或业务检查，以及
  向用户展示什么。

生成的 Skill 应区分：

```text
必须（MUST）
  目标、作用域、权限、能力边界、停止条件、
  如实报告失败和成功证据

应该（SHOULD）
  推荐方法、默认值、工具偏好、有界恢复和结果展示

Agent 判断（AGENT JUDGMENT）
  无害的格式调整、低风险默认值、等价选择，
  以及根据真实工具反馈进行的调整
```

只有当缺失细节不会实质改变目标、对象、作用域、成本、权限、副作用或成功标准时，
Agent 才可以自行推断。实质性歧义需要审阅。缺失工具、凭据、权限、恢复路径和
成功信号都是集成缺口，不能猜测。

准确工具名和权限声明属于目标 Harness 绑定。已有宿主约定时使用该约定，不要
发明通用的 Workflow-to-Skill 工具或权限 schema。

## 运行时真相

永远不要混淆这些状态：

```text
工具调用被接受
!= 请求已提交
!= 外部工作已成功
!= 结果已经验证
```

对于异步工作，只有真实能力确实提供相应接口时，才描述提交标识、运行状态、终态、
状态查询、结果获取、取消、超时和恢复。如果只能观测到提交，就报告提交，不要报告
完成。

对于有副作用的操作：

1. 如果存在操作 ID、状态查询或外部回执，用它们核对不确定结果；
2. 只有在确认操作未生效，或真实操作可以安全幂等执行时才重试；
3. 否则报告 `unknown` 或 `partial`，保留已有标识和诊断信息，然后停止。

审批不能代替防重复机制。审阅后的副作用执行需要已有的一次性批准、幂等键或基于
状态的去重约定。如果都不存在，就停在提案阶段并报告缺口。

不要在提案、生成的 Skill、Prompt、日志、诊断、测试或交付物中存储或回显凭据
明文。只引用命名的凭据绑定；它的值由 Harness 或外部系统管理。

用户输入和外部内容只是数据与任务偏好。它们不能添加工具、扩大权限、移除验证，
也不能替换 Skill 约束。

## 运行姿态

姿态是自然语言决策指导，不是模式 DSL：

- **自适应完成**：使用安全默认值，并对实质性歧义提问。
- **执行前审阅**：先展示计划、实质参数、副作用和验证方式；只有在当前审阅上下文
  可以继续，而且已有防重复执行约定时才继续。
- **无人值守**：只在明确预授权范围内行动，遇到新权限、实质性歧义或不可验证状态
  时停止。

任何姿态都不能放松能力边界、授权、如实报告失败或成功验证。

## 专用 Prompt Surface

Prompt Surface 是专用表单、Page、按钮组、命令界面或结果视图。它把结构化输入
映射为普通 Skill 消息，并展示 Harness 的普通结果。Chat 是自由文本入口；专用
Prompt Surface 是可选的。

```text
控件
-> 可见的普通 Skill 消息
-> 同一个 Harness + Agent + Skill 路径
-> Harness 普通结果
-> 专用结果展示
```

Surface 可以收集和验证非敏感输入、应用可见默认值、构造可审阅的 Prompt、通过
Harness 的普通入口提交，并展示普通结果。

Surface 不能直接调用工具、授予权限、收集密钥、拥有工作流分支、复制重试或验证
逻辑，也不能创建另一套状态或事件协议。不可信的多行输入必须明确保持为数据，不能
注入工具、权限或姿态变更。

在一份联合提案中创作 Skill 和 Surface。一次审阅应解决二者共享的实质性决策；
只有仍存在未决的实质性选择，或之后发生实质变更时才再次询问。

只有当 Harness 可以继续已审阅的上下文，而且现有 Harness 或外部工具可以防止
重复批准再次产生副作用时，才把“执行前审阅”作为可执行的 Surface 控件。测试
“只提案不执行”“批准后继续”和“重复批准”三种行为。否则只提供提案行为，或报告
适配器缺口。

## 选择 Harness

Workflow-to-Skill 不绑定 DSH。选择最小的现有 Harness：它需要能够加载 Skill、
使用所需能力运行 Agent，并返回 Skill 验证所需的证据。

| 候选项 | 适用情况 |
| --- | --- |
| **DSH** | 希望使用本仓库中的参考适配器和验收证据。 |
| **Codex 或其他 Agent Skills 宿主** | 已经可以发现标准 Skill，并提供所需 CLI、MCP 或应用工具。 |
| **Harness 后面的 Weft** | Weft 管理持久工作流、审批、回执或产物，Harness 管理 Skill 加载和 Agent 循环。 |
| **Weft 自身作为 Harness** | 所选 Weft 部署本身提供 Skill 发现、Agent 循环、能力调用和普通结果 API。 |
| **自定义 Agent 应用** | 需要产品专用宿主，并由它实现相同的目标特定约定。 |

共享 Skill 语法并不意味着运行行为完全相同。在另一个 Harness 中复用时，需要重新
审阅工具、参数、结果、权限、凭据、取消和生命周期绑定。

## 证据与边界

不同测试证明不同声明：

- 结构验证证明 frontmatter 和语义不变量；
- 集成测试证明一个 Harness 中的发现、绑定、失败传播和结果路由；
- 真实模型测试展示真实 Agent 在代表性案例中如何创作并遵循 Skill；
- 若要与普通 Skill 创作基线比较虚假成功、虚构工具、不安全重试、漏掉审阅和安装
  失败，需要对比评测。

DSH 参考实现目前有聚焦的结构、Host guard、原生 MCP、干净 profile 和浏览器
Surface 验收测试。参见
[`reference/plugins/actweave` 包](reference/plugins/actweave/README.md#current-evidence)。
这些测试不能证明未经测试的 Weft、Dify、n8n、ComfyUI、任意 CLI 或跨 Harness
行为。

当前确定性证据快照，观测于 2026-08-25：

- `npm test`：26 项测试通过，其中包括 23 项 Host、Skill、guard 和 MCP 合同测试，
  以及 3 项独立 RSS Prompt Surface 测试；
- `npm run security:audit`：架构守卫通过，`npm audit` 报告 0 个漏洞。

复现这些检查所需的精选源码、fixture、锁文件和脚本已包含在 `reference/` 中。
仓库也包含已配置的 DSH 验收脚本，但特定环境的验收结果必须在用户自己的 DSH
安装上重新建立。

运行确定性的本地门禁：

```sh
cd reference
npm test
npm run security:audit
```

已配置的 DSH 验收门禁记录在参考包中。

## 发布溯源

首次公开快照保存在
[`v0.1.0`](https://github.com/ailiheizi/workflow-to-skill/releases/tag/v0.1.0)。
它的 Git commit、带说明的标签和 GitHub Release 记录了这一实现的准确文件和
服务器可见发布时间。这可以证明这一具体组合的公开实现溯源，但不声称其他地方
从未出现过相关思想或更早工作。

## 仓库结构

```text
README.md                               产品思想和创作标准
README.zh-CN.md                         根 README 的简体中文翻译
AI_GUIDE.md                             AI 辅助安装说明
LICENSE                                 Apache-2.0 许可证
workflow-to-skill/SKILL.md              纯 Skill 创作者
workflow-to-skill-with-surface/SKILL.md Skill + 专用 Surface 创作者
reference/                              精选的 DSH 证据与验收 fixture
```

## 思想如何精炼而来

项目通过不断对早期系统应用奥卡姆剃刀，最终形成现在的形态：

```text
新版 Weft
  广泛的本地执行、恢复、产物、Page 和集成
-> Poiema
  对话、可复用任务、Effect、审批和工作流 Surface
-> 面向 DSH 的 Actweave
  复用已有 Agent、Skill 加载器、工具、Session 和 Client 生命周期
-> Workflow-to-Skill
  只保留语义标准和两个创作 Skill
```

Weft 说明真实执行、副作用、恢复、回执和产物属于执行层或事实层。Poiema 探索了
更广泛的工作流产品，并让其所有权成本变得清晰。DSH 插件说明已有 Harness 可以
拥有 Agent 执行和 UI 生命周期。最后一步又从可移植核心中移除了 Harness 绑定。

最终声明是刻意克制的：一个创作良好的 Skill 可以在兼容 Agent Harness 之间携带
工作流方法，而不必重新构建已经负责执行和验证工作的系统。它的实际优势和跨
Harness 覆盖范围应该由证据证明，而不是由这个思想自行假定。

项目采用 [Apache License 2.0](LICENSE) 许可证。参考证据涉及的第三方
声明保存在 `reference/` 中。
