import * as vscode from "vscode";
import { getCache, getModule } from "../liveLoader.js";
import { generatePathSuggestions, addStringSugg } from "./helpers.js";
import { resolve } from "path";
import { splitAtDelimiter } from "../tokinizer.js";
export function handleThisPath(filename, segments, position) {
    // copy segments so we don't mutate the caller's array
    const segs = [...segments];
    // get cache of the file
    let current = getModule(filename, true);
    if (!current)
        return null;
    // last segment may be partial — separate it
    const traverseSegments = segs.length ? segs.slice(0, -1) : [];
    // Traverse the path excluding the partial last segment
    for (const seg of traverseSegments) {
        if (current && typeof current === "object" && seg in current) {
            current = current[seg];
        }
        else {
            current = null;
            break;
        }
    }
    if (!current)
        return null;
    // generate suggestions
    const suggestions = generatePathSuggestions(current, segs, position);
    return new vscode.CompletionList(suggestions, false);
}
export function handleImportPath(filename, segments, position) {
    // copy segments to avoid mutating original
    const segs = [...segments];
    // get cache to get directives object
    const cache = getCache(filename);
    if (!cache)
        return null;
    let current = null;
    // No segments -> suggest top-level import aliases
    if (segs.length === 1) {
        const importsMap = cache.directives?.importsMap;
        if (!importsMap)
            return null;
        current = Object.fromEntries(Array.from(importsMap.keys()).map((v) => [v, undefined]));
        // lastPartial is empty (cursor right after "$import." with nothing typed)
        const lastPartial = "";
        const replaceStart = position.character - lastPartial.length;
        const replaceRange = new vscode.Range(position.line, replaceStart, position.line, position.character);
        let keys = Object.keys(current || {});
        keys = Array.from(new Set(keys)).filter(Boolean);
        const items = keys.map((k) => {
            const it = new vscode.CompletionItem(k, vscode.CompletionItemKind.Field);
            it.range = replaceRange;
            it.commitCharacters = ["."];
            it.insertText = k;
            return it;
        });
        return new vscode.CompletionList(items, false);
    }
    // segments >= 1: first is alias, remainder are path parts (last may be partial)
    const alias = segs.shift(); // safe because segs.length >= 1
    const targetFile = cache.directives?.importsMap.get(alias)?.path;
    if (!targetFile)
        return null;
    // resolve target file
    const resTargetFilePath = resolve(filename, "../", targetFile);
    // get module cache of the target file
    current = getModule(resTargetFilePath, false);
    if (!current)
        return null;
    // Now segs contains the path AFTER the alias. last may be partial.
    const traverseSegments = segs.length ? segs.slice(0, -1) : [];
    // Traverse only the concrete segments (excluding the partial)
    for (const seg of traverseSegments) {
        if (current && typeof current === "object" && seg in current) {
            current = current[seg];
        }
        else {
            current = null;
            break;
        }
    }
    if (!current)
        return null;
    // generate suggestions
    const suggestions = generatePathSuggestions(current, segs, position);
    return new vscode.CompletionList(suggestions, false);
}
export function handleThisLocals(filename, segments, position) {
    // get cache
    const cache = getCache(filename);
    if (!cache)
        return null;
    const localsMap = cache.directives?.localsMap;
    if (!localsMap)
        return null;
    // calculate locals
    const locals = Array.from(localsMap.keys());
    const remainingLocals = locals.filter((l) => !segments.includes(l));
    // Last partial calculation
    const lastPartial = segments.length ? segments[segments.length - 1] : "";
    // compute replace range so we replace only the partial after the last dot
    const replaceStart = position.character - lastPartial.length;
    const replaceRange = new vscode.Range(position.line, replaceStart, position.line, position.character);
    // add them to suggestions
    const items = addStringSugg(remainingLocals, replaceRange, lastPartial, {
        commitCharacters: "=",
        addedCharacters: "=",
    });
    return new vscode.CompletionList(items, false);
}
export function handleImportParamsExpr(filename, segments, position, exprBase) {
    // get import alias
    const exprBaseSegs = splitAtDelimiter(exprBase, ".");
    const importAlias = exprBaseSegs[1];
    if (!importAlias)
        return null;
    // get cache
    const cache = getCache(filename);
    if (!cache)
        return null;
    const importsMap = cache.directives?.importsMap;
    if (!importsMap)
        return null;
    const path = importsMap.get(importAlias)?.path;
    if (!path)
        return null;
    const resTargetFilePath = resolve(filename, "../", path);
    const targetCache = getCache(resTargetFilePath);
    if (!targetCache)
        return null;
    const paramsMap = cache.directives?.paramsMap;
    if (!paramsMap)
        return null;
    // calculate params
    const params = Array.from(paramsMap.keys());
    const remainingParams = params.filter((l) => !segments.includes(l));
    // Last partial calculation
    const lastPartial = segments.length ? segments[segments.length - 1] : "";
    // compute replace range so we replace only the partial after the last dot
    const replaceStart = position.character - lastPartial.length;
    const replaceRange = new vscode.Range(position.line, replaceStart, position.line, position.character);
    // add them to suggestions
    const items = addStringSugg(remainingParams, replaceRange, lastPartial, {
        commitCharacters: "=",
        addedCharacters: "=",
    });
    return new vscode.CompletionList(items, false);
}
export function handleParam(filename, segment, position) {
    // get cache
    const cache = getCache(filename);
    if (!cache)
        return null;
    const paramsMap = cache.directives?.paramsMap;
    if (!paramsMap)
        return null;
    // calculate params
    const params = Array.from(paramsMap.keys());
    const remainingParams = params.filter((l) => !segment.includes(l));
    // Last partial calculation
    const lastPartial = segment;
    // compute replace range so we replace only the partial after the last dot
    const replaceStart = position.character - lastPartial.length;
    const replaceRange = new vscode.Range(position.line, replaceStart, position.line, position.character);
    // add them to suggestions
    const items = addStringSugg(remainingParams, replaceRange, lastPartial);
    return new vscode.CompletionList(items, false);
}
export function handleLocal(filename, segment, position) {
    // get cache
    const cache = getCache(filename);
    if (!cache)
        return null;
    const localsMap = cache.directives?.localsMap;
    if (!localsMap)
        return null;
    // calculate locals
    const locals = Array.from(localsMap.keys());
    const remainingLocals = locals.filter((l) => !segment.includes(l));
    // Last partial calculation
    const lastPartial = segment;
    // compute replace range so we replace only the partial after the last dot
    const replaceStart = position.character - lastPartial.length;
    const replaceRange = new vscode.Range(position.line, replaceStart, position.line, position.character);
    // add them to suggestions
    const items = addStringSugg(remainingLocals, replaceRange, lastPartial);
    return new vscode.CompletionList(items, false);
}
//# sourceMappingURL=expressions.js.map