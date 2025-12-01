import * as vscode from "vscode";

import { diagnosticCollection, handleErrors } from "./erros.js";
import { handleHighlights } from "./highlights.js";
import parser from "./liveParser.js";
import { buildScalarArray } from "./scalar.js";
import { hoverProvider } from "./hover.js";

console.debug("Started");

export function activate(context: vscode.ExtensionContext) {
  // main debouncer
  let debounceTimer: NodeJS.Timeout;

  // Function to run on document change
  const onChange = vscode.workspace.onDidChangeTextDocument((e) => {
    // if changed textDocument is not YAML file return
    if (e.document.languageId !== "yaml") return;

    // Clear the previous timer if the event fires again within the debounce delay
    clearTimeout(debounceTimer);

    // Set a new debounce timer (e.g., 500ms)
    debounceTimer = setTimeout(async () => {
      // get document, uri and source text
      const doc = e.document;
      const uri = vscode.Uri.file(doc.fileName);
      const text = doc.getText();

      // parse file
      const { parse, cache, errors } = await parser.parse(uri.fsPath, text);

      // if cache is present build scalarArray and directiveArray
      if (cache) {
        buildScalarArray(cache, uri.fsPath);
      }

      // handle errors
      handleErrors(errors, uri);

      // handle highlights
      handleHighlights(doc, uri.fsPath);
    }, 500);
  });

  // Function to run on document open
  const onOpen = vscode.workspace.onDidOpenTextDocument(async (e) => {
    // if opened textDocument is not YAML file return
    if (e.languageId !== "yaml") return;

    // get uri and text
    const uri = vscode.Uri.file(e.fileName);
    const text = e.getText();

    // parse file
    const { parse, cache, errors } = await parser.parse(uri.fsPath, text);

    // if cache is present build scalarArray and directiveArray
    if (cache) {
      buildScalarArray(cache, uri.fsPath);
    }

    // handle errors
    handleErrors(errors, uri);

    // handle highlights
    handleHighlights(e, uri.fsPath);
  });

  // Function to run on document close
  const onClose = vscode.workspace.onDidCloseTextDocument((e) => {
    // if closed textDocument is not YAML file return
    if (e.languageId !== "yaml") return;

    // purge document
    const uri = vscode.Uri.file(e.fileName);
    parser.purge(uri.fsPath);
    diagnosticCollection.delete(uri);
  });

  // Add subs
  context.subscriptions.push(onChange);
  context.subscriptions.push(onOpen);
  context.subscriptions.push(onClose);
  context.subscriptions.push(diagnosticCollection);
  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
