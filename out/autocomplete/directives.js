import * as vscode from "vscode";
import { getCache, getModule } from "../liveLoader.js";
import { splitAtDelimiter } from "../tokinizer.js";
import { resolve } from "path";
import { addStringSugg } from "./helpers.js";
import { handleThisPath } from "./expressions.js";
export function handleImportParamsDir(filename, segments, position) {
    // if number of segments is less than three, return as path is not yet defined
    if (segments.length < 3)
        return null;
    // get path (second item) and resolve it
    const path = segments[1];
    const resolvedPath = resolve(filename, "../", path);
    // get params from target file path
    const cache = getCache(resolvedPath);
    if (!cache)
        return null;
    const paramsMap = cache.directives?.paramsMap;
    if (!paramsMap)
        return null;
    const params = Array.from(paramsMap.keys());
    // get alraedy defined params and caclucate remaining params
    const definedParams = segments
        .slice(2)
        .map((s) => splitAtDelimiter(s, "=")[0]);
    const remainingParams = params.filter((l) => !definedParams.includes(l));
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
export function handlePrivate(filename, segments, position) {
    // get load cache of the file
    const load = getModule(filename, true);
    if (!load)
        return null;
    // get last segment path parts
    const pathParts = splitAtDelimiter(segments[segments.length - 1] ?? "", ".");
    return handleThisPath(filename, pathParts, position);
}
//# sourceMappingURL=directives.js.map