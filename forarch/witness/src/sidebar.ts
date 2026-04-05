import * as vscode from 'vscode';
import { getSuggestions } from './similarity';

export function registerSidebar(context: vscode.ExtensionContext) {
    const provider = new SuggestionProvider();
    vscode.window.registerTreeDataProvider('forarch.suggestions', provider);
    // Refresh when a new fix is saved
    context.subscriptions.push({ dispose: () => {} });
}

class SuggestionProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }
    getChildren(): vscode.TreeItem[] {
        const editor = vscode.window.activeTextEditor;
        const currentFile = editor ? editor.document.uri.fsPath : '';
        const currentLine = editor ? editor.selection.active.line : 0;

        const suggestions = getSuggestions(currentFile, currentLine);
        if (suggestions.length === 0) {
            return [new vscode.TreeItem("No similar bugs found", vscode.TreeItemCollapsibleState.None)];
        }
        return suggestions.map(s => {
            const item = new vscode.TreeItem(`Bug ${s.id.substring(0,6)}... (score ${s.score.toFixed(2)})`, vscode.TreeItemCollapsibleState.None);
            item.tooltip = `Matches for ${currentFile}`;
            return item;
        });
    }
}
