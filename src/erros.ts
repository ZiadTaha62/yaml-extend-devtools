import * as vscode from "vscode";
import type { YAMLError } from "yaml-extend";

/** Diagnostic collection for errors. */
export const diagnosticCollection =
  vscode.languages.createDiagnosticCollection("yamlValidator");

/** Function to handle errors. */
export async function handleErrors(errors: YAMLError[], uri: vscode.Uri) {
  // delete old diagnostics
  diagnosticCollection.delete(uri);
  // execute each error
  let diagnostics: vscode.Diagnostic[] = [];
  for (const err of errors) {
    if (!err.linePos) continue;
    const range = new vscode.Range(
      err.linePos[0].line,
      err.linePos[0].col,
      err.linePos[1].line,
      err.linePos[1].col
    );
    diagnostics.push(
      new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error)
    );
  }
  // add diagnostics
  diagnosticCollection.set(uri, diagnostics);
}
