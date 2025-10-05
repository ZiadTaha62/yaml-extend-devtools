import * as vscode from "vscode";
import { createHash } from "crypto";
const errorCache = new Map(); // use uri.toString() as key
/** Function to hash document content. */
function hashDoc(doc) {
    return createHash("sha1").update(doc, "utf8").digest("hex");
}
export const diagnosticCollection = vscode.languages.createDiagnosticCollection("yamlValidator");
export async function handleError(path, err) {
    // create diagnostic
    const range = new vscode.Range(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const diagnostic = new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
    const uri = vscode.Uri.file(path);
    // read file bytes and decode to string
    const bytes = await vscode.workspace.fs.readFile(uri);
    const docText = new TextDecoder("utf-8").decode(bytes);
    // hash doc
    const hashedDoc = hashDoc(docText);
    // add to errors cache using uri string as key
    errorCache.set(uri.toString(), hashedDoc);
    // set diagnostic
    diagnosticCollection.set(uri, [diagnostic]);
}
// simple debounce helper
function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
        if (t)
            clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}
const handleChange = async (e) => {
    if (e.document.languageId !== "yaml")
        return;
    // Get the live text — NOT the file on disk
    const docText = e.document.getText();
    const hashedDoc = hashDoc(docText);
    const key = e.document.uri.toString();
    const cachedHash = errorCache.get(key);
    if (cachedHash && hashedDoc !== cachedHash) {
        diagnosticCollection.delete(e.document.uri);
        errorCache.delete(key);
    }
};
// wrap with debounce so we don't run expensive work on every keystroke
export const disposeError = vscode.workspace.onDidChangeTextDocument(debounce(handleChange, 200));
//# sourceMappingURL=erros.js.map