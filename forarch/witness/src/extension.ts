import * as vscode from 'vscode';
import { activateRecorder, deactivateRecorder, markCurrentAsFix } from './recorder';
import { registerSuggestionProvider } from './similarity';
import { registerSidebar } from './sidebar';
import { activateAnalyzer, scanPackageJson } from './analyzer';

export function activate(context: vscode.ExtensionContext) {
    activateRecorder(context);
    registerSidebar(context);
    registerSuggestionProvider();
    activateAnalyzer(context);

    // Command: mark current session as fix
    let markFixCmd = vscode.commands.registerCommand('forarch.markFix', () => {
        markCurrentAsFix();
    });
    context.subscriptions.push(markFixCmd);

    // Command: show suggestions manually
    let showCmd = vscode.commands.registerCommand('forarch.showSuggestions', () => {
        // refresh sidebar
        vscode.window.showInformationMessage('Refreshing ForArch suggestions...');
        vscode.commands.executeCommand('workbench.actions.treeView.forarch.suggestions.refresh');
    });
    context.subscriptions.push(showCmd);

    // Command: Scan package.json decay
    let scanCmd = vscode.commands.registerCommand('forarch.scanDependencies', () => {
        if (vscode.window.activeTextEditor) {
            scanPackageJson(vscode.window.activeTextEditor.document);
        }
    });
    context.subscriptions.push(scanCmd);

    // Auto-scan on save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.fileName.endsWith('package.json')) {
            scanPackageJson(document);
        }
    }));
}

export function deactivate() {
    deactivateRecorder();
}
