"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateRecorder = activateRecorder;
exports.deactivateRecorder = deactivateRecorder;
exports.markCurrentAsFix = markCurrentAsFix;
const vscode = __importStar(require("vscode"));
const uuid_1 = require("uuid");
const storage_1 = require("./storage");
let currentSessionId = null;
let events = [];
let db;
function activateRecorder(context) {
    db = (0, storage_1.getDb)(context);
    // Start new session on debug start
    vscode.debug.onDidStartDebugSession(() => {
        currentSessionId = (0, uuid_1.v4)();
        events = [];
        (0, storage_1.startSession)(db, currentSessionId);
    });
    // Record breakpoint/step events
    vscode.debug.onDidReceiveDebugSessionCustomEvent((event) => {
        if (!currentSessionId)
            return;
        if (event.event === 'stopped' && event.body.reason === 'breakpoint') {
            try {
                // @ts-ignore
                const stack = event.session.getStackFrame ? event.session.getStackFrame(0) : null;
                if (stack) {
                    events.push({
                        type: 'breakpoint',
                        // @ts-ignore
                        file: stack.source?.path || 'unknown',
                        // @ts-ignore
                        line: stack.line || 0,
                        timestamp: Date.now()
                    });
                }
            }
            catch (e) {
                // Ignore stack extraction errors
            }
        }
        // Add step handling similarly
    });
    // On debug end, auto-save if not marked as fix (we'll store as 'unfixed')
    vscode.debug.onDidTerminateDebugSession(() => {
        if (currentSessionId) {
            (0, storage_1.endSession)(db, currentSessionId, events, false);
            currentSessionId = null;
            events = [];
        }
    });
}
function deactivateRecorder() {
    // cleanup
}
function markCurrentAsFix() {
    if (currentSessionId) {
        (0, storage_1.markSessionAsFix)(db, currentSessionId);
        vscode.window.showInformationMessage('Session saved as a fix!');
    }
    else {
        vscode.window.showInformationMessage('No active session to mark as fix.');
    }
}
//# sourceMappingURL=recorder.js.map