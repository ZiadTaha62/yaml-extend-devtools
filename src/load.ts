import * as vscode from "vscode";
import { addModule, deleteModule, deleteAllModules } from "./liveLoader.js";

export const onOpen = vscode.workspace.onDidOpenTextDocument(async (e) => {
  if (e.languageId === "yaml") await addModule(e.fileName);
});

export const onClose = vscode.workspace.onDidCloseTextDocument((e) => {
  if (e.languageId === "yaml") deleteModule(e.fileName);
});

export const onDeactivateLoad = () => deleteAllModules();
