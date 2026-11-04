# dsh-voice-enhance

Voice dictation and prompt enhancement for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — two controls added to the message composer.

[中文说明](README.zh.md)

## What it does

**Hold Alt to dictate.** Press and hold `Alt`, speak, release. The recording is transcribed on the Host and then cleaned up — typos, homophones, missing characters, punctuation and sentence breaks — and the result is inserted at the cursor. The cleanup is deliberately minimal: it never rewrites, expands, summarises or asks a question, and anything uncertain is left exactly as it came out. A dictated sentence that happens to *sound* like an instruction is treated as text to be copied, not as a request to follow.

**✨ Enhance prompt.** The sparkle button at the left of the composer, immediately before the model selector, rewrites the current draft into a brief an assistant can act on without asking follow-up questions: it supplies the background and goal, splits the request into separately checkable task points, states acceptance per point, and fixes the scope, constraints and deliverable format. The result replaces the draft, with an Undo control to get the original back.

**Restore draft.** The "Restore draft" button on the status pill (or `Ctrl+Alt+Z`) puts the previous draft back in the composer. It does not depend on the pill still being on screen: the draft history is kept per Session in browser storage, survives a reload and holds up to 12 drafts. A restore is itself undoable, so the text currently in the box is never lost.

A status pill appears below the composer card while either control is working: elapsed seconds, a "send on release" switch, an Insert button when a transcript could not be placed, and an Undo button after an enhancement.

| Key / control | Behaviour |
| --- | --- |
| `Alt` (press and hold) | Start recording |
| release `Alt` | Stop, transcribe, correct, insert |
| `Alt` + any other key | Treated as a shortcut (`Alt+Tab`, IME chords); the capture is discarded |
| `Esc` while recording | Cancel |
| ✨ button | Enhance the draft |
| `Ctrl+Alt+Z` | Restore the previous draft |

## Requirements

- The recording is transcribed by the Harness **Voice Input** plugin (`dsh-experimental-voice-input-bundle`), which must be enabled and its SenseVoice model prepared. Without it the plugin reports that the speech service is unavailable.
- Correction and prompt enhancement run on the Host through the `llm` service, using the composition's **default model route**. No API key is configured or read by this plugin.
- The browser needs microphone access (HTTPS or `127.0.0.1`, plus OS permission).

## Install

```sh
dsh plugin --profile <profile> add github:Chrono-rigger/dsh-voice-enhance
```

Or from the Web UI: **Settings → Plugins**, then install the bundle by package name or from a local directory.

## Notes

- Nothing is persisted except one browser-local preference: the "send on release" switch (`localStorage` key `dsh-voice-enhance.autoSend`). Recordings are discarded after transcription; no audio is written to disk.
- The audio pipeline is bounded end to end: microphone permission, recorder flush, decoding, resampling and transcription each have a timeout, so a wedged browser API surfaces as an error message rather than an endless "transcribing" state.
- Two Remote calls cross the wire, both of them one-shot text rewrites: `promptTools/refine` with `mode: "correct"` for a transcript, `mode: "enhance"` for a draft.
- The cleanup is checked in code, not only asked for in the prompt: an answer that replies to the text, asks a question, expands or shortens it is rejected, one terser retry is made, and failing that the transcript is inserted unchanged. A transcript with a typo still says what was said; a rewritten one does not.
- The custom element styles use the host theme tokens (`--dsw-alias-*`), so light and dark themes need no separate artwork.

## Licence

MIT — see [LICENSE](LICENSE).
