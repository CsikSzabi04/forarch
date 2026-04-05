import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activateAnalyzer(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('forarch');
    context.subscriptions.push(diagnosticCollection);
}

export async function scanPackageJson(document: vscode.TextDocument) {
    if (!document.fileName.endsWith('package.json')) {
        return;
    }

    const manifestPath = document.fileName;
    // Walk up to find the root venv
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceRoot) {
        return;
    }

    // Try multiple paths depending on how the workspace is opened
    // E.g. d:\Projectss\Forecast_Archaeology\.venv\Scripts\python.exe
    let pythonPath = "python";
    const possibleVenv = path.join(workspaceRoot, '..', '.venv', 'Scripts', 'python.exe');
    const localVenv = path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');

    if (fs.existsSync(possibleVenv)) {
        pythonPath = possibleVenv;
    } else if (fs.existsSync(localVenv)) {
        pythonPath = localVenv;
    }

    // Find the decay src
    const decayPath = path.join(workspaceRoot, 'decay');
    
    vscode.window.showInformationMessage('ForArch: Scanning dependencies via local engine...');

    const command = `"${pythonPath}" -m src.cli.forarch scan --manifest "${manifestPath}" --json`;
    
    cp.exec(command, { cwd: decayPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            vscode.window.showErrorMessage('ForArch Analyzer Failed: ' + stderr);
            return;
        }

        try {
            const results = JSON.parse(stdout);
            updateDiagnostics(document, results);
            vscode.window.showInformationMessage('ForArch: Scan completed. Found ' + results.length + ' issues.');
        } catch (e) {
            console.error("Parse Error:", e);
        }
    });
}

function updateDiagnostics(document: vscode.TextDocument, results: any[]) {
    diagnosticCollection.clear();
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    for (const res of results) {
        // Find line number for the specific library in the json file
        const libRegex = new RegExp(`"${res.library}"\\s*:`, 'g');
        let match;
        while ((match = libRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + `"${res.library}"`.length);
            const range = new vscode.Range(startPos, endPos);

            let message = '';
            if (res.warnings && res.warnings.length > 0) {
                message = res.warnings.join('\\n');
            }
            if (res.recommendation) {
                message += `\\nRECOMMENDED FIX: Use '${res.recommendation}' instead.`;
            }

            const severity = res.is_decaying ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
            
            const diagnostic = new vscode.Diagnostic(range, 'Forecast Archaeology: ' + message, severity);
            diagnostic.source = 'forarch';
            diagnostics.push(diagnostic);
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
}
