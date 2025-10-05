import * as vscode from "vscode";
import { getModule } from "./liveLoader.js";
function getLeastDepth(str) {
    let leastDepth = 0;
    const lines = str.split("\n");
    for (const l of lines) {
        // skip it empty line
        if (!l.trim())
            continue;
        // get depth of the line
        let depth = 0;
        for (const ch of l) {
            if (ch === " ")
                depth++;
            else
                break;
        }
        // if new least depth reset leastDepth and baseLines
        if (leastDepth === undefined || depth < leastDepth)
            leastDepth = depth;
    }
    return leastDepth;
}
function handleLine(line, str, load) {
    let lineDepth = 0;
    for (const ch of line) {
        if (ch === " ")
            lineDepth++;
        else
            break;
    }
    if (lineDepth > 0) {
        const leastDepth = getLeastDepth(str);
        if (lineDepth > leastDepth)
            return { isBaseLine: false, key: undefined };
    }
    const keys = Object.keys(load);
    let present = false;
    let matchKey = undefined;
    for (const k of keys) {
        // trim line
        let trimmedLine = line.trim();
        // remove tag if tag is present before node's name
        if (trimmedLine.startsWith("!")) {
            let tagEnd = 0;
            for (const ch of trimmedLine)
                if (ch !== " ")
                    tagEnd++;
                else
                    break;
            trimmedLine = trimmedLine.slice(tagEnd).trim();
        }
        // if start of the trimmed line is the same as the key (also handle escaping)
        if (trimmedLine.startsWith(k) ||
            trimmedLine.startsWith(`"${k}"`) ||
            trimmedLine.startsWith(`'${k}'`)) {
            present = true;
            matchKey = k;
        }
    }
    return { isBaseLine: present, key: matchKey };
}
function isObject(val) {
    return val && typeof val === "object" && !Array.isArray(val);
}
export const onHover = vscode.languages.registerHoverProvider({ scheme: "file", language: "yaml" }, {
    provideHover(document, position, token) {
        // cancel early if requested
        if (token.isCancellationRequested)
            return null;
        // get load cache and if it's not an object return
        const loadCache = getModule(document.uri.fsPath, true);
        if (!isObject(loadCache))
            return null;
        // get current string and line
        const str = document.getText();
        const line = document.lineAt(position.line).text;
        const char = position.character;
        // handle line by checking if it's a base line or not (only base line show value when hovered on) and get corrispong key
        const { isBaseLine, key } = handleLine(line, str, loadCache);
        if (!isBaseLine || !key)
            return null;
        const start = line.indexOf(key);
        const end = start + key.length;
        // if caret is not inside the key range, don't show hover
        if (char < start || char > end)
            return null;
        // get value to show
        const value = loadCache[key];
        // Build Markdown to show the value
        const md = new vscode.MarkdownString();
        if (value === undefined) {
            md.appendMarkdown("`undefined`");
        }
        else if (value === null) {
            md.appendMarkdown("`null`");
        }
        else if (typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean") {
            // primitives: show inline (strings shown as-is)
            md.appendCodeblock(String(value), "text");
        }
        else {
            // objects/arrays: pretty-print as JSON inside a code block
            try {
                const pretty = JSON.stringify(value, null, 2);
                md.appendCodeblock(pretty, "json");
            }
            catch {
                // fallback if stringify fails
                md.appendCodeblock(String(value), "text");
            }
        }
        // return hover attached to the key range
        const hoverRange = new vscode.Range(position.line, start, position.line, end);
        return new vscode.Hover(md, hoverRange);
    },
});
//# sourceMappingURL=hover.js.map