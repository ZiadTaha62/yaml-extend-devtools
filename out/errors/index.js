import * as vscode from "vscode";
export const diagnosticCollection = vscode.languages.createDiagnosticCollection("yamlValidator");
export function handleError(path, err) {
    // create diagnostic
    const range = new vscode.Range(0, 0, 999999999, 999999999);
    const diagnostic = new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
    // create uri
    const uri = vscode.Uri.file(path);
    // set diagnostic
    diagnosticCollection.set(uri, [diagnostic]);
}
export function clearErrors(path) {
    // create uri
    const uri = vscode.Uri.file(path);
    // delete diagnostics
    diagnosticCollection.delete(uri);
}
//# sourceMappingURL=index.js.map