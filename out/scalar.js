import { Scalar, YAMLMap, YAMLSeq } from "yaml-extend";
export const SCALAR_ARRAY_MAP = new Map();
export function buildScalarArray(cache, path) {
    const scalarArray = [];
    loopAST(cache.AST, scalarArray);
    SCALAR_ARRAY_MAP.set(path, scalarArray);
}
function loopAST(current, scalarArray) {
    // if sequence loop all items
    if (current instanceof YAMLSeq)
        for (const item of current.items)
            loopAST(item, scalarArray);
    // if map loop key and value of all pairs
    if (current instanceof YAMLMap)
        for (const pair of current.items) {
            loopAST(pair.key, scalarArray);
            loopAST(pair.value, scalarArray);
        }
    // if scalar only push if it has a linePos defined
    if (current instanceof Scalar)
        if (current.linePos)
            scalarArray.push(current);
}
export function findScalar(scalarArray, pos) {
    let left = 0;
    let right = scalarArray.length - 1;
    while (left <= right) {
        const mid = (left + right) >> 1;
        const [start, end] = scalarArray[mid].linePos;
        if (comparePos(pos, start) < 0) {
            // pos < start => go left
            right = mid - 1;
        }
        else if (comparePos(pos, end) > 0) {
            // pos > end => go right
            left = mid + 1;
        }
        else {
            // start <= pos <= end
            return scalarArray[mid];
        }
    }
    return;
}
function comparePos(a, b) {
    if (a.line < b.line)
        return -1;
    if (a.line > b.line)
        return 1;
    if (a.col < b.col)
        return -1;
    if (a.col > b.col)
        return 1;
    return 0;
}
//# sourceMappingURL=scalar.js.map