# Third-party notices

`dsh-voice-enhance` itself is MIT-licensed (see [LICENSE](LICENSE)).

## @deepseek-ai/dsh-typert-protocol

`lib/client.js` contains a copy of the package-private remote-definition
assembly from `@deepseek-ai/dsh-typert-protocol` (`createTypertRemoteInfo`,
`RemoteInfo`, `NamedInput`, and `ResultValue`), included so this plugin can
mount one Remote contribution without adding a runtime dependency to the
harness that already ships it.

Upstream: <https://github.com/deepseek-ai/deepseek-harness>
License: MIT

```
MIT License

Copyright (c) 2026 DeepSeek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Audio format

The recorded audio is converted to the canonical 16 kHz mono PCM16 WAV the
harness speech service accepts. The WAV header layout follows the same shape
used by the harness's own voice-input client; it is a 44-byte canonical
header over little-endian PCM samples.
