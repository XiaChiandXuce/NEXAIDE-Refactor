/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AIChatViewProvider: () => (/* binding */ AIChatViewProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _core_agentFsm__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _core_configManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var _core_sessionManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var _core_llm_factory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(15);






class AIChatViewProvider {
    _extensionUri;
    static viewType = 'nexaide.chatView';
    messaging;
    fsm;
    config;
    session;
    llmProvider = null;
    mcp = null;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.config = new _core_configManager__WEBPACK_IMPORTED_MODULE_3__.ConfigManager();
        this.fsm = new _core_agentFsm__WEBPACK_IMPORTED_MODULE_2__.AgentFSM();
        this.session = new _core_sessionManager__WEBPACK_IMPORTED_MODULE_4__.SessionManager();
        // LLM Provider is initialized lazily based on user config
        // Wire up the controller logic
        this.messaging = new _messaging__WEBPACK_IMPORTED_MODULE_1__.MessagingService(this.handleUserAction.bind(this));
        // Listen for internal state changes
        this.fsm.on('stateChanged', (state) => {
            this.messaging.send({ type: 'STATE_CHANGED', newState: state });
        });
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this.messaging.attachWebview(webviewView.webview);
    }
    async handleUserAction(action) {
        console.log('[Controller] User Action:', action.type);
        switch (action.type) {
            case 'SUBMIT_PROMPT':
                await this.handleSubmit(action.content);
                break;
            case 'STOP_GENERATION':
                this.handleStop();
                break;
            case 'CLEAR_HISTORY':
                this.session.startNewSession();
                this.messaging.send({ type: 'REPLACE_TEXT', text: '' });
                break;
            case 'EDIT_MESSAGE':
                await this.handleEditMessage(action.payload.id, action.payload.newContent);
                break;
        }
    }
    async handleEditMessage(id, newContent) {
        // 1. Abort current generation if active
        if (this.fsm.getState() === 'WRITING' || this.fsm.getState() === 'THINKING') {
            this.handleStop();
        }
        try {
            // 2. Truncate and Update
            this.session.truncateFrom(id);
            this.session.updateMessageContent(id, newContent);
            // 3. Notify Frontend of state change (truncated history)
            // 3. Notify Frontend of state change (truncated history)
            this.syncState();
            // 4. Regenerate
            await this.handleSubmit(newContent, { isRegeneration: true });
        }
        catch (e) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`Edit failed: ${e.message}`);
        }
    }
    async handleSubmit(content, options) {
        if (this.fsm.getState() !== 'IDLE')
            return;
        this.fsm.transition('THINKING');
        // 1. Add User Message (if not regenerating)
        if (!options?.isRegeneration) {
            this.session.addMessage('user', content);
        }
        // 2. SYNC immediately so frontend gets the User Message ID
        this.syncState();
        const cfg = this.config.getConfig();
        let fullResponse = ''; // Accumulator
        try {
            // Lazy initialization
            this.llmProvider = _core_llm_factory__WEBPACK_IMPORTED_MODULE_5__.LLMFactory.createProvider(cfg.model || 'qwen-max');
            await this.llmProvider.initialize();
            // Notify frontend to clear partial text if needed (for regeneration)
            if (options?.isRegeneration) {
                this.messaging.send({ type: 'REPLACE_TEXT', text: '' });
                // We also need to ensure frontend state matches our truncated session BEFORE streaming
                // The syncState() above handles that.
            }
            await this.llmProvider.streamChat({
                messages: this.session.getMessages().map(m => ({ role: m.role, content: m.content })),
                temperature: cfg.temperature
            }, (chunk) => {
                if (this.fsm.getState() === 'IDLE')
                    return; // Interrupted
                if (this.fsm.getState() === 'THINKING') {
                    this.fsm.transition('WRITING');
                }
                fullResponse += chunk;
                this.messaging.send({ type: 'APPEND_TEXT', text: chunk });
            });
            // 3. Save Assistant Message and Sync
            if (fullResponse && this.fsm.getState() !== 'IDLE') {
                this.session.addMessage('assistant', fullResponse);
                this.syncState();
            }
            this.fsm.transition('IDLE');
            this.messaging.send({ type: 'DONE' });
        }
        catch (e) {
            this.fsm.transition('ERROR');
            this.messaging.send({ type: 'ERROR', message: e.message || 'Unknown error' });
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`LLM Error: ${e.message}`);
        }
    }
    syncState() {
        this.messaging.send({
            type: 'SYNC_MESSAGES',
            messages: this.session.getMessages().map(m => ({
                id: m.id,
                role: m.role,
                content: m.content
            }))
        });
    }
    handleStop() {
        // Logic to abort LLM request would go here (need to expose AbortController in LLMClient)
        this.fsm.transition('IDLE');
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const stylesUri = webview.asWebviewUri(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets", "index.css"));
        const scriptUri = webview.asWebviewUri(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets", "index.js"));
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data: https:;">
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
            <title>NEXAIDE</title>
        </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MessagingService: () => (/* binding */ MessagingService)
/* harmony export */ });
class MessagingService {
    onUserAction;
    view;
    disposables = [];
    constructor(onUserAction) {
        this.onUserAction = onUserAction;
    }
    attachWebview(view) {
        this.view = view;
        view.onDidReceiveMessage((message) => {
            // Runtime validation could happen here with Zod
            this.onUserAction(message);
        }, null, this.disposables);
    }
    send(message) {
        if (this.view) {
            this.view.postMessage(message);
        }
        else {
            console.warn('[Messaging] Webview not attached, dropping message:', message.type);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.view = undefined;
    }
}


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgentFSM: () => (/* binding */ AgentFSM)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);

class AgentFSM extends events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    currentState = 'IDLE';
    constructor() {
        super();
    }
    getState() {
        return this.currentState;
    }
    transition(newState) {
        // Simple validation logic (can be expanded with XState later)
        if (this.currentState === newState)
            return;
        console.log(`[FSM] State transition: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
        this.emit('stateChanged', newState);
    }
    handleAction(action) {
        switch (action.type) {
            case 'SUBMIT_PROMPT':
                if (this.currentState === 'IDLE' || this.currentState === 'ERROR') {
                    this.transition('THINKING');
                }
                break;
            case 'STOP_GENERATION':
                if (this.currentState === 'THINKING' || this.currentState === 'WRITING') {
                    this.transition('IDLE');
                }
                break;
            case 'CLEAR_HISTORY':
                this.transition('IDLE');
                break;
        }
    }
}


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("events");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfigManager: () => (/* binding */ ConfigManager)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

class ConfigManager {
    static SECTION = 'nexaide';
    getConfig() {
        const config = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration(ConfigManager.SECTION);
        return {
            apiUrl: config.get('apiUrl') ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            apiKey: config.get('apiKey') ?? process.env.DASHSCOPE_API_KEY ?? '',
            model: config.get('model') ?? 'qwen-plus',
            temperature: config.get('temperature') ?? 0.7,
            maxTokens: config.get('maxTokens') ?? 2048,
            agentMode: config.get('agentMode') ?? 'mcp'
        };
    }
    async updateConfig(key, value) {
        const config = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration(ConfigManager.SECTION);
        await config.update(key, value, vscode__WEBPACK_IMPORTED_MODULE_0__.ConfigurationTarget.Global);
    }
}


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SessionManager: () => (/* binding */ SessionManager)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);

class SessionManager {
    currentSession;
    history = [];
    constructor() {
        this.currentSession = this.createNewSession();
    }
    createNewSession() {
        const now = Date.now();
        return {
            id: (0,uuid__WEBPACK_IMPORTED_MODULE_0__["default"])(),
            messages: [],
            createdAt: now,
            updatedAt: now
        };
    }
    startNewSession() {
        if (this.currentSession.messages.length > 0) {
            this.history.push(this.currentSession);
        }
        this.currentSession = this.createNewSession();
    }
    addMessage(role, content) {
        const msg = {
            id: (0,uuid__WEBPACK_IMPORTED_MODULE_0__["default"])(),
            role,
            content,
            timestamp: Date.now()
        };
        this.currentSession.messages.push(msg);
        this.currentSession.updatedAt = Date.now();
        return msg;
    }
    truncateFrom(messageId) {
        const index = this.currentSession.messages.findIndex(m => m.id === messageId);
        if (index === -1) {
            throw new Error(`Message with ID ${messageId} not found`);
        }
        // Keep messages up to and including the target message
        this.currentSession.messages = this.currentSession.messages.slice(0, index + 1);
        this.currentSession.updatedAt = Date.now();
    }
    updateMessageContent(messageId, content) {
        const message = this.currentSession.messages.find(m => m.id === messageId);
        if (!message) {
            throw new Error(`Message with ID ${messageId} not found`);
        }
        message.content = content;
        this.currentSession.updatedAt = Date.now();
    }
    getMessages() {
        return this.currentSession.messages;
    }
    getCurrentSessionId() {
        return this.currentSession.id;
    }
    /**
     * Prepare context for LLM (e.g. limit context window)
     */
    getContextMetadata() {
        return {
            sessionId: this.currentSession.id,
            turnCount: this.currentSession.messages.length / 2
        };
    }
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);




function v4(options, buf, offset) {
  if (_native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID && !buf && !options) {
    return _native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_1__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  randomUUID: (crypto__WEBPACK_IMPORTED_MODULE_0___default().randomUUID)
});

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto__WEBPACK_IMPORTED_MODULE_0___default().randomFillSync(rnds8Pool);
    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LLMFactory: () => (/* binding */ LLMFactory)
/* harmony export */ });
/* harmony import */ var _providers_qwen__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);

class LLMFactory {
    /**
     * Create an LLM provider instance based on the model ID.
     * @param modelId The model identifier (e.g. "qwen-max", "gpt-4")
     */
    static createProvider(modelId) {
        // Normalize model ID
        const id = modelId.toLowerCase();
        // Router logic
        if (id.startsWith('qwen')) {
            return new _providers_qwen__WEBPACK_IMPORTED_MODULE_0__.QwenProvider();
        }
        // Future extensions:
        // if (id.startsWith('gpt')) return new OpenAIProvider();
        // if (id.startsWith('claude')) return new AnthropicProvider();
        // if (id.startsWith('gemini')) return new GeminiProvider();
        // Default fallback (or throw error)
        throw new Error(`Unsupported model: ${modelId}`);
    }
}


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QwenProvider: () => (/* binding */ QwenProvider)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(17);

class QwenProvider extends _base__WEBPACK_IMPORTED_MODULE_0__.BaseProvider {
    id = 'qwen-max'; // Default model
    apiKey = '';
    baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    constructor() {
        super();
    }
    async initialize() {
        this.apiKey = this.getApiKey('DASHSCOPE_API_KEY');
    }
    async chat(request) {
        const response = await this.makeRequest(request, false);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Qwen API Error: ${data.error?.message || response.statusText}`);
        }
        return data.choices[0].message.content;
    }
    async streamChat(request, onChunk) {
        const response = await this.makeRequest(request, true);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(`Qwen API Error: ${data.error?.message || response.statusText}`);
        }
        if (!response.body) {
            throw new Error('Response body is null');
        }
        // Use standard Web Streams API (available in modern Node and VS Code)
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep the last incomplete line
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]')
                        continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(trimmed.slice(6));
                            const content = data.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        }
                        catch (e) {
                            console.error('Failed to parse stream chunk:', e);
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async makeRequest(request, stream) {
        if (!this.apiKey) {
            await this.initialize();
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
        const body = {
            model: this.id,
            messages: request.messages,
            stream: stream,
            temperature: request.temperature ?? 0.7
        };
        return fetch(this.baseUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: request.abortSignal
        });
    }
}


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseProvider: () => (/* binding */ BaseProvider)
/* harmony export */ });
class BaseProvider {
    constructor() { }
    getApiKey(envVarName) {
        // Priority: Process Env (for development/testing)
        // In a real VS Code extension, this would also check vscode.workspace.getConfiguration()
        const key = process.env[envVarName];
        if (!key) {
            throw new Error(`Missing environment variable: ${envVarName}`);
        }
        return key;
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activate: () => (/* binding */ activate),
/* harmony export */   deactivate: () => (/* binding */ deactivate)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ui_ViewProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);


function activate(context) {
    console.log('[NEXAIDE] Activating extension...');
    const provider = new _ui_ViewProvider__WEBPACK_IMPORTED_MODULE_1__.AIChatViewProvider(context.extensionUri);
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerWebviewViewProvider(_ui_ViewProvider__WEBPACK_IMPORTED_MODULE_1__.AIChatViewProvider.viewType, provider, {
        webviewOptions: { retainContextWhenHidden: true }
    }));
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('nexaide.openChat', () => {
        vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand('workbench.view.extension.nexaide-sidebar');
    }));
    console.log('[NEXAIDE] Activation complete.');
}
function deactivate() {
    // Cleanup services if needed
}

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map