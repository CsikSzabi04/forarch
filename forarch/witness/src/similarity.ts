import * as vscode from 'vscode';
import Database from 'better-sqlite3';
import * as path from 'path';

function intersectionSize(setA: string[], setB: string[]): number {
    const b = new Set(setB);
    return setA.filter(x => b.has(x)).length;
}

function unionSize(setA: string[], setB: string[]): number {
    const _union = new Set([...setA, ...setB]);
    return _union.size;
}

export function registerSuggestionProvider() {
    // optional initialization
}

export function getSuggestions(currentFile: string, currentLine: number): any[] {
    const ext = vscode.extensions.getExtension('forarch-witness'); // The extension name in package.json is forarch-witness
    if (!ext) return [];
    
    try {
        const dbPath = path.join(ext.extensionPath, '..', 'globalStorage', 'forarch.witness', 'forarch.db');
        const db = new Database(dbPath);
        
        const fixSessions = db.prepare(`SELECT id, visited_files, hot_lines FROM sessions WHERE is_fix = 1`).all();
        const scores = fixSessions.map((s: any) => {
            const files = JSON.parse(s.visited_files || '[]');
            const uSize = unionSize([currentFile], files);
            const jaccard = uSize === 0 ? 0 : intersectionSize([currentFile], files) / uSize;
            return { ...s, score: jaccard };
        });
        scores.sort((a: any, b: any) => b.score - a.score);
        return scores.slice(0,3);
    } catch (e) {
        return [];
    }
}
