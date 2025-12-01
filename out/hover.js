import * as vscode from "vscode";
import { findScalar, SCALAR_ARRAY_MAP } from "./scalar.js";
export const hoverProvider = vscode.languages.registerHoverProvider({ language: "yaml" }, {
    provideHover(document, position, token) {
        // get file path and scalarArray
        const path = document.uri.fsPath;
        const scalarArray = SCALAR_ARRAY_MAP.get(path);
        // get range of the word being hover on
        const range = document.getWordRangeAtPosition(position);
        // if no scalar array or range return
        if (!scalarArray || !range)
            return;
        // make linePos object
        const pos = {
            line: range.start.line,
            col: range.start.character,
        };
        // get scalar being hover on by range (if word is inside a scalar)
        const scalar = findScalar(scalarArray, pos);
        // if no scalar or scalar is not a key return
        if (!scalar || !scalar.isKey)
            return;
        // register value of the key
        return new vscode.Hover(formatHoverValue(scalar.resolvedKeyValue));
    },
});
function formatHoverValue(value) {
    const md = new vscode.MarkdownString();
    md.isTrusted = true; // allows links if needed later
    if (value === null) {
        md.appendMarkdown("`null`");
        return md;
    }
    const type = typeof value;
    if (type === "string") {
        md.appendMarkdown(`**String:**\n\n\`${value}\``);
    }
    else if (type === "number") {
        md.appendMarkdown(`**Number:** \`${value}\``);
    }
    else if (type === "boolean") {
        md.appendMarkdown(`**Boolean:** \`${value}\``);
    }
    else if (Array.isArray(value)) {
        md.appendMarkdown("**Array:**\n\n```yaml\n");
        md.appendMarkdown(JSON.stringify(value, null, 2));
        md.appendMarkdown("\n```");
    }
    else if (type === "object") {
        md.appendMarkdown("**Object:**\n\n```yaml\n");
        md.appendMarkdown(JSON.stringify(value, null, 2));
        md.appendMarkdown("\n```");
    }
    else {
        md.appendMarkdown(`\`${String(value)}\``);
    }
    return md;
}
//# sourceMappingURL=hover.js.map