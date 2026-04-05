import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { getDb, startSession, endSession, markSessionAsFix } from './storage';

let currentSessionId: string | null = null;
let events: any[] = [];
let db: any;

export function activateRecorder(context: vscode.ExtensionContext) {
    db = getDb(context);
    
    // Start new session on debug start
    vscode.debug.onDidStartDebugSession(() => {
        currentSessionId = uuidv4();
        events = [];
        startSession(db, currentSessionId);
    });

    // Record breakpoint/step events
    vscode.debug.onDidReceiveDebugSessionCustomEvent((event) => {
        if (!currentSessionId) return;
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
            } catch (e) {
                // Ignore stack extraction errors
            }
        }
        // Add step handling similarly
    });

    // On debug end, auto-save if not marked as fix (we'll store as 'unfixed')
    vscode.debug.onDidTerminateDebugSession(() => {
        if (currentSessionId) {
            endSession(db, currentSessionId, events, false);
            currentSessionId = null;
            events = [];
        }
    });
}

export function deactivateRecorder() {
    // cleanup
}

export function markCurrentAsFix() {
    if (currentSessionId) {
        markSessionAsFix(db, currentSessionId);
        vscode.window.showInformationMessage('Session saved as a fix!');
    } else {
        vscode.window.showInformationMessage('No active session to mark as fix.');
    }
}
