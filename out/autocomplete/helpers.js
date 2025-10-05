import * as vscode from "vscode";
import { ESCAPE_CHAR_REGEX, ESCAPE_CLOSE_MAP, DELIMITERS_REGEX, } from "../tokinizer.js";
/** Function to check if string has special character (delimiter character) */
function hasSpecChar(str) {
    let specChar = false;
    for (const ch of str)
        if (DELIMITERS_REGEX.test(ch))
            specChar = true;
    return specChar;
}
/** Function to determine is string should be escaped */
function shouldBeEscaped(str, isLastPartialQouted, escapeAll) {
    if (escapeAll)
        return true;
    if (isLastPartialQouted)
        return true;
    if (hasSpecChar(str))
        return true;
    return false;
}
const defAddStringSuggOpts = {
    escapeAll: false,
    escapeChar: '"',
    commitCharacters: undefined,
    addedCharacters: undefined,
};
export function addStringSugg(suggestions, replaceRange, lastPartial, opts) {
    // handle options
    const hOpts = opts
        ? { ...defAddStringSuggOpts, ...opts }
        : defAddStringSuggOpts;
    // Build suggestions depending on whether current is array or object
    const items = [];
    // unique string element suggestions (insert as quoted strings)
    const seenStrings = new Set();
    // initialize unqouted last partial with lastPartial value
    let lpUnquoted = lastPartial;
    let isLastPartialQouted = false;
    // get first char, and check if lastPartial starts with escape char, if yes remove it
    const firtsChar = lpUnquoted[0];
    if (firtsChar && ESCAPE_CHAR_REGEX.test(firtsChar)) {
        // set it to qouted true
        isLastPartialQouted = true;
        // remove first char
        lpUnquoted = lpUnquoted.slice(1);
        // get last char and check if it ends with it's escape closing char as well, if yes remove it
        const lastChar = lpUnquoted[lpUnquoted.length - 1];
        if (lastChar && ESCAPE_CLOSE_MAP[firtsChar] === lastChar)
            lpUnquoted = lpUnquoted.slice(0, lpUnquoted.length - 1);
    }
    for (const el of suggestions) {
        if (typeof el === "string" && !seenStrings.has(el)) {
            seenStrings.add(el);
            const quoted = JSON.stringify(el); // keeps quotes and escapes correctly
            const isEscaped = shouldBeEscaped(el, isLastPartialQouted, !!hOpts.escapeAll);
            const sugg = isEscaped ? quoted : el;
            // Suggest if no partial or matches either the raw value or the quoted presentation
            if (!lastPartial ||
                el.startsWith(lpUnquoted) ||
                quoted.startsWith(lastPartial)) {
                const it = new vscode.CompletionItem(el, vscode.CompletionItemKind.Field);
                it.range = replaceRange;
                if (hOpts.commitCharacters)
                    it.commitCharacters = Array.isArray(hOpts.commitCharacters)
                        ? hOpts.commitCharacters
                        : [hOpts.commitCharacters];
                it.insertText = hOpts.addedCharacters
                    ? sugg + hOpts.addedCharacters
                    : sugg;
                items.push(it);
            }
        }
    }
    return items;
}
export function generatePathSuggestions(current, segs, position) {
    // Build suggestions depending on whether current is array or object
    const items = [];
    // Last partial calculation
    const lastPartial = segs.length ? segs[segs.length - 1] : "";
    // compute replace range so we replace only the partial after the last dot
    const replaceStart = position.character - lastPartial.length;
    const replaceRange = new vscode.Range(position.line, replaceStart, position.line, position.character);
    if (Array.isArray(current)) {
        // numeric indices
        for (let i = 0; i < current.length; i++) {
            const idx = String(i);
            if (!lastPartial || idx.startsWith(lastPartial)) {
                const it = new vscode.CompletionItem(idx, vscode.CompletionItemKind.Field);
                it.range = replaceRange;
                it.commitCharacters = ["."];
                it.insertText = idx;
                items.push(it);
            }
        }
        // string suggestios
        const strSugg = addStringSugg(current, replaceRange, lastPartial, {
            commitCharacters: ".",
            escapeChar: "[",
            escapeAll: true,
        });
        items.push(...strSugg);
    }
    else if (current && typeof current === "object") {
        // get keys
        const rawKeys = Array.from(new Set(Object.keys(current)));
        const strSugg = addStringSugg(rawKeys, replaceRange, lastPartial, {
            commitCharacters: ".",
        });
        items.push(...strSugg);
    }
    return items;
}
//# sourceMappingURL=helpers.js.map