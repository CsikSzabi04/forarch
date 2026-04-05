import * as vscode from 'vscode';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

export function getDb(context: vscode.ExtensionContext) {
    const dbPath = path.join(context.globalStorageUri.fsPath, 'forarch.db');
    // Ensure dir exists
    if (!fs.existsSync(context.globalStorageUri.fsPath)) {
        fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
    }
    const db = new Database(dbPath);
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

export function startSession(db: any, sessionId: string) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO sessions (id, start_time, is_fix) VALUES (?, ?, ?)`);
    stmt.run(sessionId, Date.now(), 0);
}

export function endSession(db: any, sessionId: string, events: any[], isFix: boolean) {
    const visitedFiles = Array.from(new Set(events.map((e: any) => e.file).filter(f => f && f !== 'unknown')));
    
    db.prepare(`UPDATE sessions SET end_time = ?, is_fix = ?, visited_files = ? WHERE id = ?`)
      .run(Date.now(), isFix ? 1 : 0, JSON.stringify(visitedFiles), sessionId);
    
    // Clear old events optionally, then insert new ones
    db.prepare(`DELETE FROM events WHERE session_id = ?`).run(sessionId);
    
    const insertEvent = db.prepare(`INSERT INTO events (session_id, type, file, line, timestamp) VALUES (?, ?, ?, ?, ?)`);
    for (const ev of events) {
        insertEvent.run(sessionId, ev.type, ev.file, ev.line, ev.timestamp);
    }
}

export function markSessionAsFix(db: any, sessionId: string) {
    // If it hasn't been saved yet, we start it right away just in case
    startSession(db, sessionId);
    db.prepare(`UPDATE sessions SET is_fix = 1 WHERE id = ?`).run(sessionId);
}
