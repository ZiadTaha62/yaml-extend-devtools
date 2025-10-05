import * as vscode from "vscode";
import { onClose, onDeactivateLoad, onOpen } from "./load.js";
import { diagnosticCollection, disposeError } from "./erros.js";
import {
  onDollarAutoComplete,
  onDotAutoComplete,
  onSpaceAutoComplete,
  onPercentAutoComplete,
} from "./autocomplete/index.js";
import {
  onHighlightUpdate,
  onHighlightClose,
  onDeactivateHighlights,
  onActiveEditorChange,
  onOpenHighlight,
  onSaveRefresh,
} from "./highlights.js";
import { onHover } from "./hover.js";

export function activate(context: vscode.ExtensionContext) {
  // Load
  context.subscriptions.push(onOpen);
  context.subscriptions.push(onClose);

  // Errors
  context.subscriptions.push(diagnosticCollection);
  context.subscriptions.push(disposeError);

  // Auto complete
  context.subscriptions.push(onDollarAutoComplete);
  context.subscriptions.push(onDotAutoComplete);
  context.subscriptions.push(onSpaceAutoComplete);
  context.subscriptions.push(onPercentAutoComplete);

  // Highlights
  context.subscriptions.push(onHighlightUpdate);
  context.subscriptions.push(onHighlightClose);
  context.subscriptions.push(onActiveEditorChange);
  context.subscriptions.push(onOpenHighlight);
  context.subscriptions.push(onSaveRefresh);

  // Hover
  context.subscriptions.push(onHover);
}

export function deactivate() {
  onDeactivateLoad();
  onDeactivateHighlights();
}
