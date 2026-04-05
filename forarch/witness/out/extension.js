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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const recorder_1 = require("./recorder");
const similarity_1 = require("./similarity");
const sidebar_1 = require("./sidebar");
const analyzer_1 = require("./analyzer");
function activate(context) {
    (0, recorder_1.activateRecorder)(context);
    (0, sidebar_1.registerSidebar)(context);
    (0, similarity_1.registerSuggestionProvider)();
    (0, analyzer_1.activateAnalyzer)(context);
    // Command: mark current session as fix
    let markFixCmd = vscode.commands.registerCommand('forarch.markFix', () => {
        (0, recorder_1.markCurrentAsFix)();
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
            (0, analyzer_1.scanPackageJson)(vscode.window.activeTextEditor.document);
        }
    });
    context.subscriptions.push(scanCmd);
    // Auto-scan on save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.fileName.endsWith('package.json')) {
            (0, analyzer_1.scanPackageJson)(document);
        }
    }));
}
function deactivate() {
    (0, recorder_1.deactivateRecorder)();
}
//# sourceMappingURL=extension.js.map