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
exports.activateAnalyzer = activateAnalyzer;
exports.scanPackageJson = scanPackageJson;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let diagnosticCollection;
function activateAnalyzer(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('forarch');
    context.subscriptions.push(diagnosticCollection);
}
async function scanPackageJson(document) {
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
    }
    else if (fs.existsSync(localVenv)) {
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
        }
        catch (e) {
            console.error("Parse Error:", e);
        }
    });
}
function updateDiagnostics(document, results) {
    diagnosticCollection.clear();
    const diagnostics = [];
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
//# sourceMappingURL=analyzer.js.map