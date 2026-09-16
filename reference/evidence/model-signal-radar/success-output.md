# Google DeepMind 模型信号雷达

- **焦点**：Google DeepMind 最近 14 天的模型或 AI 能力变化，优先 sign-language-to-text
- **时间窗口**：2026-08-11T14:01:32Z 至 2026-08-25T14:01:32Z
- **Cutoff**：2026-08-25T14:01:32Z
- **来源政策**：官方来源 בלבד
- **证据标准**：严格
- **状态**：`complete`

## 来源健康

- Google DeepMind RSS：成功，返回 3 个候选条目。
- 目标文章页面：HTTP 200，内容可核验。
- 未发现来源不可用或冲突。

## 1. SL2T sign-language-to-text 模型进入消费产品

**发生了什么**

Google DeepMind 发布大规模多语言 sign-language-to-text（SL2T）翻译模型，训练数据超过 100,000 小时，覆盖 50 多种手语；目前以 ASL 到英语为首个用户场景。

模型使用身体姿态关键点序列进行翻译，而不是直接处理原始视频。官方称其在 FLEURS-ASL 基准上取得 70 BLEURT 的 zero-shot 得分，并针对延迟、非手语输入误识别、左利手和单手手语等实际问题进行了优化。

**可用性**

已进入消费产品：

- Gboard 手语转文字输入
- Pixel 11 上的 Live Transcribe
- 首发支持 ASL → English
- 官方称无需额外付费，更多设备和语言后续推出

这属于“消费产品已提供、设备和语言范围有限”的可用状态；官方文章未宣布公开 API、模型权重或独立开发者访问方式。

**日期**

- 官方发布日期：2026-08-12
- RSS 观测日期：2026-08-12
- 页面最后修改：2026-08-21

**纳入理由**

这是窗口内唯一与 sign-language-to-text 直接匹配的官方模型能力变化，并且从研究模型推进到了实际消费产品，相关性和可操作性最高。

**主要证据**

[Google DeepMind：Putting sign language AI into users’ hands](https://deepmind.google/blog/putting-sign-language-ai-into-users-hands/)

**佐证或冲突**

无第三方来源纳入；官方 RSS 与文章页面相互一致。文章也明确披露了限制：罕见手势、快速拼指、被动结构、分类器描述和缺乏上下文时仍可能出错。

**可能影响**

对无障碍交互而言，ASL 用户可以直接通过手语输入搜索、起草消息或文档，并在 Live Transcribe 对话中用手语回复。更重要的变化是，手语处理从实验室研究转向系统级产品集成。

**不确定性**

目前无法从官方材料确认：

- Pixel 11 以外设备的具体上线时间；
- 其他手语的发布时间；
- 是否会开放 API 或模型下载；
- 不同真实环境、方言和用户群体下的独立性能。

**建议下一步**

若评估产品集成价值，应先在 Pixel 11 的 ASL 场景验证设备可用性、延迟、错误类型和隐私边界；暂不应假设 SL2T 已提供公开 API。

## 排除项

RSS 中另有 `Gemini 3.7 Flash` 和游戏 AI 研究文章，但在最多 1 条信号的限制下，它们与指定的 sign-language-to-text 优先焦点不如 SL2T 相关，因此未纳入。

最终已验证：SL2T 的官方发布、核心技术描述及其在 Gboard 和 Pixel 11 Live Transcribe 中的产品可用性。未验证：公开 API、权重发布、广泛设备覆盖及其他手语的上线时间。
