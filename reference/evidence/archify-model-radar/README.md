# Workflow-to-Skill × Archify：模型检索案例复盘

[打开交互图](model-radar.html) · [绘图输入](model-radar.workflow.json) · [原始案例](../dsh-model-signal-radar/README.md)

本次试用读取已有的 `dsh-model-signal-radar` Skill 和仓库中保存的 DSH
运行记录，由 Agent 编写 Archify 的工作流绘图输入，再调用 Archify 原版
CLI 生成、校验并检查 HTML。没有修改核心两个 Skill，没有全局安装
Archify，没有新建工作流执行器，也没有在此次试用中重新运行 DSH。

## 可以怎么查看

- 「① 创建与恢复」展示候选已写出、调用端超时、恢复会话确认原文件。
- 「② 全新会话复用」聚焦 Skill 加载、官方来源搜索、页面读取和简报。
- 「③ Skill 的失败约定」展示来源全部不可达时的处理。这是方法约定，
  在该历史复用记录中未触发；虚线和说明明确标出这一点。
- 节点查找器可搜索「读取官方页面」并打开其属性和入向、出向关系。

图中顺序是对记录的语义概括，不是逐条工具事件回放。阅读章节或播放
故事只改变图的展示，不会调用 DSH、重新检索或执行外部操作。

图形是普通工作流的一个输出，因此本次使用 Skill-only 组合即可。
只有再添加向 Harness 提交工作流请求的专用界面，才涉及 with-surface。

## 事实依据

| 图中内容 | 依据 | 本次核验范围 |
| --- | --- | --- |
| 创建、超时、恢复、原 Skill 未重写 | [案例记录](../dsh-model-signal-radar/README.md)、[运行摘要](../dsh-model-signal-radar/run-summary.json) | 读取已保存记录；未重新连接历史 DSH 会话 |
| 全新会话加载、4 次 web_search、9 次 bash | 同一运行摘要及案例记录 | 工具调用数为整个复用会话的合计；图未展开每一次调用 |
| HTTP 200、148,908 bytes、日期与结果边界 | [历史结果](../dsh-model-signal-radar/success-output.md)、运行摘要 | 复述历史记录；本次没有重新请求 DeepMind 页面 |
| 瞬时失败最多重试一次、无法验证时如实停止 | [生成的 Skill](../dsh-model-signal-radar/SKILL.md) 的 Failure And Recovery | 方法条款；不能据此声称该失败分支已通过行为测试 |

输入文件 SHA-256：

```text
SKILL.md:           0c64b28aa29849f6926ccdad1cde4d7dc269fc47331a7709d2c713a3578bb4a2
run-summary.json:   d533e1cfb0b0d830eba63701d6a54039efa965cac9676ce795f33603c53c4e23
success-output.md:  909cbe5926f073a1217c648900e13464f4e7e884c411caa0df19fc9789d9d842
```

## 本次实际验证

- Archify `validate`、`deliver`：9/9 showcase，0 errors，0 warnings。
- 原版 `visual-check`：Chrome 实测 1440×900、1600×1000、1920×1080、
  2048×1320，检查通过；另有两个端点尺寸的深浅主题截图。
- 图像审阅：检查了 1440×900 深色和 2048×1320 浅色截图。节点和标签
  没有可见裁切，分支有标注。全图细字偏小，跨行连接较长，章节聚焦
  比全图更适合阅读；这仍是一版组合试用样例。
- 内置浏览器：点击复用章节后出现 `#view=reuse` 和四个节点；点击
  失败章节后出现 `#view=limits` 和「未触发」说明；搜索「读取官方页面」
  返回 1/10 个节点，点击后出现 `#focus=fetch`，显示 1 条入向、2 条出向。
- 本次未测试导出格式、实时运行状态接入、改图后自动修改 Skill，或
  Skill 新旧版本的行为提升。

[交付回执](delivery-receipt.json)绑定绘图输入和 HTML 的字节摘要。
[浏览器回执](model-radar.visual-check.json)绑定同一 HTML；其中
`visualReview: pending` 是自动检查器的固定语义，人工/图像审阅记录在本页，
未擅自覆盖其结果。[截图索引](model-radar.visual-check.html)包含四张原始截图。

```text
diagram_type: workflow
output: model-radar.html
specification_sha256: 77474c0804b7cbb373066508e27805c68170772c2e731b1e20d96e8afeaa3c3c
artifact_sha256: bad14acdb4368b607243600aa641b29f2a5ccd64c9136c310a3f074a505c07d0
validation: 9/9 showcase, 0 errors, 0 warnings
browser_evidence: passed
visual_review: passed (inspected screenshots; layout limitations noted above)
correction_rounds: 2
```

## 复现与依赖

使用 [Archify 固定提交](https://github.com/tt-a1i/archify/tree/7ce87eff8e43e91069d43ed642f8845130e090c8)
中的 `archify.zip`，版本 `2.17.0-dev.1`。ZIP 解压在临时目录，未添加项目
依赖、修改系统 Skill 目录或安装 DSH 插件。运行环境为 Node.js 26.5.0。

```text
ZIP Git blob: 9d9d625d464ef1c1eab3eb1e57ef79e702b05ff0
ZIP SHA-256: cca27bf1ea357fc1b88652ff7e35369bbe14c91da73462c7093237f639534cf9
```

按 Archify 的 Skill 阅读 workflow schema、common schema 和一个例子后，
编写绘图输入。从本目录执行以下命令，其中路径替换为解压后的实际位置：

```sh
node /path/to/archify/bin/archify.mjs validate workflow model-radar.workflow.json --quality showcase --json
node /path/to/archify/bin/archify.mjs deliver workflow model-radar.workflow.json model-radar.html --quality showcase --json
node /path/to/archify/bin/archify.mjs visual-check model-radar.html --json
```

只有当前 `deliver` 成功后才对它的产物运行 `visual-check`。本次关闭了
可选更新检查，保持固定版本。HTML 可直接在浏览器中打开；运行时不需要
Archify 服务。`model-radar.workflow.json` 是外部绘图工具的输入，不是
Workflow-to-Skill 新增的执行协议。

本目录 HTML 包含 Archify 查看器代码，随附原版
[MIT 许可证](ARCHIFY-LICENSE)和[第三方声明](ARCHIFY-THIRD-PARTY-NOTICES.md)。
这些文件没有改变本项目核心文件的许可证。
