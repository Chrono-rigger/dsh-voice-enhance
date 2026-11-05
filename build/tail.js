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
				instruction: { type: "string" },
				enhanceRoute: {
					type: "object",
					description: "an explicit enhancement model route picked on the plugin page, or null to follow the automatic chain.",
					properties: {
						provider: { type: "string" },
						model: { type: "string" }
					},
					required: ["provider", "model"],
					additionalProperties: false
				}
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
								instruction: z.string().readonly().optional(),
								enhanceRoute: z.object({
									provider: z.string().readonly(),
									model: z.string().readonly()
								}).readonly().nullable().optional()
							}),
							jsonSchema: REFINE_SCHEMA
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-voice-enhance#RefineRequest",
							create: () => z.strictObject({
								text: z.string().readonly(),
								mode: z.string().readonly().optional(),
								instruction: z.string().readonly().optional(),
								enhanceRoute: z.object({
									provider: z.string().readonly(),
									model: z.string().readonly()
								}).readonly().nullable().optional()
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
			"enhance.hint": "点击把输入框里的草稿改写成更清晰的提示词",
			"enhance.empty": "输入框是空的，先写点什么再点增强",
			"enhance.busy": "正在增强提示词…",
			"enhance.slow": "模型响应太慢，请稍后重试",
			"enhance.done": "提示词已增强",
		"enhance.unchanged": "模型认为草稿已经很清晰，没有做改动",
			"enhance.failed": "增强失败：{message}",
			"keys.title": "快捷键",
			"keys.dictate": "语音输入（按住说话）",
			"keys.restore": "回退草稿",
			"keys.press": "按下新的组合键…",
			"keys.hint": "点一下再按键即可修改；Esc 取消。",
			"keys.reset": "恢复默认",
			"keys.invalid": "这个组合键无效",
			"keys.reserved": "这个组合键被系统或浏览器占用，请换一个",
			"keys.clashesDictate": "和「语音输入」的按键重复了",
			"keys.clashesRestore": "和「回退草稿」的按键重复了",
			"keys.dictateNeedsAlt": "语音输入只能使用 Alt / Ctrl / Shift 这类单独按键，或带 Alt 的组合",
			"keys.saved": "已保存",
			"keys.moved": "回退草稿已改为 {chord}，避免和这个按键冲突",
			"keys.guard": "裸键只在光标不在输入框时生效",
			"route.title": "提示词增强模型",
			"route.hint": "语音修正始终跟随当前会话模型，不受这里影响。",
			"route.follow": "跟随当前模型（默认）",
			"route.saving": "已选择 {label}",
			"route.error": "模型列表加载失败",
			"draft.restore": "回退草稿",
			"draft.restoreHint": "把上一个草稿放回输入框（{chord}）",
			"draft.restored": "已回退到上一个草稿",
			"draft.nothing": "没有可回退的草稿",
			"draft.hint": "有 {count} 份之前的草稿可以回退",
			"voice.title": "按住 {chord} 说话，松开结束",
			"voice.requesting": "正在打开麦克风…",
			"voice.recording": "正在聆听…松开 {chord} 结束",
			"voice.transcribing": "正在转写…",
			"voice.correcting": "正在修正错别字…",
			"voice.inserted": "已插入 {seconds} 秒语音",
			"voice.empty": "没有听清，请再说一次",
			"voice.tooLarge": "录音太长了，请说得短一些",
			"voice.conflict": "输入框正在提交，文字已保留，点「插入」重试",
			"voice.retry": "插入",
			"voice.undo": "还原",
			"voice.autoSend": "直接发送",
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
			"enhance.hint": "Click to rewrite the draft into a clearer prompt",
			"enhance.empty": "The composer is empty — write something first",
			"enhance.busy": "Enhancing the prompt…",
			"enhance.slow": "The model took too long — try again",
			"enhance.done": "Prompt enhanced",
		"enhance.unchanged": "The draft already reads clearly — nothing was changed",
			"enhance.failed": "Enhance failed: {message}",
			"keys.title": "Shortcuts",
			"keys.dictate": "Dictation (hold to talk)",
			"keys.restore": "Restore draft",
			"keys.press": "Press a new chord…",
			"keys.hint": "Click, then press the keys. Esc cancels.",
			"keys.reset": "Reset to defaults",
			"keys.invalid": "That chord is not valid",
			"keys.reserved": "That chord is taken by the browser or the OS",
			"keys.clashesDictate": "Already used by Dictation",
			"keys.clashesRestore": "Already used by Restore draft",
			"keys.dictateNeedsAlt": "Dictation must use a single modifier (Alt / Ctrl / Shift) or an Alt chord",
			"keys.saved": "Saved",
			"keys.moved": "Restore draft moved to {chord} so the two do not fight",
			"keys.guard": "A bare key only works while the focus is outside the composer",
			"route.title": "Enhancement model",
			"route.hint": "Dictation cleanup always follows the current session model; this choice only affects ✨ enhancement.",
			"route.follow": "Follow the current model (default)",
			"route.saving": "Using {label}",
			"route.error": "The model list failed to load",
			"draft.restore": "Restore draft",
			"draft.restoreHint": "Put the previous draft back in the composer ({chord})",
			"draft.restored": "Restored the previous draft",
			"draft.nothing": "No draft to restore",
			"draft.hint": "{count} earlier drafts available",
			"voice.title": "Hold {chord} to talk, release to finish",
			"voice.requesting": "Opening the microphone…",
			"voice.recording": "Listening… release {chord} to finish",
			"voice.transcribing": "Transcribing…",
			"voice.correcting": "Fixing dictation errors…",
			"voice.inserted": "Inserted {seconds}s of speech",
			"voice.empty": "Nothing was recognized, please try again",
			"voice.tooLarge": "That recording was too long, please keep it shorter",
			"voice.conflict": "The composer is busy; your text is kept — press Insert to retry",
			"voice.retry": "Insert",
			"voice.undo": "Undo",
			"voice.autoSend": "Send",
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
		//#region dsh-voice-enhance/lib/keys.js
		/**
		 * Shortcut configuration, stored in the browser.
		 *
		 * Chord strings look like `Alt`, `Ctrl+R`, `Ctrl+Alt+R`, `Ctrl+.`, `F2`.
		 * They are kept in localStorage rather than in the Host plugin Config
		 * because a Config save rewrites the Loader entry and reloads the plugin —
		 * far too heavy for "which key restores my draft", and it would also mean
		 * asking the user to restart the whole plugin to change one chord.
		 */
		const KEYS_STORAGE = "dsh-voice-enhance.keys";
		const DEFAULT_KEYS = {
			/** Push-to-talk. Held down, not tapped. A single modifier. */
			dictate: "Alt",
			/** Restore the previous draft. A chord, works while typing. */
			restore: "Ctrl+."
		};
		/**
		 * Chords the harness, the browser or the OS already own.
		 *
		 * These are refused rather than silently accepted and then found broken:
		 * `Alt` is the dictation key itself, and an OS-level hotkey (QQ's
		 * Ctrl+Alt+Z, for instance) never reaches the page at all.
		 */
		const RESERVED_CHORDS = new Set([
			"Ctrl+W", "Ctrl+T", "Ctrl+N", "Ctrl+R", "Ctrl+Shift+R", "Ctrl+P", "Ctrl+S",
			"Ctrl+F", "Ctrl+D", "Ctrl+L", "Ctrl+O", "Ctrl+H", "Ctrl+J", "Ctrl+U",
			"Ctrl+Shift+N", "Ctrl+Shift+T", "Ctrl+Shift+W", "Ctrl+Shift+I", "Ctrl+Shift+J",
			"Ctrl+Alt+Z", "Ctrl+Alt+Delete", "Alt+F4", "Alt+Tab", "Alt+Shift",
			"F5", "F11", "F12", "Escape", "Tab", "Enter", "Space"
		]);
		function readKeys() {
			try {
				const raw = window.localStorage?.getItem(KEYS_STORAGE);
				if (raw === null || raw === undefined) return { ...DEFAULT_KEYS };
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object") return { ...DEFAULT_KEYS };
				return {
					dictate: typeof parsed.dictate === "string" && parsed.dictate !== "" ? parsed.dictate : DEFAULT_KEYS.dictate,
					restore: typeof parsed.restore === "string" && parsed.restore !== "" ? parsed.restore : DEFAULT_KEYS.restore
				};
			} catch {
				return { ...DEFAULT_KEYS };
			}
		}
		function writeKeys(next) {
			try {
				window.localStorage?.setItem(KEYS_STORAGE, JSON.stringify(next));
			} catch {
				/* a locked-down storage just loses the preference */
			}
		}
		/** One chord string, parsed into the modifiers and the key it needs. */
		function parseChord(chord) {
			const parts = typeof chord === "string" ? chord.split("+").map((part) => part.trim()).filter((part) => part !== "") : [];
			if (parts.length === 0) return null;
			const key = parts[parts.length - 1];
			const modifiers = parts.slice(0, -1).map((part) => part.toLowerCase());
			return {
				key: key.length === 1 ? key.toLowerCase() : key,
				ctrl: modifiers.includes("ctrl"),
				alt: modifiers.includes("alt"),
				shift: modifiers.includes("shift"),
				meta: modifiers.includes("meta") || modifiers.includes("cmd")
			};
		}
		/**
		 * `event.key` spellings that do not look like their chord name.
		 *
		 * A space arrives as `" "` and an arrow as `" "`-style glyphs, so a chord
		 * stored as `Ctrl+Space` would otherwise never match a real keypress.
		 */
		const KEY_ALIASES = {
			" ": "Space",
			"Spacebar": "Space",
			"Esc": "Escape",
			"Control": "Ctrl",
			"OS": "Meta",
			"Left": "ArrowLeft",
			"Right": "ArrowRight",
			"Up": "ArrowUp",
			"Down": "ArrowDown"
		};
		function normaliseKey(key) {
			return KEY_ALIASES[key] ?? key;
		}
		/** Does this keyboard event match the chord? */
		function chordMatches(chord, event) {
			const parsed = parseChord(chord);
			if (parsed === null) return false;
			const key = normaliseKey(typeof event.key === "string" ? event.key : "");
			const wanted = normaliseKey(parsed.key);
			const same = wanted.length === 1
				? key.toLowerCase() === wanted
				: key === wanted;
			return same
				&& event.ctrlKey === parsed.ctrl
				&& event.altKey === parsed.alt
				&& event.shiftKey === parsed.shift
				&& event.metaKey === parsed.meta;
		}
		/** Is a chord the same as one of the reserved combos? */
		function isReservedChord(chord) {
			const parsed = parseChord(chord);
			if (parsed === null) return false;
			const modifierNames = [
				parsed.ctrl ? "Ctrl" : "",
				parsed.alt ? "Alt" : "",
				parsed.shift ? "Shift" : "",
				parsed.meta ? "Meta" : ""
			].filter((name) => name !== "");
			const bare = parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key;
			const candidates = [
				[...modifierNames, bare].join("+"),
				[...modifierNames.map((name) => (name === "Meta" ? "Cmd" : name)), bare].join("+")
			];
			return candidates.some((candidate) => RESERVED_CHORDS.has(candidate));
		}
		/** A chord with no modifiers must not steal a letter while typing. */
		function needsEditingGuard(chord) {
			const parsed = parseChord(chord);
			if (parsed === null) return true;
			const hasModifier = parsed.ctrl || parsed.alt || parsed.meta;
			const isFunctionKey = /^F[0-9]{1,2}$/.test(parsed.key);
			return !hasModifier && !isFunctionKey;
		}
		/** Is this chord usable at all? Returns null when it is. */
		function chordProblem(chord, role) {
			const parsed = parseChord(chord);
			if (parsed === null) return "invalid";
			if (isReservedChord(chord)) return "reserved";
			const keys = keyConfig.current;
			if (role === "restore" && chord === keys.dictate) return "clashesDictate";
			if (role === "dictate" && chord === keys.restore) return "clashesRestore";
			// A modifier-only dictate key swallows EVERY chord that uses that
			// modifier: pressing it starts a recording, so the rest of the chord
			// cancels instead. The two roles cannot share a modifier.
			const shared = (a, b) => {
				const left = parseChord(a);
				const right = parseChord(b);
				if (left === null || right === null) return false;
				// A modifier-only chord ("Alt") has no modifier FLAG set — the
				// modifier is the key itself — so fold it in before comparing.
				const flags = (parsed) => ({
					ctrl: parsed.ctrl || parsed.key === "Ctrl" || parsed.key === "Control",
					alt: parsed.alt || parsed.key === "Alt",
					shift: parsed.shift || parsed.key === "Shift",
					meta: parsed.meta || parsed.key === "Meta"
				});
				const l = flags(left);
				const r = flags(right);
				return (l.ctrl && r.ctrl) || (l.alt && r.alt) || (l.shift && r.shift) || (l.meta && r.meta);
			};
			if (role === "restore" && isModifierOnly(keys.dictate) && shared(keys.dictate, chord)) return "clashesDictate";
			// Choosing a modifier-only DICTATION key is not refused: `keyConfig.set`
			// moves the restore chord out of that modifier instead (see
			// RESTORE_FALLBACKS), so the user gets the key they asked for.
			// A bare modifier is a push-to-talk key only. As "restore" it would
			// fire on every Alt/Ctrl press, including the dictation itself.
			if (role === "restore" && isModifierOnly(chord)) return "invalid";
			// Dictation may be a single modifier (the default Alt, or Ctrl) or any
			// chord that carries Ctrl/Alt/Meta. A bare letter would eat typing.
			if (role === "dictate" && needsEditingGuard(chord) && !isModifierOnly(chord)) return "dictateNeedsAlt";
			return null;
		}
		/**
		 * Set while the config page is capturing a chord.
		 *
		 * The global handlers run in the capture phase on `window` and are
		 * registered first, so a press meant for the recorder would otherwise
		 * start (or cancel) a dictation. The lock makes them stand down.
		 */
		const keyCapture = { active: false };
		/** The live shortcut config, shared by the key handlers and the config page. */
		/**
		 * Restore chords tried in order when the chosen dictation key steals the
		 * modifier the current restore chord needs.
		 *
		 * A modifier-only dictate key swallows every chord built on that modifier
		 * (pressing it starts a recording, and the rest of the chord cancels), so
		 * the two roles must not share one. Rather than refuse the dictation key
		 * the user asked for, the restore chord moves out of the way.
		 */
		const RESTORE_FALLBACKS = ["Alt+.", "Ctrl+.", "Alt+R", "Ctrl+,", "R"];
		const keyConfig = {
			current: readKeys(),
			listeners: new Set(),
			get() {
				return keyConfig.current;
			},
			/**
			 * Store one binding.
			 *
			 * @returns the restore chord if it had to be moved out of the way, so
			 *          the caller can mention it; otherwise null.
			 */
			set(role, chord) {
				const next = { ...keyConfig.current, [role]: chord };
				let moved = null;
				if (role === "dictate" && isModifierOnly(chord)) {
					const restore = parseChord(next.restore);
					const uses = (parsed) => parsed !== null && (
						(chord === "Ctrl" && (parsed.ctrl || parsed.key === "Ctrl" || parsed.key === "Control"))
						|| (chord === "Alt" && (parsed.alt || parsed.key === "Alt"))
						|| (chord === "Shift" && (parsed.shift || parsed.key === "Shift"))
						|| (chord === "Meta" && (parsed.meta || parsed.key === "Meta")));
					const shared = uses(restore);
					if (shared) {
						for (const fallback of RESTORE_FALLBACKS) {
							if (isReservedChord(fallback) || isModifierOnly(fallback)) continue;
							const parsed = parseChord(fallback);
							if (parsed === null) continue;
							if ((chord === "Ctrl" && (parsed.ctrl || parsed.key === "Ctrl"))
								|| (chord === "Alt" && (parsed.alt || parsed.key === "Alt"))
								|| (chord === "Shift" && (parsed.shift || parsed.key === "Shift"))
								|| (chord === "Meta" && (parsed.meta || parsed.key === "Meta"))) continue;
							next.restore = fallback;
							moved = fallback;
							break;
						}
					}
				}
				keyConfig.current = next;
				writeKeys(next);
				for (const listener of [...keyConfig.listeners]) listener();
				return moved;
			},
			reset() {
				keyConfig.current = { ...DEFAULT_KEYS };
				writeKeys(keyConfig.current);
				for (const listener of [...keyConfig.listeners]) listener();
			},
			subscribe(listener) {
				keyConfig.listeners.add(listener);
				return () => keyConfig.listeners.delete(listener);
			}
		};
		function useKeys() {
			return React.useSyncExternalStore(keyConfig.subscribe, () => keyConfig.current, () => keyConfig.current);
		}
		/** Human-readable chord, e.g. `Ctrl + R`. */
		function chordLabel(chord) {
			const parsed = parseChord(chord);
			if (parsed === null) return chord;
			const parts = [];
			if (parsed.ctrl) parts.push("Ctrl");
			if (parsed.alt) parts.push("Alt");
			if (parsed.shift) parts.push("Shift");
			if (parsed.meta) parts.push("Meta");
			parts.push(parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key);
			return parts.join(" + ");
		}
		/** Turn a keydown event into a chord string, or null for a bare modifier. */
		function eventToChord(event) {
			const raw = typeof event.key === "string" ? event.key : "";
			if (raw === "" || raw === "Control" || raw === "Alt" || raw === "Shift" || raw === "Meta") return null;
			const key = normaliseKey(raw);
			const parts = [];
			if (event.ctrlKey) parts.push("Ctrl");
			if (event.altKey) parts.push("Alt");
			if (event.shiftKey) parts.push("Shift");
			if (event.metaKey) parts.push("Meta");
			parts.push(key.length === 1 ? key.toUpperCase() : key);
			const chord = parts.join("+");
			return chord === "" ? null : chord;
		}
		//#endregion
		//#region dsh-voice-enhance/lib/route.js
		/**
		 * The model route prompt enhancement runs on, chosen on the plugin page.
		 *
		 * Stored in localStorage like the shortcuts, and for the same reason: a
		 * Host Config save rewrites the Loader entry and remounts the plugin,
		 * which is far too heavy for "which model rewrites my draft". The value
		 * is `null` (follow the composition's automatic chain — the default) or
		 * a `{ provider, model }` pair picked from the model catalogue.
		 */
		const ROUTE_STORAGE = "dsh-voice-enhance.enhanceRoute";
		function readRoute() {
			try {
				const raw = window.localStorage?.getItem(ROUTE_STORAGE);
				if (raw === null || raw === undefined || raw === "") return null;
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object") return null;
				if (typeof parsed.provider !== "string" || typeof parsed.model !== "string") return null;
				if (parsed.provider === "" || parsed.model === "") return null;
				return { provider: parsed.provider, model: parsed.model };
			} catch {
				return null;
			}
		}
		function writeRoute(value) {
			try {
				if (value === null) window.localStorage?.removeItem(ROUTE_STORAGE);
				else window.localStorage?.setItem(ROUTE_STORAGE, JSON.stringify(value));
			} catch {
				/* a locked-down storage just loses the preference */
			}
		}
		/** The live enhance-route choice, shared by the caller and the config page. */
		const routeConfig = {
			current: readRoute(),
			listeners: new Set(),
			/** Set in registerUi; the picker reads the model catalogue through it. */
			remoteOf: () => null,
			get() {
				return routeConfig.current;
			},
			set(value) {
				routeConfig.current = value;
				writeRoute(value);
				for (const listener of [...routeConfig.listeners]) listener();
			},
			subscribe(listener) {
				routeConfig.listeners.add(listener);
				return () => routeConfig.listeners.delete(listener);
			}
		};
		function useRouteConfig() {
			return React.useSyncExternalStore(routeConfig.subscribe, () => routeConfig.current, () => routeConfig.current);
		}
		/**
		 * One `{ key, providerName, modelName, available }` entry per catalogued
		 * model, flattening the provider-grouped catalogue the way the Subagent
		 * settings card does. Groups that failed to load are skipped; the pair a
		 * stale stored route names is appended as unavailable so it still shows.
		 */
		function routeOptions(groups, picked) {
			const options = (groups ?? []).flatMap((group) => (group?.models ?? []).map((model) => ({
				key: `${group.id}::${model.id}`,
				provider: group.id,
				model: model.id,
				providerName: group.name ?? group.id,
				modelName: model.name ?? model.id,
				available: true
			})));
			if (picked !== null && picked !== undefined) {
				const key = `${picked.provider}::${picked.model}`;
				if (!options.some((option) => option.key === key)) {
					options.push({
						key,
						provider: picked.provider,
						model: picked.model,
						providerName: picked.provider,
						modelName: picked.model,
						available: false
					});
				}
			}
			return options;
		}
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
				// `historyDepth` is NOT part of the transient pill state: it describes
				// the persisted draft stack, which a new dictation must not erase.
				store.set({ ...IDLE, autoSend: store.state.autoSend, historyDepth: store.state.historyDepth });
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
				store.set({ phase: "recording", note: { key: "voice.recording", params: { chord: chordLabel(keyConfig.current.dictate) } } });
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
					// The picked enhancement route travels with the request; null
					// means "follow the composition's automatic chain" (default).
					const result = await withTimeout(remote.refine({ text, mode: "enhance", enhanceRoute: routeConfig.get() }), ENHANCE_MS, "enhanceTimeout");
					if (result?.ok !== true) throw new Error(result?.error?.message ?? "enhance failed");
					const next = typeof result.value?.text === "string" ? result.value.text : "";
					if (next.trim() === "") throw new Error("the model returned nothing");
					const actions = this.actions;
					if (actions === null) throw new Error("the composer is gone");
					// A rewrite identical to the draft changes nothing visible; say so
					// instead of claiming success over an untouched box.
					if (next === text) {
						store.set({ phase: "note", note: { key: "enhance.unchanged" }, error: null, undo: null });
						return;
					}
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
		/**
		 * Whether a keystroke is destined for text entry.
		 *
		 * The composer, the settings search box and any contenteditable all count.
		 * A one-letter shortcut must never win over typing in these places.
		 */
		function isEditableTarget(target) {
			if (target === null || target === undefined || typeof target !== "object") return false;
			const tag = typeof target.tagName === "string" ? target.tagName.toLowerCase() : "";
			if (tag === "input" || tag === "textarea" || tag === "select") return true;
			if (target.isContentEditable === true) return true;
			// Walk up: a keystroke inside a rich editor reports an inner node.
			const closest = typeof target.closest === "function" ? target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']") : null;
			return closest !== null && closest !== undefined;
		}
		/**
		 * A chord made only of modifiers (`Alt`, `Ctrl`, `Shift`, `Meta`)?
		 *
		 * Push-to-talk is naturally a single held modifier: keydown starts the
		 * recording and keyup ends it, with no other key involved.
		 */
		function isModifierOnly(chord) {
			return chord === "Alt" || chord === "Ctrl" || chord === "Shift" || chord === "Meta" || chord === "Control";
		}

		function installShortcut() {
			const onKeyDown = (event) => {
				if (keyCapture.active) return;
				const keys = keyConfig.current;
				// 1. Restore the previous draft.
				//
				//    A chord carrying Ctrl/Alt/Meta is safe anywhere, including
				//    inside the composer. A BARE key is not: it would swallow the
				//    letter while typing, so it stays behind the editing guard and
				//    only fires when the focus is outside the input.
				if (!event.repeat && chordMatches(keys.restore, event)
					&& controller.recording === null && store.state.historyDepth > 0
					&& (!needsEditingGuard(keys.restore) || !isEditableTarget(event.target))) {
					event.preventDefault();
					controller.restoreDraft();
					return;
				}
				if (event.key === "Escape" && controller.recording !== null) {
					void controller.cancel("escape");
					return;
				}
				// 3. Push-to-talk: a held modifier key starts the capture.
				if (isModifierOnly(keys.dictate)) {
					const wanted = keys.dictate === "Ctrl" || keys.dictate === "Control" ? "Control" : keys.dictate;
					if (event.key !== wanted) {
						// Another key during the hold makes this a chord, not dictation.
						if (controller.recording !== null) controller.combo = true;
						return;
					}
					if (event.repeat) return;
					// A modifier press is dictation only when no other modifier is down.
					const others = keys.dictate === "Alt"
						? event.ctrlKey || event.shiftKey || event.metaKey
						: keys.dictate === "Ctrl" || keys.dictate === "Control"
							? event.altKey || event.shiftKey || event.metaKey
							: event.ctrlKey || event.altKey || event.metaKey;
					if (others) return;
					controller.combo = false;
					void controller.begin();
					return;
				}
				// 4. Push-to-talk: a real chord (e.g. Ctrl+Shift+Space) starts it.
				if (!event.repeat && chordMatches(keys.dictate, event)) {
					if (controller.recording !== null) {
						controller.combo = true;
						return;
					}
					event.preventDefault();
					controller.combo = false;
					void controller.begin();
					return;
				}
				if (controller.recording !== null) controller.combo = true;
			};
			const onKeyUp = (event) => {
				if (keyCapture.active) return;
				const keys = keyConfig.current;
				if (isModifierOnly(keys.dictate)) {
					const wanted = keys.dictate === "Ctrl" || keys.dictate === "Control" ? "Control" : keys.dictate;
					if (event.key !== wanted) return;
					if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
						// Some other modifier is still held: it was a chord.
						if (controller.recording !== null) void controller.cancel("combo");
						return;
					}
					if (controller.combo) {
						void controller.cancel("combo");
						return;
					}
					void controller.finish();
					return;
				}
				// A chord-based dictation ends when its final key is released.
				if (chordMatches(keys.dictate, event) && controller.recording !== null) {
					if (controller.combo) void controller.cancel("combo");
					else void controller.finish();
				}
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
			const keys = useKeys();
			const busy = state.phase === "enhancing";
			React.useEffect(() => {
				// `draftOf` lets the restore path keep whatever is in the box now,
				// so a restore is itself undoable.
				controller.attach(actions, props.sessionId ?? null, () => draft);
				return () => controller.detach(props.sessionId ?? null);
			}, [actions, props.sessionId, draft]);
			const label = `${t("enhance.title")} · ${chordLabel(keys.dictate)}`;
			// Hovering ✨ explains every shortcut this plugin owns, so nobody has to
			// remember the defaults (or check the plugin page) before talking.
			const title = [
				t("enhance.hint"),
				`${t("keys.dictate")}：${chordLabel(keys.dictate)}`,
				`${t("keys.restore")}：${chordLabel(keys.restore)}`
			].join("\n");
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
			// The pill is normally transient: it clears itself a few seconds after a
			// message. A pending draft history is not transient, so it keeps the
			// pill alive with just the restore affordance — otherwise dictating
			// again (which resets the pill) would hide the way back to the draft.
			const restorable = state.historyDepth > 0;
			if (state.phase === "idle" && !restorable) return null;
			const tone = PHASE_TONE[state.phase] ?? "idle";
			const elapsed = live ? Math.max(0, Math.floor((Date.now() - controller.startedAt) / 1000)) : 0;
			const idleWithHistory = state.phase === "idle" && restorable;
			const message = idleWithHistory
				? format(t, "draft.hint", { count: state.historyDepth })
				: state.error !== null
					? format(t, state.error.key, { message: state.error.detail })
					: state.note !== null ? format(t, state.note.key, state.note.params) : "";
			return h("div", {
				className: "dsh-ve-pill",
				"data-tone": idleWithHistory ? "idle-history" : tone,
				role: tone === "error" ? "alert" : "status",
				"aria-live": "polite"
			},
				h("span", { className: "dsh-ve-dot", "data-tone": idleWithHistory ? "idle" : tone, "aria-hidden": true }),
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
.dsh-ve-settings{display:flex;flex-direction:column;gap:8px;padding:12px 0 4px;font-size:13px;color:var(--dsw-alias-label-primary)}
.dsh-ve-settings-head{font-weight:600;color:var(--dsw-alias-label-primary)}
.dsh-ve-keyrow{display:flex;align-items:center;gap:10px;min-height:26px}
.dsh-ve-keyname{flex:none;min-width:132px;color:var(--dsw-alias-label-secondary)}
.dsh-ve-keybtn{flex:none;min-width:88px;padding:3px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;font-variant-numeric:tabular-nums}
.dsh-ve-keybtn:hover{border-color:var(--dsw-alias-interactive-bg-hover-solid);background:var(--dsw-alias-interactive-bg-hover-solid)}
.dsh-ve-keybtn.is-capturing{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}
.dsh-ve-keyhint{color:var(--dsw-alias-label-tertiary)}
.dsh-ve-keyerror{color:var(--dsw-alias-state-error-primary)}
.dsh-ve-keyok{color:var(--dsw-alias-state-success-primary)}
.dsh-ve-settings-foot{margin-top:2px}
.dsh-ve-reset{padding:3px 10px;border:0;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer}
.dsh-ve-reset:hover{color:var(--dsw-alias-label-primary)}
.dsh-ve-route{display:flex;flex-direction:column;gap:8px;padding:12px 0 4px;font-size:13px;color:var(--dsw-alias-label-primary);border-top:1px solid var(--dsw-alias-border-l1);margin-top:4px}
.dsh-ve-routeselect{max-width:420px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.dsh-ve-routeselect:hover{border-color:var(--dsw-alias-interactive-bg-hover-solid)}
.dsh-ve-routeselect:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
`;
		//#endregion
		//#region dsh-voice-enhance/lib/SettingsCard.js
		/** Which role a row edits. */
		const KEY_ROLES = ["dictate", "restore"];
		/** A modifier pressed on its own is a legitimate push-to-talk key. */
		function modifierOf(event) {
			if (event.key === "Alt" || event.key === "Control" || event.key === "Shift" || event.key === "Meta") {
				return event.key === "Control" ? "Ctrl" : event.key;
			}
			return null;
		}
		/**
		 * The shortcut editor on the plugin page (`plugins.bundle.config`, keyed by
		 * package name).
		 *
		 * The bindings live in `localStorage` rather than in the plugin Config on
		 * purpose: a Config save rewrites the Loader entry, which disposes and
		 * remounts the whole plugin — a jarring reload for changing one key. The
		 * trade-off is that the value is per browser profile, which is where
		 * shortcuts belong anyway.
		 */
		function SettingsCard(props) {
			const t = typeof props.t === "function" ? props.t : (key) => key;
			const keys = useKeys();
			const [capturing, setCapturing] = React.useState(null);
			const [problem, setProblem] = React.useState(null);
			const [saved, setSaved] = React.useState(null);
			React.useEffect(() => {
				if (capturing === null) {
					keyCapture.active = false;
					return undefined;
				}
				keyCapture.active = true;
				setProblem(null);
				const onKeyDown = (event) => {
					event.preventDefault();
					event.stopPropagation();
					if (event.key === "Escape") {
						setCapturing(null);
						return;
					}
					const chord = modifierOf(event) ?? eventToChord(event);
					if (chord === null) return;
					const reason = chordProblem(chord, capturing);
					if (reason !== null) {
						setProblem(reason);
						return;
					}
					const moved = keyConfig.set(capturing, chord);
					setCapturing(null);
					setSaved(moved === null ? capturing : `keys.moved:${chordLabel(moved)}`);
				};
				window.addEventListener("keydown", onKeyDown, true);
				return () => {
					window.removeEventListener("keydown", onKeyDown, true);
					keyCapture.active = false;
				};
			}, [capturing]);
			React.useEffect(() => {
				if (saved === null) return undefined;
				const timer = window.setTimeout(() => setSaved(null), 1600);
				return () => window.clearTimeout(timer);
			}, [saved]);
			const row = (role) => {
				const active = capturing === role;
				return h("div", { className: "dsh-ve-keyrow", key: role },
					h("span", { className: "dsh-ve-keyname" }, t(`keys.${role}`)),
					h("button", {
						type: "button",
						className: `dsh-ve-keybtn${active ? " is-capturing" : ""}`,
						onClick: () => setCapturing(active ? null : role),
						"aria-label": `${t(`keys.${role}`)}: ${chordLabel(keys[role])}`
					}, active ? t("keys.press") : chordLabel(keys[role])),
					active ? h("span", { className: "dsh-ve-keyhint" }, t("keys.hint")) : null);
			};
			return h("div", { className: "dsh-ve-settings" },
				h("div", { className: "dsh-ve-settings-head" }, t("keys.title")),
				KEY_ROLES.map(row),
				problem === null ? null : h("div", { className: "dsh-ve-keyerror", role: "alert" }, t(`keys.${problem}`)),
				saved === null ? null : h("div", { className: "dsh-ve-keyok", role: "status" },
					saved.startsWith("keys.moved:")
						? format(t, "keys.moved", { chord: saved.slice("keys.moved:".length) })
						: t("keys.saved")),
				h("div", { className: "dsh-ve-settings-foot" },
					h("button", {
						type: "button",
						className: "dsh-ve-reset",
						onClick: () => {
							keyConfig.reset();
							setProblem(null);
							setCapturing(null);
						}
					}, t("keys.reset"))),
				h(RouteCard, { t }));
		}
		//#endregion
		//#region dsh-voice-enhance/lib/RouteCard.js
		/**
		 * The enhancement-model picker, rendered under the shortcut editor on the
		 * same bundle page.
		 *
		 * The model list comes from the Host's own model catalogue through the
		 * already-mounted `remote.session` remote (the same read the model
		 * selector in the composer uses), so it shows exactly what is routable
		 * right now — providers without keys are simply absent, and a stored
		 * choice that has since become unroutable still renders (greyed, with an
		 * "unavailable" suffix) instead of vanishing. Re-read when the Host
		 * advertises adapter changes, like the Subagent settings card does.
		 */
		function RouteCard(props) {
			const t = typeof props.t === "function" ? props.t : (key) => key;
			const picked = useRouteConfig();
			const [groups, setGroups] = React.useState(null);
			const [failed, setFailed] = React.useState(false);
			const [detail, setDetail] = React.useState("");
			React.useEffect(() => {
				let disposed = false;
				const load = async () => {
					try {
						const session = typeof routeConfig.remoteOf === "function" ? routeConfig.remoteOf() : null;
						const direct = session !== null && typeof session.modelCatalog === "function" ? session : null;
						if (direct === null) {
							if (!disposed) {
								setFailed(true);
								setDetail("remote.session.modelCatalog unavailable");
							}
							return;
						}
						const response = await direct.modelCatalog();
						if (disposed) return;
						if (response?.ok === true) {
							setGroups(response.value?.groups ?? []);
							setFailed(false);
							setDetail("");
						} else {
							setFailed(true);
							setDetail(JSON.stringify(response?.error ?? response ?? "empty envelope").slice(0, 160));
						}
					} catch (error) {
						if (!disposed) {
							setFailed(true);
							setDetail(String(error?.message ?? error).slice(0, 160));
						}
					}
				};
				void load();
				const off = typeof routeConfig.onAdapterChange === "function"
					? routeConfig.onAdapterChange(() => void load())
					: null;
				return () => {
					disposed = true;
					if (typeof off === "function") off();
				};
			}, []);
			const options = routeOptions(groups, picked);
			const selected = picked === null ? "" : `${picked.provider}::${picked.model}`;
			return h("div", { className: "dsh-ve-route" },
				h("div", { className: "dsh-ve-settings-head" }, t("route.title")),
				h("div", { className: "dsh-ve-keyhint" }, t("route.hint")),
				failed && groups === null
					? h("div", { className: "dsh-ve-keyerror", role: "alert" },
						t("route.error"),
						detail ? h("div", { style: "font-family:monospace;font-size:11px;white-space:pre-wrap;margin-top:4px;word-break:break-all;" }, detail) : null)
					: h("select", {
						className: "dsh-ve-routeselect",
						value: selected,
						onChange: (event) => {
							const value = event.target.value;
							if (value === "") {
								routeConfig.set(null);
								return;
							}
							const option = options.find((candidate) => candidate.key === value);
							if (option === undefined || option.available !== true) return;
							routeConfig.set({ provider: option.provider, model: option.model });
						}
					},
						h("option", { value: "" }, t("route.follow")),
						options.map((option) => h("option", {
							key: option.key,
							value: option.key,
							disabled: option.available !== true
						}, option.available
							? `${option.providerName} · ${option.modelName}`
							: `${option.providerName} · ${option.modelName}（不可用）`))));
		}
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
			// The bundle-page model picker reads the catalogue through the same
			// `remote.session` namespace the composer's model selector uses.
			routeConfig.remoteOf = () => {
				try {
					const session = ctx.remote?.session;
					if (session !== undefined && session !== null) return session;
				} catch {
					/* fall through to null below */
				}
				return null;
			};
			routeConfig.onAdapterChange = (handler) => {
				try {
					return ctx.remote?.$on?.("llm/adapters-updated", handler) ?? null;
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
			// The shortcut editor lives on this bundle's own page in the Plugins
			// panel. The page looks the configuration up by EXACT package name, so
			// the key must be the bare name (no `include:` prefix here — that form
			// is only for deployments that rename the Loader entry).
			ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: "dsh-voice-enhance",
				priority: 30,
				locale: NS
			}, SettingsCard));
		}
		async function mountVoiceEnhance(ctx, contribution) {
			const disposeRemote = await ctx.remote.$mount(contribution);
			const ui = ctx.inject(["remote.promptTools", "remote.session", "slots", "locale"], registerUi);
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
