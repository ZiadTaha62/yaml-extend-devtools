import * as vscode from "vscode";
export const onDollarSign = vscode.languages.registerCompletionItemProvider({ scheme: "file", language: "yaml" }, {
    provideCompletionItems(document, position, token, context) {
        return null;
    },
}, "$");
export const onPercentSign = vscode.languages.registerCompletionItemProvider({ scheme: "file", language: "yaml" }, {
    provideCompletionItems(document, position, token, context) {
        return null;
    },
}, "%");
//# sourceMappingURL=textChangeRegister.js.map