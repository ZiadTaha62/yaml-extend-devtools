import * as vscode from "vscode";
import { divideByDelimiter, getNextDelimiter, getNextChar, WHITE_SPACE_REGEX, } from "./tokinizer.js";
/** Color decoration for expression bases. (red) */
const exprBaseColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(203, 67, 53, 1)", // #CB4335
});
/** Color decoration for expression data. (soft green) */
const exprDataColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(88, 169, 115, 1)", // #58A973
});
/** Color decoration for directive bases. (same red as exprBase) */
const dirBaseColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(203, 67, 53, 1)", // #CB4335
});
/** Color decoration for directive data. (slightly deeper green) */
const dirDataColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(46, 160, 98, 1)", // #2EA062
});
/** Color decoration for key in key=value pairs. (gold) */
const keyColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(212, 175, 55, 1)", // #D4AF37
});
/** Color decoration for value in key=value pairs. (same gold) */
const valueColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(212, 175, 55, 1)", // #D4AF37
});
/** Color decoration for equal sign in key=value pairs. (same red) */
const equalColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(203, 67, 53, 1)", // #CB4335
});
const interpolationColor = vscode.window.createTextEditorDecorationType({
    color: "rgba(255, 215, 0, 1)",
});
/** Function to check is char is a white space char. */
function isWhiteSpace(ch) {
    return WHITE_SPACE_REGEX.test(ch);
}
function handleFreeExpr(line, startIdx) {
    /** Array to hold highlights. */
    const highlights = [];
    // define prev char
    const prevChar = startIdx === 0 ? null : line[startIdx - 1];
    // make sure that it's in the start of the line or preceeded by white space, if not return
    if (prevChar && !isWhiteSpace(prevChar))
        return { newIdx: startIdx + 1, highlights: [] };
    // divide by white spaces
    const breakpoints = divideByDelimiter(line, " ", startIdx);
    // filter breakpoints so consecutive white spaces are ignored
    const filteredBreakpoints = breakpoints.filter((num, i) => {
        if (i === 0)
            return true;
        return num - breakpoints[i - 1] > 1;
    });
    /** Var to hold last breakpoint, so newIdx can be measured. */
    let prev = startIdx;
    // loop through break points and handle
    for (let i = 0; i < filteredBreakpoints.length; i++) {
        // get breakpoint
        const bp = filteredBreakpoints[i];
        // if first breakpoint then exprBase and exprData
        if (i === 0) {
            const newHighLights = handleExprBaseData(line, prev, bp);
            highlights.push(...newHighLights);
            prev = bp;
            continue;
        }
        // handle key=value pairs as long as chain of valid key=value pairs is present
        const newHighLights = handleKeyValuePairs(line, prev, bp);
        if (newHighLights.length === 0)
            break;
        highlights.push(...newHighLights);
        prev = bp;
    }
    return { highlights, newIdx: prev };
}
function handleInterPolationExpr(line, startIdx) {
    /** Array to hold highlights */
    let highlights = [];
    // add highlight color to "${" at the start
    highlights.push({
        start: startIdx,
        end: startIdx + 2,
        color: interpolationColor,
    });
    // get first non white space char after "${"
    let firstCharIdx = startIdx + 2; // skip "${"
    while (firstCharIdx < line.length && isWhiteSpace(line[firstCharIdx]))
        firstCharIdx++;
    // divide by white spaces
    const breakpoints = divideByDelimiter(line, " ", firstCharIdx);
    // filter breakpoints so consecutive white spaces are ignored
    const filteredBreakpoints = breakpoints.filter((num, i) => {
        if (i === 0)
            return true;
        return num - breakpoints[i - 1] > 1;
    });
    /** Var to hold last breakpoint, so newIdx can be measured. */
    let prev = firstCharIdx;
    // loop through break points and handle
    for (let i = 0; i < filteredBreakpoints.length; i++) {
        // get breakpoint
        const bp = filteredBreakpoints[i];
        // if first breakpoint then exprBase and exprData
        if (i === 0) {
            const newHighLights = handleExprBaseData(line, prev, bp);
            highlights.push(...newHighLights);
            prev = bp;
            continue;
        }
        // handle key=value pairs as long as chain of valid key=value pairs is present
        const newHighLights = handleKeyValuePairs(line, prev, bp);
        if (newHighLights.length === 0)
            break;
        highlights.push(...newHighLights);
        prev = bp;
    }
    // add highlight color to "${" at the end
    const closeBracketsIdx = getNextChar(line, prev, "}");
    if (closeBracketsIdx !== -1)
        highlights.push({
            start: closeBracketsIdx,
            end: closeBracketsIdx + 1,
            color: interpolationColor,
        });
    return { highlights, newIdx: prev };
}
function handleKeyValuePairs(line, start, end) {
    // get part that hold key value pair
    const part = line.slice(start, end);
    // get equal signs
    const equalBp = divideByDelimiter(part, "=");
    // return empty array if no or more than 1 equal signs are present
    if (equalBp.length - 1 !== 1)
        return [];
    /** Array that will hold highlighs for key, equal sign and value */
    const highlights = [];
    const keyStart = start;
    const keyEnd = keyStart + equalBp[0];
    highlights.push({ start: keyStart, end: keyEnd, color: keyColor });
    const equalStart = keyEnd;
    const equalEnd = equalStart + 1;
    highlights.push({ start: equalStart, end: equalEnd, color: equalColor });
    const valueStart = equalEnd;
    const valueEnd = end;
    highlights.push({ start: valueStart, end: valueEnd, color: valueColor });
    return highlights;
}
function handleExprBaseData(line, start, end) {
    // get part that hold base and data
    const part = line.slice(start, end);
    // get index of the first "." (exprBase)
    const bp = getNextDelimiter(part, ".");
    /** Array that will hold highlighs for expr base and data */
    const highlights = [];
    // if there is a breakpoint, then add indices of exprBase and exprData, otherwise add exprBase only
    if (bp !== -1) {
        const exprBaseEnd = bp + start;
        highlights.push({ start: start, end: exprBaseEnd, color: exprBaseColor });
        highlights.push({ start: exprBaseEnd, end: end, color: exprDataColor });
    }
    else {
        highlights.push({ start: start, end: end, color: exprBaseColor });
    }
    return highlights;
}
/** Function to handle expressions */
function handleExp(line, startIdx) {
    // normalize startIdx to be zero if not defined
    startIdx = startIdx ?? 0;
    // get next and prev chars
    const nextChar = line[startIdx + 1];
    const prevChar = startIdx === 0 ? null : line[startIdx - 1];
    // make sure next char is not "$" (escaped)
    if (nextChar === "$")
        return { newIdx: startIdx + 2, highlights: [] }; // two here to skip the other "$" as well
    // make sure prev char is not "$" (escaped)
    if (prevChar === "$")
        return { newIdx: startIdx + 1, highlights: [] };
    // make sure it's not single "$" char
    if (isWhiteSpace(nextChar))
        return { newIdx: startIdx + 1, highlights: [] };
    // check if it's iterpolation format "${}" or free format "$" and handle it accordingly
    if (nextChar === "{")
        return handleInterPolationExpr(line, startIdx);
    else
        return handleFreeExpr(line, startIdx);
}
function handleDir(line, startIdx) {
    // if not at the start return directly
    if (startIdx !== 0)
        return { newIdx: startIdx + 1, highlights: [] };
    /** Array to hold highlights */
    let highlights = [];
    // divide by white spaces
    const breakpoints = divideByDelimiter(line, " ", startIdx);
    // filter breakpoints so consecutive white spaces are ignored
    const filteredBreakpoints = breakpoints.filter((num, i) => {
        if (i === 0)
            return true;
        return num - breakpoints[i - 1] > 1;
    });
    /** Var to hold last breakpoint, so newIdx can be measured. */
    let prev = startIdx;
    // start looping breakpoints and handle them
    for (let i = 0; i < filteredBreakpoints.length; i++) {
        // get breakpoint
        const bp = filteredBreakpoints[i];
        // if first breakpoint then exprBase
        if (i === 0) {
            highlights.push({ start: prev, end: bp, color: dirBaseColor });
            prev = bp;
            continue;
        }
        // if second breakpoint then exprData
        if (i === 1) {
            highlights.push({ start: prev, end: bp, color: dirDataColor });
            prev = bp;
            continue;
        }
        // after first two, check if follows key=value, if yes handle it as keyValue pair otherwise handle it as exprData
        const keyValueHighlights = handleKeyValuePairs(line, prev, bp);
        if (keyValueHighlights.length > 0) {
            highlights.push(...keyValueHighlights);
            prev = bp;
        }
        else {
            highlights.push({ start: prev, end: bp, color: dirDataColor });
            prev = bp;
        }
    }
    return { newIdx: prev, highlights };
}
export function highlightLine(line) {
    /** Array to hold hightlights */
    const highlights = [];
    // loop line
    let i = 0;
    while (i < line.length) {
        // currnt char
        const ch = line[i];
        // if "$" handle expression
        if (ch === "$") {
            const { highlights: newHighlights, newIdx } = handleExp(line, i);
            highlights.push(...newHighlights);
            i = newIdx;
            continue;
        }
        if (ch === "%") {
            const { highlights: newHighlights, newIdx } = handleDir(line, i);
            highlights.push(...newHighlights);
            i = newIdx;
            continue;
        }
        // increment index
        i++;
    }
    return highlights;
}
/* ---------- decorations store & helpers ---------- */
/**
 * Decorations store structure:
 * Map<documentUri, Map<decorationType, vscode.Range[]>>
 */
const decorationsStore = new Map();
function getDocStore(uri) {
    let store = decorationsStore.get(uri);
    if (!store) {
        store = new Map();
        // initialize entries for each decoration type we use
        [
            exprBaseColor,
            exprDataColor,
            dirBaseColor,
            dirDataColor,
            keyColor,
            valueColor,
            equalColor,
        ].forEach((dec) => store.set(dec, []));
        decorationsStore.set(uri, store);
    }
    return store;
}
/** Remove all ranges that start on `lineNum` for all decoration types in this doc */
function removeRangesForLine(store, lineNum) {
    for (const [dec, ranges] of store) {
        store.set(dec, ranges.filter((r) => r.start.line !== lineNum));
    }
}
/** Shift ranges that are after `lineAfter` by `delta` lines (delta can be negative) */
function shiftRangesAfterLine(store, lineAfter, delta) {
    if (delta === 0)
        return;
    for (const [dec, ranges] of store) {
        const shifted = ranges.map((r) => {
            if (r.start.line > lineAfter) {
                return new vscode.Range(r.start.line + delta, r.start.character, r.end.line + delta, r.end.character);
            }
            return r;
        });
        store.set(dec, shifted);
    }
}
/** Convert your Highlight {start,end,color} for a given line to vscode.Ranges and add into store */
function addHighlightsForLine(store, lineNum, hls) {
    for (const h of hls) {
        const range = new vscode.Range(lineNum, h.start, lineNum, h.end);
        const arr = store.get(h.color) ?? [];
        arr.push(range);
        store.set(h.color, arr);
    }
}
/** Apply (setDecorations) current store ranges to the given editor */
function applyAllDecorationsToEditor(editor, store) {
    for (const [dec, ranges] of store) {
        editor.setDecorations(dec, ranges);
    }
}
/** Function to recompute highlights for every line of `doc` and update the store */
function computeHighlightsForDocument(doc) {
    const uriStr = doc.uri.toString();
    const store = getDocStore(uriStr);
    // Clear any existing ranges in the store for this doc
    for (const dec of Array.from(store.keys())) {
        store.set(dec, []);
    }
    // Iterate all lines and populate the store
    for (let lineNum = 0; lineNum < doc.lineCount; lineNum++) {
        const lineText = doc.lineAt(lineNum).text;
        const hls = highlightLine(lineText);
        // add each highlight for the line into the store
        for (const h of hls) {
            // basic validation
            if (typeof h.start !== "number" || typeof h.end !== "number" || !h.color)
                continue;
            const range = new vscode.Range(lineNum, h.start, lineNum, h.end);
            const arr = store.get(h.color) ?? [];
            arr.push(range);
            store.set(h.color, arr);
        }
    }
    return store;
}
/* Function to recompute only changed lines in a doc. */
export const onHighlightUpdate = vscode.workspace.onDidChangeTextDocument((e) => {
    // only handle YAML (or adapt to your language); prefer languageId
    if (e.document.languageId !== "yaml")
        return;
    const uriStr = e.document.uri.toString();
    const editors = vscode.window.visibleTextEditors.filter((ed) => ed.document.uri.toString() === uriStr);
    if (!editors.length)
        return;
    const store = getDocStore(uriStr);
    for (const change of e.contentChanges) {
        // old range (in the document before the edit)
        const oldStartLine = change.range.start.line;
        const oldEndLine = change.range.end.line;
        // compute how many new lines the change introduced (number of '\n' in change.text)
        const newLineCount = change.text.length > 0 ? change.text.split("\n").length - 1 : 0;
        const oldLineCount = oldEndLine - oldStartLine;
        const delta = newLineCount - oldLineCount;
        // 1) remove previous highlights that were on the old affected lines
        for (let ln = oldStartLine; ln <= oldEndLine; ln++) {
            removeRangesForLine(store, ln);
        }
        // 2) compute and add highlights for new lines — read them from the updated document
        // The new lines start at oldStartLine and extend for newLineCount (n newlines -> n+1 lines)
        const newLines = newLineCount >= 0 ? newLineCount + 1 : 1; // number of affected lines after edit
        for (let i = 0; i < newLines; i++) {
            const lineNum = oldStartLine + i;
            // guard: document might be shorter (e.g., deletion at end)
            if (lineNum >= e.document.lineCount)
                break;
            const lineText = e.document.lineAt(lineNum).text;
            // use your highlightLine function (assumed to return Highlight[] with .color)
            const newHls = highlightLine(lineText);
            // if your highlightLine returns {start,end} only, you'll need to map to colors here.
            // This code assumes highlightLine returns {start,end,color}.
            addHighlightsForLine(store, lineNum, newHls); // <-- keep typing/shape aligned with your implementation
        }
        // 3) shift ranges after the replaced block by delta lines (if any)
        if (delta !== 0) {
            shiftRangesAfterLine(store, oldEndLine, delta);
        }
    }
    // 4) apply decorations to all visible editors for this doc
    for (const editor of editors) {
        applyAllDecorationsToEditor(editor, store);
    }
});
/** Function to clear highlights of doc when closed. */
export const onHighlightClose = vscode.workspace.onDidCloseTextDocument((doc) => {
    decorationsStore.delete(doc.uri.toString());
});
/** Function to compute all highlights and apply them when doc is opened. */
export const onOpenHighlight = vscode.workspace.onDidOpenTextDocument((doc) => {
    // filter by language or file extension if you want (yaml example)
    if (doc.languageId !== "yaml")
        return;
    const uriStr = doc.uri.toString();
    // compute and store highlights
    const store = computeHighlightsForDocument(doc);
    // apply to all visible editors showing this document
    const editors = vscode.window.visibleTextEditors.filter((ed) => ed.document.uri.toString() === uriStr);
    for (const editor of editors) {
        applyAllDecorationsToEditor(editor, store);
    }
});
/** Also handle when the active editor changes (user switches tabs) — show highlights for the newly active doc */
export const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor)
        return;
    const doc = editor.document;
    if (doc.languageId !== "yaml")
        return;
    const uriStr = doc.uri.toString();
    // If we don't have cached ranges yet (fresh open), compute them
    const store = decorationsStore.get(uriStr)
        ? getDocStore(uriStr)
        : computeHighlightsForDocument(doc);
    applyAllDecorationsToEditor(editor, store);
});
/** Optional: recompute all highlights when the document is saved (or when you want full refresh) */
export const onSaveRefresh = vscode.workspace.onDidSaveTextDocument((doc) => {
    if (doc.languageId !== "yaml" && !doc.fileName.endsWith(".yaml"))
        return;
    const uriStr = doc.uri.toString();
    const store = computeHighlightsForDocument(doc);
    for (const editor of vscode.window.visibleTextEditors.filter((e) => e.document.uri.toString() === uriStr)) {
        applyAllDecorationsToEditor(editor, store);
    }
});
/** Function to clear all highlights when extension is closed. */
export const onDeactivateHighlights = () => {
    decorationsStore.clear();
};
//# sourceMappingURL=highlights.js.map