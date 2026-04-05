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
exports.registerSidebar = registerSidebar;
const vscode = __importStar(require("vscode"));
const similarity_1 = require("./similarity");
function registerSidebar(context) {
    const provider = new SuggestionProvider();
    vscode.window.registerTreeDataProvider('forarch.suggestions', provider);
    // Refresh when a new fix is saved
    context.subscriptions.push({ dispose: () => { } });
}
class SuggestionProvider {
    getTreeItem(element) { return element; }
    getChildren() {
        const editor = vscode.window.activeTextEditor;
        const currentFile = editor ? editor.document.uri.fsPath : '';
        const currentLine = editor ? editor.selection.active.line : 0;
        const suggestions = (0, similarity_1.getSuggestions)(currentFile, currentLine);
        if (suggestions.length === 0) {
            return [new vscode.TreeItem("No similar bugs found", vscode.TreeItemCollapsibleState.None)];
        }
        return suggestions.map(s => {
            const item = new vscode.TreeItem(`Bug ${s.id.substring(0, 6)}... (score ${s.score.toFixed(2)})`, vscode.TreeItemCollapsibleState.None);
            item.tooltip = `Matches for ${currentFile}`;
            return item;
        });
    }
}
//# sourceMappingURL=sidebar.js.map