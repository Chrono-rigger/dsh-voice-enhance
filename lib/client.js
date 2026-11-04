window.__ModuleLoader__.load({
	id: "dsh-voice-enhance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const zod = require("zod");
		const React = require("react");
		const h = React.createElement;
		const z = zod.z ?? zod;
		//#region ../../typert/protocol/src/remote-info.ts
		/**
		* Retain one generated definition per endpoint without constructing parsers or projections.
		* The class instance builds its shared descriptor/method index on first access;
		* input schemas and JSON Schema projections are cached only when requested.
		* @param spec - compiler-produced method facts and Zod factories.
		* @param zod - the generated artifact's Zod runtime for named-input parsers.
		* @returns a lazy, mountable info instance with no registration or transport effects.
		*/
		function createTypertRemoteInfo(spec, zod) {
			return new RemoteInfo(spec, zod);
		}
		var RemoteInfo = class {
			spec;
			zod;
			index;
			constructor(spec, zod) {
				this.spec = spec;
				this.zod = zod;
			}
			get package() {
				return this.spec.package;
			}
			get descriptors() {
				return this.resolve().descriptors;
			}
			get methods() {
				return this.resolve().methods;
			}
			resolve() {
				if (this.index !== void 0) return this.index;
				const zod = this.zod;
				const descriptors = [];
				const methods = Object.create(null);
				for (const [endpoint, definition] of Object.entries(this.spec.methods)) {
					const separator = endpoint.indexOf("/");
					const namespace = endpoint.slice(0, separator);
					const method = endpoint.slice(separator + 1);
					const parameters = definition.parameters.map((parameter) => ({
						...parameter,
						wire: parameter.wire ?? parameter.name
					}));
					const descriptor = {
						...definition,
						id: `${this.spec.package}#${endpoint}`,
						namespace,
						method,
						parameters,
						result: definition.result.description === void 0 ? definition.result : new ResultValue(definition.result)
					};
					if (definition.invocation.kind === "direct") {
						const inputs = [];
						methods[endpoint] = Object.assign(descriptor, {
							input(options) {
								const strict = options?.strict === true;
								return inputs[strict ? 1 : 0] ??= new NamedInput(parameters, strict, zod);
							},
							invoke(remote, input, signal) {
								const named = input;
								const values = parameters.map((parameter) => named[parameter.wire]);
								if (definition.cancellation !== void 0) values.push(signal);
								const receiver = Reflect.get(remote, namespace);
								return Reflect.get(receiver, method).apply(receiver, values);
							}
						});
					}
					descriptors.push(descriptor);
				}
				return this.index = {
					descriptors,
					methods
				};
			}
		};
		function optional(parameter) {
			return parameter.source === "json" && parameter.acceptsUndefined === true;
		}
		var NamedInput = class {
			parameters;
			strict;
			zod;
			schema;
			projection;
			constructor(parameters, strict, zod) {
				this.parameters = parameters;
				this.strict = strict;
				this.zod = zod;
			}
			codec(parameter) {
				return this.strict ? parameter.strictCodec : parameter.codec;
			}
			create = () => this.schema ??= this.zod.strictObject(Object.fromEntries(this.parameters.map((parameter) => {
				const value = this.codec(parameter).create();
				return [parameter.wire, optional(parameter) ? value.optional() : value.nonoptional()];
			})));
			get jsonSchema() {
				return this.project().jsonSchema;
			}
			get jsonSchemaError() {
				return this.project().jsonSchemaError;
			}
			project() {
				if (this.projection !== void 0) return this.projection;
				const unavailable = this.parameters.find((parameter) => this.codec(parameter).jsonSchema === void 0);
				if (unavailable !== void 0) return this.projection = { jsonSchemaError: this.codec(unavailable).jsonSchemaError ?? `No JSON Schema for parameter ${unavailable.wire}` };
				return this.projection = { jsonSchema: {
					type: "object",
					properties: Object.fromEntries(this.parameters.map((parameter) => [parameter.wire, {
						...this.codec(parameter).jsonSchema,
						...parameter.description === void 0 ? {} : { description: parameter.description }
					}])),
					required: this.parameters.filter((parameter) => !optional(parameter)).map((parameter) => parameter.wire),
					additionalProperties: false
				} };
			}
		};
		var ResultValue = class {
			spec;
			projection;
			constructor(spec) {
				this.spec = spec;
			}
			get mode() {
				return this.spec.mode;
			}
			get typeSymbol() {
				return this.spec.typeSymbol;
			}
			get create() {
				return this.spec.create;
			}
			get decode() {
				return this.spec.decode;
			}
			get encode() {
				return this.spec.encode;
			}
			get description() {
				return this.spec.description;
			}
			get jsonSchemaError() {
				return this.spec.jsonSchemaError;
			}
			get jsonSchema() {
				if (this.projection === void 0) {
					const schema = this.spec.jsonSchema;
					this.projection = { value: schema === void 0 ? void 0 : {
						...schema,
						description: this.spec.description
					} };
				}
				return this.projection.value;
			}
		};
		//#endregion
		//#region dsh-voice-enhance/lib/remote.js
		/**
		 * The Remote contribution this browser half mounts.
		 *
		 * A client half cannot reach the Host LLM service (the mounted `llm`
		 * Remote exposes catalogue reads only), so prompt work crosses the
		 * wire: `ctx.remote.promptTools.refine({ text, mode }, signal)`.
		 */
		const REFINE_SCHEMA = {
			type: "object",
			properties: {
				text: { type: "string" },
				mode: { type: "string" },
				instruction: { type: "string" }
			},
			required: ["text"],
			additionalProperties: true
		};
		const TYPERT_REMOTE = createTypertRemoteInfo({
			package: "dsh-voice-enhance",
			methods: {
				"promptTools/refine": {
					service: "promptTools",
					description: "Rewrite one piece of user text: correct a dictation transcript, or enhance a draft prompt.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "request",
						description: "text to rewrite, the mode, and an optional extra instruction.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-voice-enhance#RefineRequest",
							create: () => z.object({
								text: z.string().readonly(),
								mode: z.string().readonly().optional(),
								instruction: z.string().readonly().optional()
							}),
							jsonSchema: REFINE_SCHEMA
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-voice-enhance#RefineRequest",
							create: () => z.strictObject({
								text: z.string().readonly(),
								mode: z.string().readonly().optional(),
								instruction: z.string().readonly().optional()
							}),
							jsonSchema: { ...REFINE_SCHEMA, additionalProperties: false }
						}
					}],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-voice-enhance#RefineResult",
						create: () => z.object({ text: z.string().readonly() }),
						description: "the rewritten text; the original is returned when the model produced nothing usable.",
						jsonSchema: {
							type: "object",
							properties: { text: { type: "string" } },
							required: ["text"],
							additionalProperties: true
						}
					},
					sourceLocation: { file: "dsh-voice-enhance/lib/index.js", line: 96, column: 3 }
				}
			}
		}, zod);
		//#endregion
		//#region dsh-voice-enhance/lib/locales.js
		const NS = "voice-enhance";
		const zh = {
			"enhance.title": "增强提示词",
			"enhance.empty": "输入框是空的，先写点什么再点增强",
			"enhance.busy": "正在增强提示词…",
			"enhance.slow": "模型响应太慢，请稍后重试",
			"enhance.done": "提示词已增强",
			"enhance.failed": "增强失败：{message}",
			"draft.restore": "回退草稿",
			"draft.restoreHint": "把上一个草稿放回输入框（Ctrl+Alt+Z 同样可用）",
			"draft.restored": "已回退到上一个草稿",
			"draft.nothing": "没有可回退的草稿",
			"voice.title": "按住 Alt 说话，松开结束",
			"voice.requesting": "正在打开麦克风…",
			"voice.recording": "正在聆听…松开 Alt 结束",
			"voice.transcribing": "正在转写…",
			"voice.correcting": "正在修正错别字…",
			"voice.inserted": "已插入 {seconds} 秒语音",
			"voice.empty": "没有听清，请再说一次",
			"voice.tooLarge": "录音太长了，请说得短一些",
			"voice.conflict": "输入框正在提交，文字已保留，点「插入」重试",
			"voice.retry": "插入",
			"voice.undo": "还原",
			"voice.autoSend": "松开后直接发送",
			"voice.unavailable": "这个环境不支持录音",
			"voice.permission": "麦克风权限被拒绝",
			"voice.deviceMissing": "找不到可用的麦克风",
			"voice.interrupted": "录音被中断",
			"voice.cancelled": "已取消",
			"voice.noSpeech": "语音服务不可用，请在插件页启用「语音输入」",
			"voice.notReady": "语音模型还没准备好，请在插件页下载模型",
			"voice.failed": "语音输入失败：{message}"
		};
		const en = {
			"enhance.title": "Enhance prompt",
			"enhance.empty": "The composer is empty — write something first",
			"enhance.busy": "Enhancing the prompt…",
			"enhance.slow": "The model took too long — try again",
			"enhance.done": "Prompt enhanced",
			"enhance.failed": "Enhance failed: {message}",
			"draft.restore": "Restore draft",
			"draft.restoreHint": "Put the previous draft back in the composer (Ctrl+Alt+Z works too)",
			"draft.restored": "Restored the previous draft",
			"draft.nothing": "No draft to restore",
			"voice.title": "Hold Alt to talk, release to finish",
			"voice.requesting": "Opening the microphone…",
			"voice.recording": "Listening… release Alt to finish",
			"voice.transcribing": "Transcribing…",
			"voice.correcting": "Fixing dictation errors…",
			"voice.inserted": "Inserted {seconds}s of speech",
			"voice.empty": "Nothing was recognized, please try again",
			"voice.tooLarge": "That recording was too long, please keep it shorter",
			"voice.conflict": "The composer is busy; your text is kept — press Insert to retry",
			"voice.retry": "Insert",
			"voice.undo": "Undo",
			"voice.autoSend": "Send on release",
			"voice.unavailable": "This environment cannot record audio",
			"voice.permission": "Microphone permission was denied",
			"voice.deviceMissing": "No usable microphone was found",
			"voice.interrupted": "The recording was interrupted",
			"voice.cancelled": "Cancelled",
			"voice.noSpeech": "The speech service is unavailable — enable the Voice Input plugin",
			"voice.notReady": "The speech model is not ready — download it in the Plugins page",
			"voice.failed": "Voice input failed: {message}"
		};
		//#endregion
		//#region dsh-voice-enhance/lib/store.js
		const AUTO_SEND_KEY = "dsh-voice-enhance.autoSend";
		const HISTORY_KEY = "dsh-voice-enhance.draftHistory";
		/** How many drafts the undo stack keeps, and how much text it may hold. */
		const HISTORY_LIMIT = 12;
		const HISTORY_CHARS = 40000;
		/** Every phase this plugin can be in; `idle` renders nothing. */
		const IDLE = {
			phase: "idle",
			seconds: 0,
			autoSend: readAutoSend(),
			note: null,
			error: null,
			pending: "",
			undo: null,
			historyDepth: 0
		};
		function readAutoSend() {
			try {
				return window.localStorage?.getItem(AUTO_SEND_KEY) === "1";
			} catch {
				return false;
			}
		}
		function writeAutoSend(value) {
			try {
				window.localStorage?.setItem(AUTO_SEND_KEY, value ? "1" : "0");
			} catch {
				/* a locked-down storage just loses the preference */
			}
		}
		/**
		 * The draft undo stack, kept per Session in localStorage.
		 *
		 * It outlives the status pill on purpose: a pill auto-clears after a few
		 * seconds, but "put my draft back" is a request people make later — after
		 * they read the enhancement, or after a dictation landed in the wrong
		 * place. Persisting it also survives a page reload.
		 */
		const history = {
			key(sessionId) {
				return sessionId === null || sessionId === undefined ? `${HISTORY_KEY}.none` : `${HISTORY_KEY}.${sessionId}`;
			},
			read(sessionId) {
				try {
					const raw = window.localStorage?.getItem(history.key(sessionId));
					if (raw === null || raw === undefined) return [];
					const parsed = JSON.parse(raw);
					if (!Array.isArray(parsed)) return [];
					return parsed.filter((entry) => entry !== null && typeof entry.text === "string");
				} catch {
					return [];
				}
			},
			write(sessionId, entries) {
				try {
					window.localStorage?.setItem(history.key(sessionId), JSON.stringify(entries));
				} catch {
					/* a full or locked storage just loses the stack */
				}
			},
			/** Push one draft, dropping the oldest entries past the limits. */
			push(sessionId, text) {
				if (typeof text !== "string") return;
				const entries = history.read(sessionId);
				// Ignore a repeat of the newest draft (double-click, no-op enhance).
				if (entries.length > 0 && entries[entries.length - 1].text === text) return;
				entries.push({ text, at: Date.now() });
				let kept = entries.slice(-HISTORY_LIMIT);
				let total = kept.reduce((sum, entry) => sum + entry.text.length, 0);
				while (kept.length > 1 && total > HISTORY_CHARS) {
					total -= kept[0].text.length;
					kept = kept.slice(1);
				}
				history.write(sessionId, kept);
			},
			/** Remove and return the newest draft. */
			pop(sessionId) {
				const entries = history.read(sessionId);
				if (entries.length === 0) return null;
				const last = entries[entries.length - 1];
				history.write(sessionId, entries.slice(0, -1));
				return last.text;
			},
			/** The newest draft without removing it. */
			peek(sessionId) {
				const entries = history.read(sessionId);
				return entries.length === 0 ? null : entries[entries.length - 1].text;
			},
			clear(sessionId) {
				history.write(sessionId, []);
			}
		};
		/** One snapshot store shared by the toolbar cell and the overlay pill. */
		const store = {
			state: { ...IDLE },
			listeners: new Set(),
			subscribe: (listener) => {
				store.listeners.add(listener);
				return () => store.listeners.delete(listener);
			},
			getSnapshot: () => store.state,
			set(patch) {
				store.state = { ...store.state, ...patch };
				for (const listener of [...store.listeners]) listener();
			},
			reset() {
				store.set({ ...IDLE, autoSend: store.state.autoSend });
			}
		};
		function useVoiceState() {
			return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
		}
		function format(t, key, params) {
			let text = t(key);
			if (params === undefined || params === null) return text;
			for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value));
			return text;
		}
		//#endregion
		//#region dsh-voice-enhance/lib/audio.js
		/** One failed capture, carrying the locale key that describes it. */
		class RecordingError extends Error {
			constructor(kind) {
				super(kind);
				this.name = "RecordingError";
				this.kind = kind;
			}
		}
		function captureErrorKind(error) {
			if (typeof DOMException !== "undefined" && error instanceof DOMException) {
				if (error.name === "NotAllowedError" || error.name === "SecurityError") return "permission";
				if (error.name === "NotFoundError" || error.name === "OverconstrainedError") return "deviceMissing";
			}
			return "unavailable";
		}
		/** Write the canonical 16 kHz mono PCM16 WAV the Host accepts. */
		function encodeWave(samples) {
			const bytes = new Uint8Array(44 + samples.length * 2);
			const view = new DataView(bytes.buffer);
			const text = (at, value) => {
				for (let index = 0; index < value.length; index++) bytes[at + index] = value.charCodeAt(index);
			};
			text(0, "RIFF");
			view.setUint32(4, bytes.length - 8, true);
			text(8, "WAVE");
			text(12, "fmt ");
			view.setUint32(16, 16, true);
			view.setUint16(20, 1, true);
			view.setUint16(22, 1, true);
			view.setUint32(24, 16000, true);
			view.setUint32(28, 32000, true);
			view.setUint16(32, 2, true);
			view.setUint16(34, 16, true);
			text(36, "data");
			view.setUint32(40, samples.length * 2, true);
			for (const [index, sample] of samples.entries()) {
				const value = Math.max(-1, Math.min(1, sample));
				view.setInt16(44 + index * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
			}
			return bytes;
		}
		function audioBase64(bytes) {
			let text = "";
			for (let index = 0; index < bytes.length; index += 8192) {
				text += String.fromCharCode(...bytes.subarray(index, index + 8192));
			}
			return btoa(text);
		}
		/**
		 * Reject a promise that never settles. A wedged Web API (an AudioContext
		 * that never closes, a recorder that never fires `stop`) must become a
		 * visible error instead of an eternal "transcribing".
		 */
		function withTimeout(promise, ms, kind) {
			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => reject(new RecordingError(kind)), ms);
				promise.then(
					(value) => {
						clearTimeout(timer);
						resolve(value);
					},
					(error) => {
						clearTimeout(timer);
						reject(error);
					}
				);
			});
		}
		/**
		 * One AudioContext reused by every capture, created lazily.
		 *
		 * It is never closed mid-session: `close()` on a context that was created
		 * without a user gesture may never resolve, and awaiting it here froze the
		 * whole pipeline while the pill kept saying "transcribing". A suspended
		 * context still decodes audio, which is all this plugin needs.
		 */
		let sharedAudioContext = null;
		function audioContextFor() {
			const Ctor = window.AudioContext ?? window.webkitAudioContext;
			if (typeof Ctor !== "function") return null;
			if (sharedAudioContext === null || sharedAudioContext.state === "closed") {
				sharedAudioContext = new Ctor();
			}
			if (sharedAudioContext.state === "suspended" && typeof sharedAudioContext.resume === "function") {
				try {
					sharedAudioContext.resume().catch(() => {});
				} catch {
					/* resume is best-effort; decoding still works */
				}
			}
			return sharedAudioContext;
		}
		/** One microphone capture: MediaRecorder in, canonical WAV out. */
		class Recording {
			constructor() {
				this.chunks = [];
				this.stream = null;
				this.recorder = null;
				this.context = null;
				this.disposed = null;
				this.lifetime = new AbortController();
				this.onError = null;
			}
			async start() {
				const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
				if (typeof MediaRecorder === "undefined" || AudioContextCtor === undefined) throw new RecordingError("unavailable");
				const media = navigator.mediaDevices;
				if (media === undefined || typeof media.getUserMedia !== "function") throw new RecordingError("unavailable");
				let stream;
				try {
					stream = await withTimeout(media.getUserMedia({
						audio: { echoCancellation: true, noiseSuppression: true },
						video: false
					}), 20000, "unavailable");
				} catch (error) {
					throw error instanceof RecordingError ? error : new RecordingError(captureErrorKind(error));
				}
				if (this.lifetime.signal.aborted) {
					stream.getTracks().forEach((track) => track.stop());
					throw new RecordingError("cancelled");
				}
				this.stream = stream;
				try {
					this.context = audioContextFor();
					this.recorder = new MediaRecorder(stream);
				} catch {
					this.dispose();
					throw new RecordingError("unavailable");
				}
				this.recorder.ondataavailable = (event) => {
					if (!this.lifetime.signal.aborted && event.data !== undefined && event.data.size > 0) this.chunks.push(event.data);
				};
				this.recorder.onerror = () => {
					this.onError?.(new RecordingError("interrupted"));
				};
				try {
					this.recorder.start();
				} catch {
					this.dispose();
					throw new RecordingError("unavailable");
				}
			}
			/**
			 * Flush the recorder and hand back a canonical 16 kHz mono PCM16 WAV.
			 *
			 * Every Web API call is bounded: a recorder that never fires `stop` or
			 * a decoder that never resolves surfaces as an error the pill can show,
			 * never as a spinner that outlives the release of Alt.
			 */
			async stop(maxDurationSeconds) {
				const recorder = this.recorder;
				const OfflineContextCtor = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
				if (recorder === null || OfflineContextCtor === undefined) {
					this.dispose();
					throw new RecordingError("empty");
				}
				if (recorder.state !== "recording") {
					this.dispose();
					throw new RecordingError("empty");
				}
				const flushed = withTimeout(new Promise((resolve, reject) => {
					recorder.onstop = () => resolve();
					recorder.onerror = () => reject(new RecordingError("empty"));
					try {
						recorder.stop();
					} catch {
						reject(new RecordingError("empty"));
					}
				}), 3000, "interrupted");
				try {
					await flushed;
				} catch (error) {
					this.dispose();
					throw error instanceof RecordingError ? error : new RecordingError("empty");
				}
				this.stream?.getTracks().forEach((track) => {
					try {
						track.stop();
					} catch {
						/* already stopped */
					}
				});
				const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
				if (blob.size === 0) throw new RecordingError("empty");
				let decoded = null;
				if (this.context !== null) {
					try {
						decoded = await withTimeout(this.context.decodeAudioData(await blob.arrayBuffer()), 8000, "interrupted");
					} catch {
						decoded = null;
					}
				}
				if (decoded === null) {
					// The realtime context never came up (or never decoded): rebuild one
					// purely for decoding. It is not awaited on close, so it cannot wedge.
					try {
						const decoder = new OfflineContextCtor(1, 1, 16000);
						decoded = await withTimeout(decoder.decodeAudioData(await blob.arrayBuffer()), 8000, "interrupted");
					} catch {
						throw new RecordingError("interrupted");
					}
				}
				const seconds = Math.max(0, Math.min(decoded.duration, maxDurationSeconds));
				const offline = new OfflineContextCtor(1, Math.max(1, Math.floor(seconds * 16000)), 16000);
				const source = offline.createBufferSource();
				source.buffer = decoded;
				source.connect(offline.destination);
				source.start();
				let rendered;
				try {
					rendered = await withTimeout(offline.startRendering(), 15000, "interrupted");
				} catch (error) {
					throw error instanceof RecordingError ? error : new RecordingError("empty");
				}
				return { bytes: encodeWave(rendered.getChannelData(0)), seconds };
			}
			/** Release the stream and the recorder. The shared AudioContext stays open. */
			dispose() {
				if (this.disposed !== null) return this.disposed;
				this.lifetime.abort();
				try {
					if (this.recorder !== null && this.recorder.state !== "inactive") this.recorder.stop();
				} catch {
					/* already stopped */
				}
				this.recorder = null;
				this.stream?.getTracks().forEach((track) => {
					try {
						track.stop();
					} catch {
						/* already stopped */
					}
				});
				this.stream = null;
				this.disposed = Promise.resolve();
				return this.disposed;
			}
		}
		//#endregion
		//#region dsh-voice-enhance/lib/controller.js
		const MAX_AUDIO_SECONDS = 120;
		const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
		const TRANSCRIBE_MS = 45000;
		const ENHANCE_MS = 90000;
		const MESSAGE_MS = 4500;
		/**
		 * Everything that is not React: the Alt gesture, the recording, the two
		 * Host calls and the draft insertion. Components read its state through
		 * the shared store and hand it the composer actions on mount.
		 */
		const controller = {
			actions: null,
			sessionId: null,
			remote: null,
			speechOf: () => null,
			run: 0,
			recording: null,
			abort: null,
			span: undefined,
			timer: null,
			clearTimer: null,
			combo: false,
			busy: false,
			startedAt: 0,
			attach(actions, sessionId, draftOf) {
				if (actions === null || actions === undefined) return;
				this.actions = actions;
				this.sessionId = sessionId;
				this.draftOf = typeof draftOf === "function" ? draftOf : null;
				// Refresh the badge whenever the pill or the button mounts.
				store.set({ historyDepth: history.read(sessionId).length });
			},
			detach(sessionId) {
				if (sessionId !== undefined && this.sessionId !== null && sessionId !== this.sessionId) return;
				this.actions = null;
				this.sessionId = null;
				void this.cancel("unmount");
			},
			scheduleIdle(delay = MESSAGE_MS) {
				if (this.clearTimer !== null) clearTimeout(this.clearTimer);
				this.clearTimer = setTimeout(() => {
					this.clearTimer = null;
					if (this.recording === null && !this.busy) store.reset();
				}, delay);
			},
			cancelAutoClear() {
				if (this.clearTimer !== null) {
					clearTimeout(this.clearTimer);
					this.clearTimer = null;
				}
			},
			async begin() {
				if (this.recording !== null || this.actions === null) return;
				if (store.state.phase === "transcribing" || store.state.phase === "correcting" || store.state.phase === "enhancing") return;
				this.cancelAutoClear();
				this.combo = false;
				this.run += 1;
				this.abort = new AbortController();
				this.span = typeof this.actions.captureInsertion === "function" ? this.actions.captureInsertion() : undefined;
				this.startedAt = Date.now();
				const recording = new Recording();
				const run = this.run;
				recording.onError = () => {
					if (run === this.run) void this.finish({ interrupted: true });
				};
				this.recording = recording;
				store.set({ phase: "requesting", note: { key: "voice.requesting" }, error: null, pending: "", undo: null, seconds: 0 });
				try {
					await recording.start();
				} catch (error) {
					if (run !== this.run) return;
					this.recording = null;
					this.fail(error);
					return;
				}
				if (run !== this.run) {
					void recording.dispose();
					return;
				}
				store.set({ phase: "recording", note: { key: "voice.recording" } });
				this.timer = setTimeout(() => void this.finish(), MAX_AUDIO_SECONDS * 1000);
			},
			async finish(options) {
				const recording = this.recording;
				if (recording === null) return;
				const run = this.run;
				this.recording = null;
				if (this.timer !== null) {
					clearTimeout(this.timer);
					this.timer = null;
				}
				if (options?.interrupted === true) {
					this.release(recording);
					this.fail(new RecordingError("interrupted"));
					return;
				}
				store.set({ phase: "transcribing", note: { key: "voice.transcribing" } });
				let captured;
				try {
					captured = await withTimeout(recording.stop(MAX_AUDIO_SECONDS), 40000, "interrupted");
				} catch (error) {
					if (run !== this.run) return;
					this.fail(error);
					return;
				} finally {
					this.release(recording);
				}
				if (run !== this.run) return;
				if (captured.bytes.byteLength > MAX_AUDIO_BYTES) {
					store.set({ phase: "error", error: { key: "voice.tooLarge", detail: "" }, note: null });
					this.scheduleIdle();
					return;
				}
				const speech = this.speechOf();
				if (speech === null) {
					store.set({ phase: "error", error: { key: "voice.noSpeech", detail: "" }, note: null });
					this.scheduleIdle();
					return;
				}
				let text = "";
				try {
					const pending = speech.transcribe({ audioBase64: audioBase64(captured.bytes) }, this.abort?.signal);
					const result = await withTimeout(pending, TRANSCRIBE_MS, "transcribeTimeout");
					if (run !== this.run) return;
					if (result?.ok !== true) throw new Error(result?.error?.message ?? "transcription failed");
					text = typeof result.value?.text === "string" ? result.value.text : "";
				} catch (error) {
					if (run !== this.run) return;
					if (error instanceof RecordingError && error.kind === "transcribeTimeout") {
						store.set({ phase: "error", error: { key: "voice.notReady", detail: "" }, note: null });
						this.scheduleIdle();
						return;
					}
					const key = (await this.readinessHint()) ?? "voice.failed";
					store.set({ phase: "error", error: { key, detail: key === "voice.failed" ? describe(error) : "" }, note: null });
					this.scheduleIdle();
					return;
				}
				if (text.trim() === "") {
					store.set({ phase: "note", note: { key: "voice.empty" }, error: null });
					this.scheduleIdle();
					return;
				}
				store.set({ phase: "correcting", note: { key: "voice.correcting" } });
				const corrected = await this.correct(text, run);
				if (run !== this.run) return;
				if (!this.insert(corrected)) {
					store.set({ phase: "error", error: { key: "voice.conflict" }, pending: corrected, note: null });
					this.scheduleIdle(15000);
					return;
				}
				store.set({
					phase: "idle",
					note: { key: "voice.inserted", params: { seconds: Math.max(1, Math.round(captured.seconds)) } },
					error: null,
					pending: "",
					seconds: 0
				});
				if (store.state.autoSend && typeof this.actions?.submit === "function") this.actions.submit();
				this.scheduleIdle();
			},
			release(recording) {
				try {
					void recording.dispose();
				} catch {
					/* disposal is best-effort */
				}
			},
			async cancel(reason) {
				if (this.recording === null) return;
				this.run += 1;
				const recording = this.recording;
				this.recording = null;
				if (this.timer !== null) {
					clearTimeout(this.timer);
					this.timer = null;
				}
				this.abort?.abort();
				this.release(recording);
				if (reason === "unmount") {
					store.reset();
					return;
				}
				store.set({ phase: "note", note: { key: "voice.cancelled" }, error: null, pending: "", seconds: 0 });
				this.scheduleIdle(1800);
			},
			async correct(text, run) {
				const remote = this.remote;
				if (remote === null) return text;
				try {
					const result = await remote.refine({ text, mode: "correct" }, this.abort?.signal);
					if (run !== this.run) return text;
					if (result?.ok === true && typeof result.value?.text === "string" && result.value.text.trim() !== "") return result.value.text;
				} catch {
					/* a failed cleanup must never lose the transcript */
				}
				return text;
			},
			async enhance(text) {
				const remote = this.remote;
				if (remote === null || this.busy) return;
				if (text.trim() === "") {
					store.set({ phase: "note", note: { key: "enhance.empty" }, error: null });
					this.scheduleIdle(2200);
					return;
				}
				this.cancelAutoClear();
				this.busy = true;
				store.set({ phase: "enhancing", note: { key: "enhance.busy" }, error: null, pending: "", undo: null });
				try {
					const result = await withTimeout(remote.refine({ text, mode: "enhance" }), ENHANCE_MS, "enhanceTimeout");
					if (result?.ok !== true) throw new Error(result?.error?.message ?? "enhance failed");
					const next = typeof result.value?.text === "string" ? result.value.text : "";
					if (next.trim() === "") throw new Error("the model returned nothing");
					const actions = this.actions;
					if (actions === null) throw new Error("the composer is gone");
					if (typeof actions.setDraft === "function") {
						// Remember what was there before the rewrite, so the draft can
						// be put back even after the pill has cleared.
						history.push(this.sessionId, text);
						actions.setDraft(next);
						store.set({ phase: "note", note: { key: "enhance.done" }, error: null, undo: { text }, historyDepth: history.read(this.sessionId).length });
					} else if (this.insert(next)) {
						store.set({ phase: "note", note: { key: "enhance.done" }, error: null, undo: null });
					} else {
						throw new Error("the composer rejected the text");
					}
				} catch (error) {
					if (error instanceof RecordingError && error.kind === "enhanceTimeout") {
						store.set({ phase: "error", error: { key: "enhance.slow", detail: "" }, note: null, undo: null });
					} else {
						store.set({ phase: "error", error: { key: "enhance.failed", detail: describe(error) }, note: null, undo: null });
					}
				} finally {
					this.busy = false;
					this.scheduleIdle();
				}
			},
			undo() {
				const actions = this.actions;
				const undo = store.state.undo;
				if (actions === null || undo === null) return;
				// The stack already holds this draft (pushed before the rewrite),
				// so restoring through it keeps the two routes consistent.
				const entries = history.read(this.sessionId);
				if (entries.length > 0 && entries[entries.length - 1].text === undo.text) history.pop(this.sessionId);
				if (typeof actions.setDraft === "function") actions.setDraft(undo.text);
				else this.insert(undo.text);
				store.set({ phase: "idle", undo: null, note: null, error: null, historyDepth: history.read(this.sessionId).length });
			},
			/**
			 * Put the previous draft back, from the persisted stack.
			 *
			 * Unlike `undo()` this does not depend on the pill still being on
			 * screen: it reads the stack, replaces the current draft with its
			 * newest entry and returns whether anything was restored.
			 */
			restoreDraft() {
				const actions = this.actions;
				if (actions === null) return false;
				const previous = history.pop(this.sessionId);
				if (previous === null) {
					store.set({ phase: "note", note: { key: "draft.nothing" }, error: null, undo: null, historyDepth: 0 });
					this.scheduleIdle(2600);
					return false;
				}
				// Keep what is in the box now, so a restore is itself undoable.
				const current = this.draftText();
				if (current !== "" && current !== previous) history.push(this.sessionId, current);
				if (typeof actions.setDraft === "function") actions.setDraft(previous);
				else this.insert(previous);
				store.set({ phase: "note", note: { key: "draft.restored" }, error: null, undo: null, historyDepth: history.read(this.sessionId).length });
				this.scheduleIdle(3000);
				return true;
			},
			/** The composer's current draft, when the hook exposes one. */
			draftText() {
				const get = this.draftOf;
				if (typeof get !== "function") return "";
				try {
					const value = get();
					return typeof value === "string" ? value : "";
				} catch {
					return "";
				}
			},
			retry() {
				const pending = store.state.pending;
				if (pending === "" || !this.insert(pending)) return;
				store.set({ phase: "idle", pending: "", note: null, error: null });
			},
			insert(text) {
				const actions = this.actions;
				if (actions === null) return false;
				try {
					if (this.span !== undefined && actions.insertText(text, this.span)) return true;
					if (typeof actions.captureInsertion === "function" && actions.insertText(text, actions.captureInsertion())) return true;
				} catch {
					/* fall through to the last resort below */
				}
				return false;
			},
			setAutoSend(value) {
				writeAutoSend(value);
				store.set({ autoSend: value });
			},
			async readinessHint() {
				const speech = this.speechOf();
				if (speech === null || typeof speech.catalog !== "function") return null;
				try {
					const result = await speech.catalog();
					if (result?.ok !== true) return null;
					const catalog = result.value;
					const provider = catalog?.providers?.find((item) => item.id === catalog?.selection?.providerId);
					const phase = provider?.preparation?.phase;
					if (phase === "unprepared" || phase === "failed" || phase === "cancelled") return "voice.notReady";
					return null;
				} catch {
					return null;
				}
			},
			fail(error) {
				const key = error instanceof RecordingError && error.kind !== "empty" ? `voice.${error.kind}` : "voice.failed";
				store.set({
					phase: "error",
					error: { key, detail: key === "voice.failed" ? describe(error) : "" },
					note: null,
					seconds: 0
				});
				this.scheduleIdle();
			},
			async dispose() {
				this.cancelAutoClear();
				if (this.recording !== null) this.cancel("unmount");
				this.actions = null;
			}
		};
		function describe(error) {
			if (error instanceof RecordingError) return error.kind;
			return error instanceof Error ? error.message : String(error);
		}
		//#endregion
		//#region dsh-voice-enhance/lib/shortcut.js
		/**
		 * The Alt push-to-talk gesture.
		 *
		 * Alt alone starts a capture and its release ends it. Alt combined with
		 * another key (Alt+Tab, Alt+Shift for an IME, app menu accelerators) is
		 * a shortcut, not dictation: the capture is dropped instead of
		 * transcribed.
		 */
		function installShortcut() {
			const onKeyDown = (event) => {
				// Ctrl+Alt+Z — put the previous draft back. Deliberately not plain
				// Ctrl+Z: the composer owns undo for typing, and taking it over
				// would break ordinary editing.
				if ((event.key === "z" || event.key === "Z") && event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey) {
					event.preventDefault();
					controller.restoreDraft();
					return;
				}
				if (event.key === "Escape" && controller.recording !== null) {
					void controller.cancel("escape");
					return;
				}
				if (event.key !== "Alt") {
					if (controller.recording !== null) controller.combo = true;
					return;
				}
				// Only a bare Alt press starts dictation: Alt+Shift / Alt+Ctrl are IME
				// and browser chords, and swallowing them would break text editing.
				if (event.repeat || event.ctrlKey || event.shiftKey || event.metaKey) return;
				controller.combo = false;
				void controller.begin();
			};
			const onKeyUp = (event) => {
				if (event.key !== "Alt") return;
				if (event.ctrlKey || event.shiftKey || event.metaKey) {
					if (controller.recording !== null) void controller.cancel("combo");
					return;
				}
				if (controller.combo) {
					void controller.cancel("combo");
					return;
				}
				void controller.finish();
			};
			const onBlur = () => void controller.cancel("blur");
			const onVisibility = () => {
				if (document.hidden) void controller.cancel("hidden");
			};
			window.addEventListener("keydown", onKeyDown, true);
			window.addEventListener("keyup", onKeyUp, true);
			window.addEventListener("blur", onBlur);
			document.addEventListener("visibilitychange", onVisibility);
			return () => {
				window.removeEventListener("keydown", onKeyDown, true);
				window.removeEventListener("keyup", onKeyUp, true);
				window.removeEventListener("blur", onBlur);
				document.removeEventListener("visibilitychange", onVisibility);
			};
		}
		//#endregion
		//#region dsh-voice-enhance/lib/EnhanceButton.js
		/** The ✨ cell in `conversation.input.left`, just before the model picker. */
		function EnhanceButton(props) {
			const t = typeof props.t === "function" ? props.t : (key) => key;
			const actions = props.inputActions ?? null;
			const useInput = typeof props.useInput === "function" ? props.useInput : null;
			const draft = useInput === null ? "" : useInput((snapshot) => snapshot?.draft ?? "");
			const state = useVoiceState();
			const busy = state.phase === "enhancing";
			React.useEffect(() => {
				// `draftOf` lets the restore path keep whatever is in the box now,
				// so a restore is itself undoable.
				controller.attach(actions, props.sessionId ?? null, () => draft);
				return () => controller.detach(props.sessionId ?? null);
			}, [actions, props.sessionId, draft]);
			const title = t("enhance.title");
			const label = `${t("enhance.title")} — ${t("voice.title")}`;
			return h("button", {
				type: "button",
				className: `dsh-ve-btn${busy ? " is-busy" : ""}`,
				title,
				"aria-label": label,
				"aria-busy": busy ? "true" : undefined,
				"data-dsh-ve-phase": state.phase,
				onClick: () => {
					void controller.enhance(draft ?? "");
				}
			}, h("svg", {
				viewBox: "0 0 16 16",
				width: 16,
				height: 16,
				fill: "currentColor",
				"aria-hidden": true,
				focusable: false
			},
				h("path", { d: "M6.1 1.35c.12-.32.58-.32.7 0l.92 2.42c.05.14.16.25.3.3l2.42.92c.32.12.32.58 0 .7l-2.42.92a.5.5 0 0 0-.3.3l-.92 2.42c-.12.32-.58.32-.7 0l-.92-2.42a.5.5 0 0 0-.3-.3L2.46 5.7c-.32-.12-.32-.58 0-.7l2.42-.92a.5.5 0 0 0 .3-.3z" }),
				h("path", { d: "M11.55 8.85c.08-.22.4-.22.48 0l.54 1.42c.03.09.1.16.19.19l1.42.54c.22.08.22.4 0 .48l-1.42.54a.33.33 0 0 0-.19.19l-.54 1.42c-.08.22-.4.22-.48 0l-.54-1.42a.33.33 0 0 0-.19-.19l-1.42-.54c-.22-.08-.22-.4 0-.48l1.42-.54a.33.33 0 0 0 .19-.19z" })
			));
		}
		//#endregion
		//#region dsh-voice-enhance/lib/StatusOverlay.js
		const PHASE_TONE = {
			requesting: "wait",
			recording: "live",
			transcribing: "wait",
			correcting: "wait",
			enhancing: "wait",
			error: "error",
			note: "done",
			idle: "idle"
		};
		/** A status pill under the composer card: listening state and messages. */
		function StatusOverlay(props) {
			const t = typeof props.t === "function" ? props.t : (key) => key;
			const state = useVoiceState();
			const live = state.phase === "recording" || state.phase === "requesting";
			const [, tick] = React.useState(0);
			React.useEffect(() => {
				if (!live) return undefined;
				const timer = setInterval(() => tick((value) => value + 1), 250);
				return () => clearInterval(timer);
			}, [live]);
			if (state.phase === "idle") return null;
			const tone = PHASE_TONE[state.phase] ?? "idle";
			const elapsed = live ? Math.max(0, Math.floor((Date.now() - controller.startedAt) / 1000)) : 0;
			const message = state.error !== null
				? format(t, state.error.key, { message: state.error.detail })
				: state.note !== null ? format(t, state.note.key, state.note.params) : "";
			return h("div", {
				className: "dsh-ve-pill",
				"data-tone": tone,
				role: tone === "error" ? "alert" : "status",
				"aria-live": "polite"
			},
				h("span", { className: "dsh-ve-dot", "data-tone": tone, "aria-hidden": true }),
				h("span", { className: "dsh-ve-text" }, message),
				live ? h("span", { className: "dsh-ve-time" }, `${elapsed}s`) : null,
				live ? h("label", { className: "dsh-ve-check" },
					h("input", {
						type: "checkbox",
						checked: state.autoSend,
						onChange: (event) => controller.setAutoSend(event.target.checked)
					}),
					h("span", null, t("voice.autoSend"))
				) : null,
				state.pending !== "" ? h("button", {
					type: "button",
					className: "dsh-ve-action",
					onClick: () => controller.retry()
				}, t("voice.retry")) : null,
				state.undo !== null ? h("button", {
					type: "button",
					className: "dsh-ve-action",
					onClick: () => controller.undo()
				}, t("voice.undo")) : null,
				state.historyDepth > 0 ? h("button", {
					type: "button",
					className: "dsh-ve-action",
					title: t("draft.restoreHint"),
					onClick: () => controller.restoreDraft()
				}, `${t("draft.restore")}${state.historyDepth > 1 ? ` (${state.historyDepth})` : ""}`) : null
			);
		}
		//#endregion
		//#region dsh-voice-enhance/lib/styles.js
		const CSS = `
.dsh-ve-btn{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .15s ease,color .15s ease}
.dsh-ve-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}
.dsh-ve-btn:disabled{cursor:default;opacity:.6}
.dsh-ve-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
.dsh-ve-btn.is-busy{color:var(--dsw-alias-state-business-primary)}
.dsh-ve-btn.is-busy svg{animation:dsh-ve-pulse 1.1s ease-in-out infinite}
@keyframes dsh-ve-pulse{0%,100%{opacity:.45;transform:scale(.86)}50%{opacity:1;transform:scale(1)}}
.dsh-ve-pill{display:flex;align-items:center;gap:8px;max-width:min(100%,640px);min-width:0;margin:6px auto 0;padding:4px 12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-ve-dot{flex:none;width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}
.dsh-ve-dot[data-tone=live]{background:var(--dsw-alias-state-error-primary);animation:dsh-ve-blink 1s ease-in-out infinite}
.dsh-ve-dot[data-tone=wait]{background:var(--dsw-alias-state-business-primary)}
.dsh-ve-dot[data-tone=done]{background:var(--dsw-alias-state-success-primary)}
.dsh-ve-dot[data-tone=error]{background:var(--dsw-alias-state-error-primary)}
@keyframes dsh-ve-blink{0%,100%{opacity:1}50%{opacity:.25}}
.dsh-ve-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-ve-pill[data-tone=error] .dsh-ve-text{color:var(--dsw-alias-state-error-primary)}
.dsh-ve-time{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsh-ve-check{display:inline-flex;align-items:center;gap:4px;flex:none;color:var(--dsw-alias-label-tertiary);cursor:pointer;white-space:nowrap}
.dsh-ve-action{flex:none;border:0;border-radius:6px;padding:1px 8px;background:var(--dsw-alias-interactive-bg-hover-solid);color:inherit;font:inherit;cursor:pointer}
.dsh-ve-action:hover{color:var(--dsw-alias-label-primary)}
`;
		//#endregion
		//#region dsh-voice-enhance/lib/mount.js
		const inject = ["remote", "slots", "locale"];
		function registerUi(ctx) {
			controller.remote = {
				refine: async (request, signal) => await ctx.remote.promptTools.refine(request, signal)
			};
			controller.speechOf = () => {
				try {
					const direct = ctx.remote?.speech;
					if (direct !== undefined && direct !== null) return direct;
				} catch {
					/* the guarded context may refuse the property; fall back below */
				}
				try {
					return typeof ctx.get === "function" ? ctx.get("remote.speech") ?? null : null;
				} catch {
					return null;
				}
			};
			ctx.effect(() => ctx.locale.register(NS, { zh, en }));
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-voice-enhance";
				tag.dataset.pluginCss = "dsh-voice-enhance/client.css";
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => tag.remove();
			});
			ctx.effect(() => installShortcut());
			ctx.effect(() => () => controller.dispose());
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "voice-enhance-enhance",
				order: 5,
				locale: NS
			}, EnhanceButton));
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "voice-enhance-status",
				order: 30,
				locale: NS
			}, StatusOverlay));
		}
		async function mountVoiceEnhance(ctx, contribution) {
			const disposeRemote = await ctx.remote.$mount(contribution);
			const ui = ctx.inject(["remote.promptTools", "slots", "locale"], registerUi);
			try {
				await ui;
			} catch (error) {
				await ui.dispose();
				await disposeRemote();
				throw error;
			}
			return async () => {
				await ui.dispose();
				await disposeRemote();
			};
		}
		async function apply(ctx) {
			return await mountVoiceEnhance(ctx, TYPERT_REMOTE);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
