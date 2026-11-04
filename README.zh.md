# dsh-voice-enhance

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的输入框增加两个控件：语音听写与提示词增强。

[English](README.md)

## 功能

**按住 Alt 说话。** 按住 `Alt` 说话，松开结束。录音在主机上转写成文字，再做一次最轻量的整理——错别字、同音字、明显漏字、标点与断句——然后把结果插入到光标处。整理刻意保持最小：不改写、不扩写、不总结、不反问，拿不准的地方原样保留。一段听上去像指令的口述，会被当作要抄下来的文字，而不是要去执行的要求。

**✨ 增强提示词。** 输入框左侧、紧挨模型选择器之前的星标按钮，把当前草稿改写成一份**能直接照着执行**的任务说明：补全背景与目标、把请求拆成可独立验收的要点、逐条写出验收标准、明确范围边界与约束、说明产出形式。改写后会保留「还原」按钮退回原稿。

**回退草稿。** 状态条上的「回退草稿」按钮（或 `Ctrl+Alt+Z`）可以把上一个草稿放回输入框。它不依赖状态条还在不在——草稿历史按 Session 存在浏览器本地，刷新页面后仍然可用，最多保留 12 份。回退本身也可以再回退，当前内容不会被丢掉。

任一控件工作时，输入卡片下方会出现一条状态条：已录秒数、「松开后直接发送」开关、文字未能插入时的「插入」按钮，以及增强之后的「还原」按钮。

| 按键 / 控件 | 行为 |
| --- | --- |
| `Alt`（按住） | 开始录音 |
| 松开 `Alt` | 停止、转写、纠错、插入 |
| `Alt` + 其它键 | 视为快捷键（`Alt+Tab`、输入法切换键），本次录音作废 |
| 录音中按 `Esc` | 取消 |
| ✨ 按钮 | 增强当前草稿 |
| `Ctrl+Alt+Z` | 回退到上一个草稿 |

## 依赖

- 转写由 Harness 的**语音输入**插件（`dsh-experimental-voice-input-bundle`）提供，需要启用并准备好 SenseVoice 模型；缺失时插件会提示语音服务不可用。
- 纠错与提示词增强在主机侧通过 `llm` 服务执行，使用当前组合的**默认模型路线**。本插件不读取也不配置任何 API Key。
- 浏览器需要麦克风权限（HTTPS 或 `127.0.0.1`，并授予系统权限）。

## 安装

```sh
dsh plugin --profile <profile> add github:Chrono-rigger/dsh-voice-enhance
```

也可以在 Web 界面：**设置 → 插件**，按包名或本地目录安装。

## 说明

- 除一个浏览器本地偏好外不持久化任何数据：那个「松开后直接发送」开关（`localStorage` 键 `dsh-voice-enhance.autoSend`）。录音在转写后即丢弃，音频不落盘。
- 音频处理链路端到端有界：麦克风授权、录音器 flush、解码、重采样、转写各有超时，浏览器接口卡死时会表现为一条错误提示，而不是无尽的「正在转写」。
- 只有两个 Remote 调用跨网络，都是一次性的文本改写：`promptTools/refine`，`mode: "correct"` 用于转写文本，`mode: "enhance"` 用于草稿。
- 纠错结果由代码复核，而不只靠提示词约束：如果模型回的是应答、反问、扩写或大幅缩短，这次结果会被拒绝，再用一次简短重试；仍然不合格就插入原始转写。带错别字的转写至少还是你原本说的话，被改写过的就不是了。
- 主机半边（`lib/index.js`）是一个 `TypertRemoteService`，注册服务 `promptTools`，只暴露一个 Remote 方法 `refine({ text, mode, instruction })`，内部调用 `llm.stream(...)` 并用 `AbortSignal` 透传取消。
- 浏览器半边（`lib/client.js`）自己挂载这份 Remote 描述符（`ctx.remote.$mount`），复用已经挂载的 `remote.speech` 做转写；它只申请一次麦克风权限，用 `MediaRecorder` 录音，再用 `OfflineAudioContext` 重采样成主机要求的 16 kHz 单声道 PCM16 WAV。
- UI 只占用两个槽位：`conversation.input.left`（✨ 按钮，就在模型选择器左边）和 `conversation.composer.dock`（状态条，在输入卡片下方），样式全部使用 `--dsw-alias-*` 主题变量。

## 许可证

MIT，见 [LICENSE](LICENSE)。
