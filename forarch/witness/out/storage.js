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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.startSession = startSession;
exports.endSession = endSession;
exports.markSessionAsFix = markSessionAsFix;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function getDb(context) {
    const dbPath = path.join(context.globalStorageUri.fsPath, 'forarch.db');
    // Ensure dir exists
    if (!fs.existsSync(context.globalStorageUri.fsPath)) {
        fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
    }
    const db = new better_sqlite3_1.default(dbPath);
    // Add visited_files and fix_diff properly
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            start_time INTEGER,
            end_time INTEGER,
            is_fix INTEGER DEFAULT 0,
            failing_test TEXT,
            visited_files TEXT,
            hot_lines TEXT,
            fix_diff TEXT
        );
        CREATE TABLE IF NOT EXISTS events (
            session_id TEXT,
            type TEXT,
            file TEXT,
            line INTEGER,
            timestamp INTEGER
        );
    `);
    return db;
}
function startSession(db, sessionId) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO sessions (id, start_time, is_fix) VALUES (?, ?, ?)`);
    stmt.run(sessionId, Date.now(), 0);
}
function endSession(db, sessionId, events, isFix) {
    const visitedFiles = Array.from(new Set(events.map((e) => e.file).filter(f => f && f !== 'unknown')));
    db.prepare(`UPDATE sessions SET end_time = ?, is_fix = ?, visited_files = ? WHERE id = ?`)
        .run(Date.now(), isFix ? 1 : 0, JSON.stringify(visitedFiles), sessionId);
    // Clear old events optionally, then insert new ones
    db.prepare(`DELETE FROM events WHERE session_id = ?`).run(sessionId);
    const insertEvent = db.prepare(`INSERT INTO events (session_id, type, file, line, timestamp) VALUES (?, ?, ?, ?, ?)`);
    for (const ev of events) {
        insertEvent.run(sessionId, ev.type, ev.file, ev.line, ev.timestamp);
    }
}
function markSessionAsFix(db, sessionId) {
    // If it hasn't been saved yet, we start it right away just in case
    startSession(db, sessionId);
    db.prepare(`UPDATE sessions SET is_fix = 1 WHERE id = ?`).run(sessionId);
}
//# sourceMappingURL=storage.js.map