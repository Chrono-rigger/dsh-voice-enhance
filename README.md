# dsh-voice-enhance

Voice dictation and prompt enhancement for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — two controls added to the message composer.

[中文说明](README.zh.md)

## What it does

**Hold Alt to dictate.** Press and hold `Alt`, speak, release. The recording is transcribed on the Host, then passed through the Host model to fix the mistakes speech recognition usually makes — homophones, wrong characters, missing punctuation — and the result is inserted at the cursor.

**✨ Enhance prompt.** The sparkle button at the left of the composer, immediately before the model selector, rewrites the current draft into a clearer, more specific prompt using the same default model. The result replaces the draft, with an Undo control to get the original back.

A status pill appears below the composer card while either control is working: elapsed seconds, a "send on release" switch, an Insert button when a transcript could not be placed, and an Undo button after an enhancement.

| Key / control | Behaviour |
| --- | --- |
| `Alt` (press and hold) | Start recording |
| release `Alt` | Stop, transcribe, correct, insert |
| `Alt` + any other key | Treated as a shortcut (`Alt+Tab`, IME chords); the capture is discarded |
| `Esc` while recording | Cancel |
| ✨ button | Enhance the draft |

## Requirements

- The recording is transcribed by the Harness **Voice Input** plugin (`dsh-experimental-voice-input-bundle`), which must be enabled and its SenseVoice model prepared. Without it the plugin reports that the speech service is unavailable.
- Correction and prompt enhancement run on the Host through the `llm` service, using the composition's **default model route**. No API key is configured or read by this plugin.
- The browser needs microphone access (HTTPS or `127.0.0.1`, plus OS permission).

## Install

```sh
dsh plugin --profile <profile> add github:owner/dsh-voice-enhance
```

Or from the Web UI: **Settings → Plugins**, then install the bundle by package name or from a local directory.

## Notes

- Nothing is persisted except one browser-local preference: the "send on release" switch (`localStorage` key `dsh-voice-enhance.autoSend`). Recordings are discarded after transcription; no audio is written to disk.
- The audio pipeline is bounded end to end: microphone permission, recorder flush, decoding, resampling and transcription each have a timeout, so a wedged browser API surfaces as an error message rather than an endless "transcribing" state.
- Two Remote calls cross the wire, both of them one-shot text rewrites: `promptTools/refine` with `mode: "correct"` for a transcript, `mode: "enhance"` for a draft.
- The custom element styles use the host theme tokens (`--dsw-alias-*`), so light and dark themes need no separate artwork.

## Licence

MIT — see [LICENSE](LICENSE).
